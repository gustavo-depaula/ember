// The head of a day of the traditional Mass or Office, and the names of its
// Masses where the missal gives several: the engine names them in Latin, as
// the rubrics do; here they are put in the reader's language.

import { type DayHeading, liturgicalColorOf } from '@ember/divinum-officium'
import type { CalloutPrimitive, ContainerOption, Primitive } from '@/content/primitives'
import i18n from '@/lib/i18n'
import { getLiturgicalDayName } from '@/lib/liturgical'

type Lang = 'pt-BR' | 'en-US'

const narrow = (lang: string): Lang | undefined =>
  lang === 'pt-BR' || lang === 'en-US' ? lang : undefined

// The 1960 classes, which the 1962 Mass and Office are ranked in; an older
// rank ('Semiduplex Dominica minor') keeps the rubrics' Latin.
const classes: Record<Lang, Record<string, string>> = {
  'pt-BR': {
    'I. classis': '1ª classe',
    'II. classis': '2ª classe',
    'III. classis': '3ª classe',
    'IV. classis': '4ª classe',
    'Dies Octavæ I. classis': 'Dia da Oitava, 1ª classe',
    Feria: 'Féria',
  },
  'en-US': {
    'I. classis': 'First class',
    'II. classis': 'Second class',
    'III. classis': 'Third class',
    'IV. classis': 'Fourth class',
    'Dies Octavæ I. classis': 'Day in the Octave, first class',
    Feria: 'Feria',
  },
}

const commemoration: Record<Lang, string> = {
  'pt-BR': 'Comemoração',
  'en-US': 'Commemoration',
}

// The breviary's files name few Sundays and ferias in Portuguese, nor
// Christmas or the Epiphany; the calendar names them. (Its 1 January is the
// new calendar's, not the Circumcision.)
const namedByTheCalendar = (winner: string) => /^Tempora|^Sancti\/(?:12-25|01-06)/.test(winner)

/** The day's head: its name in the reader's language over the Latin, its rank, what it commemorates. */
export function headingPrimitive(
  heading: DayHeading,
  { lang, date, winner }: { lang: string; date: Date; winner: string },
): CalloutPrimitive {
  const reader = narrow(lang)
  const vernacular =
    heading.name.vernacular ??
    (reader && namedByTheCalendar(winner)
      ? getLiturgicalDayName(date, 'ef', { t: (k, o) => i18n.getFixedT(reader)(k, o) as string })
      : undefined)
  const commemorated = heading.commemorations.map((c) => c.vernacular ?? c.la).join(' · ')
  return {
    type: 'callout',
    variant: 'celebration-banner',
    title: vernacular
      ? { primary: vernacular, secondary: heading.name.la, secondaryLanguage: 'la' }
      : { primary: heading.name.la },
    color: liturgicalColorOf(heading.name.la),
    ...(heading.rank
      ? { rank: { primary: (reader && classes[reader][heading.rank]) || heading.rank } }
      : {}),
    ...(commemorated
      ? {
          cycle: { primary: `${reader ? commemoration[reader] : 'Commemoratio'}: ${commemorated}` },
        }
      : {}),
  }
}

// What the missal calls each of a day's Masses (missa.pl's radio labels).
const massNames: Record<Lang | 'la', Record<string, string>> = {
  'pt-BR': {
    'missa prima': 'Missa da Noite',
    'missa secunda': 'Missa da Aurora',
    'missa tertia': 'Missa do Dia',
    'de missa chrismatis': 'Missa do Crisma',
    'missa in coena Domini': 'Missa da Ceia do Senhor',
    'forma longior': 'Forma longa',
    'forma brevior': 'Forma breve',
  },
  'en-US': {
    'missa prima': 'Midnight Mass',
    'missa secunda': 'Mass at Dawn',
    'missa tertia': 'Mass of the Day',
    'de missa chrismatis': 'Chrism Mass',
    'missa in coena Domini': "Mass of the Lord's Supper",
    'forma longior': 'Longer form',
    'forma brevior': 'Shorter form',
  },
  la: {},
}

const numbered: Record<Lang | 'la', (n: string) => string> = {
  'pt-BR': (n) => `${n}ª Missa`,
  'en-US': (n) => `Mass ${n}`,
  la: (n) => `Missa ${n}`,
}

function massLabel(name: string, lang: string): string {
  const reader = narrow(lang) ?? 'la'
  if (/^\d+$/.test(name)) return numbered[reader](name)
  const plain = name.replace(/^de /, '')
  return massNames[reader][name] ?? plain.charAt(0).toUpperCase() + plain.slice(1)
}

/**
 * A day's several Masses as one choice. Christmas opens on the Mass of its
 * hour, the night's until 6, the dawn's until 9, then the day's; Holy
 * Thursday on the Lord's Supper, the Mass the faithful attend; any other on
 * the first.
 */
export function massChoice(names: string[], masses: Primitive[][], lang: string): Primitive {
  const christmas = names[0] === 'missa prima'
  const options: ContainerOption[] = names.map((name, i) => ({
    id: String(i + 1),
    label: { primary: massLabel(name, lang) },
    children: masses[i],
    ...(christmas ? { fromHour: [0, 6, 9][i] } : {}),
  }))
  const supper = names.indexOf('missa in coena Domini')
  return {
    type: 'container',
    behavior: {
      kind: 'options',
      label: { primary: '' },
      ...(supper >= 0 ? { initialId: String(supper + 1) } : {}),
      options,
    },
  }
}
