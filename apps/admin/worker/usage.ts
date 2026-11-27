import type {
  ChurchUse,
  Features,
  HolyCards,
  Library,
  MassTimes,
  Onboarding,
  Overview,
  Place,
  Prayer,
  Pulse,
  Search,
  SearchScope,
  UsageFilter,
  UsageOf,
  UsageTab,
} from './types'

// The usage desk, read from the relay's own database: the `analytics` counts the app sends
// (apps/app/src/lib/usage.ts names them), and for accounts, only sums over the account tables
// (nothing here reads an account's details). Churches and places are named from the Mass-times
// database, which holds the churches the counts point at.
//
// An install is the unit throughout. `day` and `hour` are the device's own, so a habit reads in
// its owner's time; "today" is the latest day any install has reached. Everything but the cohorts
// and the cards held is read over the period the filter names, so switching it changes the page.

// Every statement reads `a`, the counts the filter keeps. ?1 platform, ?2 language, ?3 today, ?4
// the first day of the period, ?5 the first day of the period before it. D1 refuses a binding its
// statement never names, so `bounds` names all five for the statements that don't.
const scoped = `WITH bounds AS (SELECT ?3, ?4, ?5),
  a AS (SELECT * FROM analytics WHERE (?1 = '' OR platform = ?1) AND (?2 = '' OR language = ?2))`

const prop = (name: string) => `json_extract(props, '$.${name}')`

// Praying, for each install on each day, as two separate facts: `opened`, the prayer screen was
// shown, and `amen`, the Amen at its end was tapped. A tick on the plan and a Mass check-in mark a
// practice done without either. Builds from before the app sent `via` cannot tell an Amen from a
// tick, so their completions count as an Amen only on a day the install opened a prayer.
const prayer = `pd AS (SELECT install, day,
      COALESCE(MAX(name = 'screen' AND ${prop('route')} = '/pray/[practiceId]'), 0) AS opened,
      COALESCE(MAX(name = 'CompletionLogged' AND ${prop('via')} = 'amen'), 0) AS said,
      COALESCE(MAX(name = 'CompletionLogged' AND ${prop('via')} IS NULL), 0) AS unmarked
    FROM a WHERE day >= ?5 GROUP BY install, day),
    p AS (SELECT install, day, opened, (said OR (unmarked AND opened)) AS amen FROM pd)`

type Row = Record<string, unknown>
type Statements = Record<string, string>
type Dbs = { relay: D1Database; mass: D1Database }

async function read<S extends Statements>(
  db: D1Database,
  statements: S,
  params: unknown[],
): Promise<{ [K in keyof S]: Row[] }> {
  const names = Object.keys(statements) as (keyof S)[]
  const results = await db.batch<Row>(
    names.map((name) => db.prepare(statements[name] as string).bind(...params)),
  )
  return Object.fromEntries(names.map((name, i) => [name, results[i]?.results ?? []])) as {
    [K in keyof S]: Row[]
  }
}

export async function loadUsage<T extends UsageTab>(
  dbs: Dbs,
  tab: T,
  filter: UsageFilter,
): Promise<UsageOf[T]> {
  const latest = await dbs.relay
    .prepare('SELECT MAX(day) AS day FROM analytics')
    .first<{ day: string }>()
  const today = latest?.day ?? new Date().toISOString().slice(0, 10)
  const params = [
    filter.platform,
    filter.language,
    today,
    shift(today, -(filter.days - 1)),
    shift(today, -(2 * filter.days - 1)),
  ]
  const period = { today, filter }
  const loaders: { [K in UsageTab]: () => Promise<UsageOf[K]> } = {
    overview: () => overview(dbs.relay, params, period),
    onboarding: () => onboarding(dbs.relay, params, period),
    prayer: () => prayerTab(dbs.relay, params, period),
    mass: () => massTimes(dbs, params, period),
    cards: () => holyCards(dbs.relay, params, period),
    library: () => library(dbs.relay, params, period),
    search: () => search(dbs, params, period),
    features: () => features(dbs.relay, params, period, today),
  }
  return loaders[tab]() as Promise<UsageOf[T]>
}

type PeriodOf = { today: string; filter: UsageFilter }

const pulse = `${scoped}, ${prayer}
  SELECT
    (SELECT COUNT(DISTINCT install) FROM a WHERE day = ?3) AS today,
    (SELECT COUNT(DISTINCT install) FROM a WHERE day = date(?3, '-1 day')) AS yesterday,
    (SELECT COUNT(DISTINCT install) FROM a WHERE day >= ?4) AS period,
    (SELECT COUNT(DISTINCT install) FROM a WHERE day >= ?5 AND day < ?4) AS periodBefore,
    (SELECT COUNT(DISTINCT install) FROM p WHERE day >= ?4 AND opened) AS opened,
    (SELECT COUNT(DISTINCT install) FROM p WHERE day < ?4 AND opened) AS openedBefore,
    (SELECT COUNT(DISTINCT install) FROM p WHERE day >= ?4 AND amen) AS amen,
    (SELECT COUNT(DISTINCT install) FROM p WHERE day < ?4 AND amen) AS amenBefore,
    (SELECT COUNT(DISTINCT install) FROM a) AS ever`

