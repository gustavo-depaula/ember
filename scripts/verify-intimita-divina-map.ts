import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  type LiturgicalDayMap,
  resolveLiturgicalDay,
} from '../packages/liturgical/src/liturgical-day-resolver'

const mapPath = resolve(
  __dirname,
  '..',
  'content/practices/gabriel-stmm-intimita-divina/data/liturgical-map.json',
)
const map: LiturgicalDayMap = JSON.parse(readFileSync(mapPath, 'utf8'))

const cases: Array<[string, Date, string, string]> = [
  // [label, date, expected primary id, anchor description]
  ['I Sun Advent 2025', new Date(2025, 10, 30), 'giorno-001', 'Il Signore viene da lontano'],
  ['Immacolata 2025', new Date(2025, 11, 8), 'giorno-009', "L'Immacolata Concezione"],
  ['Christmas 2025', new Date(2025, 11, 25), 'giorno-029', 'È apparso il Salvatore'],
  ['New Year 2026', new Date(2026, 0, 1), 'giorno-036', 'La Circoncisione del Signore'],
  ['Epifania 2026', new Date(2026, 0, 6), 'giorno-041', 'Epifania'],
  ['I Sun Lent 2026', new Date(2026, 1, 22), 'giorno-098', 'I dom Quaresima'],
  ['Easter Sun 2026', new Date(2026, 3, 5), 'giorno-140', 'Domenica di Risurrezione'],
  ['Easter Mon 2026', new Date(2026, 3, 6), 'giorno-141', 'Lunedì di Pasqua'],
  ['Easter Sat 2026', new Date(2026, 3, 11), 'giorno-146', 'Sat in albis octave'],
  ['Sun in Albis 2026', new Date(2026, 3, 12), 'giorno-147', 'Domenica in Albis'],
  ['II Dom Pasqua 2026', new Date(2026, 3, 19), 'giorno-154', 'Buon Pastore'],
  ['Wed II Pasqua 2026', new Date(2026, 3, 22), 'giorno-157', 'Patrocinio S. Giuseppe'],
  ['III Dom Pasqua 2026', new Date(2026, 3, 26), 'giorno-161', 'Pellegrini di Dio (USER REPORT)'],
  ['IV Dom Pasqua 2026', new Date(2026, 4, 3), 'giorno-168', 'La grande promessa'],
  ['V Dom Pasqua 2026', new Date(2026, 4, 10), 'giorno-175', 'La preghiera efficace'],
  ['Ascensione 2026', new Date(2026, 4, 14), 'giorno-179', "Festa dell'Ascensione"],
  ['Sun Asc Octave 2026', new Date(2026, 4, 17), 'giorno-182', "Dom fra l'Ott. dell'Ascensione"],
  ['Pentecoste 2026', new Date(2026, 4, 24), 'giorno-189', 'Discesa dello Spirito Santo'],
  ['Trinità 2026', new Date(2026, 4, 31), 'giorno-196', 'Festa della SS.ma Trinità'],
  ['Corpus Christi 2026', new Date(2026, 5, 4), 'giorno-201', 'Festa del Corpus Domini'],
  ['Sun Oct Corpus 2026', new Date(2026, 5, 7), 'giorno-204', "Dom fra l'Ott. del Corpus Domini"],
  ['Sacred Heart 2026', new Date(2026, 5, 12), 'giorno-209', 'Festa del Sacro Cuore'],
  ['SS Pietro&Paolo 2026', new Date(2026, 5, 29), 'giorno-229', 'Festa SS Pietro e Paolo'],
  ['Madonna Carmelo 2026', new Date(2026, 6, 16), 'giorno-246', 'Madonna del Carmelo'],
  ['Assunzione 2026', new Date(2026, 7, 15), 'giorno-276', "L'Assunzione di Maria"],
  ['Natività Maria 2026', new Date(2026, 8, 8), 'giorno-300', 'Natività di Maria'],
  ['Madonna Rosario 2026', new Date(2026, 9, 7), 'festa-vol6-rosario', 'Madonna del Rosario'],
  ['Maternità Maria 2026', new Date(2026, 9, 11), 'festa-vol6-maternita', 'Maternità di Maria'],
  ['Cristo Re 2026', new Date(2026, 9, 25), 'festa-vol6-cristo-re', 'Festa di Cristo Re (last Sun Oct)'],
  ['Tutti i Santi 2026', new Date(2026, 10, 1), 'festa-vol6-santi', 'I Santi'],
  ['Defunti 2026', new Date(2026, 10, 2), 'festa-vol6-defunti', 'Commemorazione Defunti'],
  ['Presentazione M 2026', new Date(2026, 10, 21), 'festa-vol6-presentazione', 'Presentazione di Maria'],
]

let passed = 0
let failed = 0
for (const [label, date, expectedPrimary, desc] of cases) {
  const entries = resolveLiturgicalDay(date, map)
  const ok = entries.some((e) => e.id === expectedPrimary)
  const status = ok ? 'OK ' : 'XX '
  if (ok) passed++
  else failed++
  const dateStr = date.toISOString().slice(0, 10)
  const allIds = entries.map((e) => `${e.category}:${e.id}`).join(' | ')
  console.log(`${status} ${dateStr} ${label.padEnd(24)} → expect ${expectedPrimary.padEnd(28)} got [${allIds}] (${desc})`)
}
console.log(`\n${passed} passed, ${failed} failed (${cases.length} total)`)
process.exit(failed > 0 ? 1 : 0)
