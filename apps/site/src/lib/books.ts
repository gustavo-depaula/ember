import { findBookImage, loadBook } from '@/content/books'
import { ensureManifestBody, getEntry, isMetaId } from '@/content/contentIndex'
import type { BookEntry, CatalogEntry, TocNode } from '@/content/manifestTypes'
import {
  type BookSession,
  flattenReadingFlow,
  localizedTitle,
  openBookSession,
} from '@/features/books/reader/bookContent'
import { localizeContent } from '@/lib/i18n'
import { blobUrl } from '~/platform/store'
import { href } from '~/routes'
import { chapterHome, listEntries } from './catalog'
import { bootCorpus } from './corpus'
import { type Locale, withLocale } from './locale'

/** A table of contents longer than this is split across pages, one per part. */
const tocPageLimit = 400

export type BookListing = { id: string; entry: CatalogEntry; langs: string[] }

export async function listBooks(): Promise<BookListing[]> {
  await bootCorpus()
  return listEntries('book').map(([id, entry]) => ({ id, entry, langs: entry.langs ?? ['en-US'] }))
}

function countNodes(nodes: TocNode[]): number {
  return nodes.reduce((n, node) => n + 1 + countNodes(node.children ?? []), 0)
}

function countLeaves(nodes: TocNode[]): number {
  return nodes.reduce((n, node) => n + (node.children?.length ? countLeaves(node.children) : 1), 0)
}

export type TocItem = {
  id: string
  title: string
  /** Where the row leads: a chapter, a part's own page, or nowhere (a heading). */
  href?: string
  range?: string
  leaves: number
  children: TocItem[]
}

type BookContext = {
  book: BookEntry
  lang: string
  home: Locale
  readable: Set<string>
}

async function contextFor(id: string, locale: Locale): Promise<BookContext | undefined> {
  await bootCorpus()
  const book = await loadBook(id)
  if (!book) return undefined
  const { locale: home, lang } = chapterHome(book.languages ?? ['en-US'], locale)
  const flow = flattenReadingFlow(book.toc ?? [], book, lang)
  return { book, lang, home, readable: new Set(flow.map((n) => n.id)) }
}

// A group with no body of its own is a page only in a long book, where it
// carries the part of the contents the book's own page leaves out.
function tocItems(ctx: BookContext, nodes: TocNode[], split: boolean, depth: number): TocItem[] {
  return nodes.map((node) => {
    const children = node.children ?? []
    const isGroup = children.length > 0
    const paged = isGroup && split && countNodes(children) > 12
    const readable = ctx.readable.has(node.id)
    return {
      id: node.id,
      title: localizedTitle(node.title, ctx.lang) ?? node.id,
      href: readable || paged ? href.bookChapter(ctx.home, ctx.book.id, node.id) : undefined,
      range: node.pointRange ? `${node.pointRange.from}–${node.pointRange.to}` : undefined,
      leaves: isGroup ? countLeaves(children) : 0,
      children: paged ? [] : tocItems(ctx, children, split, depth + 1),
    }
  })
}

function findNode(nodes: TocNode[], id: string, trail: TocNode[] = []): TocNode[] | undefined {
  for (const node of nodes) {
    if (node.id === id) return [...trail, node]
    const found = node.children && findNode(node.children, id, [...trail, node])
    if (found) return found
  }
  return undefined
}

export type BookPage = {
  id: string
  title: string
  author?: string
  description?: string
  composed?: string
  sources: { url?: string; description?: string }[]
  cover: string | undefined
  langs: string[]
  /** The language the chapters are read in, and the locale hosting them. */
  lang: string
  home: Locale
  toc: TocItem[]
  chapterCount: number
  firstChapter?: string
}

export async function loadBookPage(id: string, locale: Locale): Promise<BookPage | undefined> {
  const ctx = await contextFor(id, locale)
  if (!ctx) return undefined
  const { book } = ctx
  const toc = book.toc ?? []
  const first = flattenReadingFlow(toc, book, ctx.lang)[0]
  return withLocale(locale, () => ({
    id: book.id,
    title: localizeContent(book.name),
    author: book.author ? localizeContent(book.author) : undefined,
    // A blurb written only in the other language would read as a stray paragraph.
    description: (book.description as Record<string, string | undefined> | undefined)?.[locale],
    composed: book.composed === undefined ? undefined : String(book.composed),
    sources:
      (book as unknown as { sources?: { url?: string; description?: string }[] }).sources ?? [],
    cover: getEntry(book.id)?.cover,
    langs: book.languages ?? ['en-US'],
    lang: ctx.lang,
    home: ctx.home,
    toc: tocItems(ctx, toc, countNodes(toc) > tocPageLimit, 0),
    chapterCount: ctx.readable.size,
    firstChapter: first && href.bookChapter(ctx.home, book.id, first.id),
  }))
}

