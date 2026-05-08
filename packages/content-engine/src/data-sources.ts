import type { BilingualText, LocalizedText } from './types'

/**
 * A DataSource resolves declarative data dependencies for a flow.
 *
 * Registered by name; the engine looks it up when a flow declares
 * `{ source: 'name' }` in its load steps and calls `.load(args, ctx)`.
 *
 * Sources read only from corpus content via the SourceContext — no
 * network, no filesystem APIs, no global state.
 *
 * The interface is designed so a future sandboxed plugin runtime can
 * stand in for in-tree TypeScript modules without changes to flows or
 * to the engine.
 */
export type DataSource = {
  load(args: Record<string, unknown>, ctx: SourceContext): Promise<unknown>
}

/**
 * Tightly-scoped surface a DataSource may use during load.
 *
 * Every method maps cleanly to a sandboxed runtime later — no surface
 * here implies global state, network access, or arbitrary module imports.
 */
export type SourceContext = {
  /** Fetch a JSON asset from the corpus by its asset path. */
  fetchAsset(path: string): Promise<unknown>
  /** Read a JSON file from the data declared on the calling practice. */
  fetchOwnAsset(path: string): Promise<unknown>
  /** Engine-provided localization helper. */
  localize(text: LocalizedText): BilingualText
  /** i18n lookup (passes through to engine's t()). */
  t(key: string, opts?: Record<string, unknown>): string
  /** Current date, injected so sources are deterministic in tests. */
  now(): Date
}

const registry = new Map<string, DataSource>()

export function registerDataSource(name: string, source: DataSource): void {
  registry.set(name, source)
}

export function getDataSource(name: string): DataSource | undefined {
  return registry.get(name)
}

export function clearDataSources(): void {
  registry.clear()
}
