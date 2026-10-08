import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import type { Primitive } from '@/content/primitives'
import type { SourceFetchContext } from '../../types'

// The Mass source over the real missal in `content/missal/`, with the corpus
// loaders reading the same files the corpus build ships.
const root = resolve(__dirname, '../../../../../../content/missal')
const read = (path: string) => {
  const file = resolve(root, path)
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : undefined
}

vi.mock('@/content/contentIndex', () => ({ getCatalog: () => ({ generated: 'test' }) }))
vi.mock('@/lib/missal/loaders', () => ({
  loadMissalCalendar: async () => read('calendar.json'),
  loadMassOrder: async (id: string) => read(`order/${id}.json`),
  loadEucharisticPrayer: async (id: string) => read(`eucharistic-prayers/${id}.json`),
  regionsForJurisdiction: (jurisdiction?: string) => (jurisdiction === 'BR' ? ['brazil'] : []),
  corpusMissal: {
    formulary: async (id: string) => read(`formularies/${id}.json`),
    lectionary: async (id: string) => read(`lectionary/${id}.json`),
    prefaces: async () => read('prefaces.json'),
  },
}))

const { missalMassSource, missalProperSource } = await import('../../missal-mass')

// A Brazilian reader by default; `lang` alone changes the language, not the
// calendar. `null` is a reader with no calendar region set.
async function massOn(
  iso: string,
  lang = 'pt-BR',
  region: 'BR' | 'US' | null = 'BR',
): Promise<Primitive[]> {
  const [y, m, d] = iso.split('-').map(Number)
  const ctx = {
    date: new Date(y, m - 1, d, 12),
    prefs: { lang, translation: '', jurisdiction: region ?? undefined },
    params: {},
  }
  return missalMassSource.fetch(ctx as unknown as SourceFetchContext)
}

async function properOn(iso: string, lang = 'pt-BR'): Promise<Primitive[]> {
  const [y, m, d] = iso.split('-').map(Number)
  const ctx = {
    date: new Date(y, m - 1, d, 12),
    prefs: { lang, translation: '', jurisdiction: 'BR' },
    params: {},
  }
  return missalProperSource.fetch(ctx as unknown as SourceFetchContext)
}

type Select = Extract<Extract<Primitive, { type: 'container' }>['behavior'], { kind: 'select' }>

// What the page shows before anyone taps: each selector's default branch.
function shown(primitives: Primitive[], secondary = false): string {
  const out: string[] = []
  const side = (text: { primary: string; secondary?: string }) =>
    secondary ? (text.secondary ?? '') : text.primary
  const walk = (list: Primitive[]) => {
    for (const p of list) {
      if (p.type === 'text' || p.type === 'rubric' || p.type === 'heading') out.push(side(p.text))
      else if (p.type === 'verses') out.push(...p.items.map((i) => side(i.text)))
      else if (p.type === 'callout' && p.title) out.push(side(p.title))
      else if (p.type === 'container') {
        const b = p.behavior
        if (b.kind === 'select') {
          walk((b.options.find((o) => o.id === b.selectedId) ?? b.options[0]).children)
        } else walk(p.children ?? [])
      }
    }
  }
  walk(primitives)
  return out.join('\n')
}

function selects(primitives: Primitive[], into: Select[] = []): Select[] {
  for (const p of primitives) {
    if (p.type !== 'container') continue
    if (p.behavior.kind === 'select') {
      into.push(p.behavior)
      for (const option of p.behavior.options) selects(option.children, into)
    } else selects(p.children ?? [], into)
  }
  return into
}

const selectOf = (primitives: Primitive[], key: string) =>
  selects(primitives).find((s) => s.overrideKey === key)