async function overview(db: D1Database, params: unknown[], period: PeriodOf): Promise<Overview> {
  const rows = await read(
    db,
    {
      pulse,
      newcomers: `${scoped}, f AS (SELECT install, MIN(day) AS first FROM a GROUP BY install)
        SELECT SUM(first >= ?4) AS period, SUM(first >= ?5 AND first < ?4) AS before FROM f`,
      // Each day of the period: who was there, who was new, who opened a prayer, who said Amen.
      daily: `${scoped}, ${prayer},
        f AS (SELECT install, MIN(day) AS first FROM a GROUP BY install),
        d AS (SELECT DISTINCT day FROM a WHERE day >= ?4)
        SELECT d.day,
          (SELECT COUNT(DISTINCT install) FROM a WHERE a.day = d.day) AS active,
          (SELECT COUNT(*) FROM p WHERE p.day = d.day AND opened) AS opened,
          (SELECT COUNT(*) FROM p WHERE p.day = d.day AND amen) AS amen,
          (SELECT COUNT(*) FROM f WHERE first = d.day) AS new,
          (SELECT COUNT(*) FROM a WHERE a.day = d.day AND name = 'app_opened') AS opens
        FROM d ORDER BY d.day`,
      // Weekly cohorts by first day seen, and for each, how many came back in each week after.
      cohorts: `${scoped},
        f AS (SELECT install, MIN(day) AS first FROM a GROUP BY install)
        SELECT date(f.first, '-6 days', 'weekday 1') AS cohort,
          CAST((julianday(a.day) - julianday(f.first)) / 7 AS INTEGER) AS week,
          COUNT(DISTINCT a.install) AS installs
        FROM a JOIN f USING (install)
        WHERE f.first > date(?3, '-84 days')
        GROUP BY cohort, week ORDER BY cohort, week`,
      audience: `${scoped}, w AS (SELECT * FROM a WHERE day >= ?4)
        SELECT 'platform' AS facet, platform AS value, COUNT(DISTINCT install) AS installs
          FROM w GROUP BY 2
        UNION ALL SELECT 'language', language, COUNT(DISTINCT install) FROM w GROUP BY 2
        UNION ALL SELECT 'version', version, COUNT(DISTINCT install) FROM w GROUP BY 2
        UNION ALL SELECT 'update', COALESCE(build, 'not sent'), COUNT(DISTINCT install)
          FROM w GROUP BY 2`,
    },
    params,
  )
  return {
    ...period,
    pulse: rows.pulse[0] as Pulse,
    newcomers: rows.newcomers[0] as Overview['newcomers'],
    daily: rows.daily as Overview['daily'],
    cohorts: rows.cohorts as Overview['cohorts'],
    audience: rows.audience as Overview['audience'],
  }
}

async function onboarding(
  db: D1Database,
  params: unknown[],
  period: PeriodOf,
): Promise<Onboarding> {
  // An install's onboarding: the day it began, and the reason it gave, or that it skipped.
  const began = `o AS (SELECT install, MIN(day) AS d,
      COALESCE(
        MAX(CASE WHEN name = 'onboarding_reason' THEN ${prop('reason')} END),
        CASE WHEN MAX(name = 'onboarding_done' AND ${prop('path')} = 'skip') THEN 'skipped' END,
        'left at the start') AS reason
    FROM a WHERE day >= ?4 AND (name IN ('onboarding_reason', 'onboarding_done')
      OR (name = 'screen' AND ${prop('route')} = '/onboarding'))
    GROUP BY install)`
  const rows = await read(
    db,
    {
      funnel: `${scoped}, s AS (SELECT * FROM a WHERE day >= ?4)
        SELECT
          COUNT(DISTINCT CASE WHEN name = 'screen' AND ${prop('route')} = '/onboarding'
            THEN install END) AS started,
          COUNT(DISTINCT CASE WHEN name = 'onboarding_reason' THEN install END) AS reasoned,
          COUNT(DISTINCT CASE WHEN name = 'screen' AND ${prop('route')} = '/onboarding/reminders'
            THEN install END) AS reminders,
          COUNT(DISTINCT CASE WHEN name = 'onboarding_done' AND ${prop('path')} IS NULL
            THEN install END) AS finished,
          COUNT(DISTINCT CASE WHEN name = 'onboarding_done' AND ${prop('path')} = 'skip'
            THEN install END) AS skipped
        FROM s`,
      steps: `${scoped}
        SELECT ${prop('route')} AS route, COUNT(DISTINCT install) AS installs FROM a
        WHERE day >= ?4 AND name = 'screen' AND ${prop('route')} LIKE '/onboarding%'
        GROUP BY 1 ORDER BY installs DESC`,
      reasons: `${scoped}, ${began}
        SELECT reason, COUNT(*) AS installs,
          SUM(EXISTS (SELECT 1 FROM a x WHERE x.install = o.install AND x.name = 'onboarding_done'
            AND json_extract(x.props, '$.path') IS NULL)) AS finished,
          SUM(EXISTS (SELECT 1 FROM a x WHERE x.install = o.install
            AND x.name = 'onboarding_reminders'
            AND json_extract(x.props, '$.reminders') = 'on')) AS remindersOn,
          SUM(julianday(?3) - julianday(o.d) >= 7) AS judged,
          SUM(julianday(?3) - julianday(o.d) >= 7 AND EXISTS (SELECT 1 FROM a x
            WHERE x.install = o.install AND x.day > o.d AND x.day <= date(o.d, '+7 days')))
            AS returned,
          SUM(julianday(?3) - julianday(o.d) >= 7 AND EXISTS (SELECT 1 FROM a x
            WHERE x.install = o.install AND x.name = 'CompletionLogged'
            AND x.day >= o.d AND x.day <= date(o.d, '+7 days'))) AS prayed,
          SUM(julianday(?3) - julianday(o.d) >= 7 AND EXISTS (SELECT 1 FROM a x
            WHERE x.install = o.install AND x.name = 'CompletionLogged'
            AND json_extract(x.props, '$.via') = 'amen'
            AND x.day >= o.d AND x.day <= date(o.d, '+7 days'))) AS amen
        FROM o GROUP BY reason ORDER BY installs DESC`,
      daily: `${scoped}
        SELECT day,
          COUNT(DISTINCT CASE WHEN name = 'screen' THEN install END) AS started,
          COUNT(DISTINCT CASE WHEN name = 'onboarding_done' AND ${prop('path')} IS NULL
            THEN install END) AS finished
        FROM a WHERE day >= ?4 AND ((name = 'screen' AND ${prop('route')} = '/onboarding')
          OR name = 'onboarding_done')
        GROUP BY day ORDER BY day`,
    },
    params,
  )
  return {
    ...period,
    funnel: rows.funnel[0] as Onboarding['funnel'],
    steps: rows.steps as Onboarding['steps'],
    reasons: rows.reasons as Onboarding['reasons'],
    daily: rows.daily as Onboarding['daily'],
  }
}

