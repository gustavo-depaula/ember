import { Marked } from 'marked'
import markedFootnote from 'marked-footnote'
import { galleryExtension } from '@/features/books/markedGalleryExtension'

// The same parser stack the app's reader uses, so a chapter reads alike in both.
const md = new Marked().use(markedFootnote()).use(galleryExtension())

export function markdownHtml(text: string): string {
  return md.parse(text, { async: false }) as string
}

/** Short editorial prose (a prologue, a description): paragraphs and emphasis. */
export function proseHtml(text: string | undefined): string {
  return text ? markdownHtml(text) : ''
}
