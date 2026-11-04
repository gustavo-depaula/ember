// Writes src/lib/massTimes/br-municipalities.json: every Brazilian municipality's name, state and
// outline, from IBGE. The Mass-times directory's city field often holds a neighbourhood ("Centro",
// "Aldeota") or a whole address ("Fortaleza Ceará"), so the place pages find a church's city by
// where its coordinates fall. Municipalities change rarely; rerun when IBGE publishes new ones.
//   node apps/site/scripts/br-municipalities.mjs
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const out = fileURLToPath(new URL('../src/lib/massTimes/br-municipalities.json', import.meta.url))
const ibge = 'https://servicodados.ibge.gov.br/api'

async function json(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${url}: ${res.status}`)
  return res.json()
}

const names = await json(`${ibge}/v1/localidades/municipios?view=nivelado`)
const meshes = await json(
  `${ibge}/v3/malhas/paises/BR?intrarregiao=municipio&qualidade=minima&formato=application/vnd.geo+json`,
)
const outlines = new Map(meshes.features.map((f) => [String(f.properties.codarea), f.geometry]))

// Each ring is stored as integers of 1/10000° (IBGE's own precision), each point the difference
// from the one before it, which keeps the file a third of the GeoJSON's size.
const pack = (ring) => {
  let x = 0
  let y = 0
  return ring.flatMap(([lng, lat]) => {
    const nx = Math.round(lng * 1e4)
    const ny = Math.round(lat * 1e4)
    const step = [nx - x, ny - y]
    x = nx
    y = ny
    return step
  })
}

// A municipality created after IBGE's latest mesh has no outline yet; its churches fall in the one
// it was carved from until the mesh catches up.
const unmapped = names.filter((m) => !outlines.has(String(m['municipio-id'])))
for (const m of unmapped) console.warn(`no outline yet: ${m['municipio-nome']} (${m['UF-sigla']})`)
if (unmapped.length > 20) throw new Error(`${unmapped.length} municipalities lack an outline`)

const municipalities = names
  .filter((m) => outlines.has(String(m['municipio-id'])))
  .map((m) => {
    const geometry = outlines.get(String(m['municipio-id']))
    const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates
    return {
      id: String(m['municipio-id']),
      name: m['municipio-nome'],
      uf: m['UF-sigla'],
      polygons: polygons.map((p) => p.map(pack)),
    }
  })

writeFileSync(out, `${JSON.stringify(municipalities)}\n`)
console.log(`${municipalities.length} municipalities → ${out}`)
