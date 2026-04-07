export type PsalmRef =
  | { psalm: number; verseRange?: undefined }
  | { psalm: number; verseRange: [number, number] }

export function parsePsalmRef(raw: number | string): PsalmRef {
  if (typeof raw === 'number') return { psalm: raw }

  // Format: "119:33-72"
  const [psalmStr, rangeStr] = raw.split(':')
  const psalm = Number.parseInt(psalmStr, 10)
  const [start, end] = rangeStr.split('-').map((s) => Number.parseInt(s, 10))
  return { psalm, verseRange: [start, end] }
}

export const dayNames = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const

export function formatPsalmRef(ref: PsalmRef): string {
  if (ref.verseRange) {
    return `Psalm ${ref.psalm}:${ref.verseRange[0]}-${ref.verseRange[1]}`
  }
  return `Psalm ${ref.psalm}`
}

export function formatPsalmRefs(refs: PsalmRef[]): string {
  return refs.map(formatPsalmRef).join(', ')
}