describe('an ordinary weekday', () => {
  it('is the whole Order of Mass with the day woven in', async () => {
    const mass = await massOn('2026-10-07')
    const text = shown(mass)
    // Our Lady of the Rosary, an obligatory memorial.
    expect(text).toContain('Virgem Maria do Rosário')
    for (const fixed of [
      'Em nome do Pai',
      'Senhor, tende piedade',
      'Santo, Santo, Santo',
      'Pai nosso',
      'Cordeiro de Deus',
    ]) {
      expect(text).toContain(fixed)
    }
    // A memorial has neither Gloria nor Creed.
    expect(text).not.toContain('Glória a Deus nas alturas')
    expect(text).not.toContain('Creio em um só Deus')
  })

  it('reads the weekday by default on a memorial and offers the proper readings', async () => {
    // St John Vianney.
    const mass = await massOn('2026-08-04')
    const gospel = selectOf(mass, 'missal.gospel')
    expect(gospel?.options.map((o) => o.id)).toEqual([
      'tempore.ordinary-time.week-18.tuesday',
      'sanctorale.08-04',
    ])
    expect(gospel?.options.map((o) => o.label.primary)).toEqual(['Do dia', 'Próprio'])
  })

  it("reads a Marian memorial's own readings first, as the daily missals do", async () => {
    const gospel = selectOf(await massOn('2026-10-07'), 'missal.gospel')
    expect(gospel?.options.map((o) => o.id)).toEqual([
      'sanctorale.10-07',
      'tempore.ordinary-time.week-27.wednesday',
    ])
  })

  it('shows nothing that exists only in a third language', async () => {
    // The German Eucharistic Prayers carry Sunday insertions of their own.
    const all = JSON.stringify(await massOn('2026-10-04', 'en-US'))
    expect(all).not.toContain('Darum kommen wir')
    expect(all).not.toContain('Prefacio III')
  })

  it('pairs Latin with the vernacular', async () => {
    const mass = await massOn('2026-10-07')
    expect(shown(mass, true)).toContain('Pater noster')
  })

  it('offers the three forms of the Penitential Act and the Eucharistic Prayers', async () => {
    const mass = await massOn('2026-10-07')
    expect(selectOf(mass, 'missal.penitential-act')?.options).toHaveLength(3)
    const prayers = selectOf(mass, 'missal.eucharistic-prayer')
    expect(prayers?.options).toHaveLength(10)
    // The second prayer on a weekday.
    expect(prayers?.selectedId).toBe('eucharistic-prayer.2')
  })

  it("sets the Brazilian Missal's acclamations in the Eucharistic Prayer as the people's part", async () => {
    const mass = await massOn('2026-10-07')
    const prayer = selectOf(mass, 'missal.eucharistic-prayer')?.options.find(
      (o) => o.id === 'eucharistic-prayer.2',
    )
    const responses = (prayer?.children ?? []).flatMap((p) =>
      p.type === 'verses' ? p.items.filter((i) => i.role === 'r').map((i) => i.text.primary) : [],
    )
    for (const acclamation of [
      'Enviai o vosso Espírito Santo!',
      'Aceitai, ó Senhor, a nossa oferta!',
      'O Espírito nos una num só corpo!',
      // Set inside the intercession's own paragraph in the corpus.
      'Lembrai-vos, ó Pai, da vossa Igreja!',
    ]) {
      expect(responses).toContain(acclamation)
    }
    // They are the Brazilian edition's own: the English prayer has none of them.
    const english = selectOf(await massOn('2026-10-07', 'en-US'), 'missal.eucharistic-prayer')
    expect(JSON.stringify(english)).not.toContain('Enviai')
  })

  it('offers optional memorials and the weekday as Masses of the day', async () => {
    const mass = await massOn('2026-10-06')
    const options = selectOf(mass, 'missal.mass')?.options.map((o) => o.id)
    expect(options).toContain('sanctorale.10-06#day')
    expect(options).toContain('tempore.ordinary-time.week-27.tuesday#day')
    // The weekday comes first, named as itself and not as the Sunday whose prayers it uses.
    const labels = selectOf(mass, 'missal.mass')?.options.map((o) => o.label.primary)
    expect(labels?.[0]).toBe('Terça-feira da 27ª Semana do Tempo Comum')
  })
})

