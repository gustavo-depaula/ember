import type { FlowSection, LocalizedText, RenderedSection } from '../../types'
import {
  bilingualEmpty,
  bilingualOf,
  composeVars,
  type EngineContext,
  type FlowContext,
  lookupMap,
  resolvePath,
} from '../context'
import { substituteInFlowSection, substituteTemplateVars } from '../vars'

export type StaticSelectSection = Extract<FlowSection, { type: 'select'; options: unknown }>
export type FromDataSelectSection = Extract<FlowSection, { type: 'select'; from: string }>

type SectionResolver = (
  section: FlowSection,
  context: FlowContext,
  ec: EngineContext,
) => RenderedSection[]

export function getItemId(item: unknown, idFrom: string, fallbackIndex: number): string {
  if (item !== null && typeof item === 'object') {
    const v = (item as Record<string, unknown>)[idFrom]
    if (typeof v === 'string') return v
    if (typeof v === 'number') return String(v)
  }
  return String(fallbackIndex)
}

export function getItemLabel(item: unknown, labelFrom: string | undefined): LocalizedText | string {
  if (item === null || typeof item !== 'object') return ''
  const obj = item as Record<string, unknown>
  const candidates = labelFrom ? [obj[labelFrom]] : [obj.title, obj.label, obj.name]
  for (const v of candidates) {
    if (typeof v === 'string') return v
    if (v && typeof v === 'object') return v as LocalizedText
  }
  return ''
}

export function selectedItemAndId(
  section: FromDataSelectSection,
  items: unknown[],
  context: FlowContext,
): { selectedId: string; overrideKey: string; item: unknown } {
  const idFrom = section.idFrom ?? 'id'
  const overrideKey = section.as
  const overrideId = context.selectOverrides?.[overrideKey]
  const defaultId = section.default

  // Try override → default → first item
  for (const candidate of [overrideId, defaultId]) {
    if (!candidate) continue
    const found = items.find((it, i) => getItemId(it, idFrom, i) === candidate)
    if (found !== undefined) {
      return { selectedId: candidate, overrideKey, item: found }
    }
  }
  const first = items[0]
  return {
    selectedId: first !== undefined ? getItemId(first, idFrom, 0) : '',
    overrideKey,
    item: first,
  }
}

export function computeSelectedId(
  section: StaticSelectSection,
  context: FlowContext,
): { selectedId: string; overrideKey?: string } {
  if (!section.on) {
    const autoId = section.default ?? section.options[0]?.id
    const overrideKey = section.as ?? autoId
    return {
      selectedId: (overrideKey && context.selectOverrides?.[overrideKey]) ?? autoId ?? '',
      overrideKey,
    }
  }

  const keys = Array.isArray(section.on) ? section.on : [section.on]
  const values = keys.map((k) => {
    const raw = resolvePath(context, k)
    return typeof raw === 'string' ? raw : raw === undefined ? undefined : String(raw)
  })

  let mappedValue: string | undefined
  if (section.map && values.every((v) => v !== undefined)) {
    // Try compound key first (all values joined), then drop from right
    for (let len = values.length; len >= 1; len--) {
      const compoundKey = values.slice(0, len).join(':')
      const result = lookupMap(section.map, compoundKey)
      if (result !== undefined) {
        mappedValue = result
        break
      }
    }
  }
  if (mappedValue === undefined && !section.map) {
    mappedValue = values[0]
  }

  // If the resolved value isn't one of the option ids, fall through to
  // `default`. Without this, a silent dispatch like `select on celebration.id`
  // with options for specific ids would match `options[0]` for any other id.
  if (mappedValue !== undefined && !section.options.some((o) => o.id === mappedValue)) {
    mappedValue = undefined
  }

  const autoId = mappedValue ?? section.default ?? section.options[0]?.id
  const overrideKey = section.as ?? autoId
  return {
    selectedId: (overrideKey && context.selectOverrides?.[overrideKey]) ?? autoId ?? '',
    overrideKey,
  }
}

export function resolveSelectFromData(
  section: FromDataSelectSection,
  context: FlowContext,
  ec: EngineContext,
  resolveSection: SectionResolver,
): RenderedSection[] {
  const fromPath = substituteTemplateVars(section.from, composeVars(context))
  const value = resolvePath(context, fromPath)
  const items = Array.isArray(value) ? value : []
  if (items.length === 0) return []

  const idFrom = section.idFrom ?? 'id'
  const { selectedId, overrideKey } = selectedItemAndId(section, items, context)

  // Resolve one item's body with that item bound under section.as so the body
  // can path-access it. Substitution happens here because top-level
  // substitution in resolveFlowWithContext can't see this per-item binding.
  const resolveItemBody = (it: unknown): RenderedSection[] => {
    const downstreamContext: FlowContext = {
      ...context,
      flowData: { ...context.flowData, [section.as]: it },
    }
    const downstreamVars = composeVars(downstreamContext)
    return section.body.flatMap((s) => {
      const substituted = substituteInFlowSection(s, downstreamVars)
      return resolveSection(substituted, downstreamContext, ec)
    })
  }

  // Hide picker when only one item applies and hideIfSingle is set (the common case).
  const hideIfSingle = section.hideIfSingle ?? false
  if (items.length === 1 && hideIfSingle) {
    return resolveItemBody(items[0])
  }

  // Otherwise emit a visible select. Materialize every item's body (cheap —
  // structure only; include/reading fetches stay lazy per branch in
  // preprocessFlow) so the renderer can switch tabs client-side without a
  // full re-resolve.
  const optionLabels = items.map((it, i) => {
    const rawLabel = getItemLabel(it, section.labelFrom)
    const label = typeof rawLabel === 'string' ? bilingualOf(rawLabel) : ec.localize(rawLabel)
    return {
      id: getItemId(it, idFrom, i),
      label,
      sections: resolveItemBody(it),
    }
  })

  return [
    {
      type: 'select',
      label: section.label ? ec.localize(section.label) : bilingualEmpty,
      overrideKey,
      selectedId,
      options: optionLabels,
    },
  ]
}
