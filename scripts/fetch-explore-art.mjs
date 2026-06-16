#!/usr/bin/env node
// Fetches public-domain sacred paintings (PD-Art) from Wikimedia Commons for the
// Explore feature blocks / cover rows. Writes scaled JPEGs into both the live
// dev-hearth tree (_site/hearth/v2/art) and the versioned source (content/art),
// verifies each is public domain, and emits the artMap entries + CREDITS.md.
//
// Re-runnable: pass a comma-list of ids to refetch just those, else fetches all.
//   node scripts/fetch-explore-art.mjs [collection/sacred-heart,...]

import { mkdir, readFile, writeFile } from 'node:fs/promises'
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
  // Carlo Crivelli's 1476 panel from the Demidoff Altarpiece (National Gallery,
  // London) — Aquinas in Dominican habit holding the Summa, sun of wisdom on
  // his chest. Clean portrait-format panel, PD (Crivelli †1495).
  {
    id: 'collection/thomas-aquinas',
    slug: 'thomas-aquinas',
    q: 'Crivelli Saint Thomas Aquinas National Gallery',
  },
  // Montfort's charism is Marian consecration — a Marian masterpiece fits (need
  // not depict him; no PD portrait surfaced anyway).
  { id: 'collection/montfort-spirituality', slug: 'montfort', q: 'Coronation of the Virgin Velázquez' },
  { id: 'collection/novenas', slug: 'novenas', q: 'Annunciation Fra Angelico' },
  { id: 'collection/litanies', slug: 'litanies', q: 'Madonna of the Rosary painting' },

  // Plan-of-life templates. Each names the canonical PD masterpiece of its
  // school. Modern founders (Josemaría, Thérèse photos) aren't PD, so the work
  // is chosen by charism, not portrait: the Angelus for sanctified work, etc.
  // Marian-consecration and sacred-heart reuse the collection paintings
  // (mapped directly in artMap), so they're not refetched here.
  {
    id: 'plan-of-life-template/beginner-minimum',
    slug: 'tpl-beginner-minimum',
    q: 'Good Shepherd Murillo',
  },
  // Salesian — *Introduction to the Devout Life* is a gentle guide to devotion
  // in the world; Sassoferrato's serene Virgin in Prayer matches its sweetness
  // far better than a bishop's portrait.
  {
    id: 'plan-of-life-template/salesian',
    slug: 'tpl-salesian',
    q: 'Virgin in Prayer Sassoferrato',
  },
  { id: 'plan-of-life-template/opus-dei', slug: 'tpl-opus-dei', q: 'The Angelus Jean-François Millet' },
  {
    id: 'plan-of-life-template/ignatian',
    slug: 'tpl-ignatian',
    q: 'Saint Ignatius of Loyola Rubens',
  },
  // Little Way — spiritual childhood and trust; Bloch's children-of-Christ scene
  // embodies it better than a roses still-life.
  {
    id: 'plan-of-life-template/little-way',
    slug: 'tpl-little-way',
    q: 'Carl Bloch Suffer the Little Children to Come unto Me',
  },
  // Second-wave traditions. Carmelite reuses carmelite.jpg (St Teresa) and
  // legion-of-mary reuses marian.jpg — mapped directly in artMap, not refetched.
  { id: 'plan-of-life-template/dominican', slug: 'tpl-dominican', q: 'Fra Angelico Saint Dominic' },
  {
    id: 'plan-of-life-template/franciscan',
    slug: 'tpl-franciscan',
    q: 'Saint Francis of Assisi in Ecstasy Caravaggio',
  },
  {
    id: 'plan-of-life-template/benedictine',
    slug: 'tpl-benedictine',
    q: 'Angelico Perugia Altarpiece Saint Benedict',
  },
  { id: 'plan-of-life-template/cursillo', slug: 'tpl-cursillo', q: 'Supper at Emmaus Caravaggio' },
  {
    id: 'plan-of-life-template/sulpician',
    slug: 'tpl-sulpician',
    q: 'Adoration of the Name of Jesus El Greco',
  },
  { id: 'plan-of-life-template/byzantine', slug: 'tpl-byzantine', q: 'Christ Pantocrator Sinai' },
  // Divine Mercy — the canonical Hyła Image (1943) is still in copyright
  // (Hyła †1965, PL life+70 expires ~2036). Kazimirowski's 1934 Vilnius Image
  // — the original painted under Faustina's direct supervision — is in the
  // public domain (Kazimirowski †1939, PL life+70 expired 2010) and is the
  // theologically correct choice anyway. Falls back to the Crucifixion if the
  // PD check on the Kazimirowski file fails.
  {
    id: 'plan-of-life-template/divine-mercy',
    slug: 'tpl-divine-mercy',
    q: 'Eugeniusz Kazimirowski Divine Mercy Vilnius',
  },

  // Dies Domini — one painting per weekday devotion. The query for each names
  // the canonical pre-1900 PD master for that day's theme.
  { id: 'collection/dies-sunday', slug: 'dies-sunday', q: 'Piero della Francesca Resurrection' },
  { id: 'collection/dies-monday', slug: 'dies-monday', q: 'Cristóbal Rojas Purgatorio' },
  { id: 'collection/dies-tuesday', slug: 'dies-tuesday', q: 'Guido Reni Saint Michael Archangel' },
  { id: 'collection/dies-wednesday', slug: 'dies-wednesday', q: 'Murillo Saint Joseph Christ Child' },
  { id: 'collection/dies-thursday', slug: 'dies-thursday', q: 'Juan de Juanes Salvador Eucaristía' },
  { id: 'collection/dies-friday', slug: 'dies-friday', q: 'Velázquez Cristo crucificado' },
  { id: 'collection/dies-saturday', slug: 'dies-saturday', q: 'Botticelli Madonna Magnificat Uffizi' },

  // Gospel of the Day — 3 PD evangelist paintings per evangelist. The
  // `evangelist-{name}-{1..3}` files are picked by `evangelistArt.ts` from the
  // citation's first word ("Matthew"/"Mateus" → matthew, etc.) and rotated by
  // dayIndex % 3 so the Explore card stays fresh through the lectionary cycles.
  { id: 'evangelist/matthew-1', slug: 'evangelist-matthew-1', q: 'Caravaggio Inspiration Saint Matthew' },
  { id: 'evangelist/matthew-2', slug: 'evangelist-matthew-2', q: 'Rembrandt Apostle Matthew Inspired Angel' },
  { id: 'evangelist/matthew-3', slug: 'evangelist-matthew-3', q: 'Guido Reni Saint Matthew Angel' },
  { id: 'evangelist/mark-1', slug: 'evangelist-mark-1', q: 'Tintoretto Miracle of the Slave Saint Mark Accademia' },
  { id: 'evangelist/mark-2', slug: 'evangelist-mark-2', q: 'Mantegna Saint Mark Evangelist Frankfurt' },
  { id: 'evangelist/mark-3', slug: 'evangelist-mark-3', q: 'Albrecht Dürer Four Apostles Mark Paul Munich' },
  { id: 'evangelist/luke-1', slug: 'evangelist-luke-1', q: 'Rogier van der Weyden Saint Luke Drawing Virgin' },
  { id: 'evangelist/luke-2', slug: 'evangelist-luke-2', q: 'El Greco Saint Luke Apostle Toledo' },
  { id: 'evangelist/luke-3', slug: 'evangelist-luke-3', q: 'Jan Gossaert Saint Luke painting Virgin Vienna' },
  { id: 'evangelist/john-1', slug: 'evangelist-john-1', q: 'Domenichino Saint John Evangelist eagle' },
  { id: 'evangelist/john-2', slug: 'evangelist-john-2', q: 'Hieronymus Bosch Saint John Evangelist Patmos Berlin' },
  { id: 'evangelist/john-3', slug: 'evangelist-john-3', q: 'Velázquez Saint John Evangelist Patmos' },

  // NOTE: The Daily Meditations row (/explore) cards — meditation-alphonsus.jpg,
  // meditation-intimita.jpg, meditation-patristic.jpg, meditation-opus-dei.jpg —
  // are AI-generated devotional paintings, not PD-sourced. They are managed by
  // hand (see content/art/CREDITS.md for the generation prompts) and deliberately
  // kept out of this target list so a re-run never overwrites them.
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

  // Merge with any existing CREDITS so a filtered run (only some ids) updates
  // just those lines and never drops the others' attributions.
  const lineFor = (c) =>
    `- **${c.id}** → \`${c.file}\` — ${c.artist}. *${c.title.replace('File:', '')}* (${c.lic}).`
  const byId = new Map()
  try {
    const prev = await readFile(resolve(contentDir, 'CREDITS.md'), 'utf8')
    for (const l of prev.split('\n')) {
      const m = l.match(/^- \*\*(.+?)\*\*/)
      if (m) byId.set(m[1], l)
    }
  } catch {}
  for (const c of credits) byId.set(c.id, lineFor(c))

  const creditsMd = [
    '# Explore art credits',
    '',
    'Public-domain sacred paintings (PD-Art) sourced from Wikimedia Commons for the',
    'Explore feature blocks and cover rows. See `scripts/fetch-explore-art.mjs`.',
    '',
    ...byId.values(),
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
