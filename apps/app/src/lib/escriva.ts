/**
 * Thin client for the official escriva.org API (https://escriva.org/api/v1).
 *
 * St. Josemaría Escrivá's works are © Fundación Studium / Opus Dei, so we never
 * persist them into our own corpus — we read them on demand from the publisher's
 * API and cache per-device. See content/escrivaCatalog.ts for how the responses
 * become external `BookEntry` manifests and content/escrivaWorks.ts for the
 * curated work list.
 *
 * Three endpoint families, keyed by a book's `book_group`:
 *  - base   → /chapters (thematic chapters) + /points (numbered paragraphs)
 *  - cartas → /cartas-chapters + /cartas-points (the letters)
 *  - one-level / holy-rosary → /one-level-texts (each text is a whole chapter)
 */

const baseUrl = 'https://escriva.org/api/v1'

/** Per-app-language site ids (GET /sites/). */
export const escrivaSiteId: Record<string, number> = {
  'en-US': 1,
  'pt-BR': 6,
}

export type EscrivaBookGroup = 'base' | 'cartas' | 'one-level' | 'holy-rosary'

/**
 * One chapter of an Escrivá book, language-specific. `bodyUrl` is the absolute
 * API URL whose response holds the chapter text — a paginated points list for
 * base/cartas, a single text object for one-level. `fetchChapterHtml` discovers
 * the shape at fetch time, so callers don't carry the group around.
 */
export type EscrivaChapter = {
  /** escriva.org chapter id (base/cartas only) — used to map points to chapters. */
  apiId?: number
  name: string
  bodyUrl: string
}

type Paginated<T> = { count: number; next: string | null; results: T[] }

/** Trailing numeric id of an escriva.org resource url (e.g. `…/chapters/3852/`). */
function idFromUrl(url: string | undefined): number | undefined {
  const m = url?.match(/\/(\d+)\/?$/)
  return m ? Number(m[1]) : undefined
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`escriva.org: ${url} failed (${res.status})`)
  }
  return res.json() as Promise<T>
}

/** Walk a DRF-paginated endpoint, following `next` until exhausted. */
async function fetchAllPages<T>(firstUrl: string): Promise<T[]> {
  const out: T[] = []
  let url: string | null = firstUrl
  while (url) {
    const page: Paginated<T> = await getJson<Paginated<T>>(url)
    out.push(...page.results)
    url = page.next
  }
  return out
}

function chapterListUrl(siteId: number, bookId: number, group: EscrivaBookGroup): string {
  const path =
    group === 'cartas'
      ? 'cartas-chapters'
      : group === 'one-level' || group === 'holy-rosary'
        ? 'one-level-texts'
        : 'chapters'
  return `${baseUrl}/${path}/?book_id=${bookId}&site_id=${siteId}&limit=100`
}

type ChapterListItem = {
  url: string
  name: string
  label?: string
  point_list_url?: string
}

/**
 * The ordered chapters of one book in one language. For base/cartas the body
 * lives behind each chapter's `point_list_url`; for one-level the text is the
 * item itself, fetched via its detail `url`.
 */
export async function fetchChapterList(
  siteId: number,
  bookId: number,
  group: EscrivaBookGroup,
): Promise<EscrivaChapter[]> {
  const items = await fetchAllPages<ChapterListItem>(chapterListUrl(siteId, bookId, group))
  const oneLevel = group === 'one-level' || group === 'holy-rosary'
  return items.map((it) => ({
    apiId: idFromUrl(it.url),
    name: it.name || it.label || '',
    bodyUrl: oneLevel ? it.url : (it.point_list_url ?? ''),
  }))
}

/**
 * Per-chapter range of point numbers for a book, keyed by escriva.org chapter id.
 * Used to show e.g. "1–46" beside a chapter in the maxims books' table of
 * contents. One book-wide pass over the points; numbers are language-agnostic.
 */
export async function fetchPointRanges(
  siteId: number,
  bookId: number,
): Promise<Map<number, { from: number; to: number }>> {
  type RangePoint = { number?: number; chapter?: { url: string } }
  const points = await fetchAllPages<RangePoint>(
    `${baseUrl}/points/?book_id=${bookId}&site_id=${siteId}&limit=100`,
  )
  const ranges = new Map<number, { from: number; to: number }>()
  for (const p of points) {
    const cid = idFromUrl(p.chapter?.url)
    if (typeof p.number !== 'number' || cid === undefined) continue
    const r = ranges.get(cid)
    if (!r) ranges.set(cid, { from: p.number, to: p.number })
    else ranges.set(cid, { from: Math.min(r.from, p.number), to: Math.max(r.to, p.number) })
  }
  return ranges
}

type EscrivaPoint = {
  number?: number
  label?: string
  text: string
  footnotes?: Record<string, string>
}

function renderFootnotes(footnotes: Record<string, string> | undefined): string {
  if (!footnotes) return ''
  const keys = Object.keys(footnotes)
  if (keys.length === 0) return ''
  const items = keys
    .map((k) => `<li id="fn-${k}"><span class="fn-num">${k}</span> ${footnotes[k]}</li>`)
    .join('')
  return `<section class="footnotes"><ol>${items}</ol></section>`
}

function renderPoint(p: EscrivaPoint): string {
  const num = typeof p.number === 'number' ? `<span class="point-num">${p.number}</span>` : ''
  return `<div class="point">${num}${p.text}${renderFootnotes(p.footnotes)}</div>`
}

// Scoped styling for the numbered points, prepended to the chapter body so it
// rides along with the cached HTML (the foliate reader has no per-book
// stylesheet hook). The point number reads as a quiet, letter-spaced label
// above each maxim rather than an orphaned digit; spacing separates the points.
const pointStyles =
  '<style>' +
  '.point{margin:0 0 1.7em}' +
  '.point-num{display:block;font-size:.72em;letter-spacing:.18em;opacity:.5;margin:0 0 .15em;font-variant-numeric:tabular-nums}' +
  '.point>p{margin:0 0 .5em}.point>p:last-child{margin-bottom:0}' +
  '.point .footnotes{margin-top:.6em;font-size:.82em;opacity:.65}' +
  '</style>'

/**
 * Assemble a chapter's body HTML from `bodyUrl`. Branches on the response shape:
 * a paginated points list (base/cartas) is rendered as numbered points; a single
 * one-level text object is returned as-is.
 */
export async function fetchChapterHtml(bodyUrl: string): Promise<string> {
  const json = await getJson<Paginated<EscrivaPoint> | EscrivaPoint>(bodyUrl)
  if (!('results' in json)) return json.text ?? ''
  const points = [...json.results]
  let next = json.next
  while (next) {
    const page = await getJson<Paginated<EscrivaPoint>>(next)
    points.push(...page.results)
    next = page.next
  }
  return pointStyles + points.map(renderPoint).join('')
}
