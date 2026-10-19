// Made-up installs for the usage desk to show locally: SQL on stdout, for
// `wrangler d1 execute RELAY --local`. Never run against the real relay.
//
// Each install is drawn with a devotion — how likely it is to come back on a
// given day, and how fast that fades — a few practices it keeps, and the hours
// it keeps them at, so the charts have the shapes real use would give them.

import { tables } from '../../relay/src/schema.ts'

const days = 120
const today = new Date()
let seed = 7
const random = () => {
  seed = (seed * 16807) % 2147483647
  return seed / 2147483647
}
const pick = <T>(items: T[]): T => items[Math.floor(random() * items.length)] as T
const dayOf = (offset: number) =>
  new Date(today.getTime() - offset * 86_400_000).toISOString().slice(0, 10)
const quote = (value: unknown) =>
  value === undefined || value === null ? 'NULL' : `'${String(value).replace(/'/g, "''")}'`

const practices = [
  ['practice/rosary', 30],
  ['practice/angelus', 18],
  ['practice/mass', 16],
  ['practice/divine-office', 12],
  ['practice/examination-conscience', 10],
  ['practice/act-of-contrition', 8],
  ['practice/anima-christi', 6],
  ['practice/adoro-te-devote', 4],
  ['practice/all-saints-novena', 3],
  ['practice/angelic-trisagion', 2],
] as const
const books = [
  'book/augustine-confessiones',
  'book/butler-lives-of-saints',
  'book/bonne-presse-catechism-in-pictures',
  'book/morrow-my-catholic-faith',
]
const routes = ['/', '/you', '/prayers', '/bible', '/library', '/saints', '/calendar', '/settings']

function weighted(): string {
  const total = practices.reduce((sum, [, weight]) => sum + weight, 0)
  let at = random() * total
  for (const [id, weight] of practices) {
    at -= weight
    if (at <= 0) return id
  }
  return practices[0][0]
}

const rows: string[] = []
const accounts: string[] = []
const devices: string[] = []

for (let n = 0; n < 700; n++) {
  // More arrive as time goes on.
  const first = Math.floor(days * Math.sqrt(random()))
  const startedAgo = days - first
  const install = `seed-${n}`
  const platform = random() < 0.55 ? 'ios' : random() < 0.9 ? 'android' : 'web'
  const language = random() < 0.62 ? 'pt-BR' : 'en-US'
  const devotion = random() ** 1.6
  const fade = 0.9 + devotion * 0.099
  const kept = Array.from({ length: 1 + Math.floor(devotion * 4) }, weighted)
  const reader = random() < 0.3 ? pick(books) : undefined
  const morning = 5 + Math.floor(random() * 4)
  const evening = 19 + Math.floor(random() * 4)
  let chance = 0.95
  for (let ago = startedAgo; ago >= 0; ago--) {
    const fresh = ago === startedAgo
    if (!fresh && random() > chance * (0.25 + devotion * 0.7)) {
      chance *= fade
      continue
    }
    chance *= fade
    const day = dayOf(ago)
    const version = ago > 45 ? '1.0.0' : '1.1.0'
    const build =
      ago > 45
        ? undefined
        : ago > 20
          ? '2026-09-24T18:02'
          : ago > 6
            ? '2026-10-04T11:40'
            : '2026-10-12T21:15'
    const add = (name: string, hour: number, props?: Record<string, string>) =>
      rows.push(
        `(${[day, install, platform, version, language, build, name, props && JSON.stringify(props), hour].map(quote).join(', ')})`,
      )
    add('app_opened', morning)
    add('screen', morning, { route: '/' })
    if (random() < 0.5) add('app_opened', 12, { start: 'warm' })
    if (random() < 0.6) add('app_opened', evening, { start: 'warm' })
    for (const id of new Set(kept)) {
      const hour =
        id === 'practice/examination-conscience'
          ? evening + 1
          : id === 'practice/angelus'
            ? 12
            : pick([morning, evening])
      add('screen', hour, { route: '/pray/[practiceId]', id })
      // Some are opened and left.
      if (random() < 0.82) add('CompletionLogged', hour, { id })
    }
    if (random() < 0.15) add('screen', evening, { route: '/pray/[practiceId]', id: weighted() })
    if (random() < 0.4) add('screen', morning, { route: pick(routes) })
    if (reader && random() < 0.5) {
      add('screen', evening, { route: '/browse/book/[bookId]', id: reader })
      add('ReadingLogged', evening, { id: reader, minutes: String(3 + Math.floor(random() * 25)) })
    }
    if (random() < 0.04) add('ItemSaved', evening, { id: weighted() })
    if (random() < 0.02) add('CollectionCreated', evening)
    if (random() < 0.03) add('PreferenceSet', morning)
    if (fresh) add('SlotAdded', morning, { id: kept[0] as string })
  }

  if (devotion > 0.55 && random() < 0.4) {
    const id = `seed-account-${n}`
    const created = today.getTime() - Math.floor(random() * Math.min(startedAgo, 40)) * 86_400_000
    const deleted = random() < 0.06 ? created + 86_400_000 : undefined
    const email = random() < 0.5 ? `seed-${n}@example.com` : undefined
    accounts.push(
      `(${[id, 'x', 1, created, 0, email, random() < 0.3 ? 1 : 0, email && random() < 0.7 ? 'sealed' : undefined, deleted].map(quote).join(', ')})`,
    )
    const count = 1 + (random() < 0.45 ? 1 : 0) + (random() < 0.15 ? 1 : 0)
    for (let d = 0; d < count; d++) {
      const seen = today.getTime() - Math.floor(random() * 12) * 86_400_000
      devices.push(`(${[id, `device-${d}`, 'x', created, seen].map(quote).join(', ')})`)
    }
  }
}

const out = [
  ...tables.map((sql) => `${sql};`),
  "DELETE FROM analytics WHERE install LIKE 'seed-%';",
  "DELETE FROM devices WHERE account LIKE 'seed-account-%';",
  "DELETE FROM accounts WHERE id LIKE 'seed-account-%';",
]
const chunk = <T>(items: T[], size: number) =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, i) =>
    items.slice(i * size, (i + 1) * size),
  )
for (const part of chunk(rows, 400)) {
  out.push(
    `INSERT INTO analytics (day, install, platform, version, language, build, name, props, hour) VALUES ${part.join(', ')};`,
  )
}
if (accounts.length) {
  out.push(
    `INSERT INTO accounts (id, auth_hash, format, created_at, bytes, email, news, recovery, deleted_at) VALUES ${accounts.join(', ')};`,
  )
}
if (devices.length) {
  out.push(
    `INSERT INTO devices (account, id, token_hash, created_at, seen_at) VALUES ${devices.join(', ')};`,
  )
}
process.stdout.write(`${out.join('\n')}\n`)
