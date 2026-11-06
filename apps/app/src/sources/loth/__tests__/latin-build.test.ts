import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Hour, LothSource } from '@ember/loth'
import { describe, expect, it } from 'vitest'
import { latinOfDay } from '../../../../../../scripts/loth/latin/day'
import { latinSection, latinTexts } from '../pair'

// What the corpus build (`scripts/loth/latin/`) takes from one day of
// iBreviary's Latin, against the real corpus and pages saved from the site
// (`__fixtures__/la-<date>_<page>.html`).
const root = resolve(__dirname, '../../../../../../content/loth')
const cache = new Map<string, unknown>()
const read = (path: string) => {
  if (!cache.has(path)) {
    const file = resolve(root, path)
    cache.set(path, existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : undefined)
  }
  return cache.get(path) as never
}
const source: LothSource = {
  calendar: async () => read('calendar.json'),
  index: async (hour) => read(`index/${hour}.json`),
  parts: async (bundle) => read(`parts/${bundle}.json`),
  extras: async () => read('extras.json'),
}

const pages: Record<string, [Hour, string]> = {
  'office-of-readings': ['readings', 'ufficio_delle_letture'],
  lauds: ['lauds', 'lodi'],
  terce: ['terce', 'ora_media'],
  sext: ['sext', 'ora_media'],
  none: ['none', 'ora_media'],
  vespers: ['vespers', 'vespri'],
}

// The Brazilian text of a part, by its place in the corpus.
function portuguese(ref: string): string {
  const dot = ref.lastIndexOf('.')
  const blocks = (read(`parts/${ref.slice(0, dot)}.json`) as { parts: unknown[] }).parts[
    Number(ref.slice(dot + 1))
  ] as { lines: (string | { t: string })[][] }[]
  return blocks
    .flatMap((b) =>
      b.lines.map((line) => line.map((s) => (typeof s === 'string' ? s : s.t)).join('')),
    )
    .join('\n')
}

// Each Brazilian part the day gave a Latin to, as its words and the Latin's.
async function latinOn(iso: string, page: string) {
  const [hour, file] = pages[page]
  const [y, m, d] = iso.split('-').map(Number)
  const html = readFileSync(resolve(__dirname, `__fixtures__/la-${iso}_${file}.html`), 'utf8')
  const given = await latinOfDay(new Date(y, m - 1, d, 12), hour, page, html, source)
  return given.map(({ ref, latin }) => ({
    pt: portuguese(ref),
    la: latinTexts(latinSection(latin).body).join('\n'),
  }))
}

const of = (given: { pt: string; la: string }[], words: string) =>
  given.filter((g) => g.pt.includes(words)).map((g) => g.la)

describe('the Latin a day of iBreviary gives the Brazilian hours', () => {
  it("gives a memorial's Lauds the saint's Latin, and not the weekday's office", async () => {
    // 15 July 2026: Saint Bonaventure, whose office the Latin day is.
    const lauds = await latinOn('2026-07-15', 'lauds')
    expect(of(lauds, 'celebrando a festa de São Boaventura')[0]).toMatch(/^Da, quǽsumus/)
    expect(of(lauds, 'Inclinai, ó Senhor, vosso ouvido')[0]).toMatch(/Inclína, Dómine, aurem tuam/)
    // Of the Commons the Latin offers ("[Doctores]", "[Pastores]"), the one the
    // Brazilian took: the short reading by its citation, the antiphon by its words.
    expect(of(lauds, 'Aprendi a Sabedoria')[0]).toMatch(/^Sapiéntiam sine fictióne/)
    expect(of(lauds, 'Quem é sábio brilhará')[0]).toMatch(/^Qui docti fúerint/)
    // Nothing of the weekday's own: its prayer is not the Latin day's.
    const ours = lauds.filter((g) => g.la.startsWith('Da, quǽsumus'))
    expect(ours.every((g) => g.pt.includes('Boaventura'))).toBe(true)
  })

  it('gives each little hour its own oration where the Latin prints three', async () => {
    const prayerOf = async (page: string) =>
      (await latinOn('2026-07-14', page)).find((g) => /^(Omnípotens|Deus, qui)/.test(g.la))?.la
    expect(await prayerOf('terce')).toMatch(/Paráclitum/)
    expect(await prayerOf('sext')).toMatch(/^Deus, qui Petro/)
    expect(await prayerOf('none')).toMatch(/^Deus, qui Cornélio/)
  })

  it('gives nothing of its own to a day the Latin keeps otherwise', async () => {
    // 19 March 2026: Saint Joseph in the Brazilian, a weekday of Lent in iBreviary.
    const vespers = await latinOn('2026-03-19', 'vespers')
    expect(of(vespers, 'Após três dias encontraram')).toEqual([])
    expect(
      vespers.every((g) => /^(Deus,? in adiutórium|Magníficat|Dóminus nos benedícat)/.test(g.la)),
    ).toBe(true)
  })

  it('gives a Lenten responsory nothing where the Latin has another', async () => {
    // Ash Wednesday: the Brazilian's "Deus nos amou por primeiro", the Latin's
    // "Ipse liberábit me".
    const lauds = await latinOn('2026-02-18', 'lauds')
    expect(of(lauds, 'Deus nos amou por primeiro')).toEqual([])
    expect(of(lauds, 'Jejuai sem ficar tristes')[0]).toMatch(/^Cum ieiunátis/)
  })

  it('gives the Preces their Latin however iBreviary sets the petitions', async () => {
    // A petition's second half set apart ("— virtútem et patiéntiam concéde.").
    const friday = await latinOn('2026-11-06', 'lauds')
    expect(of(friday, 'Levantemos o nosso olhar para Cristo')[0]).toMatch(/^Ad Christum óculos/)
    // The response printed again after every petition.
    const christmas = await latinOn('2026-12-25', 'lauds')
    expect(of(christmas, 'Cristo, Verbo eterno')[0]).toMatch(/Exsúltet terra, quia venísti/)
  })

  it('does not take "sancte Pater" for a saint', async () => {
    const vespers = await latinOn('2026-11-06', 'vespers')
    expect(of(vespers, 'como preço de nossa salvação')[0]).toMatch(/^Dómine, sancte Pater/)
  })

  it('trusts an antiphon drawn from the psalmody, whatever division it is in', async () => {
    // Psalm 131(132): the antiphon's words are in the Latin's second division.
    const vespers = await latinOn('2026-11-05', 'vespers')
    expect(of(vespers, 'Exultem de alegria os vossos santos')[0]).toMatch(/^Sancti tui exsúltent/)
  })

  it('doubts the antiphons iBreviary keeps from the day before', async () => {
    // 15 July 2026, Terce: iBreviary prints 14 July's antiphons over the day's
    // psalms ("Memor esto congregatiónis" is Psalm 73's, set over 69).
    const terce = await latinOn('2026-07-15', 'terce')
    // (The psalm itself, whose verse the antiphon is, has its Latin.)
    const antiphons = terce.filter((g) => !g.pt.includes('*'))
    expect(of(antiphons, 'Quanto a mim, eu sou um pobre')).toEqual([])
    expect(of(antiphons, 'Quem me segue')).toEqual([])
    expect(
      terce.some((g) => g.la.startsWith('Humiliátus sum') || g.la.includes('Humiliátus sum')),
    ).toBe(true)
  })
})
