/** Koine (`grc`) or modern Greek (`el`): one alphabet, one syllabification, one set of faces that draw it. */
export function isGreek(language: string | undefined) {
  const lang = (language ?? '').toLowerCase()
  return lang.startsWith('grc') || lang.startsWith('el')
}
