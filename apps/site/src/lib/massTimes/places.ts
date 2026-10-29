// Where a church is, as the pages that list churches by place need it. The directory's
// region and city fields come from many importers and read "SP", "São Paulo", "Sao Paulo",
// "SP, 19200-000", "Recife, PE", "State of Paraná" or nothing at all for the same state, so a
// page per raw value would scatter one state over many. Countries whose states have a fixed
// list resolve to it; elsewhere the cleaned text is kept as it is.

export type Located = {
  /** The state's display name and slug. */
  region?: { name: string; slug: string }
  /** The city as written, freed of a trailing state code. */
  city?: string
}

type RawPlace = {
  countryCode: string | null
  region: string | null
  city: string | null
  postalCode?: string | null
}

export function slug(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const brStates: Record<string, string> = {
  AC: 'Acre',
  AL: 'Alagoas',
  AP: 'Amapá',
  AM: 'Amazonas',
  BA: 'Bahia',
  CE: 'Ceará',
  DF: 'Distrito Federal',
  ES: 'Espírito Santo',
  GO: 'Goiás',
  MA: 'Maranhão',
  MT: 'Mato Grosso',
  MS: 'Mato Grosso do Sul',
  MG: 'Minas Gerais',
  PA: 'Pará',
  PB: 'Paraíba',
  PR: 'Paraná',
  PE: 'Pernambuco',
  PI: 'Piauí',
  RJ: 'Rio de Janeiro',
  RN: 'Rio Grande do Norte',
  RS: 'Rio Grande do Sul',
  RO: 'Rondônia',
  RR: 'Roraima',
  SC: 'Santa Catarina',
  SP: 'São Paulo',
  SE: 'Sergipe',
  TO: 'Tocantins',
}

const usStates: Record<string, string> = {
  AL: 'Alabama',
  AK: 'Alaska',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  DC: 'District of Columbia',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  PR: 'Puerto Rico',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
}

// Names the importers write that are not the state's own: Spanish and English renderings, and a
// capital standing for its district.
const brAliases: Record<string, string> = {
  'rio grande del sur': 'RS',
  'rio grande del norte': 'RN',
  brasilia: 'DF',
  'sao paulo state': 'SP',
}

// The Correios assign each state a block of CEPs, by their first five digits.
const brCep: [number, number, string][] = [
  [1000, 19999, 'SP'],
  [20000, 28999, 'RJ'],
  [29000, 29999, 'ES'],
  [30000, 39999, 'MG'],
  [40000, 48999, 'BA'],
  [49000, 49999, 'SE'],
  [50000, 56999, 'PE'],
  [57000, 57999, 'AL'],
  [58000, 58999, 'PB'],
  [59000, 59999, 'RN'],
  [60000, 63999, 'CE'],
  [64000, 64999, 'PI'],
  [65000, 65999, 'MA'],
  [66000, 68899, 'PA'],
  [68900, 68999, 'AP'],
  [69000, 69299, 'AM'],
  [69300, 69399, 'RR'],
  [69400, 69899, 'AM'],
  [69900, 69999, 'AC'],
  [70000, 72799, 'DF'],
  [72800, 72999, 'GO'],
  [73000, 73699, 'DF'],
  [73700, 76799, 'GO'],
  [76800, 76999, 'RO'],
  [77000, 77999, 'TO'],
  [78000, 78899, 'MT'],
  [79000, 79999, 'MS'],
  [80000, 87999, 'PR'],
  [88000, 89999, 'SC'],
  [90000, 99999, 'RS'],
]

type StateList = {
  names: Record<string, string>
  aliases: Record<string, string>
  fromPostal?: (postal: string) => string | undefined
}

const stateLists: Record<string, StateList> = {
  BR: {
    names: brStates,
    aliases: brAliases,
    fromPostal: (postal) => {
      const digits = postal.replace(/\D/g, '')
      if (digits.length !== 8) return undefined
      const prefix = Number(digits.slice(0, 5))
      return brCep.find(([from, to]) => prefix >= from && prefix <= to)?.[2]
    },
  },
  US: { names: usStates, aliases: {} },
}

const key = (text: string) =>
  slug(text)
    .replace(/^(state-of|estado-de|estado-do|estado-da)-/, '')
    .replace(/-/g, ' ')

const postalPattern = /\b\d{5}(-?\d{3,4})?\b/

function stateCode(list: StateList, text: string): string | undefined {
  const byName = Object.fromEntries(
    Object.entries(list.names).map(([code, name]) => [key(name), code]),
  )
  // The state usually closes an address ("Recife, PE"), so the last part that names one wins.
  const parts = text
    .split(/[,/]| - /)
    .map((part) => part.replace(postalPattern, '').trim())
    .filter(Boolean)
    .reverse()
  for (const part of parts) {
    const upper = part.replace(/\./g, '').toUpperCase()
    if (upper.length === 2 && list.names[upper]) return upper
    const k = key(part)
    const code = byName[k] ?? list.aliases[k]
    if (code) return code
    // "Brasília-DF", "Brasília DF": a city with its state's code after it.
    const tail = part.match(/[\s-]([A-Z]{2})$/)?.[1]
    if (tail && list.names[tail]) return tail
  }
  return undefined
}

function cleanCity(list: StateList | undefined, city: string | null): string | undefined {
  if (!city) return undefined
  let text = city.trim()
  // "Fortaleza-CE", "São Paulo SP", "São Paulo/SP": a state code the importer kept on the city.
  const suffix = text.match(/^(.+?)\s*(?:[-/]\s*|\s)([A-Z]{2})$/)
  if (list && suffix && list.names[suffix[2]]) text = suffix[1].trim()
  // A state where the city should be says nothing of the city.
  if (list && /^(state of|estado d[eoa]) /i.test(text)) return undefined
  return text || undefined
}

/** A church's state and city, from its own fields alone. */
export function locate(church: RawPlace): Located {
  const country = (church.countryCode ?? '').toUpperCase()
  const list = stateLists[country]
  const city = cleanCity(list, church.city)
  if (!list) {
    const name = church.region?.replace(postalPattern, '').split(',')[0].trim()
    return { region: name ? { name, slug: slug(name) } : undefined, city }
  }
  const code =
    (church.region && stateCode(list, church.region)) ??
    (church.postalCode && list.fromPostal?.(church.postalCode)) ??
    (church.region && list.fromPostal?.(church.region)) ??
    undefined
  const name = code ? list.names[code] : undefined
  return { region: name ? { name, slug: slug(name) } : undefined, city }
}

type Placed = RawPlace & { lat: number; lng: number }

/**
 * Every church's state and city, the states its fields leave unknown taken from the nearest church
 * of the same country whose state is known: a church a street from others is in their state.
 */
export function locateAll<T extends Placed>(churches: T[]): Map<T, Located> {
  const out = new Map(churches.map((church) => [church, locate(church)]))
  const known = churches.filter((church) => out.get(church)?.region)
  for (const church of churches) {
    const located = out.get(church) as Located
    if (located.region || !stateLists[(church.countryCode ?? '').toUpperCase()]) continue
    let nearest: T | undefined
    let best = Number.POSITIVE_INFINITY
    for (const other of known) {
      if (other.countryCode !== church.countryCode) continue
      const d = (other.lat - church.lat) ** 2 + (other.lng - church.lng) ** 2
      if (d < best) {
        best = d
        nearest = other
      }
    }
    if (nearest) located.region = out.get(nearest)?.region
  }
  return out
}
