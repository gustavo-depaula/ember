// The usage counts, thinned as they age. Every count is a row, and the usage desk reads at most
// two periods of ninety days back, except where it asks only who was there on a day (first
// seen, the cohorts, the retention of a week) and how many holy cards each install holds. So a
// row past `keepDays` is kept only as that: one row a day for each install, named `seen` and
// emptied, and every card opened, as it was.
//
// Each run reaches `reachDays` past the line, so a nightly run is a small one, and a run missed
// for a few nights is caught up by the next. Every statement is safe to run again.

export const keepDays = 180
const reachDays = 14

const kept = `('HolyCardRedeemed', 'seen')`

export async function pruneAnalytics(db: D1Database, today: string): Promise<void> {
  const line = shift(today, -keepDays)
  const from = shift(line, -reachDays)
  await db.batch([
    // All but the first row of each install's day, other than its cards.
    db
      .prepare(
        `DELETE FROM analytics WHERE day >= ?1 AND day < ?2 AND name NOT IN ${kept}
          AND id NOT IN (SELECT MIN(id) FROM analytics
            WHERE day >= ?1 AND day < ?2 AND name != 'HolyCardRedeemed' GROUP BY install, day)`,
      )
      .bind(from, line),
    // That first row, made the day's mark.
    db
      .prepare(
        `UPDATE analytics SET name = 'seen', props = NULL
          WHERE day >= ?1 AND day < ?2 AND name NOT IN ${kept}`,
      )
      .bind(from, line),
  ])
}

function shift(day: string, by: number): string {
  const date = new Date(`${day}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + by)
  return date.toISOString().slice(0, 10)
}
