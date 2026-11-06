import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import type { Primitive } from '@/content/primitives'
import type { ContentSource, SourceFetchContext } from '../../types'

// The Brazilian hours with their Latin, both from the real corpus.
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

const elsewhere: ContentSource = {
  id: 'elsewhere',
  version: '1',
  prefsDeps: ['lang'],
  fetch: async () => ({ type: 'text', text: { primary: 'from elsewhere' } }),
}
const latin = async (bundle: string) => read(`latin/${bundle}.json`) as never

async function hourOn(
  iso: string,
  hour: string,
  secondaryLang?: string,
  prefs: { lang?: string; jurisdiction?: string; vernacular?: string } = {},
) {
  const source = lothHourSource(elsewhere, latin)
  const [y, m, d] = iso.split('-').map(Number)
  const ctx = {
    date: new Date(y, m - 1, d, 12),
    prefs: { lang: 'pt-BR', translation: '', secondaryLang, ...prefs },
    params: { hour },
    sources: {
      fetch: (s: ContentSource, params: Record<string, unknown>) => s.fetch({ params } as never),
    },
  }
  return [await source.fetch(ctx as unknown as SourceFetchContext)].flat()
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
  it('sets the Latin only beside a reader who asks for it', async () => {
    expect(said(await hourOn('2026-07-15', 'lauds')).some((t) => t.secondary)).toBe(false)
    expect(said(await hourOn('2026-07-15', 'lauds', 'en-US')).some((t) => t.secondary)).toBe(false)
  })

  it("prays the Brazilian edition's office in Latin for a reader of Brazil", async () => {
    // 15 July 2026, Saint Bonaventure: the corpus's Latin, not iBreviary's.
    for (const prefs of [
      { lang: 'la', jurisdiction: 'BR' },
      { lang: 'la', vernacular: 'pt-BR' },
    ]) {
      const texts = said(await hourOn('2026-07-15', 'lauds', undefined, prefs), 'celebration')
      expect(texts.some((t) => t.primary.startsWith('Da, quǽsumus'))).toBe(true)
      expect(texts.every((t) => t.secondary === undefined)).toBe(true)
    }
    // Followed by English, still the Brazilian office in Latin.
    const english = said(
      await hourOn('2026-07-15', 'lauds', 'la', { lang: 'en-US', jurisdiction: 'BR' }),
      'celebration',
    )
    expect(english.some((t) => t.primary.startsWith('Da, quǽsumus'))).toBe(true)
    // A reader of another calendar and language prays iBreviary's.
    const elsewhereOut = said(
      await hourOn('2026-07-15', 'lauds', undefined, { lang: 'la', vernacular: 'en-US' }),
    )
    expect(elsewhereOut.map((t) => t.primary)).toEqual(['from elsewhere'])
  })

  it('gives each office of a memorial its own Latin, offline', async () => {
    // 15 July 2026: Saint Bonaventure.
    const out = await hourOn('2026-07-15', 'lauds', 'la')
    const saint = said(out, 'celebration')
    expect(beside(saint, 'Vinde, ó Deus')?.secondary).toMatch(/^Deus,? in adiutórium/)
    expect(beside(saint, '**Oração do pobre')?.secondary).toBe(
      '**Pauperis in rebus adversis oratio**',
    )
    expect(beside(saint, '–/:1:/ Inclinai')?.secondary).toMatch(/^Inclína, Dómine, aurem tuam/)
    expect(beside(saint, 'Concedei-nos, Pai todo-poderoso')?.secondary).toMatch(/^Da, quǽsumus/)
    // The weekday's office is not given the saint's prayer.
    const weekday = said(out, 'season')
    expect(weekday.filter((t) => t.secondary?.startsWith('Da, quǽsumus'))).toEqual([])
    // A hymn the day's Latin printed otherwise has its Latin from the days that
    // print it: "Doctor ætérnus", the Doctors' Common's.
    expect(beside(saint, 'Doutor eterno')?.secondary).toMatch(/^Doctor ætérnus/)
  })

  it('pairs a psalm under its own title, and the hymn stanza by stanza', async () => {
    // The third Sunday of Easter: "Aurora lucis rutilat" in Brazilian verse.
    const lauds = said(await hourOn('2026-04-19', 'lauds', 'la'))
    expect(beside(lauds, 'Desdobra-se no céu')?.secondary).toMatch(/^Auróra lucis rútilat/)
    expect(beside(lauds, '**A grandeza do Deus Criador**')?.secondary).toBe(
      '**Magnificentia Domini creatoris**',
    )
  })

  it('gives the Invitatory its Latin with any of its four psalms', async () => {
    const out = await hourOn('2026-07-14', 'lauds', 'la')
    const options = (list: Primitive[]): Primitive[][] => {
      for (const p of list)
        if (p.type === 'container') {
          const b = p.behavior
          if (b.kind === 'select' && b.overrideKey === 'loth.invitatory')
            return b.options.map((o) => o.children)
          const found = options(
            b.kind === 'select' || b.kind === 'options'
              ? b.options[0].children
              : (p.children ?? []),
          )
          if (found.length) return found
        }
      return []
    }
    const [, psalm99] = options(out).map((children) => said(children))
    // The Latin cuts Psalm 99(100) otherwise; verse for verse beside the Brazilian's.
    expect(beside(psalm99, '=/:2:/ Aclamai o Senhor')?.secondary).toMatch(/^Iubiláte Dómino/)
    expect(beside(psalm99, '=/:3:/ Sabei que o Senhor')?.secondary).toMatch(/^Scitóte quóniam/)
    expect(beside(psalm99, 'Adoremos o Senhor, admirável')?.secondary).toMatch(/^Mirábilem Deum/)
  })
})
