import type { FlowSection, LocalizedText } from '@ember/content-engine'

/**
 * Assemble the Extraordinary Form (1962 Missal) Mass flow, in code.
 *
 * The EF analog of `buildMassFlow`: the view switch (Full Mass / Propers Only /
 * Readings Only) and the Order-of-Mass section sequence — which used to live as
 * the `ef-form-body` + `ef-extraordinary-*-view` assembly fragments — are
 * decided here, leaving the practice a thin `{ include: producer/mass,
 * params: { form: 'ef' } }`. The liturgical *text* stays declarative: the
 * builder `call`s the existing `ef-*` content fragments (kyrie, gloria, canon,
 * …, served via mass-fragments.json), and the day's propers stay `proper` slots
 * resolved against Divinum Officium at render. Unlike OF there's no day object —
 * EF is slot-centric, each proper loaded independently from its own file.
 */
export function buildEFFlow(): FlowSection[] {
  return [
    {
      type: 'select',
      as: 'efView',
      label: { 'en-US': 'View', 'pt-BR': 'Visualização' },
      default: 'extraordinary',
      options: [
        {
          id: 'extraordinary',
          label: { 'en-US': 'Full Mass', 'pt-BR': 'Missa Completa' },
          sections: fullMassFragments.map(call),
        },
        {
          id: 'extraordinary-propers',
          label: { 'en-US': 'Propers Only', 'pt-BR': 'Próprios' },
          sections: slotSections(properSlots),
        },
        {
          id: 'extraordinary-readings',
          label: { 'en-US': 'Readings Only', 'pt-BR': 'Leituras' },
          sections: slotSections(readingSlots),
        },
      ],
    },
  ]
}

// The Order of Mass, in sequence — `call`s into the `ef-*` content fragments.
const fullMassFragments = [
  'ef-asperges',
  'ef-prayers-at-the-foot-of-the-altar',
  'ef-kyrie',
  'ef-gloria',
  'ef-liturgy-of-the-word',
  'ef-credo',
  'ef-offertory',
  'ef-preface',
  'ef-canon-of-the-mass',
  'ef-communion-rite',
  'ef-dismissal',
  'ef-last-gospel',
  'ef-leonine-prayers',
]

type ProperSlot = { slot: string; heading: LocalizedText; description: LocalizedText }

// The day's propers, in liturgical order, each a heading + `proper` slot.
const properSlots: ProperSlot[] = [
  {
    slot: 'introit',
    heading: { 'en-US': 'Introit', 'pt-BR': 'Intróito' },
    description: { 'en-US': 'Introit of the day', 'pt-BR': 'Intróito do dia' },
  },
  {
    slot: 'collect',
    heading: { 'en-US': 'Collect', 'pt-BR': 'Oração Coleta' },
    description: { 'en-US': 'Collect of the day', 'pt-BR': 'Oração Coleta do dia' },
  },
  {
    slot: 'epistle',
    heading: { 'en-US': 'Epistle', 'pt-BR': 'Epístola' },
    description: { 'en-US': 'Epistle of the day', 'pt-BR': 'Epístola do dia' },
  },
  {
    slot: 'gradual',
    heading: { 'en-US': 'Gradual', 'pt-BR': 'Gradual' },
    description: {
      'en-US': 'Gradual / Alleluia / Tract of the day',
      'pt-BR': 'Gradual / Aleluia / Trato do dia',
    },
  },
  {
    slot: 'gospel',
    heading: { 'en-US': 'Gospel', 'pt-BR': 'Evangelho' },
    description: { 'en-US': 'Gospel of the day', 'pt-BR': 'Evangelho do dia' },
  },
  {
    slot: 'offertory',
    heading: { 'en-US': 'Offertory', 'pt-BR': 'Ofertório' },
    description: {
      'en-US': 'Offertory verse of the day',
      'pt-BR': 'Versículo do Ofertório do dia',
    },
  },
  {
    slot: 'secret',
    heading: { 'en-US': 'Secret', 'pt-BR': 'Secreta' },
    description: { 'en-US': 'Secret of the day', 'pt-BR': 'Secreta do dia' },
  },
  {
    slot: 'preface',
    heading: { 'en-US': 'Preface', 'pt-BR': 'Prefácio' },
    description: { 'en-US': 'Preface of the day', 'pt-BR': 'Prefácio do dia' },
  },
  {
    slot: 'communion',
    heading: { 'en-US': 'Communion', 'pt-BR': 'Comunhão' },
    description: {
      'en-US': 'Communion antiphon of the day',
      'pt-BR': 'Antífona de Comunhão do dia',
    },
  },
  {
    slot: 'postcommunion',
    heading: { 'en-US': 'Postcommunion', 'pt-BR': 'Pós-Comunhão' },
    description: {
      'en-US': 'Postcommunion prayer of the day',
      'pt-BR': 'Oração pós-Comunhão do dia',
    },
  },
]

const readingSlots: ProperSlot[] = properSlots.filter((s) =>
  ['epistle', 'gradual', 'gospel'].includes(s.slot),
)

// Heading + proper per slot, dividers between groups (none trailing).
function slotSections(slots: ProperSlot[]): FlowSection[] {
  return slots.flatMap((s, i) => [
    ...(i > 0 ? [{ type: 'divider' } as FlowSection] : []),
    { type: 'heading', text: s.heading },
    { type: 'proper', slot: s.slot, form: 'ef', description: s.description },
  ])
}

function call(ref: string): FlowSection {
  return { type: 'call', ref }
}
