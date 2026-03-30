export type ReadingReference =
  | { type: 'bible'; book: string; bookName: string; chapter: number }
  | { type: 'catechism'; startParagraph: number; count: number }
