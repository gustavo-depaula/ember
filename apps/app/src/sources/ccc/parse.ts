/**
 * Turn raw vatican.va Catechism pages into clean reader HTML.
 *
 * Two source shapes, one output:
 *  - English (ENG0015): tiny IntraText pages, numbered paragraphs render as
 *    `<p class=MsoNormal>NNN text`, IN BRIEF as `<p class=MsoNormal><i>NNNN`,
 *    headings as `<p class=MsoNormal><b>…`, footnotes appended after a 30%-width
 *    rule with `<sup>` reference markers inline.
 *  - Portuguese (cathechism_po): one chapter page, numbered paragraphs as
 *    `<p><b>NN.</b> text` inside a 609px content cell, footnotes after a final
 *    `<hr>`.
 *
 * All non-paragraph text (part/section/chapter headings, the Prologue, IN BRIEF
 * summaries, scripture quotations, blockquotes) is preserved. Numbered
 * paragraphs get `id="ccc-N"` anchors so cross-references can land on them.
 */

import { cleanChapter, decodeEntities } from '../vatican/cleanup'

export type Lang = 'en-US' | 'pt-BR'
export type CccParagraph = { number: number; text: string }

function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
}

// --- English -------------------------------------------------------------

// IntraText pages wrap the body chrome in tables we strip later; the readable
// content is the run of <p class=MsoNormal> blocks. We cut the leading nav and
// the trailing footnote apparatus (after the 30%-width rule) before cleaning.
function isolateEnContent(raw: string): string {
  const firstP = raw.search(/<p\b[^>]*class=["']?MsoNormal/i)
  if (firstP < 0) return ''
  let body = raw.slice(firstP)
  // Footnote block opens with a left-aligned 30%-width rule; drop it and the
  // bottom Previous/Next nav + copyright that follow.
  const fn = body.search(/<hr[^>]*width=["']?30%/i)
  if (fn >= 0) body = body.slice(0, fn)
  else {
    const nav = body.search(/<center>[\s\S]*?(?:Previous|Next)/i)
    if (nav >= 0) body = body.slice(0, nav)
  }
  return body
}

function enToBookHtml(raw: string): string {
  // cleanChapter strips <font>/<table>/<div> noise, decodes entities, removes
  // mojibake; <sup> footnote markers and anchors survive and are dropped here.
  let html = cleanChapter(isolateEnContent(raw))
    .replace(/<sup\b[\s\S]*?<\/sup>/gi, '')
    .replace(/<a\b[^>]*name=[^>]*>[\s\S]*?<\/a>/gi, '')
    // Empty bold-paragraph shell IntraText emits around each rule: `<b><p ...></b></p>`.
    .replace(/<b>\s*<p\b[^>]*>\s*<\/b>\s*<\/p>/gi, '')
    // Empty inline tags split some headings (`<b>Title</b><b></b>`); drop them
    // so the heading pass sees a single bold run.
    .replace(/<(b|i)>\s*<\/\1>/gi, '')
    // A few paragraphs share a <p> with the previous one, the number following a
    // <br> (`… common good.<br> 2436 Unemployment …`). Split into a new paragraph.
    .replace(/<br\s*\/?>\s*(\d{1,4})\b\s+(?=[A-Z"«])/g, '</p>\n<p class=MsoNormal>$1 ')
  // Number tagging runs BEFORE the heading pass so bold/italic numbers aren't
  // mistaken for bold headings.
  // IN BRIEF paragraphs: number inside a leading <i> (often with a style attr).
  html = html.replace(
    /<p\b[^>]*class=["']?MsoNormal[^>]*>\s*<i\b[^>]*>\s*(\d{1,4})\b\.?/gi,
    (_m, n: string) => `<p id="ccc-${n}"><b class="ccc-n">${n}</b> <i>`,
  )
  // Bold numbers: <p class=MsoNormal><b ...>NN</b> … (short, so titles starting
  // with a digit aren't caught).
  html = html.replace(
    /<p\b[^>]*class=["']?MsoNormal[^>]*>\s*<b\b[^>]*>\s*(\d{1,4})\b[\s\S]{0,8}?<\/b>/gi,
    (_m, n: string) => `<p id="ccc-${n}"><b class="ccc-n">${n}</b>`,
  )
  // Bare numbers right after the tag.
  html = html.replace(
    /<p\b[^>]*class=["']?MsoNormal[^>]*>\s*(\d{1,4})\b\.?/gi,
    (_m, n: string) => `<p id="ccc-${n}"><b class="ccc-n">${n}</b> `,
  )
  // Headings: remaining bold-only MsoNormal paragraphs (part/section/chapter/
  // article titles, "IN BRIEF"). Inner is `[^<]*` so a match can't span
  // paragraph boundaries; tagged numbered paragraphs keep text after their
  // `</b>`, so they're never matched here.
  html = html.replace(
    /<p\b[^>]*class=["']?MsoNormal[^>]*>\s*<b\b[^>]*>([^<]*)<\/b>\s*<\/p>/gi,
    (_m, inner: string) => {
      const text = stripTags(inner)
      return text ? `<h3>${text}</h3>` : ''
    },
  )
  return finalizeHtml(html)
}

// --- Portuguese ----------------------------------------------------------

function isolatePtContent(raw: string): string {
  // The chapter text lives in the wide content cell; grab its inner HTML before
  // cleanChapter dissolves the surrounding tables.
  const m = raw.match(/<td[^>]*width=["']?609["']?[^>]*valign=["']?top["']?[^>]*>([\s\S]*?)<\/td>/i)
  let body = m ? m[1] : raw
  // Footnotes are the trailing numbered list after the final rule.
  const fn = body.search(/<hr\b[^>]*\/?>\s*(?:<p>\s*1\b|\s*1\.)/i)
  if (fn >= 0) body = body.slice(0, fn)
  return body
}

function ptToBookHtml(raw: string): string {
  let html = cleanChapter(isolatePtContent(raw)).replace(/<(b|i)>\s*<\/\1>/gi, '')
  // Some paragraph markers float after a block close without a <p> wrapper
  // (`</p> <b>17. </b>text…`, a source defect). Promote them to a tagged
  // paragraph first so they aren't lost.
  html = html.replace(
    /(<\/(?:p|blockquote|h3|i|b)>)\s*<b\b[^>]*>\s*(\d{1,4})\b[\s\S]{0,16}?<\/b>/gi,
    (_m, close: string, n: string) => `${close}\n<p id="ccc-${n}"><b class="ccc-n">${n}</b>`,
  )
  // Numbered paragraphs: <p ...><b>NN.</b> … (the number, sometimes with an
  // italic period like <b>33<i>. </i></b>, opens the paragraph).
  html = html.replace(
    /<p\b([^>]*)>\s*<b\b[^>]*>\s*(\d{1,4})\b[\s\S]{0,16}?<\/b>/gi,
    (_m, attrs: string, n: string) => `<p${attrs} id="ccc-${n}"><b class="ccc-n">${n}</b>`,
  )
  // Headings: remaining bold-only paragraphs (part/section/chapter titles,
  // roman-numeral sub-headings, "Resumindo:"). Inner is `[^<]*` so the match
  // can't span across paragraph boundaries (numbered paragraphs already tagged
  // above keep text after their `</b>`, so they're never matched here).
  html = html.replace(/<p\b[^>]*>\s*<b\b[^>]*>([^<]*)<\/b>\s*<\/p>/gi, (_m, inner: string) => {
    const text = stripTags(inner)
    return text ? `<h3>${text}</h3>` : ''
  })
  return finalizeHtml(html)
}

// --- shared finalize -----------------------------------------------------

function finalizeHtml(html: string): string {
  return (
    html
      .replace(/\sclass=["']?MsoNormal["']?/gi, '')
      .replace(/\sstyle=(["'])[\s\S]*?\1/gi, '')
      .replace(/\s(?:lang|align|face|size|color)=(["'])[\s\S]*?\1/gi, '')
      .replace(/<o:p\b[\s\S]*?<\/o:p>/gi, '')
      .replace(/<b>\s*<\/b>/gi, '')
      .replace(/<i>\s*<\/i>/gi, '')
      // Paragraphs holding only whitespace or orphaned inline tags (IntraText
      // emits `<p></b></p>` shells around its rules).
      .replace(/<p[^>]*>(?:\s|&nbsp;|<\/?[bi]>)*<\/p>/gi, '')
      .replace(/(?:<br\s*\/?>\s*){2,}/gi, '<br />')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{2,}/g, '\n')
      .trim()
  )
}

export function pageToBookHtml(raw: string, lang: Lang): string {
  return lang === 'pt-BR' ? ptToBookHtml(raw) : enToBookHtml(raw)
}

/**
 * Trim assembled chapter HTML to a paragraph range. English pages straddle
 * chapter boundaries (a single IntraText page can hold the tail of one chapter
 * and the head of the next), so concatenating a chapter's pages leaks
 * neighbouring paragraphs at the seams. Drop numbered paragraphs (and their
 * continuation prose) outside [from, to]; keep a heading only when it introduces
 * an in-range paragraph, so dangling next-chapter titles don't survive.
 */
// A numbered block whose number is well outside the chapter range but isn't a
// neighbouring chapter's paragraph — embedded enumerated content like the Ten
// Commandments (1–10) listed at §2051. Keep its text but drop the `ccc-` anchor
// so it isn't extracted/cross-referenced as a paragraph.
const LEAK_WINDOW = 60

export function trimToRange(bookHtml: string, from: number, to: number): string {
  const blocks = bookHtml.split(/(?=<(?:h3|p|blockquote)\b)/i)
  const out: string[] = []
  // Buffer headings + leading prose (e.g. the Prologue's epigraphs) until we
  // learn whether the next numbered paragraph is in range: flush if it is,
  // discard if it isn't (a neighbouring chapter's heading group).
  let pending: string[] = []
  let keep = false
  for (const block of blocks) {
    const idMatch = block.match(/^<p\b[^>]*\bid=["']ccc-(\d{1,4})["']/i)
    if (idMatch) {
      const n = Number(idMatch[1])
      if (n >= from && n <= to) {
        keep = true
        out.push(...pending, block)
      } else if (n >= from - LEAK_WINDOW && n <= to + LEAK_WINDOW) {
        // Adjacent chapter paragraph leaked in via a straddling page — drop it.
        keep = false
      } else {
        // Embedded enumerated content — keep the text, drop the anchor.
        keep = true
        out.push(
          ...pending,
          block.replace(/\sid=["']ccc-\d+["']/i, '').replace(/\sclass=["']ccc-n["']/i, ''),
        )
      }
      pending = []
      continue
    }
    // Heading or continuation prose / blockquote: part of the current paragraph
    // when in range, otherwise buffered for the next paragraph decision.
    if (keep) out.push(block)
    else pending.push(block)
  }
  return out.join('').trim()
}

/**
 * Extract numbered paragraphs (number + plain text) from already-converted book
 * HTML — used by the office reading source. The `<b class="ccc-n">N</b>` marker
 * is dropped from the text.
 */
export function extractParagraphs(bookHtml: string): CccParagraph[] {
  const out: CccParagraph[] = []
  // Capture each numbered paragraph up to the next numbered paragraph or heading
  // (not just the next </p>): some source paragraphs are unclosed, and a
  // paragraph's continuation prose / blockquotes belong with it.
  const re = /<p[^>]*\bid=["']ccc-(\d{1,4})["'][^>]*>([\s\S]*?)(?=<p[^>]*\bid=["']ccc-|<h3\b|$)/gi
  for (let m = re.exec(bookHtml); m; m = re.exec(bookHtml)) {
    const number = Number(m[1])
    const text = stripTags(m[2].replace(/<b\b[^>]*class=["']?ccc-n["']?[^>]*>[\s\S]*?<\/b>/i, ''))
    if (text) out.push({ number, text })
  }
  return out
}
