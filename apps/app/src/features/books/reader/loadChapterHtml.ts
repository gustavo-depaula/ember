import { Marked } from 'marked'
import markedFootnote from 'marked-footnote'
import type { BookEntry } from '@/content/manifestTypes'
import { getText } from '@/content/store'
import { escapeHtml, galleryExtension } from '@/features/books/markedGalleryExtension'

const md = new Marked().use(markedFootnote()).use(galleryExtension())

export type LoadedChapter = {
  chapterId: string
  /** Body HTML, no wrapping `<html>`/`<body>`. Image srcs are already absolute URLs. */
  html: string
}

/**
 * Load one chapter as body HTML ready to be injected into the reader surface.
 * Markdown chapters are converted via marked; .html chapters are used as-is.
 * Image `src` attributes are rewritten to absolute Hearth URLs so the DOM
 * Component can fetch them without crossing the bridge as base64.
 */
export async function loadChapterHtml(
  book: BookEntry,
  chapterId: string,
  lang: string,
  imageUrls: Map<string, string>,
  title?: string,
): Promise<LoadedChapter | undefined> {
  const ref = book.chapters[chapterId]?.[lang]
  if (!ref || 'type' in ref) return undefined
  const raw = await getText(ref.hash)
  const rendered = ref.format === 'html' ? raw : await md.parse(raw)
  let body = extractBody(rendered)
  body = rewriteImageSrcs(body, imageUrls)
  if (title) body = `<h2 class="chapter-title">${escapeHtml(title)}</h2>${body}`
  return { chapterId, html: body }
}

function extractBody(html: string): string {
  const m = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)
  return m ? m[1].trim() : html
}

function rewriteImageSrcs(body: string, urls: Map<string, string>): string {
  return body.replace(/<img\b([^>]*?)\bsrc=(['"])([^'"]+)\2/gi, (match, attrs, quote, src) => {
    const url =
      urls.get(src) ??
      urls.get(src.replace(/^\.\.\//, '')) ??
      urls.get(src.replace(/^\.\//, '')) ??
      urls.get(`../${src}`)
    return url ? `<img${attrs}src=${quote}${url}${quote}` : match
  })
}
