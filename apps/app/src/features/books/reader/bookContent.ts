import { Marked } from 'marked'
import markedFootnote from 'marked-footnote'
import { ensureManifestBody, getEntry } from '@/content/contentIndex'
import { loadEscrivaChapterHtml } from '@/content/escrivaCatalog'
import type { BookEntry } from '@/content/manifestTypes'
import type { TocNode } from '@/content/resolver'
import { getBlob, getText } from '@/content/store'
import { galleryExtension } from '@/features/books/markedGalleryExtension'

const md = new Marked().use(markedFootnote()).use(galleryExtension())

export type TocLeaf = { id: string; index: number }

/** Per-chapter image lookup built once from manifest.images. */
type ImageRef = { hash: string; mime?: string }

/**
 * Live reader session for one (book, lang). Manifest + CSS load up-front; chapter
 * bodies stream in on demand via getChapter / preloadChapter and stay in a
 * small in-memory LRU. The 110 MB Catholic Encyclopedia opens in two HTTP
 * round-trips (catalog + manifest, both cached) — no bulk download.
 */
export type BookSession = {
  css: string
  manifest: BookEntry
  /** Reading-order leaf chapter ids (matches the TOC walk). */
  chapterIds: string[]
  /** Resolve a chapter's body HTML — markdown parsed, images inlined as
   *  data URIs. Title prepending is the caller's job (see withChapterTitle). */
  getChapter(index: number): Promise<string>
  /** Same as getChapter but returns plain text and skips image inlining;
   *  cheap path for search snippet anchoring. Result is NOT cached separately
   *  from getChapter — backs into the same body cache. */
  getChapterPlain(index: number): Promise<string>
  /** Fire-and-forget prefetch; used for ±N lookahead on relocate. */
  preloadChapter(index: number): void
  /** Synchronous cache peek; undefined if not loaded yet. */
  getCachedChapter(index: number): string | undefined
}

/** Prepends the conventional chapter-title heading. Cheap; safe to call repeatedly. */
export function withChapterTitle(body: string, title: string | undefined): string {
  if (!title) return body
  return `<h2 class="chapter-title">${title}</h2>${body}`
}

const LRU_CAP = 32

function mimeForExt(filename: string): string {
  if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) return 'image/jpeg'
  if (filename.endsWith('.png')) return 'image/png'
  if (filename.endsWith('.gif')) return 'image/gif'
  if (filename.endsWith('.svg')) return 'image/svg+xml'
  if (filename.endsWith('.webp')) return 'image/webp'
  return 'image/jpeg'
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

function extractBody(html: string): string {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)
  return bodyMatch ? bodyMatch[1].trim() : html
}

/** Bundled chapters are markdown unless flagged `html`; external bodies are HTML already. */
async function renderBundledChapter(raw: string, format?: 'html'): Promise<string> {
  return format === 'html' ? raw : md.parse(raw)
}

function collectImgSrcs(html: string): string[] {
  const srcs = new Set<string>()
  const re = /<img\b[^>]*\bsrc=["']([^"']+)["']/gi
  let m = re.exec(html)
  while (m !== null) {
    const src = m[1]
    if (!src.startsWith('data:')) srcs.add(src)
    m = re.exec(html)
  }
  return [...srcs]
}

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

export function countTocNodes(toc: TocNode[]): number {
  let n = 0
  function walk(nodes: TocNode[]) {
    for (const node of nodes) {
      n++
      if (node.children) walk(node.children)
    }
  }
  walk(toc)
  return n
}

export function firstLeafId(node: TocNode): string {
  if (!node.children?.length) return node.id
  for (const child of node.children) return firstLeafId(child)
  return node.id
}

export function countLeavesUnder(node: TocNode): number {
  if (!node.children?.length) return 1
  let n = 0
  for (const child of node.children) n += countLeavesUnder(child)
  return n
}

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

/**
 * Build the image-src lookup once per session. The same image may be
 * referenced under either `images/foo.jpg` or `../images/foo.jpg` depending
 * on author convention, so we register both forms.
 */
function buildImageRefs(manifest: BookEntry): Map<string, ImageRef> {
  const refs = new Map<string, ImageRef>()
  for (const im of manifest.images ?? []) {
    refs.set(`../images/${im.rel}`, { hash: im.hash, mime: im.mime })
    refs.set(`images/${im.rel}`, { hash: im.hash, mime: im.mime })
  }
  return refs
}

/**
 * Resolve every <img src=...> referenced by `body` to a data URI and rewrite
 * the body inline. Images that don't map to a manifest ref are left alone.
 */