// The day's prayers a prayed day is made of (packages/holy-cards, acts.ts).
const offering = `'practice/morning-offering'`
const midday = `'practice/angelus', 'practice/regina-caeli', 'practice/daily-liturgy'`
const examen = `'practice/examination-of-conscience'`

async function prayerTab(db: D1Database, params: unknown[], period: PeriodOf): Promise<Prayer> {
  const marked = `c AS (SELECT install, day,
      MAX(id = ${offering}) AS o, MAX(id IN (${midday})) AS m, MAX(id = ${examen}) AS e,
      MAX(id = 'practice/rosary') AS r
    FROM (SELECT install, day, ${prop('id')} AS id FROM a
      WHERE name = 'CompletionLogged' AND day >= ?4)
    GROUP BY install, day)`
  const rows = await read(
    db,
    {
      pulse,
      // Of the installs seen in the period, on how many of its days each opened a prayer, and on
      // how many each said Amen.
      habit: `${scoped}, ${prayer},
        seen AS (SELECT DISTINCT install FROM a WHERE day >= ?4),
        c AS (SELECT install, SUM(opened) AS opened, SUM(amen) AS amen FROM p
          WHERE day >= ?4 GROUP BY install)
        SELECT 'opened' AS what, COALESCE(c.opened, 0) AS days, COUNT(*) AS installs
          FROM seen LEFT JOIN c USING (install) GROUP BY 2
        UNION ALL SELECT 'amen', COALESCE(c.amen, 0), COUNT(*)
          FROM seen LEFT JOIN c USING (install) GROUP BY 2`,
      // Where an opened prayer stops short of its Amen: by the day, and by the install.
      unfinished: `${scoped}, ${prayer}
        SELECT COALESCE(SUM(opened), 0) AS openedDays,
          COALESCE(SUM(opened AND amen), 0) AS amenDays,
          (SELECT COUNT(*) FROM (SELECT install FROM p WHERE day >= ?4 GROUP BY install
            HAVING MAX(opened) = 1 AND MAX(amen) = 0)) AS neverAmen
        FROM p WHERE day >= ?4`,
      // One pass over the counts that name a practice: finished in the period, finished in the
      // one before, and opened on the prayer's own screen.
      practices: `${scoped},
        p AS (SELECT install, day, name, ${prop('id')} AS id FROM a
          WHERE day >= ?5 AND props LIKE '%"practice/%'
            AND (name = 'CompletionLogged' OR ${prop('route')} = '/pray/[practiceId]'))
        SELECT id,
          SUM(name = 'CompletionLogged' AND day >= ?4) AS times,
          COUNT(DISTINCT CASE WHEN name = 'CompletionLogged' AND day >= ?4 THEN install END)
            AS installs,
          COUNT(DISTINCT CASE WHEN name = 'CompletionLogged' AND day < ?4 THEN install END)
            AS before,
          COUNT(DISTINCT CASE WHEN name = 'screen' AND day >= ?4 THEN install END) AS opened
        FROM p GROUP BY 1 HAVING installs > 0
        ORDER BY installs DESC, times DESC LIMIT 30`,
      // When people pray, by weekday (0 is Sunday) and the hour on their own clock.
      hours: `${scoped}
        SELECT CAST(strftime('%w', day) AS INTEGER) AS weekday, hour, COUNT(*) AS times
        FROM a WHERE name = 'CompletionLogged' AND hour IS NOT NULL AND day >= ?4
        GROUP BY 1, 2`,
      arc: `${scoped}, ${marked}
        SELECT o + m + e AS stations, r AS rosary, COUNT(*) AS days,
          COUNT(DISTINCT install) AS installs
        FROM c GROUP BY 1, 2`,
      stations: `${scoped}, ${marked}
        SELECT COUNT(DISTINCT CASE WHEN o THEN install END) AS offering,
          COUNT(DISTINCT CASE WHEN m THEN install END) AS midday,
          COUNT(DISTINCT CASE WHEN e THEN install END) AS examen
        FROM c`,
      // A reminder tapped, and whether that practice was marked the same day.
      reminders: `${scoped},
        r AS (SELECT install, day, ${prop('id')} AS id FROM a
          WHERE name = 'reminder_opened' AND day >= ?4)
        SELECT COALESCE(r.id, 'not named') AS id, COUNT(DISTINCT r.install) AS installs,
          COUNT(*) AS times,
          SUM(EXISTS (SELECT 1 FROM a x WHERE x.install = r.install AND x.day = r.day
            AND x.name = 'CompletionLogged' AND json_extract(x.props, '$.id') = r.id)) AS prayed
        FROM r GROUP BY 1 ORDER BY installs DESC LIMIT 20`,
    },
    params,
  )
  return {
    ...period,
    pulse: rows.pulse[0] as Pulse,
    habit: rows.habit as Prayer['habit'],
    unfinished: rows.unfinished[0] as Prayer['unfinished'],
    practices: rows.practices as Prayer['practices'],
    hours: rows.hours as Prayer['hours'],
    arc: rows.arc as Prayer['arc'],
    stations: rows.stations[0] as Prayer['stations'],
    reminders: rows.reminders as Prayer['reminders'],
  }
}

