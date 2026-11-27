// Made-up installs for the usage desk to show locally: SQL on stdout, for
// `wrangler d1 execute RELAY --local`. Never run against the real relay.
//
// Each install is drawn with a devotion — how likely it is to come back on a
// given day, and how fast that fades — a few practices it keeps, and the hours
// it keeps them at, so the charts have the shapes real use would give them.

import { existsSync, readFileSync } from 'node:fs'
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
  ['practice/morning-offering', 14],
  ['practice/mass', 16],
  ['practice/liturgy-of-the-hours', 12],
  ['practice/examination-of-conscience', 10],
  ['practice/act-of-contrition', 8],
  ['practice/anima-christi', 6],
  ['practice/adoro-te-devote', 4],
  ['practice/all-saints-novena', 3],
  ['practice/angelic-trisagion', 2],
] as const
const books = [
  'book/augustine-confessions',
  'book/butler-lives-of-saints',
  'book/bonne-presse-catechism-in-pictures',
  'book/morrow-my-catholic-faith',
]
const routes = ['/', '/you', '/prayers', '/bible', '/library', '/saints', '/calendar', '/settings']

// Churches to look at: the local Mass-times database's own (written by `seed:usage` before this
// runs), so the desk can name them, or made-up ones when there is none.
const churchFile = process.env.SEED_CHURCHES
const churches: { id: string; geohash: string }[] =
  churchFile && existsSync(churchFile)
    ? JSON.parse(readFileSync(churchFile, 'utf8'))
    : Array.from({ length: 40 }, (_, i) => ({
        id: `church-${i}`,
        geohash: `6gyc${'0123456789bcdefg'[i % 16]}x`,
      }))
