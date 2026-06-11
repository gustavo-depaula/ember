// The app-facing version table: app ids ↔ DO version strings. The DO string
// participates in condition evaluation, kalendar chain selection, and data
// directory routing (see Tabulae/data.txt).

export type DoVersionId = 'rubrics-1960' | 'divino-afflatu' | 'monastic'

export const doVersionNames: Record<DoVersionId, string> = {
  'rubrics-1960': 'Rubrics 1960 - 1960',
  'divino-afflatu': 'Divino Afflatu - 1954',
  monastic: 'Monastic - 1963',
}

export const defaultDoVersion: DoVersionId = 'rubrics-1960'

export function officeVersion(id: string): string {
  return doVersionNames[
    (id as DoVersionId) in doVersionNames ? (id as DoVersionId) : defaultDoVersion
  ]
}

// There is no Monastic Mass — monks use the Roman missal (DO's own Cmissa
// version list omits Monastic). Pair the 1963 Monastic office with the 1962
// missal.
export function massVersion(id: string): string {
  if (id === 'divino-afflatu') return doVersionNames['divino-afflatu']
  return doVersionNames['rubrics-1960']
}

// App content-language codes → DO data directory names.
export const doLangDirs: Record<string, string> = {
  la: 'Latin',
  'en-US': 'English',
  'pt-BR': 'Portugues',
}

export function doLangDir(lang: string): string {
  return doLangDirs[lang] ?? 'English'
}
