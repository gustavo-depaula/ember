import type { FlowSection, RenderedSection, RepeatEntry } from '../../types'
import {
  composeVars,
  type EngineContext,
  type FlowContext,
  resolveEntryVars,
  resolvePath,
} from '../context'
import { getOrdinal } from '../ordinals'
import { substituteInFlowSection, substituteTemplateVars } from '../vars'
import { resolvePrayerRef } from './prayer'

type SectionResolver = (
  section: FlowSection,
  context: FlowContext,
  ec: EngineContext,
) => RenderedSection[]

export function resolveRepeat(
  section: FlowSection & { type: 'repeat' },
  context: FlowContext,
  ec: EngineContext,
  resolveSection: SectionResolver,
): RenderedSection[] {
  if ('from' in section) {
    const fromPath = substituteTemplateVars(section.from, composeVars(context))
    const value = resolvePath(context, fromPath)
    const entries = (Array.isArray(value) ? value : []) as RepeatEntry[]
    if (!entries.length) return []

    const iterCount = section.count ? Math.min(section.count, entries.length) : entries.length
    return Array.from({ length: iterCount }, (_, i) => {
      const entry = entries[i]
      const resolved = entry ? resolveEntryVars(entry, ec) : {}
      const overlay: Record<string, unknown> = {
        ...resolved,
        index: String(i),
        ordinal: getOrdinal(i, ec.language),
      }
      const definedTemplateVars: Record<string, string> = {
        ...context.templateVars,
        ...Object.fromEntries(
          Object.entries(resolved).filter((e): e is [string, string] => e[1] !== undefined),
        ),
        index: String(i),
        ordinal: getOrdinal(i, ec.language),
      }
      const iterContext = { ...context, templateVars: definedTemplateVars }
      const substVars = composeVars(context, overlay)
      return section.sections.flatMap((s) => {
        const substituted = substituteInFlowSection(s, substVars)
        return resolveSection(substituted, iterContext, ec)
      })
    }).flat()
  }

  const { count, sections: templateSections } = section

  // Collapse repeated single-prayer refs into one section with a count
  const onlyTemplate = templateSections[0]
  if (templateSections.length === 1 && onlyTemplate?.type === 'prayer' && 'ref' in onlyTemplate) {
    const resolved = resolvePrayerRef(onlyTemplate.ref, context, ec, resolveSection)
    const firstResolved = resolved[0]
    if (resolved.length === 1 && firstResolved?.type === 'prayer') {
      return [{ ...firstResolved, count }]
    }
    return resolved
  }

  return Array.from({ length: count }, (_, i) => {
    const overlay: Record<string, string> = {
      index: String(i),
      ordinal: getOrdinal(i, ec.language),
    }
    const iterContext = {
      ...context,
      templateVars: { ...context.templateVars, ...overlay },
    }
    const substVars = composeVars(context, overlay)
    return templateSections.flatMap((s) => {
      const substituted = substituteInFlowSection(s, substVars)
      return resolveSection(substituted, iterContext, ec)
    })
  }).flat()
}