const cards = [
  'gall',
  'gerard_majella',
  'peter_of_alexandria',
  'cecilia',
  'clement',
  'columban',
  'andrew',
  'francis_xavier',
  'nicholas',
  'ambrose',
  'lucy',
  'john_of_the_cross',
]
const doors = ['office', 'office', 'prayedDay', 'prayedDay', 'mass', 'starter', 'novena']
const reasons = ['begin', 'grow', 'obra', 'office']
const searches: [string, string, number][] = [
  ['terco', 'practice/rosary', 4],
  ['rosario', 'practice/rosary', 3],
  ['angelus', 'practice/angelus', 1],
  ['novena', 'collection/novenario', 40],
  ['confissao', 'practice/act-of-contrition', 6],
  ['santo agostinho', 'book/augustine-confessions', 9],
  ['oracao da manha', 'practice/morning-offering', 5],
  ['salve rainha', 'practice/salve-regina', 2],
  ['sao miguel', 'practice/st-michael', 3],
  ['adoracao', 'practice/adoro-te-devote', 7],
  ['via sacra', 'practice/way-of-the-cross', 2],
  ['oracao pelos falecidos', '', 0],
  ['santa rita', '', 0],
  ['cerco de jerico', '', 0],
]
const churchSearches = [
  'catedral',
  'se',
  'sao bento',
  'nossa senhora do brasil',
  'santa cecilia',
  'consolacao',
]
const bibleBooks = ['GEN', 'PSA', 'MAT', 'MRK', 'LUK', 'JHN', 'ROM']
const savedKinds = ['practice', 'practice', 'book', 'chapter', 'collection']

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
  // A third go to Mass and look for it in Ember, near home and now and then away.
  const massGoer = random() < 0.35
  const home = churches.filter((c) => c.geohash.startsWith(pick(churches).geohash.slice(0, 4)))
  const parish = pick(home.length ? home : churches)
  const collector = random() < 0.4
  const searcher = random() < 0.5
  let held = 0
  let chapter = 1
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
    // The onboarding came in the last three weeks: those first seen since go through it.
    if (fresh && ago <= 21) {
      add('screen', morning, { route: '/onboarding' })
      if (random() < 0.12) {
        add('onboarding_done', morning, { path: 'skip', reminders: 'off' })
      } else {
        const reason = pick(reasons)
        add('onboarding_reason', morning, { reason })
        add('screen', morning, { route: `/onboarding/${reason}` })
        if (reason === 'office')
          add('screen', morning, {
            route: random() < 0.5 ? '/onboarding/office-hours' : '/onboarding/office-first',
          })
        if (random() < 0.85) {
          add('screen', morning, { route: '/onboarding/reminders' })
          const reminders = random() < 0.6 ? 'on' : 'off'
          add('onboarding_reminders', morning, { reminders })
          if (random() < 0.9) {
            add('screen', morning, { route: '/onboarding/pray' })
            add('onboarding_done', morning, {})
          }
        }
      }
    }
    add('screen', morning, { route: '/' })
    if (random() < 0.5) add('app_opened', 12, { start: 'warm' })
    if (random() < 0.6) add('app_opened', evening, { start: 'warm' })
    for (const id of new Set(kept)) {
      // Not every practice is kept every day, and some days none is.
      if (random() < 0.3) continue
      const hour =
        id === 'practice/examination-conscience'
          ? evening + 1
          : id === 'practice/angelus'
            ? 12
            : pick([morning, evening])
      add('screen', hour, { route: '/pray/[practiceId]', id })
      // Some are opened and left. Builds before 1.1.0 don't say how a completion was made.
      const via = version === '1.0.0' ? {} : { via: 'amen' }
      const said = random() < 0.7
      if (said) add('CompletionLogged', hour, { id, ...via })
      if (ago <= 14) {
        const depth = said ? 100 : pick([0, 25, 25, 50, 75])
        add('prayer_read', hour, { id, depth: String(depth), end: said ? 'amen' : 'left' })
      }
    }
    // A tick on the plan, with no prayer opened.
    if (random() < 0.12) add('CompletionLogged', morning, { id: weighted(), via: 'checklist' })
    if (random() < 0.15) add('screen', evening, { route: '/pray/[practiceId]', id: weighted() })
    if (random() < 0.4) add('screen', morning, { route: pick(routes) })
    if (reader && random() < 0.5) {
      add('screen', evening, { route: '/browse/book/[bookId]', id: reader })
      add('ReadingLogged', evening, { id: reader, minutes: String(3 + Math.floor(random() * 25)) })
    }
    if (reader && random() < 0.4)
      add('book_chapter', evening, { id: reader, chapter: `ch-${chapter++}` })
    if (random() < 0.15)
      add('bible_chapter', evening, {
        book: pick(bibleBooks),
        chapter: String(1 + Math.floor(random() * 20)),
      })
    if (random() < 0.04) {
      const kind = pick(savedKinds)
      add(
        'ItemSaved',
        evening,
        kind === 'book' ? { id: pick(books), kind } : { id: weighted(), kind },
      )
    }
    if (random() < 0.02) add('CollectionCreated', evening)
    if (random() < 0.03) add('CollectionItemAdded', evening, { id: weighted() })
    if (random() < 0.03)
      add(
        'PreferenceSet',
        morning,
        pick([
          { key: 'translation', value: pick(['DRB', 'AVE-MARIA', 'NVB']) },
          { key: 'display-mode', value: pick(['vernacular', 'latin', 'both']) },
          { key: 'psalter-cycle', value: pick(['30-day', '60-day']) },
        ]),
      )
    if (random() < 0.02) add('shared', evening, { id: weighted() })
    if (random() < 0.1) add('reminder_opened', morning, { id: kept[0] as string })
    if (fresh) add('SlotAdded', morning, { id: kept[0] as string })
    // Today's holy card, offered, and opened by some.
    if (ago <= 30) {
      const won = random() < 0.45
      add('card_offer', morning, { act: 'officeOrRosary', won: won ? '1' : '0' })
      if (won && (collector || random() < 0.3)) {
        held++
        add('screen', morning, { route: '/redeem' })
        add('HolyCardRedeemed', morning, { card: pick(cards), door: pick(doors) })
      }
      if (random() < 0.08) add('screen', evening, { route: '/saints/[index]', card: pick(cards) })
    }
    if (massGoer && (new Date(`${day}T12:00:00Z`).getUTCDay() === 0 || random() < 0.08)) {
      add('screen', morning, { route: '/mass-times' })
      const away = random() < 0.15 ? pick(churches) : parish
      add('mass_area', morning, {
        cell: away.geohash.slice(0, 5),
        intent: pick(['mass', 'mass', 'confession', 'adoration', 'visit']),
        when: pick(['now', 'today', 'sunday']),
        churches: String(
          away === parish ? 3 + Math.floor(random() * 12) : Math.floor(random() * 3),
        ),
        here: away === parish ? '1' : '0',
      })
      if (searcher && random() < 0.25) {
        const q = pick(churchSearches)
        const found = random() < 0.8 ? [pick(churches).id, pick(churches).id] : []
        add('search', morning, {
          scope: 'churches',
          q,
          results: String(found.length),
          ...(found.length ? { top: found.join(','), opened: found[0] as string, at: '1' } : {}),
        })
      }
      const church = random() < 0.2 ? pick(churches) : away
      add('church_opened', morning, {
        church: church.id,
        from: pick(['map', 'list', 'list', 'saved', 'search']),
      })
      if (random() < 0.4)
        add('church_action', morning, {
          church: church.id,
          action: pick(['directions', 'directions', 'call', 'website']),
        })
      if (random() < 0.5)
        add('CheckInLogged', morning, {
          church: church.id,
          kind: pick(['mass', 'mass', 'confession', 'adoration']),
        })
      if (random() < 0.05) add('ChurchFavorited', morning, { church: church.id })
      if (random() < 0.03) add('church_verified', morning, { church: church.id })
      if (random() < 0.01) add('church_correction', morning, { church: church.id, kind: 'note' })
    }
    if (searcher && random() < 0.12) {
      const [q, opened, results] = pick(searches)
      add('search', evening, {
        scope: 'corpus',
        q,
        results: String(results),
        ...(opened
          ? {
              top: opened,
              ...(random() < 0.7 ? { opened, at: String(1 + Math.floor(random() * 3)) } : {}),
            }
          : {}),
      })
    }
    if (version === '1.1.0' && random() < 0.01) add('review_asked', evening)
    // The health counts and the plan arrived with the latest update.
    if (ago <= 14) {
      if (random() < 0.06)
        add(
          'error',
          morning,
          pick([
            {
              where: 'query',
              kind: 'TypeError',
              source: 'book-chapter',
              route: '/browse/book/[bookId]/read',
            },
            {
              where: 'query',
              kind: 'HttpError',
              status: '503',
              source: 'mass-times',
              route: '/mass-times',
            },
            { where: 'query', kind: 'Error', source: 'ccc', route: '/pray/[practiceId]' },
            { where: 'mutation', kind: 'Error', source: 'unnamed', route: '/plan/[practiceId]' },
            { where: 'uncaught', kind: 'TypeError', route: '/saints/[index]' },
          ]),
        )
      if (random() < 0.004)
        add('error', morning, {
          where: 'fatal',
          kind: 'TypeError',
          route: '/',
          build: build ?? 'embedded',
        })
      if (random() < 0.5) {
        const practices = kept.length + Math.floor(random() * 3)
        add('plan', morning, {
          practices: String(practices),
          slots: String(practices),
          reminders: String(Math.floor(practices * random())),
          notifications: random() < 0.7 ? 'granted' : 'denied',
        })
      }
      if (random() < 0.02)
        add('link_opened', morning, { id: weighted(), start: random() < 0.6 ? 'cold' : 'warm' })
      if (random() < 0.02)
        add(
          'prayer_language',
          evening,
          pick([
            { action: 'pray', id: 'practice/rosary', value: 'la' },
            { action: 'follow', id: 'practice/angelus', value: 'pt-BR' },
            { action: 'every-prayer' },
            { action: 'layout', id: 'practice/mass', value: 'columns' },
          ]),
        )
    }
    if (fresh && ago <= 21 && random() < 0.6)
      add('notifications', morning, { asked: random() < 0.75 ? 'granted' : 'denied' })
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
