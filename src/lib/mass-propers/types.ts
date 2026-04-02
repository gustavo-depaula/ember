export type ProperSection = {
  text: string
  latin?: string
  citation?: string
}

export type ProperDay = Record<string, ProperSection>

export type DoFileRef = {
  type: 'tempora' | 'sancti'
  id: string
}