type ChurchRow = {
  id: string
  name: string
  city: string | null
  region: string | null
  scheduled: number | null
  services: number | null
  verified: string | null
}

// The churches the counts name, from the Mass-times database. Ids go in as one JSON array: D1
// binds at most a hundred values to a statement.
async function churchesNamed(db: D1Database, ids: string[]): Promise<Map<string, ChurchRow>> {
  if (ids.length === 0) return new Map()
  const { results } = await db
    .prepare(
      `SELECT id, name, city, region, has_structured_schedule AS scheduled,
        json_array_length(COALESCE(services, '[]')) AS services, last_verified_at AS verified
      FROM church WHERE id IN (SELECT value FROM json_each(?1))`,
    )
    .bind(JSON.stringify(ids))
    .all<ChurchRow>()
  return new Map(results.map((r) => [r.id, r]))
}

// Brazil's states by name, so a region given in full reads as its two letters.
const states: Record<string, string> = {
  acre: 'AC',
  alagoas: 'AL',
  amapa: 'AP',
  amazonas: 'AM',
  bahia: 'BA',
  ceara: 'CE',
  'distrito federal': 'DF',
  'espirito santo': 'ES',
  goias: 'GO',
  maranhao: 'MA',
  'mato grosso': 'MT',
  'mato grosso do sul': 'MS',
  'minas gerais': 'MG',
  para: 'PA',
  paraiba: 'PB',
  parana: 'PR',
  pernambuco: 'PE',
  piaui: 'PI',
  'rio de janeiro': 'RJ',
  'rio grande do norte': 'RN',
  'rio grande do sul': 'RS',
  rondonia: 'RO',
  roraima: 'RR',
  'santa catarina': 'SC',
  'sao paulo': 'SP',
  sergipe: 'SE',
  tocantins: 'TO',
}
const folded = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

// A city's name with its state written after it, every way the imports write one: "Natal/RN",
// "Belém-PA 66033-265", "São Paulo -SP", "Fortaleza/Ceará", "Chorozinho Ceará".
function stateAfter(name: string): [string, string | undefined] {
  const plain = name.replace(/\s*\d{5}-?\d{3}$/, '').trim()
  const code = plain.match(/^(.*?)\s*[-/\s]\s*([A-Z]{2})$/)
  if (code?.[1]) return [code[1], code[2]]
  const tail = folded(plain)
  for (const [full, code] of Object.entries(states)) {
    if (tail !== full && /[\s/-]$/.test(tail.slice(0, -full.length)) && tail.endsWith(full))
      return [plain.slice(0, plain.length - full.length).replace(/[\s/-]+$/, ''), code]
  }
  return [plain, undefined]
}

// Imported places are written many ways: "Natal/RN", "X | Rio Grande do Sul", a region of
// "SP, 05625-170" or "Minas Gerais". One city is one row, so each is read down to the city and
// its state's two letters, or no state where none is written.
function place(city: string, region: string | null): { city: string; region: string } {
  const [head = city, ...rest] = city.split('|').map((part) => part.trim())
  const [bare, suffix] = stateAfter(head)
  const parts = [...(region ?? '').split(/[,|]/), ...rest].map((part) => part.trim())
  const state =
    parts.find((part) => /^[A-Z]{2}$/.test(part)) ??
    parts.map((part) => states[folded(part)]).find(Boolean) ??
    suffix ??
    ''
  return { city: bare, region: state }
}

