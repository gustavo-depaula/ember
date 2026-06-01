import { liturgicalDaySource, registerDataSource } from '@ember/content-engine'
import { createMassOfSource } from '@ember/mass'
import { createCorpusMassOfDataSource } from '@/lib/mass-of/dataSource'
import { usePreferencesStore } from '@/stores/preferencesStore'

let registered = false

/**
 * Pick the languages a `mass-of` accessor should request. Always include
 * Latin since the rubrics fall back to it.
 */
function currentMassOfLangs(): string[] {
  const state = usePreferencesStore.getState()
  return Array.from(
    new Set([state.contentLanguage, state.secondaryLanguage, 'la'].filter(Boolean) as string[]),
  )
}

/**
 * Register every DataSource the app supports.
 *
 * Called once at app boot. Idempotent — repeated calls are a no-op.
 *
 * - `liturgical-day` resolves today's content from a per-practice
 *   liturgical-map (used by Liguori's Meditações).
 * - `mass-of` resolves today's OF Mass formularies from the corpus
 *   (data originally sourced from the `ember-extra` upstream submodule).
 */
export function registerDataSources(): void {
  if (registered) return
  registerDataSource('liturgical-day', liturgicalDaySource)
  registerDataSource(
    'mass-of',
    createMassOfSource(createCorpusMassOfDataSource(currentMassOfLangs)),
  )
  registered = true
}
