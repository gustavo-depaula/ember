// Every hour of iBreviary's Latin (the editio typica) for a span of days,
// saved gzipped under the data directory, one file per day and page:
//   <out>/<yyyy>/<yyyy-mm-dd>_<page>.html.gz
// Each worker keeps a session of its own (iBreviary sets the day per
// session, by a POST), so the days run side by side. A file already there is
// not fetched again; run it again to fill what failed.
//
//   node crawl.mjs <out> <from yyyy-mm-dd> <to yyyy-mm-dd> [workers]

import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'

const [out, from, to, workersArg] = process.argv.slice(2)
if (!out || !from || !to) throw new Error('usage: node crawl.mjs <out> <from> <to> [workers]')
const workers = Number(workersArg ?? 8)
const base = 'https://www.ibreviary.com/m2'
const userAgent =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
const pages = ['ufficio_delle_letture', 'lodi', 'ora_media', 'vespri', 'compieta']

const iso = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const days = []
for (let d = new Date(`${from}T12:00:00`); iso(d) <= to; d.setDate(d.getDate() + 1)) days.push(iso(d))

const fileOf = (day, page) => join(out, day.slice(0, 4), `${day}_${page}.html.gz`)
const todo = days.filter((day) => pages.some((page) => !existsSync(fileOf(day, page))))
console.log(`${todo.length} of ${days.length} days to fetch, ${workers} workers`)

async function session() {
  let cookie = ''
  const request = async (url, init = {}) => {
    const res = await fetch(url, {
      ...init,
      redirect: 'manual',
      signal: AbortSignal.timeout(30_000),
      headers: { 'user-agent': userAgent, ...(cookie ? { cookie } : {}), ...init.headers },
    })
    for (const c of res.headers.getSetCookie?.() ?? []) {
      const pair = c.split(';')[0]
      if (pair.startsWith('PHPSESSID=')) cookie = pair
    }
    if (res.status >= 400) throw new Error(`${url} → ${res.status}`)
    return res
  }
  return async (day) => {
    const [y, m, d] = day.split('-').map(Number)
    await request(`${base}/opzioni.php`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ lang: 'la', giorno: String(d), mese: String(m), anno: String(y), ok: 'ok' }).toString(),
    })
    for (const page of pages) {
      const file = fileOf(day, page)
      if (existsSync(file)) continue
      const html = await (await request(`${base}/breviario.php?s=${page}`, { headers: { accept: 'text/html' } })).text()
      mkdirSync(join(out, day.slice(0, 4)), { recursive: true })
      writeFileSync(file, gzipSync(html))
    }
  }
}

let next = 0
let done = 0
const failed = []
await Promise.all(
  Array.from({ length: workers }, async () => {
    const fetchDay = await session()
    while (next < todo.length) {
      const day = todo[next++]
      for (let attempt = 1; ; attempt++) {
        try {
          await fetchDay(day)
          break
        } catch (error) {
          if (attempt === 4) {
            failed.push(day)
            console.error(`${day}: ${error.message}`)
            break
          }
          await new Promise((r) => setTimeout(r, 2000 * 2 ** attempt))
        }
      }
      if (++done % 100 === 0) console.log(`${done}/${todo.length}`)
    }
  }),
)
console.log(`done; ${failed.length} failed${failed.length ? `: ${failed.join(' ')}` : ''}`)