// The city a geohash cell lies in: the one most of its churches name. A cell with none of its
// own is named from the wider cell around it.
async function citiesOf(
  db: D1Database,
  cells: string[],
): Promise<Map<string, { city: string; region: string }>> {
  if (cells.length === 0) return new Map()
  const named = new Map<string, { city: string; region: string }>()
  for (const length of [5, 4, 3]) {
    const left = cells.filter((cell) => !named.has(cell))
    if (left.length === 0) break
    const prefixes = [...new Set(left.map((cell) => cell.slice(0, length)))]
    const { results } = await db
      .prepare(
        `WITH p AS (SELECT value AS cell FROM json_each(?1)),
        c AS (SELECT p.cell, church.city, church.region, COUNT(*) AS n FROM p
          JOIN church ON church.geohash >= p.cell AND church.geohash < p.cell || '~'
          WHERE church.city IS NOT NULL GROUP BY 1, 2, 3)
        SELECT cell, city, region FROM c
        WHERE n = (SELECT MAX(n) FROM c AS d WHERE d.cell = c.cell)`,
      )
      .bind(JSON.stringify(prefixes))
      .all<{ cell: string; city: string; region: string | null }>()
    const byPrefix = new Map(results.map((r) => [r.cell, r]))
    for (const cell of left) {
      const hit = byPrefix.get(cell.slice(0, length))
      if (hit) named.set(cell, place(hit.city, hit.region))
    }
  }
  return named
}

async function massTimes(
  { relay, mass }: Dbs,
  params: unknown[],
  period: PeriodOf,
): Promise<MassTimes> {
  const churchEvents = `'church_opened', 'CheckInLogged', 'ChurchFavorited', 'church_action'`
  const rows = await read(
    relay,
    {
      totals: `${scoped}, s AS (SELECT * FROM a WHERE day >= ?4)
        SELECT
          COUNT(DISTINCT CASE WHEN name = 'screen' AND ${prop('route')} = '/mass-times'
            THEN install END) AS visitors,
          SUM(name = 'church_opened') AS opened,
          COUNT(DISTINCT CASE WHEN name = 'church_opened' THEN install END) AS openers,
          SUM(name = 'CheckInLogged') AS checkins,
          COUNT(DISTINCT CASE WHEN name = 'CheckInLogged' THEN install END) AS checkers,
          SUM(name = 'ChurchFavorited') AS favorites,
          SUM(name = 'church_verified') AS verified,
          SUM(name = 'church_correction') AS corrections
        FROM s`,
      daily: `${scoped}
        SELECT day,
          COUNT(DISTINCT CASE WHEN name = 'screen' THEN install END) AS visitors,
          SUM(name = 'CheckInLogged') AS checkins
        FROM a WHERE day >= ?4 AND ((name = 'screen' AND ${prop('route')} = '/mass-times')
          OR name = 'CheckInLogged')
        GROUP BY day ORDER BY day`,
      // Each install's look at each cell, summed into cities once the cells are named.
      looks: `${scoped}
        SELECT ${prop('cell')} AS cell, install, COUNT(*) AS views,
          SUM(${prop('here')} = '1') AS here, SUM(${prop('churches')} = '0') AS empty
        FROM a WHERE name = 'mass_area' AND day >= ?4 GROUP BY 1, 2`,
      churches: `${scoped}
        SELECT ${prop('church')} AS id,
          COUNT(DISTINCT CASE WHEN name = 'church_opened' THEN install END) AS openers,
          SUM(name = 'church_opened') AS opens,
          COUNT(DISTINCT CASE WHEN name = 'CheckInLogged' THEN install END) AS checkers,
          SUM(name = 'CheckInLogged') AS checkins,
          SUM(name = 'ChurchFavorited') AS favorites,
          SUM(name = 'church_action' AND ${prop('action')} = 'directions') AS directions,
          SUM(name = 'church_action' AND ${prop('action')} != 'directions') AS contact
        FROM a WHERE day >= ?4 AND name IN (${churchEvents}) AND ${prop('church')} IS NOT NULL
        GROUP BY 1 ORDER BY openers DESC, checkins DESC LIMIT 200`,
      from: `${scoped}
        SELECT ${prop('from')} AS "from", COUNT(*) AS times FROM a
        WHERE name = 'church_opened' AND day >= ?4 GROUP BY 1 ORDER BY times DESC`,
      kinds: `${scoped}
        SELECT COALESCE(${prop('kind')}, 'not named') AS kind, COUNT(*) AS times,
          COUNT(DISTINCT install) AS installs
        FROM a WHERE name = 'CheckInLogged' AND day >= ?4 GROUP BY 1 ORDER BY times DESC`,
      asked: `${scoped}
        SELECT ${prop('intent')} AS intent, ${prop('when')} AS "when", COUNT(*) AS times FROM a
        WHERE name = 'mass_area' AND day >= ?4 GROUP BY 1, 2 ORDER BY times DESC`,
    },
    params,
  )

  const looks = rows.looks as {
    cell: string
    install: string
    views: number
    here: number
    empty: number
  }[]
  const cities = await citiesOf(mass, [...new Set(looks.map((l) => l.cell))])
  const places = new Map<string, Place & { seen: Set<string> }>()
  for (const look of looks) {
    const where = cities.get(look.cell) ?? { city: `cell ${look.cell}`, region: '' }
    const key = `${where.city}|${where.region}`
    const place = places.get(key) ?? {
      ...where,
      installs: 0,
      views: 0,
      here: 0,
      empty: 0,
      seen: new Set<string>(),
    }
    place.seen.add(look.install)
    place.views += look.views
    place.here += look.here
    place.empty += look.empty
    places.set(key, place)
  }
  // A city whose state some churches leave out joins the one row that names it.
  for (const [key, place] of places) {
    if (place.region) continue
    const named = [...places.values()].filter((p) => p.city === place.city && p.region)
    if (named.length !== 1 || !named[0]) continue
    for (const install of place.seen) named[0].seen.add(install)
    named[0].views += place.views
    named[0].here += place.here
    named[0].empty += place.empty
    places.delete(key)
  }

  const used = rows.churches as Omit<ChurchUse, 'name'>[]
  const named = await churchesNamed(
    mass,
    used.map((c) => c.id),
  )
  return {
    ...period,
    totals: rows.totals[0] as MassTimes['totals'],
    daily: rows.daily as MassTimes['daily'],
    places: [...places.values()]
      .map(({ seen, ...place }) => ({ ...place, installs: seen.size }))
      .sort((a, b) => b.installs - a.installs || b.views - a.views),
    churches: used.map((c) => {
      const church = named.get(c.id)
      if (!church) return c
      return {
        ...c,
        name: church.name,
        city: church.city ?? undefined,
        region: church.region ?? undefined,
        scheduled: church.scheduled === 1,
        services: church.services ?? 0,
        verified: church.verified ?? undefined,
      }
    }),
    from: rows.from as MassTimes['from'],
    kinds: rows.kinds as MassTimes['kinds'],
    asked: rows.asked as MassTimes['asked'],
  }
}

