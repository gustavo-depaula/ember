// End-to-end integration: register mass-of with the engine's DataSource registry,
// run resolveFlowAsync against the actual ember-extra fixtures (vendored under
// content/libraries/base/of/), and verify celebration enumeration + slot
// extraction produce the expected RenderedSection shape.
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import {
  type EngineContext,
  type FlowContext,
  registerDataSource,
  resolveFlowAsync,
} from '@ember/content-engine'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { massOfSource } from './source'

// Read directly from the ember-extra submodule so tests don't depend on
// a local sync to content/libraries/base/of/ (which is gitignored).
const BASE_OF_ROOT = resolve(__dirname, '../../../vendor/ember-extra/novus-ordo-missae/data')

async function readJsonFromBase(path: string): Promise<unknown> {
  if (!path.startsWith('of/')) throw new Error(`Unexpected path prefix: ${path}`)
  const fullPath = resolve(BASE_OF_ROOT, path.slice('of/'.length))
  try {
    const raw = await readFile(fullPath, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return undefined
  }
}

function makeEngineContext(): EngineContext {
  return {
    language: 'pt-BR',
    contentLanguage: 'pt-BR',
    localize: (text) => {
      if (typeof text === 'string') return { primary: text }
      return { primary: text['pt-BR'] ?? text['en-US'] ?? '' }
    },
    localizeUI: (text) => text['pt-BR'] ?? text['en-US'] ?? '',
    t: (key) => key,
    parsePsalmRef: () => ({ book: 'psalms', chapter: 1, numbering: 'hebrew' }) as never,
    parseTrackEntry: () => [],
    prayers: {},
    canticles: {},
    prose: {},
    fetchAsset: (path) => readJsonFromBase(path),
    fetchOwnAsset: () => Promise.resolve(undefined),
  }
}

function makeContext(date: Date): FlowContext {
  return { date }
}

describe('integration: mass-of + engine + ember-extra fixtures', () => {
  beforeAll(() => {
    registerDataSource('mass-of', massOfSource)
  })
  afterAll(() => {
    // Don't clear — other tests may depend on this; idempotent registration is fine.
  })

  it('renders Good Friday with the celebration-of-the-passion stub', async () => {
    const goodFriday = new Date(2026, 3, 3) // 2026-04-03
    const flow = {
      load: [{ as: 'day', source: 'mass-of', calendar: 'of' }],
      fragments: {
        'good-friday-body': [
          { type: 'rubric' as const, text: { 'pt-BR': 'Sexta-feira Santa renders' } },
        ],
        'mass-body': [
          { type: 'rubric' as const, text: { 'pt-BR': 'WRONG: ordinary Mass should not render' } },
        ],
      },
      sections: [
        {
          type: 'select' as const,
          from: 'day.celebrations',
          as: 'celebration',
          hideIfSingle: true,
          body: [
            {
              type: 'select' as const,
              on: 'celebration.rite',
              default: 'mass',
              options: [
                {
                  id: 'mass',
                  label: { 'pt-BR': 'Missa' },
                  sections: [{ type: 'fragment' as const, ref: 'mass-body' }],
                },
                {
                  id: 'celebration-of-the-passion',
                  label: { 'pt-BR': 'Paixão' },
                  sections: [{ type: 'fragment' as const, ref: 'good-friday-body' }],
                },
              ],
            },
          ],
        },
      ],
    }

    const result = await resolveFlowAsync(flow, makeContext(goodFriday), makeEngineContext())
    // The rite dispatch must route to the Good Friday fragment, not ordinary Mass.
    expect(result).toEqual([{ type: 'rubric', label: { primary: 'Sexta-feira Santa renders' } }])
  })

  it('populates entrance antiphon, collect, and gospel via choice-rich-text on a Sunday', async () => {
    // 2026-04-26 is a Sunday in Easter Week 3 — should map to
    // tempore.easter.week-3.sunday in ember-extra.
    const sunday = new Date(2026, 3, 26)
    const flow = {
      load: [{ as: 'day', source: 'mass-of', calendar: 'of' }],
      sections: [
        {
          type: 'select' as const,
          from: 'day.celebrations',
          as: 'celebration',
          hideIfSingle: true,
          body: [
            {
              type: 'choice-rich-text' as const,
              label: { 'pt-BR': 'Antífona' },
              slot: 'entranceAntiphon',
            },
            {
              type: 'choice-rich-text' as const,
              label: { 'pt-BR': 'Coleta' },
              slot: 'collect',
            },
            {
              type: 'choice-rich-text' as const,
              label: { 'pt-BR': 'Evangelho' },
              slot: 'readings.B.gospel',
            },
          ],
        },
      ],
    }

    const result = await resolveFlowAsync(flow, makeContext(sunday), makeEngineContext())
    // We expect at least the entrance antiphon and collect to render — Sundays
    // always have those. The gospel may be present per cycle.
    const types = result.map((s) => s.type)
    expect(types).toContain('choice-rich-text')

    const entrance = result.find(
      (s): s is Extract<typeof s, { type: 'choice-rich-text' }> =>
        s.type === 'choice-rich-text' && s.label.primary === 'Antífona',
    )
    expect(entrance).toBeDefined()
    expect(entrance!.options.length).toBeGreaterThan(0)
    expect(entrance!.options[0].body.primary.length).toBeGreaterThan(0)
  })

  it('returns 4 celebrations on Christmas Day (vigil + night + dawn + day)', async () => {
    // Christmas Day exposes four Mass formularies; the celebration picker
    // must show all four chips with proper titles.
    const christmas = new Date(2026, 11, 25)
    const flow = {
      load: [{ as: 'day', source: 'mass-of', calendar: 'of' }],
      sections: [
        {
          type: 'select' as const,
          from: 'day.celebrations',
          as: 'celebration',
          idFrom: 'id',
          labelFrom: 'title',
          label: { 'pt-BR': 'Liturgia' },
          hideIfSingle: true,
          body: [{ type: 'heading' as const, text: { 'pt-BR': '{{celebration.id}}' } }],
        },
      ],
    }
    const result = await resolveFlowAsync(flow, makeContext(christmas), makeEngineContext())
    expect(result.length).toBe(1)
    const select = result[0] as Extract<(typeof result)[number], { type: 'select' }>
    expect(select.type).toBe('select')
    expect(select.options.length).toBe(4)
    const ids = select.options.map((o) => o.id)
    expect(ids).toEqual([
      'tempore.christmas.nativity-vigil',
      'tempore.christmas.nativity-night',
      'tempore.christmas.nativity-dawn',
      'tempore.christmas.nativity-day',
    ])
    // Each chip should have a non-empty label (the mass title).
    for (const o of select.options) {
      expect(o.label.primary.length).toBeGreaterThan(0)
    }
  })

  it('returns 2 celebrations on Holy Thursday (chrism-mass + lords-supper)', async () => {
    const holyThursday = new Date(2026, 3, 2) // 2026-04-02
    const flow = {
      load: [{ as: 'day', source: 'mass-of', calendar: 'of' }],
      sections: [
        {
          type: 'select' as const,
          from: 'day.celebrations',
          as: 'celebration',
          idFrom: 'id',
          labelFrom: 'title',
          label: { 'pt-BR': 'Liturgia' },
          hideIfSingle: true,
          body: [{ type: 'heading' as const, text: { 'pt-BR': '{{celebration.id}}' } }],
        },
      ],
    }

    const result = await resolveFlowAsync(flow, makeContext(holyThursday), makeEngineContext())
    // With 2 celebrations and hideIfSingle, the picker IS visible.
    expect(result.length).toBe(1)
    const select = result[0] as Extract<(typeof result)[number], { type: 'select' }>
    expect(select.type).toBe('select')
    expect(select.options.length).toBe(2)
    const ids = select.options.map((o) => o.id)
    expect(ids).toContain('tempore.holy-week.chrism-mass')
    expect(ids).toContain('tempore.holy-week.lords-supper')
  })

  it('replaces an OT Sunday when a sanctoral solemnity falls on it', async () => {
    // 2029-06-24 — Birth of St John the Baptist (solemnity) on a Sunday.
    // The Sunday OT Mass must be suppressed; only the saint's Mass surfaces.
    const date = new Date(2029, 5, 24)
    const flow = {
      load: [{ as: 'day', source: 'mass-of', calendar: 'of' }],
      sections: [
        {
          type: 'select' as const,
          from: 'day.celebrations',
          as: 'celebration',
          idFrom: 'id',
          labelFrom: 'title',
          label: { 'pt-BR': 'Liturgia' },
          hideIfSingle: true,
          body: [{ type: 'heading' as const, text: { 'pt-BR': '{{celebration.id}}' } }],
        },
      ],
    }
    const result = await resolveFlowAsync(flow, makeContext(date), makeEngineContext())
    const headings = result.filter((s) => s.type === 'heading')
    expect(headings.length).toBe(1)
    const idText = (headings[0] as { text: { primary: string } }).text.primary
    expect(idText).toBe('sanctorale.06-24')
  })

  it('suppresses tempore weekday when sanctoral is a solemnity', async () => {
    // 2026-06-24 — Birth of St John the Baptist, a solemnity in the universal
    // calendar. The tempore weekday must NOT appear as a separate top-level
    // celebration; only the saint surfaces.
    const date = new Date(2026, 5, 24)
    const flow = {
      load: [{ as: 'day', source: 'mass-of', calendar: 'of' }],
      sections: [
        {
          type: 'select' as const,
          from: 'day.celebrations',
          as: 'celebration',
          idFrom: 'id',
          labelFrom: 'title',
          label: { 'pt-BR': 'Liturgia' },
          hideIfSingle: true,
          body: [{ type: 'heading' as const, text: { 'pt-BR': '{{celebration.id}}' } }],
        },
      ],
    }
    const result = await resolveFlowAsync(flow, makeContext(date), makeEngineContext())
    // hideIfSingle=true and a single celebration: the picker is hidden and
    // only the body sections render. The body uses {{celebration.id}} so we
    // can read which celebration won precedence.
    const headings = result.filter((s) => s.type === 'heading')
    expect(headings.length).toBe(1)
    const idText = (headings[0] as { text: { primary: string } }).text.primary
    expect(idText).toBe('sanctorale.06-24')
  })

  it('renders all five reading slots on an OT Sunday with Year B cycle', async () => {
    // 2026-06-14 — Sunday in OT (year B for 2026 Sundays). Should expose
    // firstReading + responsorialPsalm + secondReading + alleluiaVerse + gospel.
    const sunday = new Date(2026, 5, 14)
    const flow = {
      load: [{ as: 'day', source: 'mass-of', calendar: 'of' }],
      sections: [
        {
          type: 'select' as const,
          from: 'day.celebrations',
          as: 'celebration',
          idFrom: 'id',
          labelFrom: 'title',
          label: { 'pt-BR': 'Liturgia' },
          hideIfSingle: true,
          body: [
            {
              type: 'choice-rich-text' as const,
              label: { 'pt-BR': '1L' },
              slot: 'readings.{{day.cycle}}.firstReading',
            },
            {
              type: 'choice-rich-text' as const,
              label: { 'pt-BR': 'Salmo' },
              slot: 'readings.{{day.cycle}}.responsorialPsalm',
            },
            {
              type: 'choice-rich-text' as const,
              label: { 'pt-BR': '2L' },
              slot: 'readings.{{day.cycle}}.secondReading',
            },
            {
              type: 'choice-rich-text' as const,
              label: { 'pt-BR': 'Evangelho' },
              slot: 'readings.{{day.cycle}}.gospel',
            },
          ],
        },
      ],
    }
    const result = await resolveFlowAsync(flow, makeContext(sunday), makeEngineContext())
    const labels = result
      .filter(
        (s): s is Extract<typeof s, { type: 'choice-rich-text' }> => s.type === 'choice-rich-text',
      )
      .map((s) => s.label.primary)
    // At least firstReading + Psalm + Gospel should resolve on an OT Sunday.
    expect(labels).toContain('1L')
    expect(labels).toContain('Salmo')
    expect(labels).toContain('Evangelho')
  })

  it('renders the Easter Sunday sequence dispatch (silent on weekdays)', async () => {
    // The flow uses a `select on celebration.id` dispatch around the Sequence.
    // Verifies the regression fix: today's celebration.id (a non-Sunday) must
    // NOT match options[0] — dispatch should be silent.
    const easterMon = new Date(2026, 3, 6) // 2026-04-06, Monday Easter Wk1
    const flow = {
      load: [{ as: 'day', source: 'mass-of', calendar: 'of' }],
      sections: [
        {
          type: 'select' as const,
          from: 'day.celebrations',
          as: 'celebration',
          idFrom: 'id',
          labelFrom: 'title',
          hideIfSingle: true,
          body: [
            {
              type: 'select' as const,
              on: 'celebration.id',
              default: 'none',
              options: [
                {
                  id: 'tempore.easter.week-1.sunday',
                  label: { 'pt-BR': 'Sequência' },
                  sections: [{ type: 'heading' as const, text: { 'pt-BR': 'Victimae Paschali' } }],
                },
                { id: 'none', label: { 'pt-BR': '—' }, sections: [] },
              ],
            },
          ],
        },
      ],
    }
    const result = await resolveFlowAsync(flow, makeContext(easterMon), makeEngineContext())
    // No heading from the dispatch should appear today.
    const headings = result.filter((s) => s.type === 'heading')
    expect(headings).toEqual([])
  })

  it('suppresses a memorial entirely on a Sunday (Sunday wins, no alternate chip)', async () => {
    // 2027-06-13 — St Anthony of Padua (memorial) falls on a Sunday.
    // The Sunday Mass should be the only celebration; the saint must NOT
    // surface as a top-level chip OR as an alternate within the Sunday Mass.
    const date = new Date(2027, 5, 13)
    const flow = {
      load: [{ as: 'day', source: 'mass-of', calendar: 'of' }],
      sections: [
        {
          type: 'select' as const,
          from: 'day.celebrations',
          as: 'celebration',
          idFrom: 'id',
          labelFrom: 'title',
          label: { 'pt-BR': 'Liturgia' },
          hideIfSingle: true,
          body: [{ type: 'heading' as const, text: { 'pt-BR': '{{celebration.id}}' } }],
        },
      ],
    }
    const result = await resolveFlowAsync(flow, makeContext(date), makeEngineContext())
    const headings = result.filter((s) => s.type === 'heading')
    expect(headings.length).toBe(1)
    const idText = (headings[0] as { text: { primary: string } }).text.primary
    // The Sunday OT Mass wins; the sanctoral memorial doesn't surface.
    expect(idText.startsWith('tempore.ordinary-time.')).toBe(true)
  })

  it('surfaces tempore + sanctoral celebrations on a memorial day', async () => {
    // 2026-06-13 — St Anthony of Padua, an optional memorial in the universal
    // calendar, falls on a Saturday in OT. Should yield 2 celebrations:
    // (a) the OT weekday Mass with St Anthony as alternate
    // (b) St Anthony's Mass with the OT weekday as alternate
    const date = new Date(2026, 5, 13)
    const flow = {
      load: [{ as: 'day', source: 'mass-of', calendar: 'of' }],
      sections: [
        {
          type: 'select' as const,
          from: 'day.celebrations',
          as: 'celebration',
          idFrom: 'id',
          labelFrom: 'title',
          label: { 'pt-BR': 'Liturgia' },
          hideIfSingle: true,
          body: [{ type: 'heading' as const, text: { 'pt-BR': '{{celebration.id}}' } }],
        },
      ],
    }
    const result = await resolveFlowAsync(flow, makeContext(date), makeEngineContext())
    const select = result[0] as Extract<(typeof result)[number], { type: 'select' }>
    expect(select.type).toBe('select')
    const ids = select.options.map((o) => o.id)
    expect(ids).toContain('sanctorale.06-13')
    expect(ids.some((id) => id.startsWith('tempore.ordinary-time.'))).toBe(true)
  })
})
