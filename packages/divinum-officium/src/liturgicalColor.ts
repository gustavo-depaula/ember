// A day's liturgical colour, read from its title as Divinum Officium reads it
// to colour the day's name (`liturgical_color`, web/cgi-bin/DivinumOfficium/Main.pm).
// DO names a display colour, not a vestment: black type is a white day (the
// page is white), grey a black one, blue Our Lady's (white). `doColor` is the
// port, kept to its names so the differential test can compare it with the Perl.

export type LiturgicalColor = 'white' | 'red' | 'green' | 'violet' | 'rose' | 'black'

export type DoColor = 'blue' | 'red' | 'grey' | 'black' | 'deeppink' | 'purple' | 'green'

export function doColor(title: string): DoColor {
  if (/(?:Beat|Sanct)(?:ae|æ) Mari/.test(title) && !/Vigil/.test(title)) return 'blue'
  if (
    /(?:Vigilia Pentecostes|Quattuor Temporum Pentecostes|Decollatione|Martyr|Reliquia)/i.test(
      title,
    )
  )
    return 'red'
  if (/(?:Defunctorum|Parasceve|Morte)/i.test(title)) return 'grey'
  if (/^In Vigilia Ascensionis|^In Vigilia Epiphaniæ/.test(title)) return 'black'
  if (/^Dominica III Adventus|^Dominica IV in Quadragesima/.test(title)) return 'deeppink'
  if (
    /(?:Vigilia|Quattuor|Rogatio|Passion|Palmis|gesim|(?:Majoris )?Hebdomadæ(?: Sanctæ)?|Sabbato Sancto|Dolorum|Ciner|Adventus)/i.test(
      title,
    ) &&
    !/commemoratione|votivum/i.test(title)
  )
    return 'purple'
  if (/(?:Conversione|Dedicatione|Cathedra|oann|Pasch|Confessor|Ascensio|Cena)/i.test(title))
    return 'black'
  if (/(?:Pentecosten(?!.*infra octavam)|Epiphaniam|post octavam)/i.test(title)) return 'green'
  if (/(?:Pentecostes|Evangel|Innocentium|Sanguinis|Cruc|Apostol)/i.test(title)) return 'red'
  return 'black'
}

const vestment: Record<DoColor, LiturgicalColor> = {
  blue: 'white',
  red: 'red',
  grey: 'black',
  black: 'white',
  deeppink: 'rose',
  purple: 'violet',
  green: 'green',
}

/** The colour of a day of the Latin Mass, from its title (`Dominica X Post Pentecosten`). */
export function liturgicalColorOf(title: string): LiturgicalColor {
  return vestment[doColor(title)]
}
