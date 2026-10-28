import type { Block, Item, Lang, Line, Localized, Seg, TextKey } from './types'

export const segText = (seg: Seg): string => (typeof seg === 'string' ? seg : seg.t)

export const lineText = (line: Line): string => line.map(segText).join('')

export function plain(blocks: Block[] | undefined): string {
  return (blocks ?? [])
    .flatMap((b) => b.lines.map(lineText))
    .join('\n')
    .trim()
}

/** An item's text in `lang`, or in the one language it exists in. */
export function blocksIn(item: Item, lang: Lang): Block[] | undefined {
  return item.text?.[lang] ?? item.text?.['*']
}

/** A localized string in `lang`, falling back through the languages that drive the corpus. */
export function localize(text: Localized | undefined, lang: Lang): string | undefined {
  if (!text) return undefined
  const order: TextKey[] = [lang, '*', 'la', 'en-US', 'pt-BR']
  for (const key of order) if (text[key]) return text[key]
  return Object.values(text)[0]
}

/**
 * Drop the words said only on other days. The corpus marks them inline (the
 * proper Communicantes of the Roman Canon, the insertions for Holy Thursday);
 * `active` names the conditions that hold today.
 */
export function forDay(blocks: Block[], active: ReadonlySet<string>): Block[] {
  return blocks
    .map((block) => ({
      ...block,
      lines: block.lines
        .map((line) =>
          line
            .filter((seg) => {
              if (typeof seg === 'string' || !seg.m.startsWith('when:')) return true
              return active.has(seg.m.slice(5))
            })
            .map((seg) => (typeof seg !== 'string' && seg.m.startsWith('when:') ? seg.t : seg)),
        )
        .filter((line) => line.length > 0),
    }))
    .filter((block) => block.lines.length > 0 || block.k === 'hr')
}

/** A reading's own words and its citation, without the furniture around it. */
export function readingOf(items: Item[], lang: Lang): { text: string; citation?: string } {
  const lines: string[] = []
  let citation: string | undefined
  for (const item of items) {
    if (item.role === 'people' || item.role === 'rubric') continue
    for (const block of blocksIn(item, lang) ?? []) {
      if (block.role === 'announcement' || block.role === 'title') citation ??= block.cite
      if (block.k !== 'p' || block.role) continue
      lines.push(...block.lines.map(lineText).filter(Boolean))
    }
  }
  return { text: lines.join('\n').trim(), ...(citation ? { citation } : {}) }
}

/** The lines of a prayer part (a collect, an antiphon), without its heading. */
export function prayerLines(items: Item[], lang: Lang): string[] {
  return items.flatMap((item) =>
    (blocksIn(item, lang) ?? [])
      .filter((block) => block.k === 'p')
      .flatMap((block) => block.lines.map(lineText).filter(Boolean)),
  )
}

/** What a saint's formulary prints under its title: the biographical note. */
export function descriptionOf(doc: { items: Item[] } | undefined, lang: Lang): string {
  const notes = (doc?.items ?? [])
    .filter((item) => item.part === 'title')
    .flatMap((item) => blocksIn(item, lang) ?? [])
    .filter(
      (block) =>
        block.k === 'p' &&
        // Not the "from the Common of…" line, nor a bracketed rubric.
        !block.lines.some((line) =>
          line.some((seg) => typeof seg !== 'string' && (seg.m === 'link' || seg.m === 'rubric')),
        ),
    )
  return plain(notes)
}
