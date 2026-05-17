import { buildAnchorIndex, chapterAnchorNames, chapterOrder } from './chapters'
import {
  collapseWhitespace,
  decodeEntities,
  dropEmptyShells,
  fixMojibake,
  stripFontTags,
  stripOfficeNoise,
  stripPresentationalAttrs,
  stripTableTags,
} from './cleanup'
import type { AnchorIndex, ChapterId, Lang, ProduceResult } from './types'

// Matches the start of a Q&A item in the three shapes the source uses:
//   <p><b>1. Question?</b></p>
//   <p><b>218.</b>&nbsp;<b>Question?</b></p>
//   <p><b>568</b>.<b> Question?</b></p>
const QUESTION_RE = /<p[^>]*>\s*<b[^>]*>\s*(\d+)\s*(?:\.\s*<\/b>|\.\s|<\/b>\s*\.)/g

type QuestionPos = { num: number; start: number }

function indexQuestions(html: string): QuestionPos[] {
  const out: QuestionPos[] = []
  QUESTION_RE.lastIndex = 0
  for (let m = QUESTION_RE.exec(html); m; m = QUESTION_RE.exec(html)) {
    out.push({ num: Number(m[1]), start: m.index })
  }
  return out
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// vatican.va writes anchor names with HTML entities for non-ASCII chars
// (e.g. `AP&Ecirc;NDICE`). We compare entity-decoded names, but search the raw
// HTML by entity-encoding the target name back. The cheap path is to scan
// every anchor and decode just its name.
function findAnchorPos(html: string, decodedName: string): number {
  const re = /<a\s+name="([^"]+)"/gi
  for (let m = re.exec(html); m; m = re.exec(html)) {
    if (decodeEntities(m[1]) === decodedName) return m.index
  }
  return -1
}

function findEnclosingPStart(html: string, pos: number): number {
  const at = html.lastIndexOf('<p', pos)
  return at < 0 ? pos : at
}

// True when a `<p>...</p>` block looks like a label, filler, or section
// heading rather than substantive chapter prose. Used to walk back from a
// chapter's title paragraph, accreting the preceding label / spacer / sub-
// heading paragraphs into the new chapter's slice.
function isHeadingOrFillerParagraph(p: string): boolean {
  const inner = p
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/&#x?[0-9a-f]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (inner.length === 0) return true
  // Papal signatures and similar attributed lines (`BENEDICTUS PP XVI`) are
  // short bold paragraphs but belong to the chapter they close, not the next
  // chapter's heading group.
  if (/\bPP\b/.test(inner)) return false
  if (/font\s+size="[45]"/i.test(p)) return true
  // Short, bold, no long digit sequences (Q-refs like "1064-1065")
  if (inner.length <= 90 && /<b\b/i.test(p) && !/\b\d{3,}/.test(inner)) return true
  return false
}

// Walk back from a chapter's defining anchor through preceding heading / label
// / filler paragraphs. The first paragraph that contains substantive prose
// marks the previous chapter's end; the slice starts at the paragraph
// immediately after it.
function chapterStartPos(html: string, chapter: ChapterId, lang: Lang): number {
  const anchorName = chapterAnchorNames[lang][chapter]
  const anchorPos = findAnchorPos(html, anchorName)
  if (anchorPos < 0) throw new Error(`Anchor not found: "${anchorName}" for ${chapter} (${lang})`)

  let pStart = findEnclosingPStart(html, anchorPos)
  if (chapterOrder.indexOf(chapter) === 0) return pStart

  while (true) {
    const prevClose = html.lastIndexOf('</p>', pStart - 1)
    if (prevClose < 0) break
    // An <hr> between the previous paragraph's close and our current start
    // marks a hard structural boundary (motu-proprio / introduction separator)
    // and stops the walkback.
    const between = html.slice(prevClose + 4, pStart)
    if (/<hr\b/i.test(between)) break
    const prevOpen = html.lastIndexOf('<p', prevClose - 1)
    if (prevOpen < 0 || prevOpen >= pStart) break
    const block = html.slice(prevOpen, prevClose + 4)
    if (!isHeadingOrFillerParagraph(block)) break
    pStart = prevOpen
  }

  return pStart
}

