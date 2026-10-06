#!/usr/bin/env node
// Runs the upstream app's own calendar (`dia_liturgico` in feria_liturgica.js)
// outside the browser and prints what it selects for each date: the temporal
// formulary, the lectionary entry and the saints, with their alternatives.
//
// It is the reference the new resolver is diffed against, and the only source
// of the sanctoral table, which upstream keeps as a switch statement.
//
//   node scripts/missal/oracle.mjs 2024 2030 > oracle.jsonl

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

const here = dirname(fileURLToPath(import.meta.url))
const upstream = join(here, '../../research/missale-romanum/consult/upstream/misal_v2')
const source = readFileSync(join(upstream, 'feria_liturgica.js'), 'utf8')

// The calendar functions sit between the date helpers and the device-ready
// handler; everything around them touches the DOM.
const start = source.indexOf('function DiferenciaFechas')
const end = source.indexOf('var esIOS', start)
const weeks = source.slice(
  source.indexOf('var semana_latin = ['),
  source.indexOf('var mienlace_misa'),
)
if (start < 0 || end < 0 || weeks.length === 0) throw new Error('upstream layout changed')

const context = vm.createContext({
  pon_pref() {},
  ciclos: ['A', 'B', 'C'],
  tiposanio: ['II', 'I'],
  tiposanio2: ['par', 'impar'],
  tiposanio3: ['annosecundo', 'annoprimo'],
  lengua: 'latin',
})
vm.runInContext(`${weeks}\n${source.slice(start, end)}`, context)

// Upstream gates national propers on the display languages; each is run alone
// so every entry can be attributed to the language that reveals it.
export const upstreamLangs = ['latin', 'cast', 'engl', 'germ', 'ital', 'port', 'fran']

const pad = (n) => String(n).padStart(2, '0')

const strip = (links) =>
  Object.fromEntries(
    Object.entries(links).map(([key, link]) => [
      key,
      String(link)
        .replace(/^\.\.\/misal_v2\/m_estructura\//, '')
        .replace(/m_estructura_/, ''),
    ]),
  )

function reset(lang) {
  Object.assign(context, {
    mimisal_1: lang,
    mimisal_2: lang,
    mienlace_misa: {},
    mienlace_lecturas: {},
    mienlace_santo: {},
    mienlace_texto: {},
    resultado_santos: '',
    santos_aux: '',
    es_domingo_to: false,
    midia: 0,
  })
}

/** One season block (1 Advent-Christmas, 2 Lent-Easter, 3 Ordinary Time) of the saints switch. */
export function oracleSaints(date, block, lang) {
  reset(lang)
  const html = vm.runInContext(
    `santos("${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}", ${block})`,
    context,
  )
  return { saints: strip(context.mienlace_santo), labels: { ...context.mienlace_texto }, html }
}

export function oracleDay(date, lang) {
  reset(lang)
  // Unpadded, as the app passes it: `dia_liturgico` pads the day and month
  // itself and mangles a date that arrives already padded.
  const html = vm.runInContext(
    `dia_liturgico("${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}")`,
    context,
  )
  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    lang,
    cycle: context.miciclo,
    weekdayCycle: context.mitipoanio,
    ordinarySunday: context.es_domingo_to,
    mass: strip(context.mienlace_misa),
    readings: strip(context.mienlace_lecturas),
    saints: strip(context.mienlace_santo),
    labels: { ...context.mienlace_texto },
    html,
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const from = Number(process.argv[2] ?? new Date().getFullYear())
  const to = Number(process.argv[3] ?? from)
  for (let year = from; year <= to; year++) {
    for (let d = new Date(year, 0, 1); d.getFullYear() === year; d.setDate(d.getDate() + 1)) {
      for (const lang of upstreamLangs) {
        process.stdout.write(`${JSON.stringify(oracleDay(d, lang))}\n`)
      }
    }
  }
}
