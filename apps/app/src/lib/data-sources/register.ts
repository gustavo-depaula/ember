import { liturgicalDaySource, registerDataSource } from '@ember/content-engine'

let registered = false

/**
 * Called once at app boot; idempotent. `liturgical-day` resolves today's
 * content from a per-practice liturgical-map (used by Liguori's Meditações).
 */
export function registerDataSources(): void {
  if (registered) return
  registerDataSource('liturgical-day', liturgicalDaySource)
  registered = true
}
