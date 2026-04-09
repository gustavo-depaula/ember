import { fetchHearth } from './hearth'

export type CccParagraph = {
  number: number
  text: string
  section: string
  breadcrumb: string[]
}

let cccData: CccParagraph[] | undefined

export async function loadCcc(): Promise<CccParagraph[]> {
  if (!cccData) {
    cccData = await fetchHearth<CccParagraph[]>('catechism/ccc.json')
  }
  return cccData
}

export async function getCccParagraphs(
  startParagraph: number,
  count: number,
): Promise<CccParagraph[]> {
  const ccc = await loadCcc()
  const startIndex = Math.max(0, startParagraph - 1)
  return ccc.slice(startIndex, startIndex + count)
}
