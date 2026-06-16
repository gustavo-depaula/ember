const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

// opusdei.org serves the article pages as ~140KB UTF-8 documents; 8s is generous
// — slower is almost certainly a hang and should surface as an error so the
// producer falls back rather than blocking the flow.
const FETCH_TIMEOUT_MS = 8_000

// The gospel commentary and (separately) the meditation producers each fetch one
// page; collapse concurrent requests for the same URL into a single GET. Dropped
// on settle so a later render re-fetches (the producer output cache handles the
// longer-lived caching).
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
      throw new Error(`opus-dei fetch timeout: ${url} (>${FETCH_TIMEOUT_MS}ms)`)
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
  if (!res.ok) throw new Error(`opus-dei fetch failed: ${url} → ${res.status}`)
  return res.text()
}

export function fetchPage(url: string, fetchImpl: typeof fetch = fetch): Promise<string> {
  const existing = inflight.get(url)
  if (existing) return existing
  const p = get(url, fetchImpl).finally(() => inflight.delete(url))
  inflight.set(url, p)
  return p
}