describe('Sundays and solemnities', () => {
  it('says the Gloria and the Creed on a Sunday of Ordinary Time', async () => {
    const text = shown(await massOn('2026-10-04'))
    expect(text).toContain('Glória a Deus nas alturas')
    expect(text).toContain('Creio em um só Deus')
  })

  it('omits the Gloria in Lent and keeps the Creed', async () => {
    const text = shown(await massOn('2026-03-01'))
    expect(text).not.toContain('Glória a Deus nas alturas')
    expect(text).toContain('Creio em um só Deus')
  })

  it('offers the four Masses of Christmas', async () => {
    const mass = await massOn('2026-12-25')
    expect(selectOf(mass, 'missal.mass')?.options.map((o) => o.label.primary)).toEqual([
      expect.stringContaining('Dia'),
      expect.stringContaining('Vigília'),
      expect.stringContaining('Noite'),
      expect.stringContaining('Aurora'),
    ])
  })

  it('keeps Our Lady of Aparecida as the Mass of 12 October in Brazil', async () => {
    expect(shown(await massOn('2026-10-12'))).toContain('Nossa Senhora da Conceição Aparecida')
    // The calendar follows the region, not the language.
    expect(shown(await massOn('2026-10-12', 'en-US', 'BR'))).toContain('Aparecida')
    expect(shown(await massOn('2026-10-12', 'pt-BR', null))).not.toContain('Aparecida')
    // Its texts exist in Portuguese only, so nothing stands in the Latin column.
    expect(shown(await massOn('2026-10-12', 'en-US', 'BR'), true)).not.toContain('pescadores')
  })
})

describe('sequences', () => {
  it('offers the Stabat Mater on 15 September as optional, with both Gospels of the memorial', async () => {
    const mass = await massOn('2026-09-15')
    expect(JSON.stringify(mass)).toContain('Sequência (facultativa)')
    expect(shown(mass, true)).toContain('Stabat Mater')
    // Its readings are proper: the memorial's two Gospels first, then the weekday's.
    const gospels = selectOf(mass, 'missal.gospel')?.options.map((o) => o.id.split('#')[0])
    expect(gospels).toEqual([
      'sanctorale.09-15',
      'sanctorale.09-15',
      'tempore.ordinary-time.week-24.tuesday',
    ])
  })

  it('sets Veni, Sancte Spiritus at Pentecost, in Latin beside the vernacular', async () => {
    const mass = await massOn('2026-05-24')
    expect(shown(mass, true)).toContain('Veni, Sancte Spíritus')
    expect(JSON.stringify(mass)).not.toContain('Sequência (facultativa)')
  })

  it('sets Victimae paschali on Easter Sunday', async () => {
    expect(shown(await massOn('2026-04-05'), true)).toMatch(/V[íi]ctim[æa]e? pasch[áa]li/)
  })
})

describe('Holy Week and the Triduum', () => {
  it('opens Palm Sunday with the procession instead of the Penitential Act', async () => {
    const mass = await massOn('2026-03-29')
    expect(shown(mass, true)).toContain('Glória, laus')
    expect(selectOf(mass, 'missal.penitential-act')).toBeUndefined()
    expect(shown(mass)).toContain('Santo, Santo, Santo')
  })

  it("offers the Chrism Mass and the Mass of the Lord's Supper on Holy Thursday", async () => {
    const mass = await massOn('2026-04-02')
    expect(selectOf(mass, 'missal.mass')?.options.map((o) => o.id)).toEqual([
      'tempore.holy-week.lords-supper#evening',
      'tempore.holy-week.chrism-mass#chrism',
    ])
    expect(shown(mass)).toContain('Ubi cáritas')
  })

  it('reads Good Friday straight through: the Passion, the intercessions, the Cross', async () => {
    const mass = await massOn('2026-04-03')
    const latin = shown(mass, true)
    expect(latin).toMatch(/P[áa]ssio D[óo]mini nostri/)
    expect(latin).toContain('Ecce lignum Crucis')
    expect(latin).toContain('Pópule meus')
    // The readings stand inside the Liturgy of the Word, not before the rite.
    const text = shown(mass)
    expect(text.indexOf('Liturgia da Palavra')).toBeLessThan(
      text.indexOf('Leitura do Livro de Isaías'),
    )
    expect(text.indexOf('Leitura do Livro de Isaías')).toBeLessThan(
      text.indexOf('Adoração da Cruz'),
    )
    // Not a Mass: no Eucharistic Prayer.
    expect(selectOf(mass, 'missal.eucharistic-prayer')).toBeUndefined()
  })

  it('gives the Easter Vigil its own rite, then the Liturgy of the Eucharist', async () => {
    const mass = await massOn('2026-04-04')
    const latin = shown(mass, true)
    expect(latin).toContain('Exsúltet iam')
    expect(latin).toContain('Sancta María, Mater Dei')
    // The Exsultet in its long and short forms, and each reading in its place.
    const forms = selects(mass).map((s) => s.options.map((o) => o.label.primary).join(' | '))
    expect(forms).toContain('Forma longa | Forma breve')
    const text = shown(mass)
    expect(text.indexOf('Livro do Gênesis')).toBeGreaterThan(0)
    expect(text.indexOf('Livro do Gênesis')).toBeLessThan(text.indexOf('Livro do Êxodo'))
    expect(selectOf(mass, 'missal.eucharistic-prayer')).toBeDefined()
  })
})