async function holyCards(db: D1Database, params: unknown[], period: PeriodOf): Promise<HolyCards> {
  // Each install's day with a card: offered, won and waiting, opened.
  const days = `d AS (SELECT install, day,
      MAX(name = 'card_offer') AS offered,
      MAX(name = 'card_offer' AND ${prop('won')} = '1') AS won,
      MAX(name = 'HolyCardRedeemed') AS redeemed
    FROM a WHERE day >= ?4 AND name IN ('card_offer', 'HolyCardRedeemed') GROUP BY install, day)`
  const rows = await read(
    db,
    {
      totals: `${scoped}, ${days}
        SELECT COUNT(DISTINCT CASE WHEN redeemed THEN install END) AS collectors,
          (SELECT COUNT(*) FROM a WHERE name = 'HolyCardRedeemed' AND day >= ?4) AS redeemed,
          SUM(offered) AS offerDays, SUM(won) AS wonDays, SUM(redeemed) AS openedDays
        FROM d`,
      daily: `${scoped}, ${days}
        SELECT day, SUM(offered) AS offered, SUM(won) AS won, SUM(redeemed) AS redeemed
        FROM d GROUP BY day ORDER BY day`,
      doors: `${scoped}
        SELECT COALESCE(${prop('door')}, 'not named') AS door, COUNT(DISTINCT install) AS installs,
          COUNT(*) AS times
        FROM a WHERE name = 'HolyCardRedeemed' AND day >= ?4 GROUP BY 1 ORDER BY times DESC`,
      saints: `${scoped}
        SELECT ${prop('card')} AS card, SUM(name = 'HolyCardRedeemed') AS redeemed,
          COUNT(DISTINCT CASE WHEN name = 'screen' THEN install END) AS viewers
        FROM a WHERE day >= ?4 AND ${prop('card')} IS NOT NULL
          AND (name = 'HolyCardRedeemed' OR ${prop('route')} = '/saints/[index]')
        GROUP BY 1 ORDER BY redeemed DESC, viewers DESC LIMIT 25`,
      held: `${scoped}
        SELECT cards, COUNT(*) AS installs FROM (SELECT install, COUNT(*) AS cards FROM a
          WHERE name = 'HolyCardRedeemed' GROUP BY install)
        GROUP BY cards ORDER BY cards`,
    },
    params,
  )
  return {
    ...period,
    totals: rows.totals[0] as HolyCards['totals'],
    daily: rows.daily as HolyCards['daily'],
    doors: rows.doors as HolyCards['doors'],
    saints: rows.saints as HolyCards['saints'],
    held: rows.held as HolyCards['held'],
  }
}

