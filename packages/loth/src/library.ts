// The shapes of `content/loth/library/`: what the breviary has that is opened
// by name rather than by date.

import type { Block } from './text'

// `psalter.json`: every psalm and canticle of the four-week psalter, once.
export interface PsalterEntry {
  // "Salmo 22(23)", "Cântico Dn 3,57-88.56"
  name: string
  // The title the breviary gives it: "O Bom Pastor".
  title: string
  kind: 'psalm' | 'canticle'
  blocks: Block[]
  psalmPrayer?: Block[]
}

// `offices.json` (the Commons, the Office of the Dead), `prayers.json`,
// `rites.json`: an entry has one text, or one for each hour or weekday.
export interface LibraryText {
  hour?: string
  psalterWeek?: number
  weekday?: number
  blocks: Block[]
}

export interface LibraryEntry {
  name: string
  // The short name the breviary's own index uses.
  label: string
  texts: LibraryText[]
}
