import type {
  MassFormulary,
  OrderItem,
  OrderOfMass,
  OrderSegment,
  Prayer,
} from '@ember/missal-schema'
import type { ContainerOption, Primitive } from '@/content/primitives'
import { eucharisticPrayerPicker, prefacePicker } from '../blocks/eucharist'
import { cycleKeyFor, renderReadingSet } from '../blocks/readings'
import {
  bt,
  collapsible,
  group,
  heading,
  type LangPrefs,
  lines,
  prayerPicker,
  responseRichText,
  rubric,
  sectionMarker,
} from '../helpers'
import { amen } from '../responses'
import { activeSpine, type ProperSlot, type SpineCtx, type SpineStep } from '../spine'

/** Orations the people seal with "Amém" — antiphons don't get one. */
const orationSlots = new Set<ProperSlot>([
  'collect',
  'prayerOverOfferings',
  'postcommunion',
  'prayerOverPeople',
])

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

const properLabels: Record<ProperSlot, { pt: string; en: string; key: string }> = {
  entranceAntiphon: { pt: 'Antífona da Entrada', en: 'Entrance Antiphon', key: 'of.entrance' },
  collect: { pt: 'Oração do Dia', en: 'Collect', key: 'of.collect' },
  prayerOverOfferings: {
    pt: 'Oração sobre as Oferendas',
    en: 'Prayer over the Offerings',
    key: 'of.offerings',
  },
  communionAntiphon: { pt: 'Antífona da Comunhão', en: 'Communion Antiphon', key: 'of.communion' },
  postcommunion: {
    pt: 'Oração depois da Comunhão',
    en: 'Prayer after Communion',
    key: 'of.postcommunion',
  },
  prayerOverPeople: {
    pt: 'Oração sobre o Povo',
    en: 'Prayer over the People',
    key: 'of.over-people',
  },
}

/** Render a run of order segments. `key` namespaces nested-picker overrideKeys
 * so a choice inside a choice (Penitential Act form → invitation) doesn't
 * collide with its parent. */
function renderSegments(segments: OrderSegment[], lang: LangPrefs, key: string): Primitive[] {
  return segments.flatMap((seg, i) =>
    seg.kind === 'text' ? lines(seg.body, lang) : renderChoice(seg, lang, `${key}.c${i}`),
  )
}

/**
 * A pick-one set → a chip selector showing one option at a time, so the prayer
 * never faces every alternative at once. Options empty in the active language
 * are dropped (the alternates are language-uneven — pt/it carry national
 * additions the editio typica lacks); a lone survivor renders inline, with no
 * pointless one-chip picker.
 */
function renderChoice(
  choice: Extract<OrderSegment, { kind: 'choice' }>,
  lang: LangPrefs,
  key: string,
): Primitive[] {
  const options = choice.options
    .map(
      (opt, i): ContainerOption => ({
        id: `opt-${i}`,
        label: bt(opt.label, lang) ?? { primary: '' },
        children: renderSegments(opt.segments, lang, `${key}.${i}`),
      }),
    )
    .filter((o) => o.children.length > 0)
  if (options.length === 0) return []
  if (options.length === 1) return options[0].children
  return [
    {
      type: 'container',
      behavior: {
        kind: 'select',
        label: bt(choice.label, lang) ?? { primary: '' },
        overrideKey: `of.${key}`,
        selectedId: options[0].id,
        options,
      },
    },
  ]
}

/** Render one Order-of-Mass piece. Pieces with `segments` weave fixed text and
 * (possibly nested) pick-one choices; the rest render as flat body text.
 * Collapsed when the piece is silent/long. */
function renderOrderItem(item: OrderItem, collapsed: boolean, lang: LangPrefs): Primitive[] {
  const title = bt(item.title, lang)
  const id = item.id.replace(/^order\./, '')
  const body = item.segments ? renderSegments(item.segments, lang, id) : lines(item.body, lang)
  if (body.length === 0) return []
  if (collapsed && title) return [collapsible(title, body)]
  return title ? [heading(title), ...body] : body
}

function properOf(ctx: MassContext, slot: ProperSlot): Prayer | undefined {
  // Antiphons + prayerOverPeople live on the celebration; orations may inherit.
  if (slot === 'entranceAntiphon' || slot === 'communionAntiphon' || slot === 'prayerOverPeople') {
    return ctx.formulary[slot]
  }
  return ctx.orations[slot]
}

function renderStep(step: SpineStep, ctx: MassContext): Primitive[] {
  const { lang, order } = ctx
  switch (step.kind) {
    case 'section':
      return [sectionMarker(step.pt, step.en)]
    case 'rubric':
      return [rubric(L(step.pt, step.en, lang))]
    case 'order': {
      const item = order.items[step.id]
      return item ? renderOrderItem(item, Boolean(step.collapsed), lang) : []
    }
    case 'proper': {
      const prayer = properOf(ctx, step.slot)
      if (!prayer) return []
      const l = properLabels[step.slot]
      return [
        prayerPicker({
          overrideKey: l.key,
          label: L(l.pt, l.en, lang),
          prayer,
          lang,
          pickerStyle: step.cards ? 'cards' : undefined,
          response: orationSlots.has(step.slot) ? responseRichText(amen, lang) : undefined,
        }),
      ]
    }
    case 'readings': {
      const ck = cycleKeyFor(ctx.readingsFormulary, ctx.cycle, ctx.weekdayCycle)
      const set = ck ? ctx.readingsFormulary.readings?.[ck] : undefined
      return set
        ? renderReadingSet(set, lang)
        : [
            rubric(
              L(
                'As leituras do dia são as da féria.',
                'The day’s readings are the ferial readings.',
                lang,
              ),
            ),
          ]
    }
    case 'preface': {
      const p = prefacePicker(ctx.formulary, lang)
      return p ? [p] : []
    }
    case 'eucharistic-prayer':
      return [eucharisticPrayerPicker(order, lang)]
  }
}

function fullMass(ctx: MassContext): Primitive[] {
  const spineCtx: SpineCtx = {
    formulary: ctx.formulary,
    orations: ctx.orations,
    season: ctx.formulary.season,
    rank: ctx.formulary.rank,
    hasOrder: (id) => Boolean(ctx.order.items[id]),
  }
  return activeSpine(spineCtx).flatMap((step) => renderStep(step, ctx))
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
