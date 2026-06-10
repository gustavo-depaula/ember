export type HourId =
  | 'office-of-readings'
  | 'lauds'
  | 'terce'
  | 'sext'
  | 'none'
  | 'vespers'
  | 'compline'

// iBreviary's `lang` form value. Beyond vernaculars it also selects editions:
// 'la' (Latin) and 'vt' (Vetus Ordo) are valid future values — extend the
// tables, never branch on literals elsewhere.
export type IbLang = 'en' | 'pt'

export const baseUrl = 'https://www.ibreviary.com/m2'

// `s` query value for each hour's page on breviario.php. iBreviary serves the
// three little hours as one combined ora_media page — terce/sext/none share
// the fetch and are split apart in parse (see splitDaytime).
export const hourSections: Record<HourId, string> = {
  'office-of-readings': 'ufficio_delle_letture',
  lauds: 'lodi',
  terce: 'ora_media',
  sext: 'ora_media',
  none: 'ora_media',
  vespers: 'vespri',
  compline: 'compieta',
}

export const daytimeHours = ['terce', 'sext', 'none'] as const
export type DaytimeHour = (typeof daytimeHours)[number]

export const isDaytimeHour = (h: HourId): h is DaytimeHour =>
  (daytimeHours as readonly HourId[]).includes(h)

// First-line text that opens each little hour's own block (reading, versicle,
// oration) inside the combined ora_media page, in terce/sext/none order.
// PT marks them as bare <strong>Tércia</strong> paragraphs; EN as
// "MIDMORNING [Terce]" label runs.
export const daytimeMarkers: Record<IbLang, [string, string, string]> = {
  pt: ['Tércia', 'Sexta', 'Noa'],
  en: ['MIDMORNING', 'MIDDAY', 'MIDAFTERNOON'],
}

const hourIds = Object.keys(hourSections) as HourId[]

export function narrowHour(raw: unknown): HourId {
  if (typeof raw === 'string' && (hourIds as string[]).includes(raw)) return raw as HourId
  throw new Error(`ibreviary: unknown hour param ${JSON.stringify(raw)}`)
}

// iBreviary's `pt` is the European Portuguese LOTH edition — accepted for
// pt-BR users (Brazil's CNBB edition isn't available there).
export function ibLangFor(appLang: string): IbLang {
  return appLang === 'pt-BR' ? 'pt' : 'en'
}
