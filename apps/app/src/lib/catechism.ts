export type CccParagraph = {
  number: number
  text: string
  section: string
  breadcrumb: string[]
}

let cccData: CccParagraph[] | undefined

export function loadCcc(): CccParagraph[] {
  if (!cccData) {
    cccData = require('@/assets/catechism/ccc.json')
  }
  return cccData as CccParagraph[]
}

export function getCccParagraphs(startParagraph: number, count: number): CccParagraph[] {
  const ccc = loadCcc()
  const startIndex = Math.max(0, startParagraph - 1)
  return ccc.slice(startIndex, startIndex + count)
}
