import { type InferSelectModel, sql } from 'drizzle-orm'
import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// Source of truth for the Mass-Times directory. Domain types are inferred from these tables
// (no hand-written `type`s) and migrations are generated from them via drizzle-kit.
//
// Note on geohash collation: SQLite's default TEXT collation IS already BINARY, so the geohash
// index below is binary-collated for free — the prefix-range geo filters are sargable as-is.
// The FTS5 `church_fts` virtual table is intentionally NOT modelled here (drizzle-kit can't emit
// virtual tables); it lives in a hand-written migration and is queried via raw `sql`.

// A church owns its schedule + text + links. They are EMBEDDED as JSON columns on `church` (below),
// not separate tables: the server never queries inside a schedule (rrule expansion is on-device), so
// a church is always read whole. Embedding makes `/near` a single geohash scan and cuts row writes
// ~4× (no per-child rows/indexes). `service.id` is deterministic (`churchId:hash(slot)`) so a
// `correction` can still target one Mass.
export type Service = {
  id: string
  kind: string // mass | confession | adoration
  rite?: string // Mass only; latin_novus_ordo | latin_tridentine | byzantine | ...
  language?: string // ISO 639
  rrule: string // iCal RRULE: ONE pattern at ONE time
  startTime: string // 'HH:MM' wall-clock; displayed as-is, expanded on-device
  endTime?: string
  exdate?: string // RRuleSet EXDATE (cancelled dates)
  rdate?: string // RRuleSet RDATE (one-off added dates)
  locationNote?: string
  note?: string
  source?: string // import | manual | user
  confidence?: number
}
export type ChurchText = {
  kind: string // mass_times | seasonal_mass_times | confession | adoration | info
  rawText: string
  sourceUpdatedAt?: string
}
export type ChurchLink = {
  kind: string // website | instagram | facebook | whatsapp | youtube | livestream | donation
  url: string
}

export const church = sqliteTable(
  'church',
  {
    id: text('id').primaryKey(), // human-friendly slug: name + city + disambiguator
    name: text('name').notNull(),
    longName: text('long_name'),
    address: text('address'),
    city: text('city'),
    region: text('region'),
    postalCode: text('postal_code'),
    country: text('country'),
    countryCode: text('country_code'),
    lat: real('lat').notNull(),
    lng: real('lng').notNull(),
    geohash: text('geohash').notNull(), // precomputed (len ~9); BINARY-collated index → sargable prefix ranges
    timezone: text('timezone').notNull(), // IANA; metadata, only consulted for cross-zone "open now"
    phoneE164: text('phone_e164'),
    email: text('email'),
    status: text('status'), // active | temporarily_closed | closed
    featured: integer('featured', { mode: 'boolean' }),
    // affiliation: all nullable; absent (unknown) for most churches; curated over time
    administration: text('administration'), // diocesan | religious_institute | society_apostolic_life | personal_prelature | ordinariate | independent | other
    institute: text('institute'), // FSSP, ICKSP, SSPX, OSB, OP, SJ, Opus Dei, ...
    canonicalStatus: text('canonical_status'), // full_communion | irregular | not_in_communion | (null = unknown)
    note: text('note'),
    hasStructuredSchedule: integer('has_structured_schedule', { mode: 'boolean' }),
    lastVerifiedAt: text('last_verified_at'), // ISO
    verifiedSource: text('verified_source'), // import | user | moderator
    updatedAt: text('updated_at'),
    // embedded owned content (see the note above); shipped to the device, expanded there
    services: text('services', { mode: 'json' }).$type<Service[]>(),
    texts: text('texts', { mode: 'json' }).$type<ChurchText[]>(),
    links: text('links', { mode: 'json' }).$type<ChurchLink[]>(),
  },
  (t) => [index('church_geohash_idx').on(t.geohash)],
)

export const correction = sqliteTable(
  'correction',
  {
    id: text('id').primaryKey(), // server-generated crypto.randomUUID()
    churchId: text('church_id').notNull(),
    serviceId: text('service_id'), // null for church-level / add-service
    kind: text('kind').notNull(), // edit_service | edit_church | add_service | flag_closed | note
    payload: text('payload').notNull(), // JSON { changes?, comment?, attachmentKeys? }, Zod-validated per kind
    fingerprint: text('fingerprint'),
    status: text('status').notNull().default('pending'), // pending | accepted | rejected | duplicate
    createdAt: text('created_at').notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
    reviewedAt: text('reviewed_at'),
    reviewedBy: text('reviewed_by'),
  },
  (t) => [
    index('correction_church_idx').on(t.churchId),
    index('correction_status_idx').on(t.status),
  ],
)

export const verificationEvent = sqliteTable(
  'verification_event',
  {
    id: text('id').primaryKey(), // crypto.randomUUID()
    churchId: text('church_id').notNull(),
    serviceId: text('service_id'),
    fingerprint: text('fingerprint').notNull(), // dedup: one per (church_id, fingerprint) per window
    createdAt: text('created_at').notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
  },
  (t) => [index('verification_church_fp_idx').on(t.churchId, t.fingerprint)],
)

// Correction attachments (bulletin photos). INTERIM: stored as base64 in D1 because R2 isn't
// enabled on the account yet. Low volume (operator-reviewed corrections), capped small. Swap to
// R2 later by moving `data` out to object storage and keeping these ids as the keys.
export const attachment = sqliteTable(
  'attachment',
  {
    id: text('id').primaryKey(), // crypto.randomUUID(); referenced from correction.payload.attachmentKeys
    churchId: text('church_id').notNull(),
    contentType: text('content_type').notNull(),
    data: text('data').notNull(), // base64
    createdAt: text('created_at').notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
  },
  (t) => [index('attachment_church_idx').on(t.churchId)],
)

export type Church = InferSelectModel<typeof church>
export type Correction = InferSelectModel<typeof correction>
export type VerificationEvent = InferSelectModel<typeof verificationEvent>
export type Attachment = InferSelectModel<typeof attachment>
