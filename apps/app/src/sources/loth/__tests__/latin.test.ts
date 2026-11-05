import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import type { Primitive } from '@/content/primitives'
import { parseHourPage } from '../../ibreviary/parse'
import type { ContentSource, SourceFetchContext } from '../../types'

// The Brazilian hours from the real corpus, with iBreviary's Latin for the same
// day as saved from the site (`__fixtures__/la-<date>_<page>.html`).
const root = resolve(__dirname, '../../../../../../content/loth')
const cache = new Map<string, unknown>()
const read = (path: string) => {
  if (!cache.has(path)) {
    const file = resolve(root, path)
    cache.set(path, existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : undefined)
  }
  return cache.get(path)
}

vi.mock('@/content/contentIndex', () => ({ getCatalog: () => ({ generated: 'test' }) }))
vi.mock('@/lib/loth/loaders', () => ({
  corpusLoth: {
    calendar: async () => read('calendar.json'),
    index: async (hour: string) => read(`index/${hour}.json`),
    parts: async (bundle: string) => read(`parts/${bundle}.json`),
    extras: async () => read('extras.json'),
  },
}))

const { lothHourSource } = await import('../source')

const page: Record<string, string> = {
  'office-of-readings': 'ufficio_delle_letture',
  lauds: 'lodi',
  terce: 'ora_media',
  sext: 'ora_media',
  none: 'ora_media',
  vespers: 'vespri',
  compline: 'compieta',
}

const elsewhere: ContentSource = {
  id: 'elsewhere',
  version: '1',
  prefsDeps: ['lang'],
  fetch: async () => ({ type: 'text', text: { primary: 'from elsewhere' } }),
}

async function hourOn(iso: string, hour: string, latin: 'fixture' | 'offline' | 'none') {
  const fetched: string[] = []
  const latinSource: ContentSource = {
    id: 'latin',
    version: '1',
    prefsDeps: [],
    fetch: async (ctx) => {
      fetched.push(String(ctx.params.hour))
      if (latin === 'offline') throw new Error('ibreviary fetch timeout')
      const html = readFileSync(
        resolve(__dirname, `__fixtures__/la-${iso}_${page[hour]}.html`),
        'utf8',
      )
      return parseHourPage(html, hour as never, 'la')
    },
  }
  const source = lothHourSource(elsewhere, latinSource)
  const [y, m, d] = iso.split('-').map(Number)
  const ctx = {
    date: new Date(y, m - 1, d, 12),
    prefs: { lang: 'pt-BR', translation: '', secondaryLang: latin === 'none' ? undefined : 'la' },
    params: { hour },
    sources: {
      fetch: (s: ContentSource, params: Record<string, unknown>) => s.fetch({ params } as never),
    },
  }
  const out = await source.fetch(ctx as unknown as SourceFetchContext)
  return { out: [out].flat(), fetched, kept: source.keep(out) }
}

type Said = { primary: string; secondary?: string; secondaryMissing?: boolean }

// Every text and versicle of an office, with the Latin beside it.
function said(primitives: Primitive[], office?: string): Said[] {
  const out: Said[] = []
  const walk = (list: Primitive[]) => {
    for (const p of list) {
      if (p.type === 'text') out.push(p.text)
      else if (p.type === 'verses') out.push(...p.items.map((i) => i.text))
      else if (p.type === 'container') {
        const b = p.behavior
        if (b.kind === 'select' && b.overrideKey === 'loth.office')
          walk(b.options.find((o) => !office || o.id === office)?.children ?? [])
        else if (b.kind === 'select' || b.kind === 'options') walk(b.options[0].children)
        else walk(p.children ?? [])
      }
    }
  }
  walk(primitives)
  return out
}

const beside = (texts: Said[], start: string) => texts.find((t) => t.primary.startsWith(start))

