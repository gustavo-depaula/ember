import { Marked } from 'marked'
import markedFootnote from 'marked-footnote'
import { getEntry, getRememberedManifest } from '@/content/contentIndex'
import type { BookEntry } from '@/content/manifestTypes'
import type { TocNode } from '@/content/resolver'
import { getBlob, getJson, getText } from '@/content/store'
import { galleryExtension } from '@/features/books/markedGalleryExtension'

const md = new Marked().use(markedFootnote()).use(galleryExtension())

export type BookContent = {
  css: string
  chapters: Map<string, string>
  images: Map<string, string>
}

export type TocLeaf = { id: string; index: number }

export type LoadProgress = {
  phase: 'manifest' | 'chapters' | 'images'
  completed: number
  total: number
}

function mimeForExt(filename: string): string {
  if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) return 'image/jpeg'
  if (filename.endsWith('.png')) return 'image/png'
  if (filename.endsWith('.gif')) return 'image/gif'
  if (filename.endsWith('.svg')) return 'image/svg+xml'
  if (filename.endsWith('.webp')) return 'image/webp'
  return 'image/jpeg'
}

function collectImgSrcs(htmls: Iterable<string>): string[] {
  const srcs = new Set<string>()
  const re = /<img\b[^>]*\bsrc=["']([^"']+)["']/gi
  for (const html of htmls) {
    let m = re.exec(html)
    while (m !== null) {
      const src = m[1]
      if (!src.startsWith('data:')) srcs.add(src)
      m = re.exec(html)
    }
  }
  return [...srcs]
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize)
    binary += String.fromCharCode.apply(null, chunk as unknown as number[])
  }
  return btoa(binary)
}

// React 18 batches every setState inside the same task — including
// microtasks chained off `await`. 200+ rapid-fire progress calls in a
// Promise.all collapse into one render with the final value. A setTimeout
// callback runs as its own task, so React re-renders between emissions.
function throttleProgress(
  fn: ((p: LoadProgress) => void) | undefined,
  ms: number,
): ((p: LoadProgress) => void) | undefined {
  if (!fn) return undefined
  let scheduled = false
  let pending: LoadProgress | undefined
  return (p) => {
    pending = p
    if (scheduled) return
    scheduled = true
    setTimeout(() => {
      scheduled = false
      if (pending) fn(pending)
    }, ms)
  }
}

// Images are inlined as base64 data URIs so the WebView can render them
// without an HTTP round-trip or FS-permission dance.
export async function loadBookContent(
  bookId: string,
  lang: string,
  chapterIds: string[],
  rawOnProgress?: (p: LoadProgress) => void,
): Promise<BookContent> {
  const onProgress = throttleProgress(rawOnProgress, 50)
  const corpusId = bookId.startsWith('book/') ? bookId : `book/${bookId}`
  const entry = getEntry(corpusId)
  if (!entry) return { css: '', chapters: new Map(), images: new Map() }

  onProgress?.({ phase: 'manifest', completed: 0, total: 1 })
  let manifest = getRememberedManifest<BookEntry>(entry.hash)
  if (!manifest) manifest = await getJson<BookEntry>(entry.hash)
  const css = manifest.style ? await getText(manifest.style.hash).catch(() => '') : ''
  onProgress?.({ phase: 'manifest', completed: 1, total: 1 })

  const chapters = new Map<string, string>()
  const chapterTotal = chapterIds.length
  let chapterDone = 0
  onProgress?.({ phase: 'chapters', completed: 0, total: chapterTotal })
  await Promise.all(
    chapterIds.map(async (id) => {
      const ref = manifest.chapters?.[id]?.[lang]
      if (ref && 'hash' in ref) {
        try {
          const raw = await getText(ref.hash)
          chapters.set(id, ref.format === 'html' ? raw : await md.parse(raw))
        } catch (err) {
          console.warn(`[bookContent] chapter ${id} (${lang}) failed to load:`, err)
        }
      }
      chapterDone++
      onProgress?.({ phase: 'chapters', completed: chapterDone, total: chapterTotal })
    }),
  )

  const imageRefs = new Map<string, { hash: string; mime?: string }>()
  for (const im of manifest.images ?? []) {
    imageRefs.set(`../images/${im.rel}`, { hash: im.hash, mime: im.mime })
    imageRefs.set(`images/${im.rel}`, { hash: im.hash, mime: im.mime })
  }

  const images = new Map<string, string>()
  const imageSrcs = collectImgSrcs(chapters.values())
  const imageTotal = imageSrcs.length
  let imageDone = 0
  if (imageTotal > 0) onProgress?.({ phase: 'images', completed: 0, total: imageTotal })
  await Promise.all(
    imageSrcs.map(async (src) => {
      const ref = imageRefs.get(src)
      if (ref) {
        try {
          const bytes = await getBlob(ref.hash)
          const mime = ref.mime ?? mimeForExt(src)
          images.set(src, `data:${mime};base64,${bytesToBase64(bytes)}`)
        } catch (err) {
          console.warn(`[bookContent] image ${src} failed to load:`, err)
        }
      }
      imageDone++
      onProgress?.({ phase: 'images', completed: imageDone, total: imageTotal })
    }),
  )

  return { css, chapters, images }
}

function extractBody(html: string): string {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)
  return bodyMatch ? bodyMatch[1].trim() : html
}

/** Get a chapter's body HTML with images resolved to data URIs. */
export function getChapterBody(content: BookContent, chapterId: string, title?: string): string {
  const html = content.chapters.get(chapterId)
  if (!html) return ''

  let body = extractBody(html)
  for (const [path, dataUri] of content.images) {
    if (body.includes(path)) body = body.replaceAll(path, dataUri)
    const parentPath = `../${path}`
    if (body.includes(parentPath)) body = body.replaceAll(parentPath, dataUri)
  }
  if (title) body = `<h2 class="chapter-title">${title}</h2>${body}`
  return body
}

function localizedTitle(title: TocNode['title'], lang: string): string | undefined {
  return (title as Record<string, string>)[lang] ?? Object.values(title)[0]
}

export function buildTitleLookup(toc: TocNode[], lang: string): Map<string, string> {
  const map = new Map<string, string>()
  function walk(nodes: TocNode[]) {
    for (const node of nodes) {
      const title = localizedTitle(node.title, lang)
      if (title) map.set(node.id, title)
      if (node.children) walk(node.children)
    }
  }
  walk(toc)
  return map
}

/** Reading-order leaves of the TOC tree (skipping section nodes that have children). */
export function flattenTocLeaves(toc: TocNode[]): TocLeaf[] {
  const leaves: TocLeaf[] = []
  function walk(nodes: TocNode[]) {
    for (const node of nodes) {
      if (node.children?.length) {
        walk(node.children)
      } else {
        leaves.push({ id: node.id, index: leaves.length })
      }
    }
  }
  walk(toc)
  return leaves
}

/** All section (non-leaf) ids in the tree — used to "expand all" the TOC. */
export function collectAllSectionIds(toc: TocNode[]): Set<string> {
  const ids = new Set<string>()
  function walk(nodes: TocNode[]) {
    for (const node of nodes) {
      if (node.children?.length) {
        ids.add(node.id)
        walk(node.children)
      }
    }
  }
  walk(toc)
  return ids
}

/** True when at least one section in the tree has a section child (depth ≥ 2). */
export function hasNestedSections(toc: TocNode[]): boolean {
  function walk(nodes: TocNode[]): boolean {
    for (const node of nodes) {
      if (node.children?.some((c) => c.children?.length)) return true
      if (node.children?.length && walk(node.children)) return true
    }
    return false
  }
  return walk(toc)
}
