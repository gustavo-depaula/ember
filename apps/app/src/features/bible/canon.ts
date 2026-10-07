// The divisions of the canon, each named by the Douay slug of its first book.
// Labels and the edge index's abbreviations are `bible.divisions.<id>` and
// `bible.divisionAbbr.<id>`.
export const canonDivisions = [
  { id: 'pentateuch', firstBook: 'genesis' },
  { id: 'historical', firstBook: 'josue' },
  { id: 'wisdom', firstBook: 'job' },
  { id: 'prophets', firstBook: 'isaias' },
  { id: 'maccabees', firstBook: '1-machabees' },
  { id: 'gospels', firstBook: 'matthew' },
  { id: 'acts', firstBook: 'acts' },
  { id: 'pauline', firstBook: 'romans' },
  { id: 'catholic', firstBook: 'james' },
  { id: 'apocalypse', firstBook: 'apocalypse' },
] as const

export type CanonDivisionId = (typeof canonDivisions)[number]['id']

export function divisionStartingAt(bookId: string): CanonDivisionId | undefined {
  return canonDivisions.find((d) => d.firstBook === bookId)?.id
}

/** The division a book belongs to, given the canon's book ids in order. */
export function divisionOfBook(bookId: string, canon: string[]): CanonDivisionId | undefined {
  const index = canon.indexOf(bookId)
  if (index === -1) return undefined
  return canonDivisions.findLast((d) => canon.indexOf(d.firstBook) <= index)?.id
}
