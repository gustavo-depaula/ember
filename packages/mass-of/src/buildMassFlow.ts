import type { FlowSection, LocalizedText } from '@ember/content-engine'
import type { DayLiturgies } from './types'

/**
 * Assemble the OF Mass flow for a day, in code.
 *
 * This is the "complexity" that used to live as nested selects + 32 fragments in
 * `content/practices/mass/flow.json`: the celebration enumeration, the rite
 * dispatch, and (incrementally) the Order of Mass + seasonal branching are
 * decided here, leaving the practice a thin `{ include: producer/mass }`. The
 * liturgical *text* stays declarative — the emitted slots resolve against the
 * day's formularies at render time.
 *
 * The host (app) loads the day via the `mass-of` DataSource, calls this builder,
 * and resolves the returned sections through the engine. The sections still bind
 * to `day` / `celebration` in the flow context (populated by the `load` step),
 * so the celebration picker and proper slots stay data-driven and interactive.
 *
 * First slice: celebration picker + the day's propers (entrance, collect,
 * gospel). The full Order of Mass and the special rites follow.
 */
export function buildMassFlow(day: DayLiturgies): FlowSection[] {
  return [
    {
      type: 'select',
      from: 'day.celebrations',
      as: 'celebration',
      idFrom: 'id',
      labelFrom: 'title',
      label: { 'en-US': "Today's Liturgy", 'pt-BR': 'Liturgia de Hoje' },
      hideIfSingle: true,
      body: [
        {
          type: 'liturgical-color-scope',
          from: 'celebration.primary.liturgicalColor',
          sections: [
            { type: 'celebration-banner', from: 'celebration.primary', cycleFrom: 'day.cycle' },
            ...celebrationBody(day),
          ],
        },
      ],
    },
  ]
}

function celebrationBody(day: DayLiturgies): FlowSection[] {
  // The rite is uniform across a day's celebrations — multi-celebration days are
  // all `mass`, and the special rites (Easter Vigil, Good Friday, …) are
  // single-celebration — so decide it once, in code, instead of a render-time
  // `select on celebration.rite`.
  const rite = day.celebrations[0]?.rite ?? 'mass'
  if (rite !== 'mass') return [] // special rites assembled in a later slice
  return [
    properSlot('entranceAntiphon', {
      'en-US': 'Entrance Antiphon',
      'pt-BR': 'Antífona de Entrada',
    }),
    properSlot('collect', { 'en-US': 'Collect', 'pt-BR': 'Oração do Dia' }),
    properSlot('readings.{{day.cycle}}.gospel', { 'en-US': 'Gospel', 'pt-BR': 'Evangelho' }),
  ]
}

function properSlot(slot: string, label: LocalizedText): FlowSection {
  return { type: 'choice-rich-text', slot, label }
}
