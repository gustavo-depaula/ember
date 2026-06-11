import type { ContentBlock, MassFormulary, SpecialPart } from '@ember/missal-schema'
import type { Primitive } from '@/content/primitives'
import { bt, type LangPrefs, lines, sectionMarker } from '../helpers'

// The ordered part keys per structure (best-effort; unknown keys append after).
const partOrder: Record<string, string[]> = {
  'mass-with-blessing-and-procession': ['preamble', 'commemorationOfTheLordsEntrance', 'mass'],
  'mass-with-ashes': ['preamble', 'liturgyOfTheWord', 'blessingOfAshes', 'mass'],
  'chrism-mass': ['preamble', 'renewalOfPriestlyPromises', 'blessingOfTheOils', 'mass'],
  'lords-supper': ['preamble', 'washingOfFeet', 'mass', 'transferOfTheBlessedSacrament'],
  'good-friday': ['preamble', 'liturgyOfTheWord', 'adorationOfTheCross', 'holyCommunion'],
  'easter-vigil': [
    'preamble',
    'serviceOfLight',
    'liturgyOfTheWord',
    'baptismalLiturgy',
    'liturgyOfTheEucharist',
  ],
  'vigil-mass': ['preamble', 'mass'],
}

function renderBlocks(blocks: ContentBlock[], lang: LangPrefs, depth = 0): Primitive[] {
  const out: Primitive[] = []
  for (const block of blocks) {
    if (block.kind === 'richtext') {
      out.push(...lines(block.body, lang))
    } else {
      const h = bt(block.heading, lang)
      if (h) out.push({ type: 'heading', text: h, size: depth === 0 ? 'h2' : 'h2' })
      out.push(...renderBlocks(block.content, lang, depth + 1))
    }
  }
  return out
}

function renderPart(part: SpecialPart, lang: LangPrefs): Primitive[] {
  const out: Primitive[] = []
  const h = bt(part.heading, lang)
  if (h) out.push(sectionMarker(h.primary, h.secondary ?? h.primary))
  out.push(...renderBlocks(part.content, lang))
  return out
}

/**
 * Render a special-rite liturgy from its typed `parts` content tree. Lossless:
 * every part's heading + content (including the folded intercessions / vigil
 * readings / baptismal renewal) is emitted in liturgical order. A future
 * iteration can promote the typed sub-structures to bespoke interactive blocks.
 */
export function renderSpecial(f: MassFormulary, lang: LangPrefs): Primitive[] {
  const parts = f.parts ?? {}
  const order = partOrder[f.structure] ?? []
  const seen = new Set<string>()
  const out: Primitive[] = []
  for (const key of order) {
    if (parts[key]) {
      out.push(...renderPart(parts[key], lang))
      seen.add(key)
    }
  }
  for (const [key, part] of Object.entries(parts)) {
    if (!seen.has(key)) out.push(...renderPart(part, lang))
  }
  return out
}