describe('every day of a year', () => {
  for (const lang of ['pt-BR', 'en-US', 'la']) {
    it(`builds a Mass in ${lang}`, async () => {
      const thin: string[] = []
      for (
        let date = new Date(2026, 0, 1, 12);
        date.getFullYear() === 2026;
        date.setDate(date.getDate() + 1)
      ) {
        const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        const text = shown(await massOn(iso, lang))
        if (text.length < 4000) thin.push(`${iso} ${text.length}`)
      }
      expect(thin).toEqual([])
    })
  }
})

describe('what the corpus must not show', () => {
  const canon = async (iso: string) => {
    const prayers = selectOf(await massOn(iso), 'missal.eucharistic-prayer')
    const roman = prayers?.options.find((o) => o.id === 'eucharistic-prayer.1')
    return shown(roman?.children ?? [])
  }

  it("says one Communicantes in the Roman Canon: the day's own, or the ordinary one", async () => {
    const ordinary = await canon('2026-10-07')
    expect(ordinary.match(/Em comunhão com toda a Igreja/g)).toHaveLength(1)
    expect(ordinary).toContain('celebramos em primeiro lugar')
    const christmas = await canon('2026-12-25')
    expect(christmas.match(/Em comunhão com toda a Igreja/g)).toHaveLength(1)
    expect(christmas).toContain('deu à luz o Salvador do mundo')
    // Another language's insertions are not a Portuguese reader's.
    expect(ordinary).not.toContain('In Gemeinschaft')
  })

  it('reads the Gospel on All Souls', async () => {
    const text = shown(await massOn('2026-11-02'))
    expect(text).toContain('Eu o ressuscitarei no último dia')
    expect(text).not.toMatch(/MatthewMateus|JohnJoão/)
  })

  it('offers no choice that is empty for the reader', async () => {
    // St Vincent: Spain has antiphons of its own, which no one else reads.
    for (const select of selects(await massOn('2026-01-22'))) {
      for (const option of select.options) expect(option.children.length).toBeGreaterThan(0)
    }
  })
})

describe("the day's proper alone", () => {
  it('is the antiphons, the collect and the readings, without the Order of Mass', async () => {
    const text = shown(await properOn('2026-10-08'))
    const at = [
      'Antífona da entrada',
      'Deus eterno e todo-poderoso',
      'Carta de São Paulo aos Gálatas',
      'Salmo Responsorial',
      'segundo Lucas',
      'Antífona da comunhão',
    ].map((part) => text.indexOf(part))
    expect(at.every((n) => n >= 0)).toBe(true)
    expect(at).toEqual([...at].sort((a, b) => a - b))
    expect(text).not.toContain('Santo, Santo, Santo')
    expect(text).not.toContain('Sobre as oferendas')
  })

  it('offers the same Masses as the Mass, under the same choice', async () => {
    for (const iso of ['2026-12-25', '2026-04-02', '2026-08-04']) {
      const ids = (list: Primitive[]) => selectOf(list, 'missal.mass')?.options.map((o) => o.id)
      expect(ids(await properOn(iso))).toEqual(ids(await massOn(iso)))
    }
  })

  it('reads the Easter Vigil through all its readings', async () => {
    const text = shown(await properOn('2026-04-04'))
    expect(text.indexOf('Livro do Gênesis')).toBeGreaterThan(0)
    expect(text.indexOf('Livro do Gênesis')).toBeLessThan(text.indexOf('Livro do Êxodo'))
    expect(text.indexOf('Livro do Êxodo')).toBeLessThan(text.indexOf('Epístola'))
    expect(text).toContain('segundo São Mateus')
  })

  it('has a Gospel every day of a year', async () => {
    const without: string[] = []
    for (
      let date = new Date(2026, 0, 1, 12);
      date.getFullYear() === 2026;
      date.setDate(date.getDate() + 1)
    ) {
      const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      const text = shown(await properOn(iso))
      if (!/segundo (São )?(Mateus|Marcos|Lucas|João)/.test(text)) without.push(iso)
    }
    expect(without).toEqual([])
  })
})
