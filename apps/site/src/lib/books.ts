import { findBookImage, loadBook } from '@/content/books'
import { ensureManifestBody, getEntry, isMetaId } from '@/content/contentIndex'
import type { BookEntry, CatalogEntry, TocNode } from '@/content/manifestTypes'
import {
  type BookEdition,
  bookEditions,
  matchingNode,
  versionView,
} from '@/features/books/editions'
import {
  type BookSession,
  flattenReadingFlow,
  localizedTitle,
  openBookSession,
} from '@/features/books/reader/bookContent'
import { localizeContent } from '@/lib/i18n'
import enUS from '@/lib/i18n/locales/en-US'
import ptBR from '@/lib/i18n/locales/pt-BR'
import { blobUrl } from '~/platform/store'
import { href } from '~/routes'
import { listEntries } from './catalog'
import { bootCorpus } from './corpus'
import { type Locale, locales, withLocale } from './locale'

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
  /** The book as the edition's version presents it. */
  book: BookEntry
  manifest: BookEntry
  edition: BookEdition
  editions: BookEdition[]
  lang: string
  /** The side whose pages hold this edition's chapters. */
  home: Locale
  /** The edition's URL segment there; none for that side's default text. */
  slug?: string
  readable: Set<string>
}

/**
 * Where an edition's chapters are pages: a text in a site language on that
 * language's side, a text in any other (Latin, Spanish) on both.
 */
export function editionSides(edition: BookEdition): Locale[] {
  return (locales as readonly string[]).includes(edition.language)
    ? [edition.language as Locale]
    : [...locales]
}

/** The text a side opens a book on, whose pages keep the plain URLs. */
function sideDefault(editions: BookEdition[], locale: Locale): BookEdition | undefined {
  return (
    editions.find((e) => !e.version && e.language === locale) ??
    editions.find((e) => !e.version && editionSides(e).includes(locale))
  )
}

/** An edition's URL segment on a side: none for the side's default text,
 *  else its language (`la`) or its version and language (`npnf-en`). */
function editionSlug(
  editions: BookEdition[],
  edition: BookEdition,
  side: Locale,
): string | undefined {
  if (sideDefault(editions, side)?.id === edition.id) return undefined
  const short = edition.language.split('-')[0]
  return edition.version ? `${edition.version}-${short}` : short
}

const contexts = new Map<string, Promise<BookContext | undefined>>()

// Every chapter page asks for its book's contexts: each is built once.
function contextFor(
  id: string,
  locale: Locale,
  editionId?: string,
): Promise<BookContext | undefined> {
  const key = `${id}\n${locale}\n${editionId ?? ''}`
  let ctx = contexts.get(key)
  if (!ctx) {
    ctx = buildContext(id, locale, editionId)
    contexts.set(key, ctx)
  }
  return ctx
}

async function buildContext(
  id: string,
  locale: Locale,
  editionId?: string,
): Promise<BookContext | undefined> {
  await bootCorpus()
  const manifest = await loadBook(id)
  if (!manifest) return undefined
  const editions = bookEditions(manifest)
  const edition = editionId
    ? editions.find((e) => e.id === editionId)
    : // A book with no text of its own on this side (English only, seen from
      // the Portuguese) opens on the text another side hosts.
      (sideDefault(editions, locale) ?? editions.find((e) => !e.version) ?? editions[0])
  if (!edition) return undefined
  const sides = editionSides(edition)
  const home = sides.includes(locale) ? locale : sides[0]
  const book = versionView(manifest, edition.version)
  const flow = flattenReadingFlow(book.toc ?? [], book, edition.language)
  return {
    book,
    manifest,
    edition,
    editions,
    lang: edition.language,
    home,
    slug: editionSlug(editions, edition, home),
    readable: new Set(flow.map((n) => n.id)),
  }
}

