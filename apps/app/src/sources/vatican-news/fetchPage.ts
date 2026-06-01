import { dayUrl, type Lang } from './url'

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

// vaticannews.va returns 403 to requests without a browser-like User-Agent.
// The pages are UTF-8 (unlike the Latin-1 Compendium), so res.text() decodes
// correctly. 8s is generous — the page is ~70KB; slower is almost certainly a
// hang and should surface as an error.
const FETCH_TIMEOUT_MS = 8_000

// The gospel + pope producers both parse the SAME daily page and resolve
// concurrently (preprocessFlow's Promise.all over the tab options). Collapse
// their in-flight requests for the same URL into a single GET. Entry is
// dropped on settle so a later render re-fetches (the producer output cache
// handles longer-lived caching).
const inflight = new Map<string, Promise<string>>()

async function get(url: string, fetchImpl: typeof fetch): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  let res: Response
  try {
    res = await fetchImpl(url, {
      headers: { 'user-agent': USER_AGENT, accept: 'text/html' },
      signal: controller.signal,
    })
  } catch (err) {
    if (controller.signal.aborted) {
      throw new Error(`vatican-news fetch timeout: ${url} (>${FETCH_TIMEOUT_MS}ms)`)
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
  if (!res.ok) throw new Error(`vatican-news fetch failed: ${url} → ${res.status}`)
  return res.text()
}

export function fetchDay(lang: Lang, date: Date, fetchImpl: typeof fetch = fetch): Promise<string> {
  const url = dayUrl(lang, date)
  const existing = inflight.get(url)
  if (existing) return existing
  const p = get(url, fetchImpl).finally(() => inflight.delete(url))
  inflight.set(url, p)
  return p
}
