import { liturgicalDaySource, registerDataSource } from '@ember/content-engine'

let registered = false

/**
 * Register every DataSource the app supports.
 *
 * Called once at app boot. Idempotent — repeated calls are a no-op.
 *
 * - `liturgical-day` resolves today's content from a per-practice
 *   liturgical-map (used by Liguori's Meditações).
 *
 * The OF Mass no longer uses a DataSource: `producer/mass-of` resolves the day
 * and fetches its formularies directly from the rebuilt corpus.
 */
export function registerDataSources(): void {
  if (registered) return
  registerDataSource('liturgical-day', liturgicalDaySource)
  registered = true
}
