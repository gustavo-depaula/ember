// Which Mass of the Kyriale a day is sung to.
//
// The Kyriale heads each of its eighteen Masses with its occasion — "in
// Paschal time", "for feasts of the II class", "for the Sundays of Advent and
// Lent" — and those headings, in the book's own order of precedence, are the
// whole of the rule here. Where the book offers several Masses for one kind of
// day (five for a feast of the II class), the first it prints is taken: any
// of them is the book's answer, and a choir is free among them.

import { type Chant, chantSummary, loadChant, loadChantBooks } from './chants'

/** The day as the 1962 calendar resolves it (`resolveDay` of @ember/divinum-officium). */
export type RankedDay = {
  /** The office that wins the day, as a file id: `Tempora/Adv1-0.txt`, `Sancti/12-08.txt`. */
  winner: string
  /** Divinum Officium's rank: 6 and up is the I class, 5 the II, 2 to 4 the III. */
  rank: number
  /** The week of the season, `dayname[0]`: `Adv1`, `Nat26`, `Quad3`, `Pasc2`, `Pent20`. */
  week: string
  /** 0 is Sunday. */
  weekday: number
  /** The Common the office draws on, if any: `Commune/C11.txt` is Our Lady's. */
  commune: string
}

/** The section of the Kyriale for a day: `mass-xi`. */
export function ordinaryOfDay({ winner, rank, week, weekday, commune }: RankedDay): string {
  // "Tempore paschali", from the Vigil to the Saturday after Pentecost.
  if (week.startsWith('Pasc')) return 'mass-i'
  // "In festis B. Mariae Virginis": the greater feasts, then the lesser.
  if (/Commune\/C1[01]/.test(`${winner} ${commune}`)) return rank >= 5 ? 'mass-ix' : 'mass-x'
  const ofTheSeason = winner.startsWith('Tempora')
  const penitential = /^(Adv|Quad\d)/.test(week)
  if (ofTheSeason && weekday === 0) return penitential ? 'mass-xvii' : 'mass-xi'
  if (rank >= 6) return 'mass-ii'
  if (rank >= 5) return 'mass-iv'
  if (!ofTheSeason) return rank >= 2 ? 'mass-xii' : 'mass-xv'
  // A feria: of Advent or Lent, of Christmastide, or through the year.
  if (penitential) return 'mass-xviii'
  return week.startsWith('Nat') ? 'mass-xv' : 'mass-xvi'
}

/** The parts of the ordinary the Mass prints under a head of their own, by that head. */
const partOf: Record<string, string> = {
  Kyrie: 'Kyrie',
  Gloria: 'Gloria',
  // The Sanctus closes the Preface, which is where the Missal prints it.
  Præfatio: 'Sanctus',
}

/**
 * The chant of the day's ordinary, by the head of the section of the Mass it
 * belongs under. A Mass of the Kyriale with no Gloria has none to give, and
 * the Credo, which belongs to no one Mass, is the first of the book's.
 */
export async function ordinaryChants(day: RankedDay): Promise<Record<string, Chant>> {
  const kyriale = (await loadChantBooks()).find((book) => book.id === 'chant-book/kyriale')
  const section = kyriale?.sections.find((s) => s.id === ordinaryOfDay(day))
  if (!kyriale || !section) return {}
  const wanted = Object.entries(partOf).flatMap(([head, part]): [string, string][] => {
    const id = section.chants.find((chant) => chantSummary(chant).name.startsWith(part))
    return id ? [[head, id]] : []
  })
  const credo = kyriale.sections.find((s) => s.id === 'credo')?.chants[0]
  if (credo) wanted.push(['Credo', credo])
  const loaded = await Promise.all(
    wanted.map(
      async ([head, id]): Promise<[string, Chant | undefined]> => [head, await loadChant(id)],
    ),
  )
  return Object.fromEntries(loaded.filter((entry): entry is [string, Chant] => !!entry[1]))
}
