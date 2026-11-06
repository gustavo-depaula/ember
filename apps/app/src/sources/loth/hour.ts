// One hour of the Liturgy of the Hours for a date, from the corpus.

import {
  assembleHour,
  type Form,
  formsOf,
  type Hour,
  type InvitatoryPsalm,
  isCommemoration,
  isVerified,
  type LothSource,
  type Office,
  officeOf,
} from '@ember/loth'
import type { ContainerOption, Primitive } from '@/content/primitives'
import {
  baseOf,
  type FormSlots,
  type LatinBundle,
  type LatinSection,
  latinSection,
  markMissing,
  missing,
  oneLatinEach,
  pairHymn,
  pairInvitatory,
  pairPart,
  type SlotPrimitives,
} from './pair'
import { type RenderContext, renderParts, renderSlots } from './render'

// The Latin of the corpus's parts, by bundle (`content/loth/latin/`).
export type LatinSource = (bundle: string) => Promise<LatinBundle | undefined>

async function latinOfPart(
  ref: string | undefined,
  latin: LatinSource,
): Promise<LatinSection | undefined> {
  if (!ref) return undefined
  const dot = ref.lastIndexOf('.')
  const stored = (await latin(ref.slice(0, dot)))?.parts[Number(ref.slice(dot + 1))]
  return stored ? latinSection(stored) : undefined
}

/** A part with its Latin beside it, or marked as having none where it would. */
async function withItsLatin(part: SlotPrimitives, latin: LatinSource): Promise<SlotPrimitives> {
  const choice = part.primitives.find(
    (p) => p.type === 'container' && p.behavior.kind === 'options',
  )
  // A hymn left to choice: each beside the Latin hymn it renders, if one does.
  if (choice?.type === 'container' && choice.behavior.kind === 'options' && part.choiceRefs) {
    const refs = part.choiceRefs
    const options = await Promise.all(
      choice.behavior.options.map(async (option, i) => {
        const section = await latinOfPart(refs[i], latin)
        const paired = section && pairHymn(option.children, section)
        return { ...option, children: paired ?? markMissing(option.children) }
      }),
    )
    return {
      ...part,
      primitives: part.primitives.map((p) =>
        p === choice ? { ...choice, behavior: { ...choice.behavior, options } } : p,
      ),
    }
  }
  const section = await latinOfPart(part.ref, latin)
  const paired = section && pairPart(part.slot, part.primitives, section)
  if (paired) return { ...part, primitives: paired }
  return missing(baseOf(part.slot)) ? { ...part, primitives: markMissing(part.primitives) } : part
}

// The psalms the Invitatory may be sung with, each with its antiphon repeated
// after every strophe.
const invitatoryPsalms: [InvitatoryPsalm, string][] = [
  ['94c', 'Salmo 94(95)'],
  ['99c', 'Salmo 99(100)'],
  ['66c', 'Salmo 66(67)'],
  ['23c', 'Salmo 23(24)'],
]

// The hours the Invitatory may open: whichever of the two begins the day.
const opensTheDay = new Set<Hour>(['readings', 'lauds'])

function select(label: string, overrideKey: string, options: ContainerOption[]): Primitive[] {
  if (options.length === 0) return []
  if (options.length === 1) return options[0].children
  return [
    {
      type: 'container',
      behavior: {
        kind: 'select',
        label: { primary: label },
        overrideKey,
        selectedId: options[0].id,
        pickerStyle: 'chips',
        options,
      },
    },
  ]
}

function formLabel(office: Office, form: Form): string {
  if (form === 'season') return 'Tempo litúrgico'
  // What the saint has not of his own, from the weekday instead of the Common.
  if (form === 'celebration-of-the-weekday') return 'Memória com os textos da féria'
  const saint = office.celebration?.title.replace(/\s*\n\s*/g, ' — ') ?? 'Memória'
  // In Lent and the like the saint is not kept, only added to the weekday.
  return isCommemoration(office) ? `Com a comemoração de ${saint}` : saint
}

async function invitatory(
  date: Date,
  source: LothSource,
  ctx: RenderContext,
  latin?: LatinSource,
): Promise<Primitive[]> {
  const office = officeOf(date, 'invitatory', await source.calendar())
  const [own] = formsOf(office)
  const options = await Promise.all(
    invitatoryPsalms.map(async ([psalm, label]) => {
      const parts = await assembleHour(office, own, source, psalm)
      const children = renderParts(parts, ctx)
      const section = latin
        ? await latinOfPart(parts.find((p) => p.slot === 'psalm-1')?.ref, latin)
        : undefined
      return {
        id: psalm,
        label: { primary: label },
        children: section ? pairInvitatory(children, section) : children,
      }
    }),
  )
  if (options.every((option) => option.children.length === 0)) return []
  return [
    {
      type: 'container',
      behavior: { kind: 'collapsible', title: { primary: 'Invitatório' }, defaultOpen: false },
      children: select('Salmo do Invitatório', 'loth.invitatory', options),
    },
  ]
}

/**
 * The offices an hour of a date may be prayed in (the weekday's, the
 * saint's…), each as its parts rendered.
 */
export async function officesOf(
  date: Date,
  hour: Hour,
  source: LothSource,
): Promise<{ office: Office; ctx: RenderContext; forms: FormSlots<Form>[] }> {
  const [calendar, extras] = await Promise.all([source.calendar(), source.extras()])
  const office = officeOf(date, hour, calendar)
  const ctx: RenderContext = { extras, celebration: office.celebration?.title }
  const assembled = await Promise.all(
    formsOf(office).map(async (form) => ({
      form,
      parts: await assembleHour(office, form, source),
    })),
  )
  for (const { parts } of assembled) {
    if (parts.length === 0) {
      throw new Error(`Liturgy of the Hours: no ${hour} in the corpus for ${date.toDateString()}`)
    }
  }
  // A saint whose every part is his own has one office, not two alike.
  const distinct = assembled.filter(
    ({ parts }, i) =>
      !assembled.slice(0, i).some((other) => JSON.stringify(other.parts) === JSON.stringify(parts)),
  )
  return {
    office,
    ctx,
    forms: distinct.map(({ form, parts }) => ({ form, slots: renderSlots(parts, ctx) })),
  }
}

/**
 * One hour for a date, from the corpus. With `latin`, each part that has a
 * Latin original is given it beside.
 */
export async function lothHour(
  date: Date,
  hour: Hour,
  source: LothSource,
  latin?: LatinSource,
): Promise<Primitive[]> {
  const { office, ctx, forms } = await officesOf(date, hour, source)
  const paired = latin
    ? await Promise.all(
        forms.map(async (f) =>
          oneLatinEach({
            ...f,
            slots: await Promise.all(f.slots.map((part) => withItsLatin(part, latin))),
          }),
        ),
      )
    : forms
  const options = await Promise.all(
    paired.map(async ({ form, slots }) => ({
      id: form,
      label: { primary: formLabel(office, form) },
      children: [
        ...(opensTheDay.has(hour) ? await invitatory(date, source, ctx, latin) : []),
        ...slots.flatMap((s) => s.primitives),
      ],
    })),
  )
  const prayed = select('Ofício', 'loth.office', options)
  if (isVerified(date)) return prayed
  return [
    {
      type: 'rubric',
      text: {
        primary:
          'Este ofício foi montado para uma data fora dos anos conferidos com o breviário (2020–2040); confira-o com o livro.',
      },
    },
    ...prayed,
  ]
}
