import type { Lang, Line, Localized, OrderItem, RichText } from '@ember/missal-schema'
import type { ParsedFile, SourceLang } from '../parse/types'
import { sourceLangs } from '../parse/types'
import { type BlockLines, splitNumberedForms } from './order-forms'
import { ordinalLabel, splitAlternates } from './order-ou'
import { segmentsToLines } from './segments-to-lines'

/** Upstream source-directory language → normalized schema language. */
const sourceLangToSchema: Record<SourceLang, Lang> = {
  latin: 'la',
  cast: 'es',
  engl: 'en-US',
  port: 'pt-BR',
  ital: 'it',
  fran: 'fr',
  germ: 'de',
}

/**
 * The Order of Mass split, keyed on the upstream `ordinario` hijo-block (padre)
 * indices. Those indices are aligned across all 7 languages by construction, so
 * one index-range map carves every language at once — no per-language anchors.
 *
 * Ranges are inclusive. Discovered by inspecting the aligned blocks; see
 * docs/mass-rework-journal.md. Rubric/heading-only blocks between moments
 * (titles, "Liturgia da Palavra", proper placeholders) are simply not claimed.
 */
interface OrderSlotSpec {
  id: string
  blocks: [number, number]
  title?: { 'pt-BR': string; 'en-US': string }
  /** When set, the piece is carved into numbered forms (the Penitential Act),
   * one picker option per upstream lone-number marker. `labels[i]` names form i. */
  forms?: Localized[]
  /** When set, the piece's leading run of "Or"-separated formulas becomes a
   * pick-one choice with this chip-group label (Greeting, Our Father, …). */
  ouSplit?: Localized
}

// The three forms of the Penitential Act, by their distinctive penitential
// part (the invitation that opens each is the same "Brethren…"). Labels drive
// the chip picker; bt() falls back across these when the user's lang is absent.
const penitentialForms: Localized[] = [
  { 'pt-BR': 'Confiteor', 'en-US': 'Confiteor', la: 'Confíteor' },
  { 'pt-BR': 'Tende compaixão', 'en-US': 'Have mercy', la: 'Miserére' },
  { 'pt-BR': 'Invocações', 'en-US': 'Invocations', la: 'Invocatiónes' },
]

const orderSlots: OrderSlotSpec[] = [
  { id: 'sign-of-the-cross', blocks: [6, 8], title: { 'pt-BR': 'Sinal da Cruz', 'en-US': 'Sign of the Cross' } },
  { id: 'greeting', blocks: [9, 18], title: { 'pt-BR': 'Saudação', 'en-US': 'Greeting' }, ouSplit: { 'pt-BR': 'Saudação', 'en-US': 'Greeting', la: 'Salutátio' } },
  { id: 'sprinkling-rite', blocks: [20, 51], title: { 'pt-BR': 'Rito da Aspersão', 'en-US': 'Rite of Blessing and Sprinkling Water' } },
  { id: 'penitential-act', blocks: [52, 95], title: { 'pt-BR': 'Ato Penitencial', 'en-US': 'Penitential Act' }, forms: penitentialForms },
  { id: 'kyrie', blocks: [96, 97], title: { 'pt-BR': 'Senhor, tende piedade', 'en-US': 'Kyrie' } },
  { id: 'gloria', blocks: [99, 100], title: { 'pt-BR': 'Glória', 'en-US': 'Gloria' } },
  { id: 'credo-nicene', blocks: [159, 160], title: { 'pt-BR': 'Profissão de Fé', 'en-US': 'Profession of Faith' } },
  { id: 'credo-apostles', blocks: [162, 163], title: { 'pt-BR': 'Símbolo dos Apóstolos', 'en-US': 'Apostles’ Creed' } },
  { id: 'preparation-of-gifts', blocks: [167, 189], title: { 'pt-BR': 'Preparação das Oferendas', 'en-US': 'Preparation of the Gifts' } },
  { id: 'preface-dialogue', blocks: [194, 207], title: { 'pt-BR': 'Diálogo do Prefácio', 'en-US': 'Preface Dialogue' } },
  { id: 'sanctus', blocks: [211, 211], title: { 'pt-BR': 'Santo', 'en-US': 'Sanctus' } },
  { id: 'our-father', blocks: [218, 226], title: { 'pt-BR': 'Pai-Nosso', 'en-US': 'The Lord’s Prayer' }, ouSplit: { 'pt-BR': 'Convite', 'en-US': 'Invitation', la: 'Invitátio' } },
  { id: 'sign-of-peace', blocks: [227, 239], title: { 'pt-BR': 'Rito da Paz', 'en-US': 'Sign of Peace' } },
  { id: 'agnus-dei', blocks: [240, 244], title: { 'pt-BR': 'Cordeiro de Deus', 'en-US': 'Agnus Dei' } },
  { id: 'communion-invitation', blocks: [245, 252], title: { 'pt-BR': 'Convite à Comunhão', 'en-US': 'Invitation to Communion' } },
  { id: 'communion-silent', blocks: [253, 268], title: { 'pt-BR': 'Orações da Comunhão', 'en-US': 'Communion Prayers' } },
  { id: 'simple-blessing', blocks: [281, 285], title: { 'pt-BR': 'Bênção', 'en-US': 'Blessing' } },
  // NOTE: the dismissal's interchangeable formulas sit after a pontifical
  // preamble ("O Senhor esteja convosco"), not at the head of the piece, so the
  // leading-alternates splitter can't carve them — left flat for now.
  { id: 'dismissal', blocks: [286, 290], title: { 'pt-BR': 'Despedida', 'en-US': 'Dismissal' } },
]

