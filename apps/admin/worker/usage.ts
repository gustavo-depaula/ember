import type { Usage, UsageFilter } from './types'

// The usage desk, read from the relay's own database: the `analytics` counts the app sends, and
// for accounts, only sums over the account tables (nothing here reads an account's details).
//
// An install is the unit throughout. `day` and `hour` are the device's own, so a habit reads in
// its owner's time; "today" is the latest day any install has reached.

// The actions that mean someone prayed.
const prayed = "('CompletionLogged', 'CompletionsBatchLogged')"

type Row = Record<string, unknown>

export async function loadUsage(db: D1Database, filter: UsageFilter): Promise<Usage> {
  const latest = await db.prepare('SELECT MAX(day) AS day FROM analytics').first<{ day: string }>()
  const today = latest?.day ?? new Date().toISOString().slice(0, 10)
  const days = filter.days

  // Every statement reads `a`, the counts the filter keeps. ?1 platform, ?2 language, ?3 today,
  // ?4 the first day of the period, ?5 the first day of the period before it. D1 refuses a
  // binding its statement never names, so `bounds` names all five for the statements that don't.
  const scoped = `WITH bounds AS (SELECT ?3, ?4, ?5),
    a AS (SELECT * FROM analytics WHERE (?1 = '' OR platform = ?1) AND (?2 = '' OR language = ?2))`
  const params = [
    filter.platform,
    filter.language,
    today,
    shift(today, -(days - 1)),
    shift(today, -(2 * days - 1)),
  ]
  const statements = {
    pulse: `${scoped}
      SELECT
        COUNT(DISTINCT CASE WHEN day = ?3 THEN install END) AS today,
        COUNT(DISTINCT CASE WHEN day = date(?3, '-1 day') THEN install END) AS yesterday,
        COUNT(DISTINCT CASE WHEN day > date(?3, '-7 days') THEN install END) AS week,
        COUNT(DISTINCT CASE WHEN day > date(?3, '-14 days') AND day <= date(?3, '-7 days')
          THEN install END) AS weekBefore,
        COUNT(DISTINCT CASE WHEN day > date(?3, '-28 days') THEN install END) AS month,
        COUNT(DISTINCT CASE WHEN day > date(?3, '-56 days') AND day <= date(?3, '-28 days')
          THEN install END) AS monthBefore,
        COUNT(DISTINCT CASE WHEN day > date(?3, '-7 days') AND name IN ${prayed}
          THEN install END) AS prayingWeek,
        COUNT(DISTINCT CASE WHEN day > date(?3, '-14 days') AND day <= date(?3, '-7 days')
          AND name IN ${prayed} THEN install END) AS prayingWeekBefore,
        COUNT(DISTINCT install) AS ever
      FROM a`,
    newcomers: `${scoped}, f AS (SELECT install, MIN(day) AS first FROM a GROUP BY install)
      SELECT SUM(first >= ?4) AS period, SUM(first >= ?5 AND first < ?4) AS before FROM f`,
    // Each day of the period: who was there, who was new, who prayed, and who had been there
    // in the seven days up to it.
    daily: `${scoped},
      f AS (SELECT install, MIN(day) AS first FROM a GROUP BY install),
      d AS (SELECT DISTINCT day FROM a WHERE day >= ?4)
      SELECT d.day,
        (SELECT COUNT(DISTINCT install) FROM a WHERE a.day = d.day) AS active,
        (SELECT COUNT(DISTINCT install) FROM a WHERE a.day = d.day AND name IN ${prayed})
          AS praying,
        (SELECT COUNT(*) FROM f WHERE first = d.day) AS new,
        (SELECT COUNT(DISTINCT install) FROM a
          WHERE a.day > date(d.day, '-7 days') AND a.day <= d.day) AS week,
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
    // Of the installs seen in the last 28 days, on how many of those days each prayed.
    habit: `${scoped},
      seen AS (SELECT DISTINCT install FROM a WHERE day > date(?3, '-28 days')),
      p AS (SELECT install, COUNT(DISTINCT day) AS days FROM a
        WHERE day > date(?3, '-28 days') AND name IN ${prayed} GROUP BY install)
      SELECT COALESCE(p.days, 0) AS days, COUNT(*) AS installs
      FROM seen LEFT JOIN p USING (install) GROUP BY 1 ORDER BY 1`,
    // One pass over the counts that name a practice: finished in the period, finished in the one
    // before, and opened on the prayer's own screen.
    practices: `${scoped},
      p AS (SELECT install, day, name, json_extract(props, '$.id') AS id FROM a
        WHERE day >= ?5 AND props LIKE '%"practice/%'
          AND (name = 'CompletionLogged' OR json_extract(props, '$.route') = '/pray/[practiceId]'))
      SELECT id,
        SUM(name = 'CompletionLogged' AND day >= ?4) AS times,
        COUNT(DISTINCT CASE WHEN name = 'CompletionLogged' AND day >= ?4 THEN install END)
          AS installs,
        COUNT(DISTINCT CASE WHEN name = 'CompletionLogged' AND day < ?4 THEN install END)
          AS before,
        COUNT(DISTINCT CASE WHEN name = 'screen' AND day >= ?4 THEN install END) AS opened
      FROM p GROUP BY 1 HAVING installs > 0
      ORDER BY installs DESC, times DESC LIMIT 30`,
    books: `${scoped}
      SELECT json_extract(props, '$.id') AS id, COUNT(DISTINCT install) AS installs,
        COUNT(DISTINCT install || day) AS sittings,
        COALESCE(SUM(CAST(json_extract(props, '$.minutes') AS INTEGER)), 0) AS minutes
      FROM a WHERE name = 'ReadingLogged' AND day >= ?4 AND props IS NOT NULL
      GROUP BY 1 ORDER BY installs DESC, minutes DESC LIMIT 20`,
    // When people pray, by weekday (0 is Sunday) and the hour on their own clock.
    hours: `${scoped}
      SELECT CAST(strftime('%w', day) AS INTEGER) AS weekday, hour, COUNT(*) AS times
      FROM a WHERE name = 'CompletionLogged' AND hour IS NOT NULL AND day >= ?4
      GROUP BY 1, 2`,
    screens: `${scoped}
      SELECT json_extract(props, '$.route') AS route, COUNT(*) AS views,
        COUNT(DISTINCT install) AS installs
      FROM a WHERE name = 'screen' AND day >= ?4 GROUP BY route ORDER BY installs DESC LIMIT 25`,
    actions: `${scoped}
      SELECT name, COUNT(*) AS times, COUNT(DISTINCT install) AS installs
      FROM a WHERE name NOT IN ('screen', 'app_opened') AND day >= ?4
      GROUP BY name ORDER BY installs DESC, times DESC`,
    // Who the installs of the last seven days are.
    audience: `${scoped}, w AS (SELECT * FROM a WHERE day > date(?3, '-7 days'))
      SELECT 'platform' AS facet, platform AS value, COUNT(DISTINCT install) AS installs
        FROM w GROUP BY 2
      UNION ALL SELECT 'language', language, COUNT(DISTINCT install) FROM w GROUP BY 2
      UNION ALL SELECT 'version', version, COUNT(DISTINCT install) FROM w GROUP BY 2
      UNION ALL SELECT 'update', COALESCE(build, 'not sent'), COUNT(DISTINCT install)
        FROM w GROUP BY 2`,
  }

  const names = Object.keys(statements) as (keyof typeof statements)[]
  const results = await db.batch<Row>(
    names.map((name) => db.prepare(statements[name]).bind(...params)),
  )
  const rows = Object.fromEntries(names.map((name, i) => [name, results[i]?.results ?? []]))

  return {
    today,
    filter,
    pulse: rows.pulse[0] as Usage['pulse'],
    newcomers: rows.newcomers[0] as Usage['newcomers'],
    daily: rows.daily as Usage['daily'],
    cohorts: rows.cohorts as Usage['cohorts'],
    habit: rows.habit as Usage['habit'],
    practices: rows.practices as Usage['practices'],
    books: rows.books as Usage['books'],
    hours: rows.hours as Usage['hours'],
    screens: rows.screens as Usage['screens'],
    actions: rows.actions as Usage['actions'],
    audience: rows.audience as Usage['audience'],
    accounts: await loadAccounts(db, today),
  }
}

// Accounts, only ever summed. The tables are the relay's; each sum skips deleted accounts.
async function loadAccounts(db: D1Database, today: string): Promise<Usage['accounts']> {
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
    ...(totals?.results[0] as Omit<Usage['accounts'], 'devices' | 'weekly'>),
    devices: (devices?.results ?? []) as Usage['accounts']['devices'],
    weekly: ((weekly?.results ?? []) as Usage['accounts']['weekly']).reverse(),
  }
}

function shift(day: string, by: number): string {
  const date = new Date(`${day}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + by)
  return date.toISOString().slice(0, 10)
}
