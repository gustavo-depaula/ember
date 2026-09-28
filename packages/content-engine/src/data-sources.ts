import type { BilingualText, LocalizedText } from './types'

/**
 * Resolves a flow's `load` step, looked up by the step's `source` name.
 * Sources read only corpus content via the SourceContext — no network,
 * filesystem or global state — so a sandboxed runtime could stand in for them.
 */
export type DataSource = {
  load(args: Record<string, unknown>, ctx: SourceContext): Promise<unknown>
}

/**
 * Sources that need cross-practice data receive typed accessors at
 * construction time via a factory, not through this context.
 */
export type SourceContext = {
  /** Read a JSON file from the data declared on the calling practice. */
  fetchOwnAsset(path: string): Promise<unknown>
  localize(text: LocalizedText): BilingualText
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
