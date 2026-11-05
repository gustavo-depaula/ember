// Every Mass and every Office day of the 1960 rubrics, as Divinum Officium
// resolves them, for scripts/chant-books.py to set out as the Graduale and the
// Antiphonale. Prints JSON: [{area, part, file, date?, title, sections}].
//
// The files are read through the engine's own `setupstring`, so a Mass or an
// Office that borrows its texts (`@Commune/C2a`) arrives with them filled in,
// and a feast is the file the 1960 Kalendarium names for its date.
//
//   pnpm exec tsx scripts/do-chant-days.ts > days.json

import { existsSync, readdirSync } from 'node:fs'
import {
  createDirectorium,
  createSession,
  type DoArea,
  defaultContext,
  type Sections,
  setupstring,
} from '../packages/divinum-officium/src/index'
import { createFsLoader } from '../packages/divinum-officium/src/node/fsLoader'

const www = 'content/do/web/www'
const version = 'Rubrics 1960 - 1960'
const loader = createFsLoader(www)

// The sung texts, by section: the Mass's propers; the Office's antiphons, hymns,
// invitatory and responsories. Everything else (lessons, collects) is left out.
const sung: Record<DoArea, RegExp> = {
  missa: /^(Introitus|Graduale|Tractus|Sequentia|Offertorium|Communio)/,
  horas: /^(Ant |Ant$|Invit|Hymnus|Responsory)/,
}

async function read(area: DoArea, file: string): Promise<Sections | undefined> {
  const session = createSession({
    loader,
    ctx: defaultContext({ version, missa: area === 'missa' }),
    area,
    lang: 'Latin',
  })
  return setupstring(session, file)
}

function keep(area: DoArea, sections: Sections): Record<string, string> {
  return Object.fromEntries(Object.entries(sections).filter(([k]) => sung[area].test(k)))
}

// A saint whose Mass or Office is a Common's names it in its rank or rule: "vide C4a", "ex C2".
function commonOf(sections: Sections): string | undefined {
  return /(?:vide|ex)\s+(?:Commune\/)?(C\w+)/.exec(`${sections.Rank ?? ''}\n${sections.Rule ?? ''}`)?.[1]
}

// "In Nativitate Domini;;Duplex I classis;;6.5" — the name before the rank.
function titleOf(sections: Sections | undefined): string | undefined {
  const named = sections?.Officium?.trim() || sections?.Rank?.split(';;')[0]?.trim()
  return named || undefined
}

async function day(area: DoArea, part: string, file: string, date?: string) {
  const own = await read(area, file)
  if (!own) return undefined
  const common = commonOf(own)
  const borrowed = common ? await read(area, `Commune/${common}`) : undefined
  // A Mass borrows whole from its Common or not at all: the Assumption names the
  // Common of Our Lady, but only for what it does not sing, and it sings all of it.
  // An Office takes from its Common every hour it does not have.
  const fill = borrowed && (area === 'horas' || !own.Introitus) ? keep(area, borrowed) : {}
  const sections = { ...fill, ...keep(area, own) }
  if (!Object.keys(sections).length) return undefined
  // The Mass file can lack the name the Office file carries (12-08).
  const title =
    titleOf(own) ?? titleOf(area === 'missa' ? await read('horas', file) : undefined) ?? file
  return { area, part, file: file.replace(/^\w+\//, ''), date, title, common, sections }
}

async function main() {
  const directorium = await createDirectorium(loader)
  const out: unknown[] = []
  const push = (d: unknown) => d && out.push(d)

  for (const area of ['missa', 'horas'] as const) {
    const tempora = readdirSync(`${www}/${area}/Latin/Tempora`)
      .map((f) => f.replace(/\.txt$/, ''))
      .filter((f) => /^(Adv|Nat|Epi|Quadp|Quad|Pasc|Pent)\d+(-\d)?$/.test(f))
    for (const t of tempora) push(await day(area, 'tempora', `Tempora/${t}`))

    for (let m = 1; m <= 12; m++) {
      for (let d = 1; d <= 31; d++) {
        const date = `${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
        const entry = await directorium.getFromDirectorium('kalendar', version, date, 0)
        if (!entry || entry.startsWith('XXXXX')) continue
        const feast = entry.split('~')[0]
        // Christmas has three Masses, a file each beside the day's own.
        const masses =
          area === 'missa'
            ? [1, 2, 3]
                .map((n) => `${feast}m${n}`)
                .filter((f) => existsSync(`${www}/missa/Latin/Sancti/${f}.txt`))
            : []
        for (const file of masses.length ? masses : [feast]) {
          push(await day(area, 'sancti', `Sancti/${file}`, date))
        }
      }
    }

    const communes = readdirSync(`${www}/horas/Latin/Commune`)
      .map((f) => f.replace(/\.txt$/, ''))
      .filter((f) => /^C\d/.test(f))
    for (const c of communes) push(await day(area, 'commune', `Commune/${c}`))
  }

  // The weekly psalter: its antiphons and the hymns and versicles of its hours.
  for (const file of [
    'Psalterium/Psalmi/Psalmi major',
    'Psalterium/Psalmi/Psalmi matutinum',
    'Psalterium/Psalmi/Psalmi minor',
    'Psalterium/Special/Major Special',
    'Psalterium/Special/Matutinum Special',
    'Psalterium/Special/Minor Special',
  ]) {
    const sections = await read('horas', file)
    if (sections) out.push({ area: 'horas', part: 'psalterium', file, title: file, sections })
  }

  process.stdout.write(JSON.stringify(out))
}

main()
