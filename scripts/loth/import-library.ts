// Builds `content/loth/library/` from the archive's second collection: the
// psalter by psalm, and the texts opened by name rather than by date (the
// Commons, the Office of the Dead, prayers, rites, the catecheses on the
// psalms). Nothing reads them yet; they are kept so the corpus holds all the
// breviary has.
//
//   npx tsx scripts/loth/import-library.ts <dumps dir>

import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Block } from '../../packages/loth/src/text'
import { normalize } from './normalize'

const dumps = process.argv[2]
const out = join(__dirname, '../../content/loth/library')
const load = <T>(name: string): T => JSON.parse(readFileSync(join(dumps, name), 'utf8'))

const linkId = (url: string) => url.replace(/^.*\//, '').replace(/\.htm$/, '')
const blocksOf = (html: string): Block[] =>
  normalize(html).map((block) => ({
    ...block,
    lines: block.lines.map((line) =>
      line.map((seg) => (typeof seg !== 'string' && seg.to ? { ...seg, to: linkId(seg.to) } : seg)),
    ),
  }))

const hours: Record<string, string> = {
  leituras: 'readings',
  laudes: 'lauds',
  terca: 'terce',
  sexta: 'sext',
  nona: 'none',
  Ivesperas: 'first-vespers',
  vesperas: 'vespers',
  completas: 'compline',
}
const weekdays = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado']

rmSync(out, { recursive: true, force: true })
mkdirSync(out, { recursive: true })
const write = (id: string, value: object) =>
  writeFileSync(join(out, `${id}.json`), `${JSON.stringify({ id, ...value })}\n`)

interface Psalm {
  ordem: number
  secao: string
  nome: string
  titulo: string
  html: string
  coleta: string
}
write('psalter', {
  entries: load<Psalm[]>('lh_salterio.json')
    .sort((a, b) => a.ordem - b.ordem)
    .map((p) => ({
      name: p.nome,
      title: p.titulo,
      kind: p.secao === 'Salmo' ? 'psalm' : 'canticle',
      blocks: blocksOf(p.html),
      ...(p.coleta ? { psalmPrayer: blocksOf(p.coleta) } : {}),
    })),
})

interface Occasional {
  ordem: number
  menu: 'horas' | 'oracoes' | 'rituais'
  nome: string
  rotulo: string
  hora: string
  semana: string
  dia: string
  html: string
}
const shelves = { horas: 'offices', oracoes: 'prayers', rituais: 'rites' } as const
const all = load<Occasional[]>('lh_avulsos.json').sort((a, b) => a.ordem - b.ordem)
for (const [menu, id] of Object.entries(shelves)) {
  const entries: { name: string; label: string; texts: object[] }[] = []
  for (const row of all.filter((r) => r.menu === menu)) {
    let entry = entries.find((e) => e.name === row.nome)
    if (!entry) {
      entry = { name: row.nome, label: row.rotulo, texts: [] }
      entries.push(entry)
    }
    entry.texts.push({
      ...(row.hora ? { hour: hours[row.hora] ?? row.hora } : {}),
      ...(row.semana ? { psalterWeek: Number(row.semana) } : {}),
      ...(row.dia ? { weekday: weekdays.indexOf(row.dia) } : {}),
      blocks: blocksOf(row.html),
    })
  }
  write(id, { entries })
  console.log(`${id}: ${entries.length} entries`)
}

write('extras', {
  texts: Object.fromEntries(
    load<{ url: string; html: string }[]>('lh_avulsos_extras.json').map((e) => [linkId(e.url), blocksOf(e.html)]),
  ),
})
