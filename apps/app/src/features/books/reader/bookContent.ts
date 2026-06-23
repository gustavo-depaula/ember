import { Marked } from 'marked'
import markedFootnote from 'marked-footnote'
import { cccBookProducerId, loadCccChapterHtml } from '@/content/cccCatalog'
import { ensureManifestBody, getEntry } from '@/content/contentIndex'
import { loadEscrivaChapterHtml } from '@/content/escrivaCatalog'
import { escrivaProducerId } from '@/content/escrivaWorks'
import type { BookEntry } from '@/content/manifestTypes'
import type { TocNode } from '@/content/resolver'
import { getBlob, getText } from '@/content/store'
import { galleryExtension } from '@/features/books/markedGalleryExtension'

const md = new Marked().use(markedFootnote()).use(galleryExtension())

/**
 * Loader for an external book's already-HTML chapter body, keyed by the book's
 * `source.producer`. Each fetches from its third-party site and caches locally.
 */
type ExternalChapterLoader = (
  bookId: string,
  chapterId: string,
  lang: string,
  url: string,
) => Promise<string>

const externalChapterLoaders: Record<string, ExternalChapterLoader> = {
  [escrivaProducerId]: loadEscrivaChapterHtml,
  [cccBookProducerId]: loadCccChapterHtml,
}

/** Position of a readable node in the reading flow — its title is styled by role. */
export type TocRole = 'part' | 'section' | 'chapter'
export type ReadingNode = { id: string; index: number; role: TocRole }
/** Subset consumed by sheets that only need id + reading-order index. */
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
  /** Resolve a chapter's body HTML — markdown parsed, images inlined as data
   *  URIs, and the leading H1 promoted to the role-styled title heading. */
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

/**
 * Rewrite a chapter body's first `<h1>…</h1>` into the role-styled title
 * heading the reader renders (`<h2 class="part-title|section-title|chapter-title">`).
 * The H1 is the canonical displayed title; the TOC label is navigation-only.
 * Markdown can't legally embed an H1 mid-paragraph, so a single string replace
 * of the first H1 is robust. No-op when the body has no leading H1.
 */