function chapterSliceBounds(
  rawHtml: string,
  chapter: ChapterId,
  lang: Lang,
): { start: number; end: number } {
  const idx = chapterOrder.indexOf(chapter)
  if (idx < 0) throw new Error(`Unknown chapter: ${chapter}`)

  const start = chapterStartPos(rawHtml, chapter, lang)
  const next = chapterOrder[idx + 1]
  let end = next ? chapterStartPos(rawHtml, next, lang) : rawHtml.length

  if (!next) {
    const closer = rawHtml.indexOf('</div>', start)
    if (closer > 0) end = closer
  }

  return { start, end }
}

function findEnclosingPTagStart(html: string, qStart: number): number {
  const cut = html.lastIndexOf('<p', qStart)
  return cut < 0 ? qStart : cut
}

function injectQuestionIds(html: string, questions: QuestionPos[], offset: number): string {
  const inSlice = questions
    .filter((q) => q.start >= offset && q.start < offset + html.length)
    .map((q) => ({ num: q.num, start: q.start - offset }))
  if (inSlice.length === 0) return html

  let out = html
  for (let i = inSlice.length - 1; i >= 0; i--) {
    const q = inSlice[i]
    const pStart = findEnclosingPTagStart(out, q.start)
    const tagEnd = out.indexOf('>', pStart)
    if (tagEnd < 0) continue
    const opening = out.slice(pStart, tagEnd + 1)
    if (/\sid="q\d/.test(opening)) continue
    const patched = `${opening.slice(0, -1)} id="q${q.num}">`
    out = out.slice(0, pStart) + patched + out.slice(tagEnd + 1)
  }
  return out
}

function cleanChapter(html: string): string {
  let s = html
  s = stripOfficeNoise(s)
  s = stripTableTags(s)
  s = stripFontTags(s)
  s = stripPresentationalAttrs(s)
  s = decodeEntities(s)
  s = fixMojibake(s)
  s = dropEmptyShells(s)
  s = collapseWhitespace(s)
  // Trim trailing `<hr />` and any remaining empty markers left at the very
  // end after the appendix-b list.
  s = s.replace(/(?:\s*<hr\s*\/?>\s*)+$/i, '').trim()
  return s
}

// The paragraph immediately after each Q's `<p id="qN">` carries the
// cross-references into the full CCC. Shapes: `1-25`, `27-30<br />44-45`,
// `1064 – 1065`, `75-79,<br />83,<br />96, 98`. Rewrite each numeric token
// into a tappable `<a data-ref="book/ccc#…">` so the reader's data-ref handler
// can dispatch into the full CCC.
function linkifyCccRefs(html: string): string {
  return html.replace(
    /(<p[^>]*\sid="q\d+"[^>]*>[\s\S]*?<\/p>)\s*<p([^>]*)>([\s\S]*?)<\/p>/g,
    (full, qP, attrs, body) => {
      const text = body
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      if (!text) return full
      if (!/^[\d,\s\-–]+$/.test(text)) return full
      const linked = body.replace(
        /(\d+)(?:\s*([-–])\s*(\d+))?/g,
        (_match, a: string, dash: string | undefined, b: string | undefined) => {
          const ref = b ? `${a}-${b}` : a
          const text = b ? `${a}${dash}${b}` : a
          return `<a data-ref="book/ccc#${ref}">${text}</a>`
        },
      )
      const cls = /\sclass="/.test(attrs) ? attrs : `${attrs} class="ccc-refs"`
      return `${qP}\n<p${cls}>${linked}</p>`
    },
  )
}

function chapterAnchors(chapter: ChapterId): AnchorIndex {
  const all = buildAnchorIndex()
  const out: AnchorIndex = {}
  for (const [k, v] of Object.entries(all)) {
    if (v.chapter === chapter) out[k] = v
  }
  return out
}

export function parseChapter(rawHtml: string, chapter: ChapterId, lang: Lang): ProduceResult {
  const questions = indexQuestions(rawHtml)
  const { start, end } = chapterSliceBounds(rawHtml, chapter, lang)
  const slice = rawHtml.slice(start, end)
  const withIds = injectQuestionIds(slice, questions, start)
  const cleaned = cleanChapter(withIds)
  const html = linkifyCccRefs(cleaned)
  const anchors = chapterAnchors(chapter)
  return { html, anchors }
}

// Exported for unit testing of internals; not part of the public API.
export const __test = {
  findAnchorPos,
  chapterStartPos,
  escapeRegex,
  indexQuestions,
}