export type BookNodeListing = { nodeId: string; kind: 'chapter' | 'part' }

/** Every node of a book that has a page under `locale`, or none if another locale hosts it. */
export async function listBookNodes(id: string, locale: Locale): Promise<BookNodeListing[]> {
  const ctx = await contextFor(id, locale)
  if (!ctx || ctx.home !== locale) return []
  const split = countNodes(ctx.book.toc ?? []) > tocPageLimit
  const out: BookNodeListing[] = []
  // A contents list may name one chapter twice (the Catholic Encyclopedia files
  // an article under each of its headwords): it is still one page.
  const seen = new Set<string>()
  function walk(nodes: TocNode[]) {
    for (const node of nodes) {
      const children = node.children ?? []
      const kind = ctx?.readable.has(node.id)
        ? 'chapter'
        : children.length && split && countNodes(children) > 12
          ? 'part'
          : undefined
      if (kind && !seen.has(node.id)) {
        seen.add(node.id)
        out.push({ nodeId: node.id, kind })
      }
      walk(children)
    }
  }
  walk(ctx.book.toc ?? [])
  return out
}

const sessions = new Map<string, Promise<BookSession | undefined>>()

function sessionFor(id: string, lang: string): Promise<BookSession | undefined> {
  const key = `${id}\n${lang}`
  let session = sessions.get(key)
  if (!session) {
    session = openBookSession(id, lang)
    sessions.set(key, session)
  }
  return session
}

// The app inlines chapter images as data URIs for its offline reader; a page
// points at the same blobs on Hearth instead.
function withImageUrls(html: string, book: BookEntry): string {
  return html.replace(/(<img\b[^>]*\bsrc=["'])([^"']+)(["'])/gi, (match, before, src, after) => {
    const image = findBookImage(book, src)
    return image ? `${before}${blobUrl(image.hash)}${after} loading="lazy" decoding="async"` : match
  })
}

export type Crumb = { title: string; href?: string }

export type ChapterPage = {
  bookId: string
  bookTitle: string
  author?: string
  title: string
  lang: string
  /** Chapter body, or undefined for a part's contents page. */
  html?: string
  /** A part's contents, when this node is a part. */
  toc: TocItem[]
  trail: Crumb[]
  position?: { index: number; total: number }
  previous?: Crumb
  next?: Crumb
}

export async function loadChapterPage(
  id: string,
  nodeId: string,
  locale: Locale,
): Promise<ChapterPage | undefined> {
  const ctx = await contextFor(id, locale)
  if (!ctx) return undefined
  const { book, lang } = ctx
  const path = findNode(book.toc ?? [], nodeId)
  if (!path) return undefined
  const node = path[path.length - 1]
  const session = await sessionFor(id, lang)
  if (!session) return undefined
  const index = session.chapterIds.indexOf(nodeId)
  const titleOf = (n: TocNode) => localizedTitle(n.title, lang) ?? n.id
  const crumb = (i: number): Crumb | undefined => {
    const chapterId = session.chapterIds[i]
    const found = chapterId && findNode(book.toc ?? [], chapterId)
    return found
      ? {
          title: titleOf(found[found.length - 1]),
          href: href.bookChapter(ctx.home, book.id, chapterId),
        }
      : undefined
  }
  const split = countNodes(book.toc ?? []) > tocPageLimit
  const html = index >= 0 ? withImageUrls(await session.getChapterPlain(index), book) : undefined
  return withLocale(locale, () => ({
    bookId: book.id,
    bookTitle: localizeContent(book.name),
    author: book.author ? localizeContent(book.author) : undefined,
    title: titleOf(node),
    lang,
    html,
    toc: node.children?.length ? tocItems(ctx, node.children, split, path.length) : [],
    trail: [
      { title: localizeContent(book.name), href: href.book(locale, book.id) },
      ...path.slice(0, -1).map((n) => ({
        title: titleOf(n),
        href:
          ctx.readable.has(n.id) || (split && countNodes(n.children ?? []) > 12)
            ? href.bookChapter(ctx.home, book.id, n.id)
            : undefined,
      })),
    ],
    position: index >= 0 ? { index, total: session.chapterIds.length } : undefined,
    previous: index > 0 ? crumb(index - 1) : undefined,
    next: index >= 0 ? crumb(index + 1) : undefined,
  }))
}

export async function bookManifest(id: string): Promise<BookEntry | undefined> {
  await bootCorpus()
  const entry = getEntry(id)
  return entry && !isMetaId(id) ? ensureManifestBody<BookEntry>(entry.hash) : undefined
}