function chapterHref(ctx: BookContext, nodeId: string): string {
  return href.bookChapter(ctx.home, ctx.manifest.id, nodeId, ctx.slug)
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
      href: readable || paged ? chapterHref(ctx, node.id) : undefined,
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

/** A language's name on a side, from the app's own names. Portuguese writes
 *  it lower-case mid-sentence ("Este livro está em latim"). */
export function languageName(locale: Locale, language: string): string {
  const names: Record<string, string> = (locale === 'pt-BR' ? ptBR : enUS).languages
  const name = names[language] ?? language
  return locale === 'pt-BR' ? name.toLocaleLowerCase('pt-BR') : name
}

/** How a text is named in a book's switch: its language, and its translator
 *  where one language has several texts. */
export function editionName(locale: Locale, edition: { language: string; label?: string }): string {
  const language = languageName(locale, edition.language)
  const capital = language.charAt(0).toLocaleUpperCase(locale) + language.slice(1)
  return edition.label ? `${capital} — ${edition.label}` : capital
}

/** One text of a book as its page shows it: its contents and where they lead. */
export type EditionPanel = {
  id: string
  /** The edition's name in the page's links (`npnf-en`), stable across sides. */
  key: string
  /** The language of the text, and the translator where that tells it apart. */
  language: string
  label?: string
  /** The side hosting this text's chapters. */
  home: Locale
  toc: TocItem[]
  chapterCount: number
  firstChapter?: string
  sources: { url?: string; description?: string }[]
}

export type BookPage = {
  id: string
  title: string
  author?: string
  description?: string
  composed?: string
  cover: string | undefined
  /** Every language some text of the book is in. */
  langs: string[]
  editions: EditionPanel[]
  /** The edition the page opens on. */
  edition: string
}

function editionKey(edition: BookEdition): string {
  const short = edition.language.split('-')[0]
  return edition.version ? `${edition.version}-${short}` : short
}

function panel(ctx: BookContext): EditionPanel {
  const toc = ctx.book.toc ?? []
  const first = flattenReadingFlow(toc, ctx.book, ctx.lang)[0]
  return {
    id: ctx.edition.id,
    key: editionKey(ctx.edition),
    language: ctx.edition.language,
    label: ctx.edition.label,
    home: ctx.home,
    toc: tocItems(ctx, toc, countNodes(toc) > tocPageLimit, 0),
    chapterCount: ctx.readable.size,
    firstChapter: first && chapterHref(ctx, first.id),
    sources: (ctx.book.sources ?? []).filter((source) => source.language === ctx.lang),
  }
}

export async function loadBookPage(id: string, locale: Locale): Promise<BookPage | undefined> {
  const ctx = await contextFor(id, locale)
  if (!ctx) return undefined
  const { manifest: book } = ctx
  const others = await Promise.all(
    ctx.editions.filter((e) => e.id !== ctx.edition.id).map((e) => contextFor(id, locale, e.id)),
  )
  const order = (c: BookContext) => ctx.editions.findIndex((e) => e.id === c.edition.id)
  const panels = [ctx, ...others.filter((c): c is BookContext => !!c)]
    .sort((a, b) => order(a) - order(b))
    .map(panel)
  return withLocale(locale, () => ({
    id: book.id,
    title: localizeContent(book.name),
    author: book.author ? localizeContent(book.author) : undefined,
    // A blurb written only in the other language would read as a stray paragraph.
    description: (book.description as Record<string, string | undefined> | undefined)?.[locale],
    composed: book.composed === undefined ? undefined : String(book.composed),
    cover: getEntry(book.id)?.cover,
    langs: [...new Set(ctx.editions.map((e) => e.language))],
    editions: panels,
    edition: ctx.edition.id,
  }))
}

export type BookNodeListing = { nodeId: string; kind: 'chapter' | 'part' }

/** A book's texts, each with the sides that host its chapters. */
export async function listBookEditions(
  id: string,
): Promise<{ edition: BookEdition; sides: Locale[] }[]> {
  const ctx = await contextFor(id, 'en-US')
  return (ctx?.editions ?? []).map((edition) => ({ edition, sides: editionSides(edition) }))
}

/** A text's URL segment on each side hosting it (none for a side's default). */
export async function editionSlugs(
  id: string,
  edition: string,
): Promise<Partial<Record<Locale, string>>> {
  const out: Partial<Record<Locale, string>> = {}
  const ctx = await contextFor(id, 'en-US', edition)
  for (const side of ctx ? editionSides(ctx.edition) : []) {
    out[side] = editionSlug(ctx?.editions ?? [], ctx?.edition as BookEdition, side)
  }
  return out
}

/** Every node of one text of a book that is a page. */
export async function listBookNodes(id: string, edition: string): Promise<BookNodeListing[]> {
  const ctx = await contextFor(id, 'en-US', edition)
  if (!ctx) return []
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

function sessionFor(id: string, edition: BookEdition): Promise<BookSession | undefined> {
  const key = `${id}\n${edition.id}`
  let session = sessions.get(key)
  if (!session) {
    session = openBookSession(id, edition.language, edition.version)
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

/** Another text of the book, from a chapter: its matching page, or its contents. */
export type OtherEdition = { language: string; label?: string; href: string }

export type ChapterPage = {
  bookId: string
  /** The book's other texts, each opened where it matches this page. */
  others: OtherEdition[]
  bookTitle: string
  author?: string
  title: string
  lang: string
  /** Chapter body, or undefined for a part's contents page. */
  html?: string
  /** A part's contents, when this node is a part. */
  toc: TocItem[]
  trail: Crumb[]
  /** The chapter's neighbours in its part, for the rail: the book's contents at this point. */
  siblings: (Crumb & { current: boolean })[]
  position?: { index: number; total: number }
  previous?: Crumb
  next?: Crumb
}

export async function loadChapterPage(
  id: string,
  nodeId: string,
  locale: Locale,
  edition?: string,
): Promise<ChapterPage | undefined> {
  const ctx = await contextFor(id, locale, edition)
  if (!ctx) return undefined
  const { book, lang } = ctx
  const path = findNode(book.toc ?? [], nodeId)
  if (!path) return undefined
  const node = path[path.length - 1]
  const session = await sessionFor(id, ctx.edition)
  if (!session) return undefined
  const index = session.chapterIds.indexOf(nodeId)
  const titleOf = (n: TocNode) => localizedTitle(n.title, lang) ?? n.id
  const crumb = (i: number): Crumb | undefined => {
    const chapterId = session.chapterIds[i]
    const found = chapterId && findNode(book.toc ?? [], chapterId)
    return found
      ? {
          title: titleOf(found[found.length - 1]),
          href: chapterHref(ctx, chapterId),
        }
      : undefined
  }
  const split = countNodes(book.toc ?? []) > tocPageLimit
  const linkable = (n: TocNode) =>
    ctx.readable.has(n.id) || (split && countNodes(n.children ?? []) > 12)
      ? chapterHref(ctx, n.id)
      : undefined
  // A part can hold hundreds of chapters (a letter of the Encyclopedia): the
  // rail shows the stretch around this one.
  const around = 30
  const peers = path.length > 1 ? (path[path.length - 2].children ?? []) : (book.toc ?? [])
  const at = peers.findIndex((n) => n.id === nodeId)
  const from = Math.max(0, Math.min(at - around / 2, peers.length - around))
  const siblings = peers.slice(from, from + around).map((n) => ({
    title: titleOf(n),
    href: linkable(n),
    current: n.id === nodeId,
  }))
  const html = index >= 0 ? withImageUrls(await session.getChapterPlain(index), book) : undefined
  const others = await otherEditions(ctx, nodeId, locale)
  return withLocale(locale, () => ({
    bookId: book.id,
    others,
    bookTitle: localizeContent(book.name),
    author: book.author ? localizeContent(book.author) : undefined,
    title: titleOf(node),
    lang,
    html,
    toc: node.children?.length ? tocItems(ctx, node.children, split, path.length) : [],
    trail: [
      {
        title: localizeContent(book.name),
        href: `${href.book(locale, book.id)}#${editionKey(ctx.edition)}`,
      },
      ...path.slice(0, -1).map((n) => ({
        title: titleOf(n),
        href:
          ctx.readable.has(n.id) || (split && countNodes(n.children ?? []) > 12)
            ? chapterHref(ctx, n.id)
            : undefined,
      })),
    ],
    siblings,
    position: index >= 0 ? { index, total: session.chapterIds.length } : undefined,
    previous: index > 0 ? crumb(index - 1) : undefined,
    next: index >= 0 ? crumb(index + 1) : undefined,
  }))
}

async function otherEditions(
  ctx: BookContext,
  nodeId: string,
  locale: Locale,
): Promise<OtherEdition[]> {
  const out: OtherEdition[] = []
  for (const edition of ctx.editions) {
    if (edition.id === ctx.edition.id) continue
    const other = await contextFor(ctx.manifest.id, locale, edition.id)
    if (!other) continue
    // Another language of this text has the same pages; another version
    // lands where its `match` says, else on its contents.
    const target =
      edition.version === ctx.edition.version
        ? nodeId
        : matchingNode(ctx.manifest, ctx.edition.version, nodeId, edition.version)
    out.push({
      language: edition.language,
      label: edition.label,
      href:
        target && other.readable.has(target)
          ? chapterHref(other, target)
          : `${href.book(locale, ctx.manifest.id)}#${editionKey(edition)}`,
    })
  }
  return out
}

export async function bookManifest(id: string): Promise<BookEntry | undefined> {
  await bootCorpus()
  const entry = getEntry(id)
  return entry && !isMetaId(id) ? ensureManifestBody<BookEntry>(entry.hash) : undefined
}
