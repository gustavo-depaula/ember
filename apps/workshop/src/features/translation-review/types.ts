export type IssueType =
  | 'completeness'
  | 'diacritics'
  | 'references'
  | 'typos'
  | 'formatting'
  | 'other'
  | 'note'

export const issueTypeLabels: Record<IssueType, string> = {
  completeness: 'Completeness',
  diacritics: 'Diacritics / Encoding',
  references: 'Wrong References',
  typos: 'Typos',
  formatting: 'Formatting',
  other: 'Other',
  note: 'Note',
}

export const taxonomyTypes: IssueType[] = [
  'completeness',
  'diacritics',
  'references',
  'typos',
  'formatting',
  'other',
]

export type FlagMode = 'paragraph' | 'selection'

export type Issue = {
  id: string
  libraryId: string
  bookId: string
  chapterId: string
  type: IssueType
  languages: string[]
  paragraphIdx?: number
  selectionLang?: string
  quote: string
  note: string
  createdAt: number
}

export type IssueDraft = Omit<Issue, 'id' | 'createdAt'>
