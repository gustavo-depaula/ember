import { baseUrl, type IbLang } from './config'

const userAgent =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

const fetchTimeoutMs = 10_000

// iBreviary serves a date only through session state: a POST to opzioni.php
// sets PHPSESSID's date/lang (GET query params are silently ignored), and the
// following GET reads whatever the session last had. React Native's headers
// API can't reliably read Set-Cookie, but the native HTTP stacks persist and
// resend cookies for the domain on their own — so we lean on that jar and
// instead guarantee that POST-date + GET-hour pairs never interleave, via a
// module-level promise chain. All iBreviary traffic must go through this
// queue: any fetch outside it races the shared session.
let chain: Promise<unknown> = Promise.resolve()

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = chain.then(task, task)
  chain = run.catch(() => undefined) // keep the chain alive after a failure
  return run
}

async function request(url: string, init: RequestInit, fetchImpl: typeof fetch): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), fetchTimeoutMs)
  try {
    const res = await fetchImpl(url, {
      ...init,
      headers: { 'user-agent': userAgent, ...init.headers },
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`ibreviary fetch failed: ${url} → ${res.status}`)
    return res
  } catch (err) {
    if (controller.signal.aborted) {
      throw new Error(`ibreviary fetch timeout: ${url} (>${fetchTimeoutMs}ms)`)
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

// Date parts are the LOCAL calendar day — the same day runCachedSource folds
// into the cache key — so key and content always agree.
async function postOptions(ibLang: IbLang, date: Date, fetchImpl: typeof fetch): Promise<void> {
  const body = new URLSearchParams({
    lang: ibLang,
    giorno: String(date.getDate()),
    mese: String(date.getMonth() + 1),
    anno: String(date.getFullYear()),
    ok: 'ok',
  }).toString()
  await request(
    `${baseUrl}/opzioni.php`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
    },
    fetchImpl,
  )
}

async function getSection(section: string, fetchImpl: typeof fetch): Promise<string> {
  const res = await request(
    `${baseUrl}/breviario.php?s=${section}`,
    { headers: { accept: 'text/html' } },
    fetchImpl,
  )
  return res.text()
}

const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

// Opening the practice prefetches every hour branch at once (SelectBlock
// mounts all options) — collapse duplicate concurrent requests (keyed by
// section, so terce/sext/none share one ora_media download), and serialize
// distinct ones so each POST-date + GET-section pair stays atomic.
const inflight = new Map<string, Promise<string>>()

export function fetchSectionHtml(
  ibLang: IbLang,
  date: Date,
  section: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string> {
  const key = `${ibLang}|${ymd(date)}|${section}`
  const existing = inflight.get(key)
  if (existing) return existing
  const p = enqueue(async () => {
    await postOptions(ibLang, date, fetchImpl)
    return getSection(section, fetchImpl)
  }).finally(() => inflight.delete(key))
  inflight.set(key, p)
  return p
}
