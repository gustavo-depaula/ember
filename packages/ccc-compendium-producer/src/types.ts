export type Lang = 'en-US' | 'pt-BR'

export type ChapterId =
  | 'motu-proprio'
  | 'introduction'
  | 'part-1'
  | 'part-2'
  | 'part-3'
  | 'part-4'
  | 'appendix-a'
  | 'appendix-b'

export type ProduceContext = {
  chapter: ChapterId
  lang: Lang
  fetch?: typeof fetch
}

export type AnchorIndex = Record<string, { chapter: ChapterId }>

export type ProduceResult = {
  html: string
  anchors: AnchorIndex
}
