import { parseDocument } from 'htmlparser2'
import { findElement, hasClass } from '../dom'
import { knoxCode } from './books'
import { collapseWs, findAll, textOf } from './html'
import { fetchOk, type Verse, type WebBible } from './types'

// Baronius Press, who publish the Knox Bible under licence from Westminster.
const baseUrl = 'https://catholicbible.online/knox'

// A verse is `<div class="vers"><div class="vers-no">` + `<div class="vers-content">`;
// an `a.inline-comment` is the mark that opens one of Knox's footnotes.
export function parseKnoxChapter(html: string): Verse[] {
  const doc = parseDocument(html, { decodeEntities: true })
  return findAll(doc.children, (el) => hasClass(el, 'vers')).flatMap((el) => {
    const number = findElement(el, (e) => hasClass(e, 'vers-no'))
    const content = findElement(el, (e) => hasClass(e, 'vers-content'))
    const verse = number ? Number.parseInt(textOf(number), 10) : Number.NaN
    if (!content || Number.isNaN(verse)) return []
    const text = collapseWs(textOf(content, (e) => hasClass(e, 'inline-comment')))
    return text ? [{ verse, text }] : []
  })
}

export const knox: WebBible = {
  fetchChapter: async (book, chapter) => {
    const res = await fetchOk(`${baseUrl}/${knoxCode[book]}/ch_${chapter}`, 'catholicbible.online')
    return parseKnoxChapter(await res.text())
  },
}