describe('the Brazilian hours with the Latin beside them', () => {
  it('asks for the Latin only of a reader who sets it beside', async () => {
    const { out, fetched } = await hourOn('2026-07-15', 'lauds', 'none')
    expect(fetched).toEqual([])
    expect(said(out).some((t) => t.secondary)).toBe(false)
  })

  it("pairs a memorial's Lauds part by part with the saint's Latin office", async () => {
    // 15 July 2026: Saint Bonaventure, whose Latin office the Latin day is.
    const { out, fetched, kept } = await hourOn('2026-07-15', 'lauds', 'fixture')
    expect(fetched).toEqual(['lauds'])
    expect(kept).toBe(true)
    const saint = said(out, 'celebration')
    expect(beside(saint, 'Vinde, ó Deus')?.secondary).toBe('Deus in adiutórium meum inténde.')
    // The psalm under its own name, then its strophes as one block beside the
    // Latin's, which cuts them otherwise.
    expect(beside(saint, '**Oração do pobre')?.secondary).toBe(
      '**Pauperis in rebus adversis oratio**',
    )
    expect(beside(saint, '–/:1:/ Inclinai')?.secondary).toMatch(/^Inclína, Dómine, aurem tuam/)
    expect(beside(saint, 'Alegrai vosso servo')?.secondary).toMatch(/^Lætífica ánimam servi tui/)
    // Of the Commons the Latin offers ("[Doctores]", "[Pastores]"), the one the
    // Brazilian took: the short reading by its citation, the antiphon by its words.
    expect(beside(saint, 'Aprendi a Sabedoria')?.secondary).toMatch(/^Sapiéntiam sine fictióne/)
    expect(beside(saint, 'Quem é sábio brilhará')?.secondary).toMatch(/^Qui docti fúerint/)
    // The responsory said twice and abbreviated, line for line.
    expect(beside(saint, 'Que os povos.')?.secondary).toMatch(/^Sapiéntiam sanctórum/)
    expect(beside(saint, 'Apascentai, Senhor')?.secondary).toBe('Pasce pópulum tuum, Dómine.')
    expect(beside(saint, 'Concedei-nos, Pai todo-poderoso')?.secondary).toMatch(/^Da, quǽsumus/)
    // The Brazilian's own hymn is no translation of the Latin's.
    expect(beside(saint, 'Doutor eterno')?.secondaryMissing).toBe(true)

    // The weekday's office shares the psalms with the Latin day, not the prayer.
    const weekday = said(out, 'season')
    expect(beside(weekday, '–/:1:/ Inclinai')?.secondary).toMatch(/^Inclína/)
    const prayers = weekday.filter((t) => t.secondary?.startsWith('Da, quǽsumus'))
    expect(prayers).toEqual([])
    expect(beside(weekday, 'Concedei-nos, Pai todo-poderoso')).toBeUndefined()
  })

  it('gives each little hour its own oration where the Latin prints three', async () => {
    // A Tuesday of the year: iBreviary sets each hour's oration after its reading.
    const terce = said((await hourOn('2026-07-14', 'terce', 'fixture')).out)
    const sext = said((await hourOn('2026-07-14', 'sext', 'fixture')).out)
    const none = said((await hourOn('2026-07-14', 'none', 'fixture')).out)
    const prayer = (texts: Said[]) =>
      texts.find((t) => /^(Omnípotens|Deus, qui)/.test(t.secondary ?? ''))
    expect(prayer(terce)?.secondary).toMatch(/^Omnípotens sempitérne Deus, qui Paráclitum/)
    expect(prayer(sext)?.secondary).toMatch(/^Deus, qui Petro/)
    expect(prayer(none)?.secondary).toMatch(/^Deus, qui Cornélio/)
  })

  it('trusts an antiphon drawn from the psalmody, whatever division it is in', async () => {
    // Psalm 131(132): the antiphon's words are in the Latin's second division.
    const vespers = said((await hourOn('2026-11-05', 'vespers', 'fixture')).out)
    expect(beside(vespers, 'Exultem de alegria os vossos santos')?.secondary).toMatch(
      /^Sancti tui exsúltent/,
    )
  })

  it('doubts the antiphons iBreviary keeps from the day before', async () => {
    // 15 July 2026, Terce: iBreviary prints 14 July's antiphons over the
    // day's psalms ("Memor esto congregatiónis" is Psalm 73's, set over 69).
    const terce = said((await hourOn('2026-07-15', 'terce', 'fixture')).out)
    expect(beside(terce, 'Quanto a mim, eu sou um pobre')?.secondary).toBeUndefined()
    expect(beside(terce, 'Quem me segue')?.secondary).toBeUndefined()
    // The psalms themselves are the day's.
    expect(
      beside(terce, '–/:105:/')?.secondary ?? beside(terce, '–/:107:/')?.secondary,
    ).toBeDefined()
  })

  it('sets nothing of its own beside a day the Latin keeps otherwise', async () => {
    // 19 March 2026: Saint Joseph in the Brazilian, a weekday of Lent in iBreviary.
    const vespers = said((await hourOn('2026-03-19', 'vespers', 'fixture')).out)
    expect(beside(vespers, 'Vinde, ó Deus')?.secondary).toBeDefined()
    expect(beside(vespers, 'Após três dias encontraram')?.secondary).toBeUndefined()
    // Only what every day says: the opening, the Magnificat, the blessing.
    const everyDays =
      /^(Deus,? in adiutórium|Dómine, ad|Glória Patri|\*\*Exsultatio animæ|Magníficat|Dóminus nos benedícat)/
    expect(vespers.filter((t) => t.secondary && !everyDays.test(t.secondary))).toEqual([])
  })

  it('leaves a Lenten responsory the Latin has otherwise beside nothing', async () => {
    // Ash Wednesday: the Brazilian's "Deus nos amou por primeiro", the Latin's
    // "Ipse liberábit me".
    const lauds = said((await hourOn('2026-02-18', 'lauds', 'fixture')).out)
    expect(beside(lauds, 'Deus nos amou por primeiro')?.secondary).toBeUndefined()
    expect(beside(lauds, 'Jejuai sem ficar tristes')?.secondary).toMatch(/^Cum ieiunátis/)
  })

  it('prays the Portuguese offline, says why the Latin is missing, and does not keep it', async () => {
    const { out, kept } = await hourOn('2026-07-15', 'lauds', 'offline')
    expect(out[0]).toMatchObject({ type: 'rubric' })
    expect(out[0].type === 'rubric' && out[0].text.primary).toMatch(
      /texto latino não pôde ser carregado/,
    )
    expect(said(out).some((t) => t.primary.startsWith('Vinde, ó Deus'))).toBe(true)
    expect(kept).toBe(false)
  })
})
