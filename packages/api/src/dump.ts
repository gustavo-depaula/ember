// The bulk-import contract. The out-of-band pipeline produces a JSONL file — one `ChurchDump` per
// line — and `apps/backend/scripts/import.ts` turns it into a `.sql` for `wrangler d1 import`. This
// file is the ONLY thing that pipeline needs to depend on.
//
// Derived fields are NOT in the dump: the importer generates the church `id` (a slug from
// name+city+region) and the `geohash` (from lat/lng), and assigns `service` ids. Provide identity
// + content; the importer derives the rest.
//
// Example line:
//   {"name":"St. Patrick's Cathedral","city":"New York","region":"NY","lat":40.7585,"lng":-73.9759,
//    "timezone":"America/New_York","canonicalStatus":"full_communion",
//    "services":[{"kind":"mass","rite":"latin_novus_ordo","rrule":"FREQ=WEEKLY;BYDAY=SU","startTime":"10:15"}],
//    "links":[{"kind":"website","url":"https://saintpatrickscathedral.org"}]}

// Accepts the known values (with editor autocomplete) but stays open to new ones — the schema stores
// these as free text and filters only when a value is supplied, so the vocabulary can grow.
type Open<T extends string> = T | (string & {})

export type ServiceKind = 'mass' | 'confession' | 'adoration'
export type ChurchStatus = 'active' | 'temporarily_closed' | 'closed'
export type CanonicalStatus = 'full_communion' | 'irregular' | 'not_in_communion'
export type Administration =
  | 'diocesan'
  | 'religious_institute'
  | 'society_apostolic_life'
  | 'personal_prelature'
  | 'ordinariate'
  | 'independent'
  | 'other'
// Extensible: Latin OF/EF + Eastern Catholic rites + the Anglican Ordinariate.
export type Rite = Open<
  | 'latin_novus_ordo'
  | 'latin_tridentine'
  | 'byzantine'
  | 'maronite'
  | 'chaldean'
  | 'syro_malabar'
  | 'melkite'
  | 'ukrainian_greek'
  | 'ordinariate_divine_worship'
>
export type ChurchTextKind = Open<
  'mass_times' | 'seasonal_mass_times' | 'confession' | 'adoration' | 'info'
>
export type ChurchLinkKind = Open<
  'website' | 'instagram' | 'facebook' | 'whatsapp' | 'youtube' | 'livestream' | 'donation'
>

export type ChurchDump = {
  name: string
  longName?: string
  address?: string
  city?: string
  region?: string // state / province; used in the slug
  postalCode?: string
  country?: string
  countryCode?: string // ISO 3166-1 alpha-2
  lat: number
  lng: number
  timezone: string // IANA (e.g. 'America/New_York'); the pipeline resolves it (e.g. from lat/lng)
  phoneE164?: string
  email?: string
  status?: ChurchStatus
  featured?: boolean
  // affiliation — all optional, mostly unknown; curated over time, filters never hide `unknown`
  administration?: Administration
  institute?: Open<string> // e.g. FSSP, ICKSP, SSPX, OSB, OP, SJ, Opus Dei
  canonicalStatus?: CanonicalStatus // in communion with Rome, or not
  note?: string
  hasStructuredSchedule?: boolean // defaults to (services.length > 0) at import
  lastVerifiedAt?: string // ISO 8601
  verifiedSource?: 'import' | 'user' | 'moderator'
  // child records nested under the church
  services?: ServiceDump[]
  texts?: ChurchTextDump[]
  links?: ChurchLinkDump[]
}

export type ServiceDump = {
  kind: ServiceKind
  rite?: Rite // Mass only; omit for confession/adoration
  language?: string // ISO 639 (e.g. 'en', 'pt', 'la')
  rrule: string // iCal RRULE, ONE pattern at ONE time (e.g. 'FREQ=WEEKLY;BYDAY=SU'). Union = multiple rows.
  startTime: string // 'HH:MM' local wall-clock
  endTime?: string // 'HH:MM'
  exdate?: string // comma-separated 'YYYY-MM-DD' cancelled dates
  rdate?: string // comma-separated 'YYYY-MM-DD' one-off added dates
  locationNote?: string
  note?: string
  source?: 'import' | 'manual' | 'user'
  confidence?: number // 0..1
}

export type ChurchTextDump = {
  kind: ChurchTextKind
  rawText: string
  sourceUpdatedAt?: string // ISO 8601
}

export type ChurchLinkDump = {
  kind: ChurchLinkKind
  url: string
}
