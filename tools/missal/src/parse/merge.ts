import type {
  Category,
  DayItem,
  DayPart,
  ParsedDay,
  RawBlock,
  SourceLang,
  StructDay,
} from './types'
import { sourceLangs } from './types'

/**
 * Join an estructura day with the per-language hijo blocks: every padre index
 * the structure references is filled with the same-N block from each language.
 */
export function mergeDay(
  category: Category,
  basename: string,
  day: StructDay,
  langBlocks: Partial<Record<SourceLang, RawBlock[]>>,
): ParsedDay {
  const byN: Partial<Record<SourceLang, Map<number, RawBlock>>> = {}
  for (const lang of sourceLangs) {
    const blocks = langBlocks[lang]
    if (blocks) byN[lang] = new Map(blocks.map((b) => [b.n, b]))
  }

  const languagesWithContent = new Set<SourceLang>()

  function fill(role: string, padre: number): DayItem {
    const content: DayItem['content'] = {}
    for (const lang of sourceLangs) {
      const block = byN[lang]?.get(padre)
      if (!block) continue
      content[lang] = { text: block.text, segments: block.segments }
      if (block.text) languagesWithContent.add(lang)
    }
    return { role, padre, content }
  }

  const parts: DayPart[] = []
  for (const part of day.parts) {
    if (part.kind !== 'slot') {
      parts.push(part)
      continue
    }
    const items: DayItem[] = [
      ...part.padres.map((n) => fill('main', n)),
      ...part.groups.map((g) => fill(g.group, g.padre)),
    ]
    parts.push({
      kind: 'slot',
      type: part.type,
      id: part.id,
      classes: part.classes,
      padreClasses: part.padreClasses,
      items,
    })
  }

  return {
    id: day.id,
    category,
    basename,
    estructuraLanguages: day.languages,
    languagesWithContent: sourceLangs.filter((l) => languagesWithContent.has(l)),
    parts,
  }
}
