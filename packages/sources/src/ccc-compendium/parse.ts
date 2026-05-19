import { buildAnchorIndex, chapterAnchorNames, chapterOrder } from './chapters'
import { cleanChapter, decodeEntities } from './cleanup'
import type { AnchorIndex, ChapterId, Lang, ProduceResult } from './types'

// Matches the start of a Q&A item in the three shapes the source uses:
//   <p><b>1. Question?</b></p>
//   <p><b>218.</b>&nbsp;<b>Question?</b></p>
//   <p><b>568</b>.<b> Question?</b></p>
const QUESTION_START = /<p([^>]*)>(\s*<b[^>]*>\s*(\d+)\s*(?:\.\s*<\/b>|\.\s|<\/b>\s*\.))/g

const ANCHOR_INDEX = buildAnchorIndex()

type AnchorMap = Map<string, number>

function buildAnchorMap(html: string): AnchorMap {
  const map: AnchorMap = new Map()
  const re = /<a\s+name="([^"]+)"/gi
  for (let m = re.exec(html); m; m = re.exec(html)) {
    const decoded = decodeEntities(m[1])
    if (!map.has(decoded)) map.set(decoded, m.index)
  }
  return map
}

function lastPStart(html: string, pos: number): number {
  const at = html.lastIndexOf('<p', pos)
  return at < 0 ? pos : at
}

function isHeadingOrFillerParagraph(p: string): boolean {
  const inner = p
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z]+;|&#x?[0-9a-f]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (inner.length === 0) return true
  // Papal signatures (`BENEDICTUS PP XVI`) are short bold paragraphs but
  // belong to the chapter they close, not the next chapter's heading group.
  if (/\bPP\b/.test(inner)) return false
  if (/font\s+size="[45]"/i.test(p)) return true
  if (inner.length <= 90 && /<b\b/i.test(p) && !/\b\d{3,}/.test(inner)) return true
  return false
}

// Walk back from a chapter's defining anchor through preceding heading / label
// / filler paragraphs. The first paragraph with substantive prose marks the
// previous chapter's end; the slice starts at the paragraph after it.
function chapterStartPos(html: string, chapter: ChapterId, lang: Lang, anchors: AnchorMap): number {
  const anchorName = chapterAnchorNames[lang][chapter]
  const anchorPos = anchors.get(anchorName)
  if (anchorPos === undefined)
    throw new Error(`Anchor not found: "${anchorName}" for ${chapter} (${lang})`)

  let pStart = lastPStart(html, anchorPos)
  if (chapterOrder.indexOf(chapter) === 0) return pStart

  while (true) {
    const prevClose = html.lastIndexOf('</p>', pStart - 1)
    if (prevClose < 0) break
    // An `<hr>` between paragraphs is a hard structural boundary
    // (motu-proprio / introduction separator) and stops the walkback.
    if (/<hr\b/i.test(html.slice(prevClose + 4, pStart))) break
    const prevOpen = html.lastIndexOf('<p', prevClose - 1)
    if (prevOpen < 0 || prevOpen >= pStart) break
    if (!isHeadingOrFillerParagraph(html.slice(prevOpen, prevClose + 4))) break
    pStart = prevOpen
  }
  return pStart
}

function chapterSliceBounds(
  html: string,
  chapter: ChapterId,
  lang: Lang,
  anchors: AnchorMap,
): { start: number; end: number } {
  const idx = chapterOrder.indexOf(chapter)
  if (idx < 0) throw new Error(`Unknown chapter: ${chapter}`)

  const start = chapterStartPos(html, chapter, lang, anchors)
  const next = chapterOrder[idx + 1]
  if (!next) {
    const closer = html.indexOf('</div>', start)
    return { start, end: closer > 0 ? closer : html.length }
  }
  return { start, end: chapterStartPos(html, next, lang, anchors) }
}

function injectQuestionIds(html: string): string {
  return html.replace(
    QUESTION_START,
    (_full, attrs: string, rest: string, num: string) => `<p${attrs} id="q${num}">${rest}`,
  )
}

// The paragraph immediately after each Q's `<p id="qN">` carries the
// cross-references into the full CCC. Shapes: `1-25`, `27-30<br />44-45`,
// `1064 – 1065`, `75-79,<br />83,<br />96, 98`. Rewrite each numeric token
// into `<a data-ref="book/ccc#…">` so the reader's data-ref handler can
// dispatch into the full CCC.
function linkifyCccRefs(html: string): string {
  return html.replace(
    /(<p[^>]*\sid="q\d+"[^>]*>[\s\S]*?<\/p>)\s*<p([^>]*)>([\s\S]*?)<\/p>/g,
    (full, qP: string, attrs: string, body: string) => {
      const text = body
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      if (!text || !/^[\d,\s\-–]+$/.test(text)) return full
      const linked = body.replace(
        /(\d+)(?:\s*([-–])\s*(\d+))?/g,
        (_m, a: string, dash: string | undefined, b: string | undefined) =>
          `<a data-ref="book/ccc#${b ? `${a}-${b}` : a}">${b ? `${a}${dash}${b}` : a}</a>`,
      )
      const cls = /\sclass="/.test(attrs) ? attrs : `${attrs} class="ccc-refs"`
      return `${qP}\n<p${cls}>${linked}</p>`
    },
  )
}

function chapterAnchors(chapter: ChapterId): AnchorIndex {
  const out: AnchorIndex = {}
  for (const [k, v] of Object.entries(ANCHOR_INDEX)) {
    if (v.chapter === chapter) out[k] = v
  }
  return out
}

export function parseChapter(rawHtml: string, chapter: ChapterId, lang: Lang): ProduceResult {
  const anchors = buildAnchorMap(rawHtml)
  const { start, end } = chapterSliceBounds(rawHtml, chapter, lang, anchors)
  const slice = rawHtml.slice(start, end)
  const html = linkifyCccRefs(cleanChapter(injectQuestionIds(slice)))
  return { html, anchors: chapterAnchors(chapter) }
}
