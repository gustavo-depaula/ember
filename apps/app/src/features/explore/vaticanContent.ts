import { parseDocument } from 'htmlparser2'

/**
 * Fetches and parses the official Vatican News widget fragment
 * (`widget.{lang}.html`) into typed content, so Explore can render it natively
 * (in Ember's voice) instead of embedding the white Bootstrap widget. The
 * fragment is server-rendered, CORS-open (`access-control-allow-origin: *`), and
 * cacheable (`max-age=900`) — the same source `widget.js` itself consumes.
 *
 * The markup is stable but not a contract; the parser is defensive and the
 * caller (`FromRome`) falls back to the embed when extraction comes back empty.
 */

const widgetOrigin = 'https://www.vaticannews.va'

export type VnVideo = { id: string; title: string; date: string; thumb: string }
export type VnItem = { title: string; date: string; url: string }
export type VnOutlet = { label: string; url: string }

export type VaticanContent = {
  videos: VnVideo[]
  featured?: VnItem
  news: VnItem[]
  holySee: VnItem[]
  outlets: VnOutlet[]
}

// --- minimal DOM walk over domhandler nodes (no css-select dep) ---

// biome-ignore lint/suspicious/noExplicitAny: domhandler node shape
type Node = any
const isEl = (n: Node) => n.type === 'tag' || n.type === 'script' || n.type === 'style'

function walk(n: Node, fn: (n: Node) => void): void {
  fn(n)
  if (n.children) for (const c of n.children) walk(c, fn)
}
const classOf = (el: Node): string => el.attribs?.class ?? ''
const hasClass = (el: Node, c: string): boolean => classOf(el).split(/\s+/).includes(c)
const attr = (el: Node | undefined, k: string): string | undefined => el?.attribs?.[k]

function text(n: Node | undefined): string {
  if (!n) return ''
  let s = ''
  walk(n, (x) => {
    if (x.type === 'text') s += x.data
  })
  return s.replace(/\s+/g, ' ').trim()
}

function findAll(root: Node, pred: (n: Node) => boolean): Node[] {
  const out: Node[] = []
  walk(root, (n) => {
    if (isEl(n) && pred(n)) out.push(n)
  })
  return out
}
function findIn(root: Node, pred: (n: Node) => boolean): Node | undefined {
  let r: Node | undefined
  walk(root, (n) => {
    if (!r && isEl(n) && pred(n)) r = n
  })
  return r
}
const firstAnchor = (el: Node): Node | undefined =>
  findIn(el, (n) => n.name === 'a' && !!n.attribs?.href)

function itemFrom(el: Node): VnItem | undefined {
  const a = firstAnchor(el)
  const url = attr(a, 'href')
  const title = text(a)
  if (!url || !title) return undefined
  return { url, title, date: text(findIn(el, (n) => hasClass(n, 'date'))) }
}

function itemsInPanel(doc: Node, panelClasses: string[]): VnItem[] {
  const panel = findAll(doc, (el) => panelClasses.every((c) => hasClass(el, c)))[0]
  if (!panel) return []
  const out: VnItem[] = []
  walk(panel, (n) => {
    if (isEl(n) && hasClass(n, 'item')) {
      const item = itemFrom(n)
      if (item) out.push(item)
    }
  })
  return out
}

export function parseVaticanWidget(html: string, lang: string): VaticanContent {
  const doc = parseDocument(html)

  const videos: VnVideo[] = findAll(doc, (el) => !!attr(el, 'data-video-id'))
    .map((el) => ({
      id: attr(el, 'data-video-id') ?? '',
      title: attr(el, 'data-title') ?? '',
      date: attr(el, 'data-date') ?? '',
      thumb: attr(el, 'data-thumbnail') ?? '',
    }))
    .filter((v) => v.id && v.thumb)

  const featuredEl = findAll(doc, (el) => hasClass(el, 'news-featured'))[0]
  const featured = featuredEl ? itemFrom(featuredEl) : undefined

  const news = itemsInPanel(doc, ['news-list', 'vaticannews'])
  const holySee = itemsInPanel(doc, ['news-list', 'vatican_va'])

  // Outlet tiles: the Vatican News hub plus whatever custom-link-items carry
  // (L'Osservatore Romano, Radio Vaticana), keyed off their logo class.
  const outlets: VnOutlet[] = [{ label: 'Vatican News', url: `${widgetOrigin}/${lang}.html` }]
  for (const el of findAll(doc, (n) => hasClass(n, 'custom-link-item'))) {
    const url = attr(firstAnchor(el), 'href')
    if (!url) continue
    const img = findIn(el, (n) => n.name === 'img')
    const imgClass = classOf(img)
    const label = imgClass.includes('rv')
      ? 'Radio Vaticana'
      : imgClass.includes('or')
        ? "L'Osservatore Romano"
        : undefined
    if (label) outlets.push({ label, url })
  }

  return { videos, featured, news, holySee, outlets }
}

export function vaticanWidgetLang(appLang: string | undefined): string {
  return (appLang || 'en-US').startsWith('pt') ? 'pt' : 'en'
}

export async function fetchVaticanNews(lang: string): Promise<VaticanContent> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12_000)
  try {
    const res = await fetch(`${widgetOrigin}/widget.${lang}.html`, {
      credentials: 'omit',
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`Vatican widget ${res.status}`)
    return parseVaticanWidget(await res.text(), lang)
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * Article-URL → thumbnail map from the Vatican News RSS feed, in one fetch
 * (each `<item>` carries `<media:content>`). The feed's `<link>`s match the
 * widget fragment's article URLs, so news tiles look themselves up by href.
 * Native only — the feed isn't CORS-enabled — which is fine: photo covers are a
 * native enhancement and the tiles fall back to a solid tone everywhere else.
 */
export async function fetchNewsImages(lang: string): Promise<Record<string, string>> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)
  try {
    const res = await fetch(`${widgetOrigin}/${lang}.rss.xml`, { signal: controller.signal })
    if (!res.ok) return {}
    const xml = await res.text()
    const map: Record<string, string> = {}
    for (const item of xml.split('<item>').slice(1)) {
      const link = item.match(/<link>\s*([^<\s]+)/)?.[1]
      const image = item.match(/<media:content[^>]*\burl="([^"]+)"/i)?.[1]
      if (link && image) map[link] = image
    }
    return map
  } catch {
    return {}
  } finally {
    clearTimeout(timeout)
  }
}
