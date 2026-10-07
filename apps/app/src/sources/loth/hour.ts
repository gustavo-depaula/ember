// One hour of the Liturgy of the Hours for a date, from the corpus.

import {
  assembleHour,
  type Form,
  formsOf,
  type Hour,
  type InvitatoryPsalm,
  type LothSource,
  type Office,
  officeOf,
} from '@ember/loth'
import type { ContainerOption, Primitive } from '@/content/primitives'
import { type RenderContext, renderParts } from './render'

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
  return office.celebration?.title.replace(/\s*\n\s*/g, ' — ') ?? 'Memória'
}

async function invitatory(
  date: Date,
  form: Form,
  source: LothSource,
  ctx: RenderContext,
): Promise<Primitive[]> {
  const office = officeOf(date, 'invitatory', await source.calendar())
  const forms = formsOf(office)
  const own = forms.includes(form) ? form : forms[0]
  const options = await Promise.all(
    invitatoryPsalms.map(async ([psalm, label]) => ({
      id: psalm,
      label: { primary: label },
      children: renderParts(await assembleHour(office, own, source, psalm), ctx),
    })),
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

export async function lothHour(date: Date, hour: Hour, source: LothSource): Promise<Primitive[]> {
  const [calendar, extras] = await Promise.all([source.calendar(), source.extras()])
  const ctx: RenderContext = { extras }
  const office = officeOf(date, hour, calendar)
  const options = await Promise.all(
    formsOf(office).map(async (form) => {
      const parts = await assembleHour(office, form, source)
      if (parts.length === 0) {
        throw new Error(`Liturgy of the Hours: no ${hour} in the corpus for ${date.toDateString()}`)
      }
      return {
        id: form,
        label: { primary: formLabel(office, form) },
        children: [
          ...(opensTheDay.has(hour) ? await invitatory(date, form, source, ctx) : []),
          ...renderParts(parts, ctx),
        ],
      }
    }),
  )
  return select('Ofício', 'loth.office', options)
}
