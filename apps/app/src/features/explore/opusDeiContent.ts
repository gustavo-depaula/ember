import { XMLParser } from 'fast-xml-parser'

/**
 * Opus Dei's "recent news" Atom feed (`lastarticles.xml`), parsed for the Explore
 * "From Opus Dei" row. The feed carries no images, so card art is resolved in a
 * second step from each article page's `og:image` (see `fetchOpusDeiImages`) —
 * the same two-step the Vatican source uses. Both fetches are native-only: the
 * feed and pages aren't CORS-enabled, and on web Explore degrades to a link-out.
 */

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

export type OdItem = { title: string; summary?: string; url: string; category?: string }

// opusdei.org keys its locale by a lowercase hyphenated path segment.
export function opusDeiLang(appLang: string | undefined): 'en-us' | 'pt-br' {
  return (appLang || 'en-US').startsWith('pt') ? 'pt-br' : 'en-us'
}

export function opusDeiHome(lang: string): string {
  return `https://opusdei.org/${lang}/`
}

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' })

// An Atom <link> is one object or an array; pick the alternate (or first) href.
function alternateHref(link: unknown): string | undefined {
  const links = Array.isArray(link) ? link : link ? [link] : []
  // biome-ignore lint/suspicious/noExplicitAny: parsed XML node shape
  const alt = (links as any[]).find((l) => l?.['@_rel'] === 'alternate') ?? links[0]
  // biome-ignore lint/suspicious/noExplicitAny: parsed XML node shape
  return (alt as any)?.['@_href']
}

// Atom text nodes come back as a string, or an object when the tag has attributes.
function textOf(node: unknown): string | undefined {
  if (typeof node === 'string') return node.trim() || undefined
  // biome-ignore lint/suspicious/noExplicitAny: parsed XML node shape
  const t = (node as any)?.['#text']
  return typeof t === 'string' ? t.trim() || undefined : undefined
}

async function get(url: string): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10_000)
  try {
    const res = await fetch(url, {
      headers: { 'user-agent': USER_AGENT },
      credentials: 'omit',
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`opus-dei feed ${res.status}`)
    return res.text()
  } finally {
    clearTimeout(timer)
  }
}

export async function fetchOpusDeiArticles(lang: string): Promise<OdItem[]> {
  const xml = await get(`https://opusdei.org/${lang}/lastarticles.xml`)
  const feed = parser.parse(xml)?.feed
  const entries = feed?.entry ? (Array.isArray(feed.entry) ? feed.entry : [feed.entry]) : []
  const items: OdItem[] = []
  for (const e of entries) {
    const url = alternateHref(e?.link)
    const title = textOf(e?.title)
    if (!url || !title) continue
    items.push({
      title,
      summary: textOf(e?.summary),
      url,
      category: e?.category?.['@_term'],
    })
  }
  return items
}

// Card-sized variant of the page's `og:image`. The CDN takes a `w=` width param;
// shrink the social 1200px image so cards don't pull full-width hero JPEGs.
function cardImage(ogImage: string): string {
  return /[?&]w=\d+/.test(ogImage) ? ogImage.replace(/([?&]w=)\d+/, '$1600') : ogImage
}

async function ogImage(url: string): Promise<string | undefined> {
  try {
    const html = await get(url)
    const meta = html.match(/<meta[^>]*property=["']og:image["'][^>]*>/i)?.[0]
    const src = meta?.match(/content=["']([^"']+)["']/i)?.[1]
    return src ? cardImage(src) : undefined
  } catch {
    return undefined
  }
}

// article-URL → card image, resolving the top `limit` pages in parallel. Native
// only (the pages aren't CORS-enabled); tiles without an entry fall back to a
// solid tone, exactly like the Vatican news row.
export async function fetchOpusDeiImages(
  urls: string[],
  limit = 10,
): Promise<Record<string, string>> {
  const top = urls.slice(0, limit)
  const resolved = await Promise.all(top.map((u) => ogImage(u).then((img) => [u, img] as const)))
  const map: Record<string, string> = {}
  for (const [u, img] of resolved) if (img) map[u] = img
  return map
}