async function library(db: D1Database, params: unknown[], period: PeriodOf): Promise<Library> {
  const rows = await read(
    db,
    {
      books: `${scoped}
        SELECT ${prop('id')} AS id, COUNT(DISTINCT install) AS installs,
          COUNT(DISTINCT install || day) AS sittings,
          COALESCE(SUM(CAST(${prop('minutes')} AS INTEGER)), 0) AS minutes
        FROM a WHERE name = 'ReadingLogged' AND day >= ?4 AND ${prop('id')} IS NOT NULL
        GROUP BY 1 ORDER BY installs DESC, minutes DESC LIMIT 25`,
      // How far into each book its readers get: chapters stayed in, per reader.
      reach: `${scoped},
        r AS (SELECT ${prop('id')} AS id, install, COUNT(DISTINCT ${prop('chapter')}) AS n
          FROM a WHERE name = 'book_chapter' AND day >= ?4 GROUP BY 1, 2)
        SELECT id, COUNT(*) AS readers, SUM(n) AS chapters,
          ROUND(AVG(n), 1) AS average, MAX(n) AS most, SUM(n >= 5) AS far
        FROM r GROUP BY id ORDER BY readers DESC, chapters DESC LIMIT 25`,
      bible: `${scoped}
        SELECT ${prop('book')} AS book, COUNT(DISTINCT install) AS installs,
          COUNT(*) AS chapters
        FROM a WHERE name = 'bible_chapter' AND day >= ?4 GROUP BY 1
        ORDER BY installs DESC, chapters DESC LIMIT 20`,
      bibleTotals: `${scoped}
        SELECT COUNT(DISTINCT install) AS installs, COUNT(*) AS chapters FROM a
        WHERE name = 'bible_chapter' AND day >= ?4`,
      saved: `${scoped}
        SELECT COALESCE(${prop('kind')}, 'not named') AS kind,
          COUNT(DISTINCT install) AS installs, COUNT(*) AS times
        FROM a WHERE name = 'ItemSaved' AND day >= ?4 GROUP BY 1 ORDER BY times DESC`,
      savedItems: `${scoped}
        SELECT ${prop('id')} AS id, COUNT(DISTINCT install) AS installs, COUNT(*) AS times FROM a
        WHERE name = 'ItemSaved' AND day >= ?4 AND ${prop('id')} IS NOT NULL
        GROUP BY 1 ORDER BY installs DESC LIMIT 20`,
      collections: `${scoped}, s AS (SELECT * FROM a WHERE day >= ?4)
        SELECT SUM(name = 'CollectionCreated') AS made,
          COUNT(DISTINCT CASE WHEN name = 'CollectionCreated' THEN install END) AS makers,
          SUM(name = 'CollectionItemAdded') AS added,
          COUNT(DISTINCT CASE WHEN name = 'CollectionItemAdded' THEN install END) AS adders
        FROM s`,
      collected: `${scoped}
        SELECT ${prop('id')} AS id, COUNT(DISTINCT install) AS installs, COUNT(*) AS times FROM a
        WHERE name = 'CollectionItemAdded' AND day >= ?4 AND ${prop('id')} IS NOT NULL
        GROUP BY 1 ORDER BY installs DESC LIMIT 20`,
    },
    params,
  )
  return {
    ...period,
    books: rows.books as Library['books'],
    reach: rows.reach as Library['reach'],
    bible: rows.bible as Library['bible'],
    bibleTotals: rows.bibleTotals[0] as Library['bibleTotals'],
    saved: rows.saved as Library['saved'],
    savedItems: rows.savedItems as Library['savedItems'],
    collections: rows.collections[0] as Library['collections'],
    collected: rows.collected as Library['collected'],
  }
}

function searchStatements(scope: 'corpus' | 'churches'): Statements {
  const s = `s AS (SELECT install, ${prop('q')} AS q, CAST(${prop('results')} AS INTEGER) AS results,
      ${prop('opened')} AS opened, CAST(${prop('at')} AS INTEGER) AS at
    FROM a WHERE name = 'search' AND day >= ?4 AND ${prop('scope')} = '${scope}')`
  return {
    [`${scope}Totals`]: `${scoped}, ${s}
      SELECT COUNT(*) AS searches, COUNT(DISTINCT install) AS installs,
        COALESCE(SUM(opened IS NOT NULL), 0) AS opened, COALESCE(SUM(results = 0), 0) AS empty
      FROM s`,
    [`${scope}Queries`]: `${scoped}, ${s}
      SELECT q, COUNT(DISTINCT install) AS installs, COUNT(*) AS times,
        ROUND(AVG(results)) AS results, SUM(opened IS NOT NULL) AS opened
      FROM s WHERE results > 0 GROUP BY q ORDER BY installs DESC, times DESC LIMIT 30`,
    [`${scope}Empty`]: `${scoped}, ${s}
      SELECT q, COUNT(DISTINCT install) AS installs, COUNT(*) AS times
      FROM s WHERE results = 0 GROUP BY q ORDER BY installs DESC, times DESC LIMIT 30`,
    [`${scope}Opened`]: `${scoped}, ${s}
      SELECT opened AS id, COUNT(*) AS times, COUNT(DISTINCT install) AS installs,
        ROUND(AVG(at), 1) AS at
      FROM s WHERE opened IS NOT NULL GROUP BY 1 ORDER BY installs DESC LIMIT 20`,
    [`${scope}Positions`]: `${scoped}, ${s}
      SELECT MIN(at, 11) AS at, COUNT(*) AS times FROM s WHERE opened IS NOT NULL
      GROUP BY 1 ORDER BY 1`,
  }
}

