// The Gregorian chant of the hours. The breviary is in Portuguese and sings
// it so, but most of what it sings has a Latin original with its chant: its
// hymns are the Liturgia Horarum's, translated; the Marian antiphons and the
// Te Deum are the Church's own. `content/loth/chant.json` pairs a text, by its
// opening words as printed, with the chant of its original; a text so paired
// becomes one sung block with its chant, as in the Latin Office and the prayers.

import type { ChantPrimitive, ContainerOption, Primitive } from '@/content/primitives'
import { loadChant } from '@/features/chant/chants'

/** The chant ids paired with a text, by its opening words as the breviary prints them. */
export type ChantPairs = Record<string, string | string[]>

/** A text reduced to its letters, so a pairing's key and the text it opens agree whatever the marks. */
function fold(text: string): string {
  return (
    text
      // Verse numbers and pointing marks set in the text: `–/:29:/`, `/:*:/`.
      .replace(/\/:[^:]*:\//g, ' ')
      .replace(/æ/g, 'ae')
      .replace(/œ/g, 'oe')
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .trim()
  )
}

type Pairing = { key: string; ids: string[] }

const textOf = (p: Primitive) => (p.type === 'text' ? p.text.primary : undefined)

function pairingOf(p: Primitive, pairings: Pairing[]): Pairing | undefined {
  const text = textOf(p)
  if (!text) return undefined
  const folded = fold(text)
  return pairings.find(({ key }) => folded.startsWith(key))
}

/**
 * The primitives with every paired text sung: the text, the stanzas and
 * rubrics that run on from it, and the heading or rubric just above it, which
 * the block keeps as its title.
 */
function sing(
  list: Primitive[],
  pairings: Pairing[],
  chants: Map<string, ChantPrimitive>,
): Primitive[] {
  const out: Primitive[] = []
  const inOptions = (options: ContainerOption[]) =>
    options.map((option) => ({ ...option, children: sing(option.children, pairings, chants) }))
  for (let i = 0; i < list.length; i++) {
    const p = list[i]
    if (p.type === 'container') {
      const behavior =
        'options' in p.behavior
          ? { ...p.behavior, options: inOptions(p.behavior.options) }
          : p.behavior
      out.push({
        ...p,
        behavior,
        ...(p.children ? { children: sing(p.children, pairings, chants) } : {}),
      } as Primitive)
      continue
    }
    const pairing = pairingOf(p, pairings)
    const found = pairing?.ids.flatMap((id) => chants.get(id) ?? [])
    if (!found?.length) {
      out.push(p)
      continue
    }
    const title = out.at(-1)
    const text: Primitive[] =
      title?.type === 'heading' || title?.type === 'rubric' ? [out.pop() as Primitive, p] : [p]
    while (
      i + 1 < list.length &&
      (list[i + 1].type === 'text' || list[i + 1].type === 'rubric') &&
      !pairingOf(list[i + 1], pairings)
    ) {
      text.push(list[++i])
    }
    out.push({ type: 'sung', text, chants: found })
  }
  return out
}

/** Every text in the hour that `pairs` names, set as one block with its chant. */
export async function withChant(primitives: Primitive[], pairs: ChantPairs): Promise<Primitive[]> {
  const pairings = Object.entries(pairs)
    .map(([opening, ids]) => ({ key: fold(opening), ids: [ids].flat() }))
    // The longest opening first, so a text that opens on a shorter pairing's
    // words still finds its own.
    .sort((a, b) => b.key.length - a.key.length)
  const wanted = new Set<string>()
  const collect = (list: Primitive[]) => {
    for (const p of list) {
      for (const id of pairingOf(p, pairings)?.ids ?? []) wanted.add(id)
      if (p.type === 'container') {
        if (p.children) collect(p.children)
        if ('options' in p.behavior) for (const o of p.behavior.options) collect(o.children)
      }
    }
  }
  collect(primitives)
  if (wanted.size === 0) return primitives
  const chants = new Map<string, ChantPrimitive>()
  await Promise.all(
    [...wanted].map(async (id) => {
      const chant = await loadChant(id)
      if (!chant) return
      const { id: _, name, subtitle: __, ...rest } = chant
      chants.set(id, { type: 'chant', name, ...rest })
    }),
  )
  return sing(primitives, pairings, chants)
}
