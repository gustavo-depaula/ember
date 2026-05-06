import { liturgicalDaySource, registerDataSource } from '@ember/content-engine'
import { massOfSource } from '@ember/mass-of'

let registered = false

/**
 * Register every DataSource the app supports.
 *
 * Called once at app boot. Idempotent — repeated calls are a no-op.
 *
 * - `liturgical-day` resolves today's content from a per-practice
 *   liturgical-map (used by Liguori's Meditações).
 * - `mass-of` resolves today's OF Mass formularies from the bundled
 *   `ember-extra` library.
 */
export function registerDataSources(): void {
  if (registered) return
  registerDataSource('liturgical-day', liturgicalDaySource)
  registerDataSource('mass-of', massOfSource)
  registered = true
}
