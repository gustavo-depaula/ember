/**
 * Biblical (`hbo`) or modern Hebrew (`he`): one script, set right to left,
 * never hyphenated, in a face that draws its points and accents.
 */
export function isHebrew(language: string | undefined) {
  const lang = (language ?? '').toLowerCase()
  return lang.startsWith('hbo') || lang === 'he' || lang.startsWith('he-')
}
