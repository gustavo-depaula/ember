import { parseDocument } from 'htmlparser2'
import { findElement } from '../dom'
import { portugueseSlug } from './books'
import { collapseWs, findAll, textOf } from './html'
import { fetchOk, type Verse, type WebBible } from './types'

const baseUrl = 'https://www.liriocatolico.com.br/biblia_online/biblia_matos_soares'

// A verse is `<p><strong><sup><small>3</small></sup></strong> text <a>…</a></p>`:
// the links are the page's copy and share buttons. A footnote is called by
// "[iii]", or by a bare digit run on after the verse's last mark ("Senhor,1").
export function parseMatosSoaresChapter(html: string): Verse[] {
  const doc = parseDocument(html, { decodeEntities: true })
  return findAll(doc.children, (el) => el.name === 'p').flatMap((p) => {
    const number = findElement(p, (el) => el.name === 'small')
    const verse = number ? Number.parseInt(textOf(number), 10) : Number.NaN
    if (Number.isNaN(verse)) return []
    const text = collapseWs(
      textOf(p, (el) => el.name === 'strong' || el.name === 'a').replace(/\[[ivxlcdm]+\]/g, ''),
    ).replace(/([,.;:!?”"])\d+$/, '$1')
    return text ? [{ verse, text }] : []
  })
}

export const matosSoares: WebBible = {
  fetchChapter: async (book, chapter) => {
    const res = await fetchOk(`${baseUrl}/${portugueseSlug[book]}/${chapter}/`, 'Lírio Católico')
    return parseMatosSoaresChapter(await res.text())
  },
}
