// producer/ember-days — what the Ember Days practice can't write down ahead of
// time: the three dates of the Ember week under way or next to come, and, on
// an Ember day, the collect and Gospel of that day's Mass, read out of the
// Divinum Officium missal rather than copied into the practice.

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
  },
}

// An Ember Mass reads its extra lessons (five on a Saturday), a second collect
// and the day's commemorations under the collect's head. The practice prays
// the first prayer alone: the missal rules off each of those that follow.
function firstCollectAndGospel(mass: Primitive[]): Primitive[] {
  const gospel = mass.findIndex((p, i) => i > 0 && p.type === 'heading' && p.size === 'h1')
  if (gospel === -1) return mass
  const rule = mass.findIndex((p) => p.type === 'divider')
  const collect = mass.slice(0, rule === -1 || rule > gospel ? gospel : rule)
  return [...collect, { type: 'divider' }, ...mass.slice(gospel)]
}

export const emberDaysSource: ContentSource<Primitive[]> = {
  id: 'producer/ember-days',
  version: '1',
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
    const mass = await ctx.sources.fetch(doMassSource, { parts: ['Oratio', 'Evangelium'] })
    return [
      when,
      { type: 'divider' },
      { type: 'heading', size: 'h2', text: { primary: words.days[today.day] } },
      ...firstCollectAndGospel(mass),
    ]
  },
}