async function inlineChapterImages(
  body: string,
  imageRefs: Map<string, ImageRef>,
  imageCache: Map<string, string>,
): Promise<string> {
  const srcs = collectImgSrcs(body)
  if (srcs.length === 0) return body
  await Promise.all(
    srcs.map(async (src) => {
      if (imageCache.has(src)) return
      const ref = imageRefs.get(src) ?? imageRefs.get(src.replace(/^\.\.\//, ''))
      if (!ref) return
      try {
        const bytes = await getBlob(ref.hash)
        const mime = ref.mime ?? mimeForExt(src)
        imageCache.set(src, `data:${mime};base64,${bytesToBase64(bytes)}`)
      } catch (err) {
        console.warn(`[bookContent] image ${src} failed to load:`, err)
      }
    }),
  )
  let out = body
  for (const src of srcs) {
    const dataUri = imageCache.get(src)
    if (!dataUri) continue
    if (out.includes(src)) out = out.replaceAll(src, dataUri)
    const parent = `../${src}`
    if (out.includes(parent)) out = out.replaceAll(parent, dataUri)
  }
  return out
}

/**
 * Open a reader session for (book, lang). Fetches manifest + CSS up-front,
 * returns a handle that the BookReader uses to stream chapters on demand.
 *
 * Returns undefined when the catalog entry is missing for this book id —
 * the caller is expected to render its own not-found surface.
 */
export async function openBookSession(
  bookId: string,
  lang: string,
): Promise<BookSession | undefined> {
  const corpusId = bookId.startsWith('book/') ? bookId : `book/${bookId}`
  const entry = getEntry(corpusId)
  if (!entry) return undefined

  // ensureManifestBody resolves both Hearth books (by blob hash) and external
  // Escrivá books (built on demand from the API via the manifest resolver).
  const manifest = await ensureManifestBody<BookEntry>(entry.hash)
  const css = manifest.style ? await getText(manifest.style.hash).catch(() => '') : ''
  const imageRefs = buildImageRefs(manifest)

  const chapterIds = manifest.toc ? flattenTocLeaves(manifest.toc).map((l) => l.id) : []

  // Map insertion order = recency: delete + re-set on hit, evict head on overflow.
  const cache = new Map<number, string>()
  const imageCache = new Map<string, string>()
  const inflight = new Map<number, Promise<string>>()

  function bumpAndCache(index: number, body: string) {
    if (cache.has(index)) cache.delete(index)
    cache.set(index, body)
    if (cache.size > LRU_CAP) {
      const oldest = cache.keys().next().value
      if (oldest !== undefined) cache.delete(oldest)
    }
  }

  async function fetchChapter(index: number, inlineImages: boolean): Promise<string> {
    const id = chapterIds[index]
    if (!id) return ''
    const ref = manifest.chapters?.[id]?.[lang]
    if (!ref) return ''
    // External books (Escrivá) fetch+cache their already-HTML chapter body from
    // the producer; bundled books read the hashed markdown/HTML blob from Hearth.
    const html =
      'type' in ref
        ? await loadEscrivaChapterHtml(manifest.id, id, lang, ref.url)
        : await renderBundledChapter(await getText(ref.hash), ref.format)
    const body = extractBody(html)
    return inlineImages ? inlineChapterImages(body, imageRefs, imageCache) : body
  }

  async function getChapter(index: number): Promise<string> {
    const cached = cache.get(index)
    if (cached !== undefined) {
      cache.delete(index)
      cache.set(index, cached)
      return cached
    }
    let pending = inflight.get(index)
    if (!pending) {
      pending = fetchChapter(index, true).finally(() => inflight.delete(index))
      inflight.set(index, pending)
    }
    const body = await pending
    bumpAndCache(index, body)
    return body
  }

  return {
    css,
    manifest,
    chapterIds,
    getChapter,
    // Plain path bypasses image inlining for search snippet anchoring — saves
    // a second blob fetch per image times 50 results. Cache-hit if any prior
    // call (eager or plain) loaded this chapter; otherwise fetches without
    // inlining and does NOT store the bare body in the cache (so the next
    // image-needing call still has to do the image pass).
    getChapterPlain: async (index) => {
      const cached = cache.get(index)
      if (cached !== undefined) return cached
      return fetchChapter(index, false)
    },
    preloadChapter: (index) => {
      if (index < 0 || index >= chapterIds.length) return
      if (cache.has(index) || inflight.has(index)) return
      void getChapter(index).catch((err) => {
        console.warn(`[bookContent] preload chapter ${index} failed:`, err)
      })
    },
    getCachedChapter: (index) => cache.get(index),
  }
}
