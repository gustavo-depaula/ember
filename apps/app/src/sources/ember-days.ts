// producer/ember-days — what the Ember Days practice can't write down ahead of
// time: the three dates of the Ember week under way or next to come, and, on
// an Ember day, the collects, lessons and Gospel of that day's Mass, read out
// of the Divinum Officium missal rather than copied into the practice.

import { emberWeekOn, nextEmberWeek } from '@ember/liturgical'
import { format, parseISO } from 'date-fns'
import { enUS, ptBR } from 'date-fns/locale'
import type { Primitive } from '@/content/primitives'
import { doMassSource } from './divinum-officium/do-mass'
import type { ContentSource, SourceFetchContext } from './types'

const wording = {
  'en-US': {
    locale: enUS,
    date: 'EEEE, MMMM d',
    weeks: {
      advent: 'Advent Ember Days',
      lent: 'Lenten Ember Days',
      pentecost: 'Pentecost Ember Days',
      september: 'September Ember Days',
    },
    days: ['Ember Wednesday', 'Ember Friday', 'Ember Saturday'],
    lessons: 'The lessons of the Mass',
  },
  'pt-BR': {
    locale: ptBR,
    date: "EEEE, d 'de' MMMM",
    weeks: {
      advent: 'Têmporas do Advento',
      lent: 'Têmporas da Quaresma',
      pentecost: 'Têmporas de Pentecostes',
      september: 'Têmporas de Setembro',
    },
    days: ['Quarta-feira das Têmporas', 'Sexta-feira das Têmporas', 'Sábado das Têmporas'],
    lessons: 'As leituras da Missa',
  },
}

const isHead = (p: Primitive) => p.type === 'heading' && p.size === 'h1'
const isRule = (p: Primitive) => p.type === 'divider'

// The saint of the date is commemorated after the day's own collects: an
// "Orémus", a rubric naming the saint, the prayer. Those belong to the date,
// not to the Ember day, so the collects end where the first one begins.
function withoutCommemorations(collects: Primitive[]): Primitive[] {
  const named = collects.findIndex(
    (p) =>
      p.type === 'rubric' && /^Comm?emora/.test(`${p.text.secondary ?? ''}\n${p.text.primary}`),
  )
  if (named === -1) return collects
  const lastRule = collects.slice(0, named).findLastIndex(isRule)
  return collects.slice(0, lastRule === -1 ? named : lastRule)
}

/**
 * The day's Mass as the practice prays it: the first collect and the Gospel
 * open, and between them, folded, what the missal reads there — the Ember
 * lessons with their graduals (five on a Saturday), the second collect, the
 * Epistle.
 */
function prayedFromMass(mass: Primitive[], lessons: string): Primitive[] {
  const gospel = mass.findLastIndex(isHead)
  const afterCollects = mass.findIndex((p, i) => i > 0 && isHead(p))
  if (gospel <= 0) return mass
  const collects = withoutCommemorations(mass.slice(0, afterCollects))
  const rule = collects.findIndex(isRule)
  const first = rule === -1 ? collects : collects.slice(0, rule)
  const between = [...collects.slice(first.length), ...mass.slice(afterCollects, gospel)]
  const folded = between.slice(
    between.findIndex((p) => !isRule(p)),
    between.findLastIndex((p) => !isRule(p)) + 1,
  )
  return [
    ...first,
    { type: 'divider' },
    {
      type: 'container',
      behavior: { kind: 'collapsible', title: { primary: lessons }, defaultOpen: false },
      children: folded,
    },
    { type: 'divider' },
    ...mass.slice(gospel),
  ]
}

export const emberDaysSource: ContentSource<Primitive[]> = {
  id: 'producer/ember-days',
  version: '2',
  prefsDeps: ['lang'],
  dateScoped: true,
  async fetch(ctx: SourceFetchContext): Promise<Primitive[]> {
    const words = ctx.prefs.lang === 'pt-BR' ? wording['pt-BR'] : wording['en-US']
    const week = nextEmberWeek(ctx.date)
    const dates = week.days.map((d) => format(parseISO(d), words.date, { locale: words.locale }))
    const when: Primitive = {
      type: 'rubric',
      text: { primary: `${words.weeks[week.season]}: ${dates.join('; ')}.` },
    }
    const today = emberWeekOn(ctx.date)
    if (!today) return [when]
    const mass = await ctx.sources.fetch(doMassSource, {
      parts: ['Oratio', 'Lectio', 'Graduale', 'Evangelium'],
    })
    return [
      when,
      { type: 'divider' },
      { type: 'heading', size: 'h2', text: { primary: words.days[today.day] } },
      ...prayedFromMass(mass, words.lessons),
    ]
  },
}