/** Flatten a parsed ordinario file into block-index → per-language Lines. */
function indexBlocks(ordinario: ParsedFile): BlockLines {
  const map: BlockLines = new Map()
  for (const day of ordinario.days) {
    for (const part of day.parts) {
      if (part.kind !== 'slot') continue
      for (const item of part.items) {
        const entry = map.get(item.padre) ?? {}
        for (const sl of sourceLangs) {
          const content = item.content[sl as SourceLang]
          if (!content) continue
          const lang = sourceLangToSchema[sl]
          const lines = segmentsToLines(content.segments)
          if (lines.length > 0) entry[lang] = (entry[lang] ?? []).concat(lines)
        }
        map.set(item.padre, entry)
      }
    }
  }
  return map
}

function richTextForRange(blocks: BlockLines, [start, end]: [number, number]): RichText {
  const lines: RichText['lines'] = {}
  for (let n = start; n <= end; n++) {
    const block = blocks.get(n)
    if (!block) continue
    for (const [lang, blockLines] of Object.entries(block) as Array<[Lang, Line[]]>) {
      lines[lang] = (lines[lang] ?? []).concat(blockLines)
    }
  }
  return { lines }
}

/** Carve the upstream ordinario into per-moment OrderItems. The ranges are
 * tied to one upstream edition's block numbering, so an empty range is the
 * canary that the source was renumbered — warn loudly rather than silently
 * drop a moment of the Mass. */
export function splitOrdinary(ordinario: ParsedFile): Record<string, OrderItem> {
  const blocks = indexBlocks(ordinario)
  const items: Record<string, OrderItem> = {}
  for (const spec of orderSlots) {
    const body = richTextForRange(blocks, spec.blocks)
    if (Object.keys(body.lines).length === 0) {
      console.warn(`⚠ order split: "${spec.id}" [${spec.blocks[0]}–${spec.blocks[1]}] is empty — upstream block numbering may have changed`)
      continue
    }
    const id = `order.${spec.id}`
    const item: OrderItem = spec.title ? { id, title: spec.title, body } : { id, body }
    if (spec.forms) {
      const segments = splitNumberedForms(blocks, spec.blocks, spec.forms)
      if (segments) item.segments = segments
      else console.warn(`⚠ order split: "${spec.id}" expected numbered forms but found none — upstream may have changed`)
    } else if (spec.ouSplit) {
      const segments = splitAlternates(body, spec.ouSplit, ordinalLabel)
      if (segments) item.segments = segments
      else console.warn(`⚠ order split: "${spec.id}" expected "Or"-separated formulas but found none — upstream may have changed`)
    }
    items[id] = item
  }
  return items
}

export { orderSlots }
