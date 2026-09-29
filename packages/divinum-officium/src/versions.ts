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

function isDoVersion(id: string): id is DoVersionId {
  return id in doVersionNames
}

// Office practices name their version in the manifest; an unknown id is a
// content typo, so it throws instead of quietly praying another breviary.
export function officeVersion(id: string): string {
  if (!isDoVersion(id)) throw new Error(`unknown Divinum Officium version id '${id}'`)
  return doVersionNames[id]
}

// The Vetus Ordo Mass follows the 1962 missal, one of the two missals the Mass
// is differentially verified for (with Divino Afflatu).
export const efVersion = doVersionNames['rubrics-1960']

// App content-language codes → DO data directory names.
export const doLangDirs: Record<string, string> = {
  la: 'Latin',
  'en-US': 'English',
  'pt-BR': 'Portugues',
}

export function doLangDir(lang: string): string {
  return doLangDirs[lang] ?? 'English'
}