export function promoteFirstHeading(body: string, role: TocRole): string {
  return body.replace(
    /<h1\b[^>]*>([\s\S]*?)<\/h1>/i,
    (_m, inner) => `<h2 class="${role}-title">${inner}</h2>`,
  )
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

function inferRole(node: TocNode, depth: number): TocRole {
  if (node.role) return node.role
  if (node.children?.length) return depth === 0 ? 'part' : 'section'
  return 'chapter'
}

/**
 * The reading flow: every node the reader paginates through, in DFS preorder.
 * A leaf is always a page (a chapter). A group node (Part/Section) becomes a
 * page only when it carries a body file for this language — otherwise it stays
 * a pure structural grouping, visible in the TOC sheet but not in the flow.
 * Each node is tagged with the role that styles its promoted title heading.
 *
 * Leaves are included unconditionally (matching the old leaf-only walk and
 * external books whose chapter map populates lazily); group-body presence is
 * what newly admits Parts/Sections.
 */
export function flattenReadingFlow(
  toc: TocNode[],
  manifest: Pick<BookEntry, 'chapters'>,
  lang: string,
): ReadingNode[] {
  const flow: ReadingNode[] = []
  function walk(nodes: TocNode[], depth: number) {
    for (const node of nodes) {
      const isGroup = !!node.children?.length
      const hasBody = !!manifest.chapters?.[node.id]?.[lang]
      if (!isGroup || hasBody) {
        flow.push({ id: node.id, index: flow.length, role: inferRole(node, depth) })
      }
      if (isGroup) walk(node.children as TocNode[], depth + 1)
    }
  }
  walk(toc, 0)
  return flow
}

/** A node's title in `lang`, falling back to the first language present. */
export function localizedTitle(title: TocNode['title'], lang: string): string | undefined {
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

/**
 * groupId → summed leaf value beneath it, for every group node, in one
 * bottom-up pass — `leafValue` scores each leaf (1 to count all, 0/1 to count a
 * subset). Lets a TOC row read its subtree total by id instead of re-walking on
 * each render.
 */
function buildLeafIndex(toc: TocNode[], leafValue: (node: TocNode) => number): Map<string, number> {
  const counts = new Map<string, number>()
  function walk(node: TocNode): number {
    if (!node.children?.length) return leafValue(node)
    let n = 0
    for (const child of node.children) n += walk(child)
    counts.set(node.id, n)
    return n
  }
  for (const node of toc) walk(node)
  return counts
}

/** groupId → number of leaf chapters beneath it. */
export function buildLeafCountIndex(toc: TocNode[]): Map<string, number> {
  return buildLeafIndex(toc, () => 1)
}

/** groupId → number of leaves beneath it present in `completed`. */
export function buildCompletedLeafIndex(
  toc: TocNode[],
  completed: Set<string>,
): Map<string, number> {
  return buildLeafIndex(toc, (node) => (completed.has(node.id) ? 1 : 0))
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

/** A TOC node placed in a flat, render-ready list (the collapsible-tree row). */
export type FlatTocItem = {
  node: TocNode
  depth: number
  isLeaf: boolean
  isExpanded: boolean
}

/**
 * Flatten the TOC tree into the rows currently visible given `expandedIds`:
 * a group's children are emitted only while the group is expanded. Shared by
 * the in-reader TOC sheet and the book-detail Sumário so both collapse alike.
 */
export function flattenToc(nodes: TocNode[], expandedIds: Set<string>, depth = 0): FlatTocItem[] {
  const result: FlatTocItem[] = []
  for (const node of nodes) {
    const isLeaf = !node.children?.length
    const isExpanded = !isLeaf && expandedIds.has(node.id)
    result.push({ node, depth, isLeaf, isExpanded })
    if (isExpanded && node.children) {
      result.push(...flattenToc(node.children, expandedIds, depth + 1))
    }
  }
  return result
}

/**
 * The set of group ids on the path from the roots down to `targetId` (excluding
 * the target itself). Expanding these reveals the target's row. Empty when the
 * target is absent or undefined.
 */
export function ancestorGroupIds(toc: TocNode[], targetId?: string): Set<string> {
  const ids = new Set<string>()
  if (!targetId) return ids
  function find(nodes: TocNode[], path: string[]): boolean {
    for (const node of nodes) {
      if (node.id === targetId) return true
      if (node.children?.length) {
        path.push(node.id)
        if (find(node.children, path)) return true
        path.pop()
      }
    }
    return false
  }
  const path: string[] = []
  find(toc, path)
  for (const id of path) ids.add(id)
  return ids
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

  // Reading flow drives both the index→id map and the per-index role used to
  // style each chapter's promoted title. Must match the reader's flow exactly
  // (same flattenReadingFlow inputs; see useReadingFlow) so indices stay aligned.
  const readingFlow = manifest.toc ? flattenReadingFlow(manifest.toc, manifest, lang) : []
  const chapterIds = readingFlow.map((n) => n.id)
  // Navigation titles — only consulted by the defensive synthesized-body path.
  const titleLookup = manifest.toc
    ? buildTitleLookup(manifest.toc, lang)
    : new Map<string, string>()

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
    const node = readingFlow[index]
    if (!node) return ''
    const ref = manifest.chapters?.[node.id]?.[lang]
    // Defensive: a node in the flow with no markdown (shouldn't happen) still
    // gets its TOC title as a synthesized H1 so the page isn't blank.
    if (!ref) {
      const title = titleLookup.get(node.id)
      return title ? promoteFirstHeading(`<h1>${title}</h1>`, node.role) : ''
    }
    // External books fetch+cache their already-HTML chapter body from the
    // producer named by `source.producer`; bundled books read the hashed
    // markdown/HTML blob from Hearth.
    let html: string
    if ('type' in ref) {
      const loader = externalChapterLoaders[manifest.source?.producer ?? '']
      if (!loader) {
        throw new Error(
          `No external chapter loader for producer "${manifest.source?.producer}" (book ${manifest.id})`,
        )
      }
      html = await loader(manifest.id, node.id, lang, ref.url)
    } else {
      html = await renderBundledChapter(await getText(ref.hash), ref.format)
    }
    const promoted = promoteFirstHeading(extractBody(html), node.role)
    return inlineImages ? inlineChapterImages(promoted, imageRefs, imageCache) : promoted
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
