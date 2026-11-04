// Writes src/lib/massTimes/br-neighbourhoods.json: the neighbourhoods of Brazil's cities, from the
// 2022 census (IBGE), so a big city's Mass-times page can be read, and searched, by neighbourhood
// ("missa em Pinheiros", "missa na Aldeota"). The census's bairros are the legal neighbourhoods of
// some 900 cities. São Paulo and Brasília have none: São Paulo is known by its 96 districts
// (Pinheiros, Moema, Penha) and Brasília by its administrative regions (Ceilândia, Taguatinga),
// which the census keeps as districts and subdistricts. Needs `unzip`; rerun after a census.
//   node apps/site/scripts/br-neighbourhoods.mjs
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const out = fileURLToPath(new URL('../src/lib/massTimes/br-neighbourhoods.json', import.meta.url))
const census =
  'https://geoftp.ibge.gov.br/organizacao_do_territorio/malhas_territoriais/malhas_de_setores_censitarios__divisoes_intramunicipais/censo_2022'
const sources = [
  { url: `${census}/bairros/shp/BR/BR_bairros_CD2022.zip`, name: 'NM_BAIRRO' },
  { url: `${census}/distritos/shp/UF/SP_distritos_CD2022.zip`, name: 'NM_DIST', mun: '3550308' },
  { url: `${census}/subdistritos/shp/UF/DF_subdistritos_CD2022.zip`, name: 'NM_SUBDIST', mun: '5300108' },
]

// A dBase table: a header, one 32-byte descriptor per field, then fixed-width rows.
function readDbf(buf) {
  const count = buf.readUInt32LE(4)
  const headerLength = buf.readUInt16LE(8)
  const rowLength = buf.readUInt16LE(10)
  const fields = []
  for (let at = 32; buf[at] !== 0x0d; at += 32) {
    fields.push({ name: buf.toString('latin1', at, at + 11).replace(/\0.*$/, ''), length: buf[at + 16] })
  }
  return Array.from({ length: count }, (_, i) => {
    let at = headerLength + i * rowLength + 1
    const row = {}
    for (const field of fields) {
      row[field.name] = buf.toString('utf8', at, at + field.length).trim()
      at += field.length
    }
    return row
  })
}

// An ESRI shapefile of polygons: each record its rings as runs of (x, y) doubles.
function readShp(buf) {
  const shapes = []
  for (let at = 100; at < buf.length; ) {
    const length = buf.readInt32BE(at + 4) * 2
    const content = at + 8
    const rings = []
    if (buf.readInt32LE(content) === 5) {
      const parts = buf.readInt32LE(content + 36)
      const points = buf.readInt32LE(content + 40)
      const starts = Array.from({ length: parts }, (_, p) => buf.readInt32LE(content + 44 + p * 4))
      const base = content + 44 + parts * 4
      for (let p = 0; p < parts; p++) {
        const end = p + 1 < parts ? starts[p + 1] : points
        const ring = []
        for (let k = starts[p]; k < end; k++) {
          ring.push([buf.readDoubleLE(base + k * 16), buf.readDoubleLE(base + k * 16 + 8)])
        }
        rings.push(ring)
      }
    }
    shapes.push(rings)
    at = content + length
  }
  return shapes
}

// Douglas–Peucker to about 20 m: a church is placed in a neighbourhood, not on its border. A ring
// closes on its first point, so it is split first at the point farthest from it.
function simplify(ring, tolerance = 2e-4) {
  if (ring.length < 5) return ring
  const keep = new Uint8Array(ring.length)
  let split = 1
  for (let i = 1; i < ring.length - 1; i++) {
    const d = (p) => Math.hypot(p[0] - ring[0][0], p[1] - ring[0][1])
    if (d(ring[i]) > d(ring[split])) split = i
  }
  keep[0] = keep[split] = keep[ring.length - 1] = 1
  const stack = [
    [0, split],
    [split, ring.length - 1],
  ]
  while (stack.length) {
    const [a, b] = stack.pop()
    const [ax, ay] = ring[a]
    const [bx, by] = ring[b]
    const dx = bx - ax
    const dy = by - ay
    const norm = Math.hypot(dx, dy) || 1
    let far = -1
    let farthest = tolerance
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs(dy * (ring[i][0] - ax) - dx * (ring[i][1] - ay)) / norm
      if (d > farthest) {
        farthest = d
        far = i
      }
    }
    if (far >= 0) {
      keep[far] = 1
      stack.push([a, far], [far, b])
    }
  }
  return ring.filter((_, i) => keep[i])
}

// Integers of 1/10000°, each point the difference from the one before, as br-municipalities.json.
function pack(ring) {
  let x = 0
  let y = 0
  return ring.flatMap(([lng, lat]) => {
    const step = [Math.round(lng * 1e4) - x, Math.round(lat * 1e4) - y]
    x += step[0]
    y += step[1]
    return step
  })
}

const byMunicipality = {}
const work = mkdtempSync(join(tmpdir(), 'br-neighbourhoods-'))
try {
  for (const source of sources) {
    const zip = join(work, 'source.zip')
    const res = await fetch(source.url)
    if (!res.ok) throw new Error(`${source.url}: ${res.status}`)
    writeFileSync(zip, Buffer.from(await res.arrayBuffer()))
    const dir = join(work, String(sources.indexOf(source)))
    execFileSync('unzip', ['-q', '-o', zip, '-d', dir])
    const stem = source.url.split('/').pop().replace(/\.zip$/, '')
    const rows = readDbf(readFileSync(join(dir, `${stem}.dbf`)))
    const shapes = readShp(readFileSync(join(dir, `${stem}.shp`)))
    if (rows.length !== shapes.length) throw new Error(`${stem}: ${rows.length} rows, ${shapes.length} shapes`)
    rows.forEach((row, i) => {
      if (source.mun && row.CD_MUN !== source.mun) return
      const name = row[source.name]
      if (!name) return
      const rings = shapes[i].map((ring) => simplify(ring)).filter((ring) => ring.length >= 4)
      if (!rings.length) return
      byMunicipality[row.CD_MUN] ??= []
      byMunicipality[row.CD_MUN].push({ name, rings: rings.map(pack) })
    })
  }
} finally {
  rmSync(work, { recursive: true, force: true })
}

writeFileSync(out, `${JSON.stringify(byMunicipality)}\n`)
const count = Object.values(byMunicipality).reduce((n, list) => n + list.length, 0)
console.log(`${count} neighbourhoods in ${Object.keys(byMunicipality).length} municipalities → ${out}`)
