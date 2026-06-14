// The app-facing version table: app ids ↔ DO version strings. The DO string
// participates in condition evaluation, kalendar chain selection, and data
// directory routing (see Tabulae/data.txt).

export type DoVersionId =
  | 'rubrics-1960'
  | 'divino-afflatu'
  | 'monastic'
  | 'tridentine-1570'
  | 'tridentine-1888'
  | 'tridentine-1906'
  | 'divino-afflatu-1939'
  | 'reduced-1955'
  | 'monastic-1617'
  | 'monastic-1930'
  | 'monastic-barroux'

export const doVersionNames: Record<DoVersionId, string> = {
  'rubrics-1960': 'Rubrics 1960 - 1960',
  'divino-afflatu': 'Divino Afflatu - 1954',
  monastic: 'Monastic - 1963',
  'tridentine-1570': 'Tridentine - 1570',
  'tridentine-1888': 'Tridentine - 1888',
  'tridentine-1906': 'Tridentine - 1906',
  'divino-afflatu-1939': 'Divino Afflatu - 1939',
  'reduced-1955': 'Reduced - 1955',
  'monastic-1617': 'Monastic Tridentinum 1617',
  'monastic-1930': 'Monastic Divino 1930',
  'monastic-barroux': 'Monastic - 1963 - Barroux',
}

// Display order, grouped by family (Roman chain oldest→newest, then Monastic).
// Drives the settings selector.
export const doVersionOrder: DoVersionId[] = [
  'tridentine-1570',
  'tridentine-1888',
  'tridentine-1906',
  'divino-afflatu-1939',
  'divino-afflatu',
  'reduced-1955',
  'rubrics-1960',
  'monastic-1617',
  'monastic-1930',
  'monastic',
  'monastic-barroux',
]

export const defaultDoVersion: DoVersionId = 'rubrics-1960'

function isDoVersion(id: string): id is DoVersionId {
  return id in doVersionNames
}

export function officeVersion(id: string): string {
  return doVersionNames[isDoVersion(id) ? id : defaultDoVersion]
}

// The EF Mass practice maps the office preference onto a missal Cmissa
// supports. The Mass is only differentially verified for the 1960 and Divino
// Afflatu missals so far; the Divino-Afflatu family maps to DA, everything
// else (incl. the Tridentine and Monastic offices) maps to the 1962 missal
// until per-version Mass verification lands.
export function massVersion(id: string): string {
  if (id === 'divino-afflatu' || id === 'divino-afflatu-1939') {
    return doVersionNames['divino-afflatu']
  }
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