async function search({ relay, mass }: Dbs, params: unknown[], period: PeriodOf): Promise<Search> {
  const rows = await read(
    relay,
    { ...searchStatements('corpus'), ...searchStatements('churches') },
    params,
  )
  const scope = (name: 'corpus' | 'churches'): SearchScope => ({
    totals: rows[`${name}Totals`]?.[0] as SearchScope['totals'],
    queries: rows[`${name}Queries`] as SearchScope['queries'],
    empty: rows[`${name}Empty`] as SearchScope['empty'],
    opened: rows[`${name}Opened`] as SearchScope['opened'],
    positions: rows[`${name}Positions`] as SearchScope['positions'],
  })
  const churches = scope('churches')
  const named = await churchesNamed(
    mass,
    churches.opened.map((o) => o.id),
  )
  return {
    ...period,
    corpus: scope('corpus'),
    churches,
    names: Object.fromEntries([...named].map(([id, c]) => [id, c.name])),
  }
}

async function features(
  db: D1Database,
  params: unknown[],
  period: PeriodOf,
  today: string,
): Promise<Features> {
  const rows = await read(
    db,
    {
      screens: `${scoped}
        SELECT ${prop('route')} AS route, COUNT(*) AS views, COUNT(DISTINCT install) AS installs
        FROM a WHERE name = 'screen' AND day >= ?4 GROUP BY route
        ORDER BY installs DESC LIMIT 40`,
      actions: `${scoped}
        SELECT name, COUNT(*) AS times, COUNT(DISTINCT install) AS installs
        FROM a WHERE name NOT IN ('screen', 'app_opened') AND day >= ?4
        GROUP BY name ORDER BY installs DESC, times DESC`,
      // Each install's latest choice for each preference it set in the period.
      preferences: `${scoped},
        l AS (SELECT install, ${prop('key')} AS key, ${prop('value')} AS value,
          ROW_NUMBER() OVER (PARTITION BY install, ${prop('key')} ORDER BY day DESC, id DESC) AS n
          FROM a WHERE name = 'PreferenceSet' AND day >= ?4 AND ${prop('key')} IS NOT NULL)
        SELECT key, value, COUNT(*) AS installs FROM l WHERE n = 1
        GROUP BY 1, 2 ORDER BY key, installs DESC`,
      shared: `${scoped}
        SELECT COALESCE(${prop('id')}, 'not named') AS id, COUNT(DISTINCT install) AS installs,
          COUNT(*) AS times
        FROM a WHERE name = 'shared' AND day >= ?4 GROUP BY 1 ORDER BY installs DESC LIMIT 20`,
      appStore: `${scoped}
        SELECT ${prop('action')} AS action, COUNT(DISTINCT install) AS installs, COUNT(*) AS times
        FROM a WHERE name = 'app_store_sheet' AND day >= ?4 GROUP BY 1`,
    },
    params,
  )
  return {
    ...period,
    screens: rows.screens as Features['screens'],
    actions: rows.actions as Features['actions'],
    preferences: rows.preferences as Features['preferences'],
    shared: rows.shared as Features['shared'],
    appStore: rows.appStore as Features['appStore'],
    accounts: await loadAccounts(db, today),
  }
}

// Accounts, only ever summed. The tables are the relay's; each sum skips deleted accounts.
async function loadAccounts(db: D1Database, today: string): Promise<Features['accounts']> {
  const [totals, devices, weekly] = await db.batch<Row>([
    db
      .prepare(
        `SELECT COUNT(*) AS accounts,
        SUM(email IS NOT NULL OR phone IS NOT NULL) AS reachable,
        SUM(news = 1) AS news,
        SUM(recovery IS NOT NULL) AS recovery,
        (SELECT COUNT(*) FROM accounts WHERE deleted_at IS NOT NULL) AS deleted,
        (SELECT COUNT(DISTINCT account) FROM devices WHERE removed_at IS NULL
          AND seen_at > ?1) AS activeWeek
      FROM accounts WHERE deleted_at IS NULL`,
      )
      .bind(Date.parse(today) - 7 * 86_400_000),
    db.prepare(
      `SELECT n AS devices, COUNT(*) AS accounts FROM (
        SELECT COUNT(*) AS n FROM devices JOIN accounts ON accounts.id = devices.account
        WHERE devices.removed_at IS NULL AND accounts.deleted_at IS NULL GROUP BY account
      ) GROUP BY n ORDER BY n`,
    ),
    db.prepare(
      `SELECT date(created_at / 1000, 'unixepoch', '-6 days', 'weekday 1') AS week,
        COUNT(*) AS created, SUM(deleted_at IS NOT NULL) AS deleted
      FROM accounts GROUP BY week ORDER BY week DESC LIMIT 12`,
    ),
  ])
  return {
    ...(totals?.results[0] as Omit<Features['accounts'], 'devices' | 'weekly'>),
    devices: (devices?.results ?? []) as Features['accounts']['devices'],
    weekly: ((weekly?.results ?? []) as Features['accounts']['weekly']).reverse(),
  }
}

function shift(day: string, by: number): string {
  const date = new Date(`${day}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + by)
  return date.toISOString().slice(0, 10)
}
