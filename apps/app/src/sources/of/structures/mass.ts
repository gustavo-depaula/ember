import type { MassFormulary, OrderOfMass } from '@ember/missal-schema'
import type { Primitive } from '@/content/primitives'
import { eucharisticPrayerPicker, prefacePicker } from '../blocks/eucharist'
import { cycleKeyFor, renderReadingSet } from '../blocks/readings'
import {
  bt,
  collapsible,
  group,
  type LangPrefs,
  lines,
  prayerPicker,
  rubric,
  sectionMarker,
} from '../helpers'

export interface MassContext {
  /** The celebration's own formulary. */
  formulary: MassFormulary
  /** The formulary supplying orations (== formulary unless it inherits). */
  orations: MassFormulary
  /** The formulary supplying readings (the temporal sibling on memorial days). */
  readingsFormulary: MassFormulary
  order: OrderOfMass
  cycle: 'A' | 'B' | 'C'
  weekdayCycle: 'I' | 'II'
  lang: LangPrefs
}

const L = (pt: string, en: string, lang: LangPrefs) =>
  bt({ 'pt-BR': pt, 'en-US': en }, lang) ?? { primary: pt }

function fullMass(ctx: MassContext): Primitive[] {
  const { formulary: f, orations, readingsFormulary, order, lang } = ctx
  const out: Primitive[] = []

  out.push(sectionMarker('Ritos Iniciais', 'Introductory Rites'))
  if (f.entranceAntiphon)
    out.push(
      prayerPicker({
        overrideKey: 'of.entrance',
        label: L('Antífona da Entrada', 'Entrance Antiphon', lang),
        prayer: f.entranceAntiphon,
        lang,
        pickerStyle: 'cards',
      }),
    )
  // The fixed Order frame (greeting, penitential act, Gloria, Creed) as reference.
  if (order.items['order.ordinary-frame']) {
    out.push(
      collapsible(
        L('Ordinário da Missa', 'Order of Mass', lang),
        lines(order.items['order.ordinary-frame'].body, lang),
      ),
    )
  }
  if (orations.collect)
    out.push(
      prayerPicker({
        overrideKey: 'of.collect',
        label: L('Oração do Dia', 'Collect', lang),
        prayer: orations.collect,
        lang,
      }),
    )

  out.push(sectionMarker('Liturgia da Palavra', 'Liturgy of the Word'))
  const ck = cycleKeyFor(readingsFormulary, ctx.cycle, ctx.weekdayCycle)
  const set = ck ? readingsFormulary.readings?.[ck] : undefined
  if (set) out.push(...renderReadingSet(set, lang))
  else
    out.push(
      rubric(
        L(
          'As leituras do dia são as da féria.',
          'The day’s readings are the ferial readings.',
          lang,
        ),
      ),
    )

  out.push(sectionMarker('Liturgia Eucarística', 'Liturgy of the Eucharist'))
  if (orations.prayerOverOfferings)
    out.push(
      prayerPicker({
        overrideKey: 'of.offerings',
        label: L('Oração sobre as Oferendas', 'Prayer over the Offerings', lang),
        prayer: orations.prayerOverOfferings,
        lang,
      }),
    )
  out.push(
    rubric(
      L(
        'Em pé, inicia-se o diálogo do Prefácio, que pertence à Oração Eucarística escolhida abaixo.',
        'All stand for the Preface dialogue, which belongs to the chosen Eucharistic Prayer.',
        lang,
      ),
    ),
  )
  const preface = prefacePicker(f, lang)
  if (preface) out.push(preface)
  out.push(eucharisticPrayerPicker(order, lang))

  out.push(sectionMarker('Rito da Comunhão', 'Communion Rite'))
  if (f.communionAntiphon)
    out.push(
      prayerPicker({
        overrideKey: 'of.communion',
        label: L('Antífona da Comunhão', 'Communion Antiphon', lang),
        prayer: f.communionAntiphon,
        lang,
        pickerStyle: 'cards',
      }),
    )

  out.push(sectionMarker('Ritos Finais', 'Concluding Rites'))
  if (orations.postcommunion)
    out.push(
      prayerPicker({
        overrideKey: 'of.postcommunion',
        label: L('Oração depois da Comunhão', 'Prayer after Communion', lang),
        prayer: orations.postcommunion,
        lang,
      }),
    )
  if (f.prayerOverPeople)
    out.push(
      prayerPicker({
        overrideKey: 'of.over-people',
        label: L('Oração sobre o Povo', 'Prayer over the People', lang),
        prayer: f.prayerOverPeople,
        lang,
      }),
    )
  if (order.solemnBlessings[0])
    out.push(
      collapsible(
        L('Bênção Solene', 'Solemn Blessing', lang),
        lines(order.solemnBlessings[0].body, lang),
      ),
    )

  return out
}

function readingsOnly(ctx: MassContext): Primitive[] {
  const ck = cycleKeyFor(ctx.readingsFormulary, ctx.cycle, ctx.weekdayCycle)
  const set = ck ? ctx.readingsFormulary.readings?.[ck] : undefined
  return set ? renderReadingSet(set, ctx.lang) : []
}

/** A regular Mass with a Full / Readings-only view switcher. */
export function renderMass(ctx: MassContext): Primitive[] {
  const { lang } = ctx
  return [
    {
      type: 'container',
      behavior: {
        kind: 'select',
        label: L('Visualização', 'View', lang),
        overrideKey: 'of.view',
        selectedId: 'full',
        options: [
          {
            id: 'full',
            label: L('Missa Completa', 'Full Mass', lang),
            children: group(fullMass(ctx)).children ?? [],
          },
          {
            id: 'readings',
            label: L('Leituras', 'Readings', lang),
            children: group(readingsOnly(ctx)).children ?? [],
          },
        ],
      },
    },
  ]
}
