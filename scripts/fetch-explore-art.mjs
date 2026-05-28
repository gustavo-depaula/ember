#!/usr/bin/env node
// Fetches public-domain sacred paintings (PD-Art) from Wikimedia Commons for the
// Explore feature blocks / cover rows. Writes scaled JPEGs into both the live
// dev-hearth tree (_site/hearth/v2/art) and the versioned source (content/art),
// verifies each is public domain, and emits the artMap entries + CREDITS.md.
//
// Re-runnable: pass a comma-list of ids to refetch just those, else fetches all.
//   node scripts/fetch-explore-art.mjs [collection/sacred-heart,...]

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const siteDir = resolve(root, '_site/hearth/v2/art')
const contentDir = resolve(root, 'content/art')
const UA = 'EmberDev/1.0 (Catholic prayer app; contact ai@dpgu.me)'
const WIDTH = 1400

// id → { slug, q } — precise artist+subject queries that surface the canonical
// pre-1900 (PD) masterpiece for each theme.
const targets = [
  { id: 'collection/marian', slug: 'marian', q: 'Immaculate Conception Murillo' },
  { id: 'collection/sacred-heart', slug: 'sacred-heart', q: 'Sacred Heart of Jesus Pompeo Batoni' },
  { id: 'collection/eucharistic', slug: 'eucharistic', q: 'Last Supper Juan de Juanes' },
  { id: 'collection/holy-spirit', slug: 'holy-spirit', q: 'Pentecost El Greco' },
  { id: 'collection/way-of-the-cross', slug: 'way-of-the-cross', q: 'Christ Carrying the Cross El Greco' },
  { id: 'collection/for-the-dead', slug: 'for-the-dead', q: 'Souls in Purgatory painting' },
  { id: 'collection/divine-mercy', slug: 'divine-mercy', q: 'Resurrection of Christ Raphael' },
  { id: 'collection/carmelite', slug: 'carmelite', q: 'Saint Teresa of Avila painting Gerard' },
  { id: 'collection/spiritual-classics', slug: 'spiritual-classics', q: 'Saint Jerome in his study Ghirlandaio' },
  { id: 'collection/mental-prayer', slug: 'mental-prayer', q: 'Saint Dominic in Prayer El Greco' },
  { id: 'collection/alphonsus-liguori', slug: 'alphonsus-liguori', q: 'Saint Alphonsus Liguori painting' },
  // Montfort's charism is Marian consecration — a Marian masterpiece fits (need
  // not depict him; no PD portrait surfaced anyway).
  { id: 'collection/montfort-spirituality', slug: 'montfort', q: 'Coronation of the Virgin Velázquez' },
  { id: 'collection/novenas', slug: 'novenas', q: 'Annunciation Fra Angelico' },
  { id: 'collection/litanies', slug: 'litanies', q: 'Madonna of the Rosary painting' },
]

const api = 'https://commons.wikimedia.org/w/api.php'
const stripHtml = (s) => (s ? s.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() : '')

async function getJson(url) {
  const c = new AbortController()
  const t = setTimeout(() => c.abort(), 15000)
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA }, signal: c.signal })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return await r.json()
  } finally {
    clearTimeout(t)
  }
}

async function search(q) {
  const u = `${api}?action=query&format=json&list=search&srnamespace=6&srlimit=6&srsearch=${encodeURIComponent(q)}`
  const j = await getJson(u)
  return (j.query?.search ?? []).map((s) => s.title)
}

async function imageInfo(title) {
  const u = `${api}?action=query&format=json&prop=imageinfo&iiprop=url|extmetadata|mime|size&iiurlwidth=${WIDTH}&titles=${encodeURIComponent(title)}`
  const j = await getJson(u)
  const pages = j.query?.pages ?? {}
  const page = Object.values(pages)[0]
  return page?.imageinfo?.[0]
}

function isPublicDomain(meta) {
  const lic = stripHtml(meta?.LicenseShortName?.value).toLowerCase()
  const copyrighted = meta?.Copyrighted?.value
  return lic.includes('public domain') || copyrighted === 'False'
}

async function download(url) {
  const c = new AbortController()
  const t = setTimeout(() => c.abort(), 30000)
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA }, signal: c.signal })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return Buffer.from(await r.arrayBuffer())
  } finally {
    clearTimeout(t)
  }
}

async function run() {
  const only = process.argv[2] ? new Set(process.argv[2].split(',')) : undefined
  await mkdir(siteDir, { recursive: true })
  await mkdir(contentDir, { recursive: true })

  const map = {}
  const credits = []
  for (const target of targets) {
    if (only && !only.has(target.id)) continue
    try {
      const titles = await search(target.q)
      let chosen
      for (const title of titles) {
        const info = await imageInfo(title)
        if (!info) continue
        if (!/^image\/(jpeg|png)$/.test(info.mime)) continue
        if ((info.width ?? 0) < 700) continue
        if (!isPublicDomain(info.extmetadata)) continue
        chosen = { title, info }
        break
      }
      if (!chosen) {
        console.log(`✗ ${target.id} — no PD image for "${target.q}"`)
        continue
      }
      const { info, title } = chosen
      const ext = info.mime === 'image/png' ? 'png' : 'jpg'
      const file = `${target.slug}.${ext}`
      const buf = await download(info.thumburl ?? info.url)
      await writeFile(resolve(siteDir, file), buf)
      await writeFile(resolve(contentDir, file), buf)
      map[target.id] = file
      const artist = stripHtml(info.extmetadata?.Artist?.value) || 'Unknown'
      const lic = stripHtml(info.extmetadata?.LicenseShortName?.value) || 'Public domain'
      credits.push({ id: target.id, file, title, artist, lic })
      console.log(`✓ ${target.id} → ${file} (${Math.round(buf.length / 1024)}KB) — ${artist} · ${title}`)
    } catch (e) {
      console.log(`✗ ${target.id} — ${e.message}`)
    }
  }

  const creditsMd = [
    '# Explore art credits',
    '',
    'Public-domain sacred paintings (PD-Art) sourced from Wikimedia Commons for the',
    'Explore feature blocks and cover rows. See `scripts/fetch-explore-art.mjs`.',
    '',
    ...credits.map((c) => `- **${c.id}** → \`${c.file}\` — ${c.artist}. *${c.title.replace('File:', '')}* (${c.lic}).`),
    '',
  ].join('\n')
  await writeFile(resolve(contentDir, 'CREDITS.md'), creditsMd)

  console.log('\n--- artFiles entries ---')
  console.log(Object.entries(map).map(([k, v]) => `  '${k}': '${v}',`).join('\n'))
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
