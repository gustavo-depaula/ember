export type ReadingReference =
  | {
      type: 'bible'
      book: string
      bookName: string
      chapter: number
      startVerse?: number
      endVerse?: number
      toEnd?: boolean
    }
  | { type: 'catechism'; startParagraph: number; count: number }
