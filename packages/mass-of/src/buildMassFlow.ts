import type { FlowSection } from '@ember/content-engine'
import type { DayLiturgies } from './types'

/**
 * Assemble the OF Mass flow for a day, in code.
 *
 * This is the "complexity" that used to live as nested selects + 32 fragments in
 * `content/practices/mass/flow.json`: the celebration enumeration, the rite
 * dispatch (`select on celebration.rite`), and the seasonal-blessing choice
 * (`select on celebration.primary.season`) are decided HERE, in code, leaving
 * the practice a thin `{ include: producer/mass }`. The liturgical *text* stays
 * declarative — the builder emits `call`s to the existing content fragments and
 * `choice-rich-text` slots that resolve against the day's formularies at render
 * time.
 *
 * The host (app) loads the day via the `mass-of` DataSource, calls this builder,
 * and resolves the returned sections (plus the content fragments) through the
 * engine. The celebration picker and proper slots stay data-driven; with the
 * engine now materializing every branch + client-side tab switching, the picker
 * is interactive even though the producer is cached.
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

// Special rites map to their own body fragment; everything else is the Mass.
const riteBodyFragment: Record<string, string> = {
  'easter-vigil': 'of-easter-vigil-rite-body',
  'celebration-of-the-passion': 'of-celebration-of-the-passion-rite-body',
  'lords-supper': 'of-lords-supper-rite-body',
  'chrism-mass': 'of-chrism-mass-rite-body',
  'mass-with-procession': 'of-mass-with-procession-rite-body',
}

function celebrationBody(day: DayLiturgies): FlowSection[] {
  // The rite is uniform across a day's celebrations — multi-celebration days are
  // all `mass`, and the special rites are single-celebration — so dispatch once,
  // in code, instead of a render-time `select on celebration.rite`.
  const rite = day.celebrations[0]?.rite ?? 'mass'
  const special = riteBodyFragment[rite]
  if (special) return [call(special)]

  // The Ordinary Form Mass: the Order of Mass as content fragments, with the
  // seasonal blessing chosen here rather than via a 6-way select.
  return [
    call('of-introductory-rites'),
    call('of-liturgy-of-the-word'),
    call('of-liturgy-of-the-eucharist'),
    call('of-communion-rite'),
    call('of-concluding-frame'),
    call(blessingFragment(day)),
    call('of-dismissal'),
  ]
}

const blessingSeasons = new Set(['advent', 'christmas', 'lent', 'easter', 'ordinary-time'])

/** The season blessing, computed from the day — replaces the 6-way season select. */
function blessingFragment(day: DayLiturgies): string {
  const season = (day.celebrations[0]?.primary as { season?: string } | undefined)?.season
  return `of-blessing-${season && blessingSeasons.has(season) ? season : 'default'}`
}

function call(ref: string): FlowSection {
  return { type: 'call', ref }
}
