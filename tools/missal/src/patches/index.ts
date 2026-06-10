import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import type { Lang } from '@ember/missal-schema'
import { z } from 'zod'

/**
 * Durable text-correction system for upstream errors (e.g. "Paalvra do
 * Senhor" → "Palavra do Senhor"). content/of/ is regenerated output, so
 * hand-edits there would be overwritten — patches are THE way a discovered
 * typo gets fixed: add an entry, re-run build:missal, commit.
 *
 * Every patch must apply at least once per build; a stale patch (matching
 * nothing) FAILS the build so corrections never rot silently.
 */
export const patchSchema = z.object({
  match: z.string().min(1),
  replace: z.string(),
  /** Restrict to one language; omit = all languages. */
  lang: z.string().optional(),
  /** Restrict to formulary/file ids starting with this prefix; omit = everywhere. */
  scope: z.string().optional(),
  note: z.string().min(1),
})
export type Patch = z.infer<typeof patchSchema>

export const patchFileSchema = z.array(patchSchema)

export interface LoadedPatch extends Patch {
  source: string
  applied: number
}

export function loadPatches(dir: string): LoadedPatch[] {
  let files: string[]
  try {
    files = readdirSync(dir)
      .filter((f) => f.endsWith('.json'))
      .sort()
  } catch {
    return []
  }
  const out: LoadedPatch[] = []
  for (const f of files) {
    const parsed = patchFileSchema.parse(JSON.parse(readFileSync(join(dir, f), 'utf-8')))
    out.push(...parsed.map((p) => ({ ...p, source: f, applied: 0 })))
  }
  return out
}

/** Apply all applicable patches to one text value, counting applications. */
export function applyPatches(
  patches: LoadedPatch[],
  text: string,
  ctx: { lang: Lang | string; id: string },
): string {
  let result = text
  for (const p of patches) {
    if (p.lang && p.lang !== ctx.lang) continue
    if (p.scope && !ctx.id.startsWith(p.scope)) continue
    if (!result.includes(p.match)) continue
    result = result.split(p.match).join(p.replace)
    p.applied += 1
  }
  return result
}

/** Build gate: every patch must have applied at least once. */
export function assertNoStalePatches(patches: LoadedPatch[]): void {
  const stale = patches.filter((p) => p.applied === 0)
  if (stale.length > 0) {
    const list = stale.map((p) => `  - [${p.source}] "${p.match}" (${p.note})`).join('\n')
    throw new Error(
      `${stale.length} stale patch(es) matched nothing this build — remove or fix them:\n${list}`,
    )
  }
}

export function patchSummary(patches: LoadedPatch[]): string {
  const total = patches.reduce((acc, p) => acc + p.applied, 0)
  return `${patches.length} patch(es), ${total} application(s)`
}
