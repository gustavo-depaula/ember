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
import { type LatinSection, latinSections } from './latin'
import { pairForms, pairInvitatory } from './pair'
import { type RenderContext, renderParts, renderSlots } from './render'

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
  latin?: { section: LatinSection; latinOffice?: Form },
): Promise<Primitive[]> {
  const office = officeOf(date, 'invitatory', await source.calendar())
  const [own] = formsOf(office)
  // Its antiphon is its own office's: the Latin's where the Latin day is that office.
  const antiphon = latin?.latinOffice === own
  const options = await Promise.all(
    invitatoryPsalms.map(async ([psalm, label]) => {
      const children = renderParts(await assembleHour(office, own, source, psalm), ctx)
      // The Latin edition prints the Invitatory with Psalm 94(95) only.
      return {
        id: psalm,
        label: { primary: label },
        children:
          latin && psalm === '94c' ? pairInvitatory(children, latin.section, antiphon) : children,
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
 * One hour for a date, from the corpus. With `latin` (the same hour in the
 * Latin edition), each part the Latin day shares is given its Latin.
 */
export async function lothHour(
  date: Date,
  hour: Hour,
  source: LothSource,
  latin?: Primitive[],
): Promise<Primitive[]> {
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
  const sections = latin ? latinSections(latin) : undefined
  const rendered = distinct.map(({ form, parts }) => ({ form, slots: renderSlots(parts, ctx) }))
  // A memorial's little hours and Night Prayer are the weekday's in the Latin
  // (General Instruction, 236), whatever the Brazilian takes from the saint.
  const ofTheWeekday =
    sections &&
    office.celebration?.rank === 'memorial' &&
    !rendered.some(({ form }) => form === 'season')
      ? {
          form: 'season' as const,
          slots: renderSlots(await assembleHour(office, 'season', source), ctx),
        }
      : undefined
  const { forms: paired, latinOffice } = sections
    ? pairForms(rendered, sections, {
        penitential: ['advent', 'lent', 'holy-week'].includes(office.day.season),
        weekday: ofTheWeekday,
        onlyOrdinary:
          hour === 'compline' && office.day.season === 'holy-week' && office.day.weekday >= 4,
      })
    : { forms: rendered, latinOffice: undefined }
  const invitatorySection = sections?.find((section) => section.slot === 'invitatory')
  const options = await Promise.all(
    paired.map(async ({ form, slots }) => ({
      id: form,
      label: { primary: formLabel(office, form) },
      children: [
        ...(opensTheDay.has(hour)
          ? await invitatory(
              date,
              source,
              ctx,
              invitatorySection && { section: invitatorySection, latinOffice },
            )
          : []),
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
