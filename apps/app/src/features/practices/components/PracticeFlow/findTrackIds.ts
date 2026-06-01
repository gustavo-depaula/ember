import type { RenderedSection } from '@/content/types'

// Walks the engine's pre-preprocess output for include sections with a lectio
// trackId. Primitives drop track metadata during preprocess, so this has to
// traverse the engine-level tree.
//
// Every `select` branch is materialized in the engine output, but only the
// branch the user actually chose counts toward completion — otherwise we'd
// advance reading cursors for branches that were never prayed. The effective
// choice is `selectOverrides[overrideKey]`, falling back to the engine's
// default `selectedId`.
function* walkRendered(
  sections: RenderedSection[],
  selectOverrides: Record<string, string>,
): Generator<RenderedSection> {
  for (const s of sections) {
    yield s
    switch (s.type) {
      case 'select': {
        const activeId = selectOverrides[s.overrideKey] ?? s.selectedId
        const opt = s.options.find((o) => o.id === activeId) ?? s.options[0]
        if (opt) yield* walkRendered(opt.sections, selectOverrides)
        break
      }
      case 'options':
        for (const opt of s.options) yield* walkRendered(opt.sections, selectOverrides)
        break
      case 'collapsible':
      case 'liturgical-color-scope':
        yield* walkRendered(s.sections, selectOverrides)
        break
      case 'prayer':
        if (s.sections) yield* walkRendered(s.sections, selectOverrides)
        break
    }
  }
}

export function findTrackIds(
  sections: RenderedSection[],
  selectOverrides: Record<string, string>,
): string[] {
  const ids = new Set<string>()
  for (const s of walkRendered(sections, selectOverrides)) {
    if (s.type === 'include' && s.trackId) ids.add(s.trackId)
  }
  return Array.from(ids)
}
