import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import type { Primitive } from '@/content/primitives'
import type { ContentSource, SourceFetchContext } from '../../types'

// The source over the real breviary in `content/loth/`, with the corpus
// loaders reading the same files the corpus build ships.
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
const source = lothHourSource(elsewhere)

async function hourOn(iso: string, hour: string, lang = 'pt-BR'): Promise<Primitive[]> {
  const [y, m, d] = iso.split('-').map(Number)
  const ctx = {
    date: new Date(y, m - 1, d, 12),
    prefs: { lang, translation: '' },
    params: { hour },
    sources: {
      fetch: (s: ContentSource, params: Record<string, unknown>) => s.fetch({ params } as never),
    },
  }
  const out = await source.fetch(ctx as unknown as SourceFetchContext)
  return Array.isArray(out) ? out : [out]
}

type Container = Extract<Primitive, { type: 'container' }>
type Select = Extract<Container['behavior'], { kind: 'select' }>

// What the page shows before anyone taps: each selector's first branch, and
// nothing that is folded away.
function shown(primitives: Primitive[], open = false): string {
  const out: string[] = []
  const walk = (list: Primitive[]) => {
    for (const p of list) {
      if (p.type === 'text' || p.type === 'rubric' || p.type === 'heading') out.push(p.text.primary)
      else if (p.type === 'verses')
        out.push(
          ...p.items.map((i) => `${i.mark ?? (i.role === 'v' ? '℣.' : '℟.')} ${i.text.primary}`),
        )
      else if (p.type === 'container') {
        const b = p.behavior
        if (b.kind === 'select') walk(b.options[0].children)
        else if (b.kind === 'collapsible') {
          if (open || b.defaultOpen) walk(p.children ?? [])
        } else walk(p.children ?? [])
      }
    }
  }
  walk(primitives)
  return out.join('\n')
}

function find<T extends Container['behavior']['kind']>(
  primitives: Primitive[],
  kind: T,
  into: Extract<Container['behavior'], { kind: T }>[] = [],
) {
  for (const p of primitives) {
    if (p.type !== 'container') continue
    if (p.behavior.kind === kind) into.push(p.behavior as never)
    if (p.behavior.kind === 'select' || p.behavior.kind === 'options') {
      for (const option of p.behavior.options) find(option.children, kind, into)
    } else find(p.children ?? [], kind, into)
  }
  return into
}

const officeSelect = (primitives: Primitive[]): Select | undefined =>
  find(primitives, 'select').find((s) => s.overrideKey === 'loth.office')

describe('the Liturgy of the Hours in Brazilian Portuguese', () => {
  it('prays a weekday of Ordinary Time from the psalter', async () => {
    const lauds = shown(await hourOn('2026-10-07', 'lauds'))
    expect(lauds).toContain('Vinde, ó Deus, em meu auxílio.')
    expect(lauds).toContain('Hino')
    expect(lauds).toContain('Salmodia')
    expect(lauds).toContain('Preces')
    expect(lauds).toContain('Conclusão da Hora')
  })

  it('offers the weekday first and the saint second on an optional memorial', async () => {
    // 6 October 2026, a Tuesday: Saint Bruno.
    const select = officeSelect(await hourOn('2026-10-06', 'lauds'))
    expect(select?.options.map((o) => o.label.primary)).toEqual([
      'Tempo litúrgico',
      'São Bruno, presbítero',
    ])
    expect(shown(select?.options[0].children ?? [])).not.toContain('BRUNO')
    const saint = shown(select?.options[1].children ?? [])
    expect(saint).toContain('SÃO BRUNO, PRESBÍTERO')
    // The memorial keeps the weekday's psalms and takes the saint's prayer.
    expect(saint).toContain('Salmo 84(85)')
  })

  it('offers the saint first on an obligatory memorial', async () => {
    // 7 October: Our Lady of the Rosary.
    const select = officeSelect(await hourOn('2026-10-07', 'lauds'))
    expect(select?.options.map((o) => o.id)).toEqual(['celebration', 'season'])
  })

  it('gives a solemnity one office, and its first Vespers the evening before', async () => {
    // 12 October: Our Lady of Aparecida, patroness of Brazil.
    const lauds = await hourOn('2026-10-12', 'lauds')
    expect(officeSelect(lauds)).toBeUndefined()
    expect(shown(lauds)).toContain('APARECIDA')
    expect(shown(await hourOn('2026-10-11', 'vespers'))).toContain('APARECIDA')
  })

  it('prays the first Vespers of Sunday on Saturday evening', async () => {
    expect(shown(await hourOn('2026-10-10', 'vespers'))).toMatch(/I V[ée]speras/i)
  })

  it('opens the day with the Invitatory, folded, with its four psalms', async () => {
    for (const hour of ['office-of-readings', 'lauds']) {
      const primitives = await hourOn('2026-10-08', hour)
      const invitatory = find(primitives, 'collapsible').find(
        (c) => c.title.primary === 'Invitatório',
      )
      expect(invitatory?.defaultOpen).toBe(false)
      const psalms = find(primitives, 'select').find((s) => s.overrideKey === 'loth.invitatory')
      expect(psalms?.options.map((o) => o.label.primary)).toEqual([
        'Salmo 94(95)',
        'Salmo 99(100)',
        'Salmo 66(67)',
        'Salmo 23(24)',
      ])
      expect(shown(psalms?.options[0].children ?? [])).toContain(
        'Vinde, exultemos de alegria no Senhor',
      )
    }
    expect(
      find(await hourOn('2026-10-08', 'vespers'), 'collapsible').map((c) => c.title.primary),
    ).not.toContain('Invitatório')
  })

  it('folds the psalm-prayers away and sets antiphons, versicles and verse numbers apart', async () => {
    const primitives = await hourOn('2026-10-08', 'vespers')
    expect(
      find(primitives, 'collapsible').filter((c) => c.title.primary === 'Coleta salmódica'),
    ).toHaveLength(2)
    expect(shown(primitives)).not.toContain('Coleta salmódica')
    const text = shown(primitives)
    expect(text).toMatch(/^Ant\. 1 \S/m)
    expect(text).toMatch(/^℣\. Vinde, ó Deus/m)
    expect(text).toMatch(/^℟\. Socorrei-me sem demora\.$/m)
    // A verse number is a small red run, the asterisk left for the renderer to colour.
    expect(text).toMatch(/–\/:\d+:\/ .+ \*$/m)
  })

  it('unfolds the Latin texts the hour links to', async () => {
    const titles = find(await hourOn('2026-10-08', 'lauds'), 'collapsible').map(
      (c) => c.title.primary,
    )
    expect(titles).toContain('Em latim')
  })

  it('has every hour of every day of a year', async () => {
    const hours = ['office-of-readings', 'lauds', 'terce', 'sext', 'none', 'vespers', 'compline']
    for (
      let day = new Date(2027, 0, 1, 12);
      day.getFullYear() === 2027;
      day.setDate(day.getDate() + 1)
    ) {
      const iso = `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`
      for (const hour of hours)
        expect(shown(await hourOn(iso, hour)).length, `${iso} ${hour}`).toBeGreaterThan(400)
    }
  }, 120_000)
})

describe('in any other language', () => {
  it('hands the hour to the other source', async () => {
    expect(await hourOn('2026-10-08', 'lauds', 'en-US')).toEqual([
      { type: 'text', text: { primary: 'from elsewhere' } },
    ])
  })
})
