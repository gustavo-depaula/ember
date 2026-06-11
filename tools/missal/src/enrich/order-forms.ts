import type { Lang, Line, Localized, OrderSegment, RichText } from '@ember/missal-schema'
import { langs } from '@ember/missal-schema'
import { ordinalLabel, splitAlternates } from './order-ou'

/** Per-block, per-language lines (the output of indexBlocks in order-split). */
export type BlockLines = Map<number, Partial<Record<Lang, Line[]>>>

/** Concatenate a set of block indices into one RichText (per language). */
export function richTextForBlocks(blocks: BlockLines, ns: number[]): RichText {
  const lines: RichText['lines'] = {}
  for (const n of ns) {
    const block = blocks.get(n)
    if (!block) continue
    for (const [lang, blockLines] of Object.entries(block) as Array<[Lang, Line[]]>) {
      lines[lang] = (lines[lang] ?? []).concat(blockLines)
    }
  }
  return { lines }
}

const oneLine = (line: Line | undefined): string | undefined =>
  line && line.length === 1 && typeof line[0]?.text === 'string' ? line[0].text.trim() : undefined

/**
 * A "form marker" block holds nothing but a lone number ("1", "2", "3") — the
 * upstream missal's way of numbering the alternative forms of a piece (the
 * Penitential Act). It is language-independent (a digit is a digit), so one
 * pass over any present language finds the same boundaries in all of them.
 */
function isNumberMarker(block: Partial<Record<Lang, Line[]>> | undefined): boolean {
  if (!block) return false
  for (const lang of langs) {
    const arr = block[lang]
    if (!arr || arr.length !== 1) continue
    const txt = oneLine(arr[0])
    if (txt && /^\d+$/.test(txt)) return true
  }
  return false
}

/** A leftover navigation artifact like "1 2 3" — only digits and spaces. */
function isDigitArtifact(block: Partial<Record<Lang, Line[]>> | undefined): boolean {
  if (!block) return false
  const pt = block['pt-BR']
  if (!pt || pt.length !== 1) return false
  const txt = oneLine(pt[0])
  return Boolean(txt && /^[\d\s]+$/.test(txt))
}

/**
 * Carve a block range into numbered forms when the upstream marks them with
 * lone-number blocks. Returns `undefined` when fewer than two markers are
 * found, so the caller falls back to a single flat body.
 *
 * The text before the first marker (invitation rubric, the "(On Sundays…)"
 * note) becomes a leading fixed-text segment; the bare-number navigation
 * artifact is dropped. Each form's body keeps its own inline invitation
 * variants — those are language-uneven (pt/it/es/de carry alternates the
 * editio typica does not), so they stay inline rather than a nested picker.
 */
export function splitNumberedForms(
  blocks: BlockLines,
  [start, end]: [number, number],
  formLabels: Array<Record<string, string>>,
): OrderSegment[] | undefined {
  const markers: number[] = []
  for (let n = start; n <= end; n++) if (isNumberMarker(blocks.get(n))) markers.push(n)
  if (markers.length < 2) return undefined

  const segments: OrderSegment[] = []

  const introBlocks: number[] = []
  for (let n = start; n < markers[0]; n++) {
    if (isDigitArtifact(blocks.get(n))) continue
    introBlocks.push(n)
  }
  const introBody = richTextForBlocks(blocks, introBlocks)
  if (Object.keys(introBody.lines).length > 0) segments.push({ kind: 'text', body: introBody })

  // Each form opens with a pick-one set of invitations (language-uneven — the
  // editio typica has one, national missals add more), then shared text (the
  // Confiteor, the versicles…). splitAlternates carves that into a nested
  // choice; if there's only one invitation everywhere it stays inline.
  const invitationLabel: Localized = { 'pt-BR': 'Convite', 'en-US': 'Invitation', la: 'Invitátio' }
  const options = markers.map((marker, i) => {
    const next = markers[i + 1] ?? end + 1
    const formBlocks: number[] = []
    for (let n = marker + 1; n < next; n++) formBlocks.push(n)
    const formBody = richTextForBlocks(blocks, formBlocks)
    const label = formLabels[i] ?? { 'pt-BR': `${i + 1}ª fórmula`, 'en-US': `Form ${i + 1}` }
    const nested = splitAlternates(formBody, invitationLabel, ordinalLabel)
    return { label, segments: nested ?? [{ kind: 'text' as const, body: formBody }] }
  })

  segments.push({ kind: 'choice', label: { 'pt-BR': 'Fórmula', 'en-US': 'Form', la: 'Forma' }, options })
  return segments
}
