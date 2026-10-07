// An hour cut into its parts. The cut follows the titles and the red labels
// the book itself prints ("Hino", "Ant. 1", "Leitura breve"), so the same
// psalm or the same antiphon is the same part wherever it is prayed.

import type { Block, Line } from '../../../packages/loth/src/text'
import { lineText } from '../../../packages/loth/src/text'

export interface Part {
  slot: string
  blocks: Block[]
}

const lead = (line: Line | undefined) => {
  const first = line?.[0]
  return first && typeof first !== 'string' && first.m === 'rubric' ? first.t.trim() : undefined
}

const rubricsOf = (block: Block) =>
  block.lines.flatMap((line) =>
    line.filter((seg) => typeof seg !== 'string' && seg.m === 'rubric').map((seg) => (seg as { t: string }).t),
  )

const gospelCanticle = /c[âa]ntico\s+evang[ée]lico/i

export function slotsOf(blocks: Block[], hour: string): Part[] {
  const parts: Part[] = []
  let region: 'head' | 'psalmody' | 'canticle' | 'other' = 'head'
  let slot = 'head'
  // The psalm of the psalmody being read, and whether its text has begun.
  let unit = 0
  let unitHasPsalm = false
  let unitClosed = false
  let lastReading = ''
  let canticleHasBody = false

  const push = (name: string, block: Block) => {
    const last = parts[parts.length - 1]
    if (last && last.slot === name) last.blocks.push(block)
    else parts.push({ slot: name, blocks: [block] })
    slot = name
  }
  const openUnit = (n?: number) => {
    unit = n ?? unit + 1
    unitHasPsalm = false
    unitClosed = false
  }

  for (const block of blocks) {
    const title = block.k === 'title' ? lineText(block.lines[0]).trim() : undefined
    const mark = lead(block.lines[0])

    if (title !== undefined || (mark && gospelCanticle.test(mark))) {
      const t = title ?? mark ?? ''
      if (gospelCanticle.test(t)) {
        region = 'canticle'
        canticleHasBody = false
        push('canticle', block)
        continue
      }
      // The hymn that follows the readings is the Te Deum.
      if (/^hino\b/i.test(t) && !/te deum/i.test(t) && !lastReading) {
        region = 'other'
        push('hymn', block)
        continue
      }
      if (/te deum/i.test(t) || /^hino\b/i.test(t)) {
        region = 'other'
        push('te-deum', block)
        continue
      }
      if (/^salmodia/i.test(t)) {
        region = 'psalmody'
        unit = 0
        unitClosed = true
        push('psalmody', block)
        continue
      }
      if (/^coleta salm/i.test(t)) {
        if (region === 'head') region = 'psalmody'
        if (unit === 0) openUnit()
        unitClosed = true
        push(region === 'canticle' ? 'canticle-collect' : `collect-${unit}`, block)
        continue
      }
      if (/^(salmo|c[âa]ntico|sl)\b/i.test(t)) {
        if (region === 'canticle') {
          canticleHasBody = true
          push('canticle', block)
          continue
        }
        region = 'psalmody'
        if (unit === 0 || unitClosed) openUnit()
        unitHasPsalm = true
        push(`psalm-${unit}`, block)
        continue
      }
      region = 'other'
      if (/^leitura breve/i.test(t)) push((lastReading = 'reading'), block)
      else if (/^primeira leitura/i.test(t)) push((lastReading = 'reading-1'), block)
      else if (/^segunda leitura/i.test(t)) push((lastReading = 'reading-2'), block)
      else if (/^leitura/i.test(t)) push((lastReading = 'reading'), block)
      else if (/^respons[óo]rio/i.test(t))
        push(lastReading.includes('-') ? lastReading.replace('reading', 'responsory') : 'responsory', block)
      else if (/^(preces|intercess)/i.test(t)) push('intercessions', block)
      else if (/^ora[çc][ãa]o/i.test(t)) push('prayer', block)
      else if (/^conclus/i.test(t)) push('conclusion', block)
      else if (/^invitat/i.test(t)) push('invitatory', block)
      else push(slot, block)
      continue
    }

    const antiphon = mark ? /^ant\.?\s*(\d)?\s*$/i.exec(mark) : undefined
    if (antiphon && region === 'canticle') {
      push(canticleHasBody ? 'canticle-ant-end' : 'canticle-ant', block)
      continue
    }
    if (antiphon && (region === 'psalmody' || region === 'head' || hour === 'invitatorio')) {
      region = 'psalmody'
      const n = antiphon[1] ? Number(antiphon[1]) : undefined
      if (n !== undefined) {
        openUnit(n)
        push(`ant-${unit}`, block)
      } else if (unit > 0 && unitHasPsalm && !unitClosed) {
        unitClosed = true
        push(`ant-${unit}-end`, block)
      } else {
        openUnit()
        push(`ant-${unit}`, block)
      }
      continue
    }
    if (region === 'psalmody') {
      // The versicle that leads from the psalms to the readings.
      if (hour === 'leituras' && mark && /^[℣℟]/.test(mark) && unitClosed && lineText(block.lines[0]).length > 4) {
        push('verse', block)
        continue
      }
      if (slot === 'verse') {
        push('verse', block)
        continue
      }
      if (unit > 0 && slot.startsWith('ant-') && !slot.endsWith('-end')) {
        unitHasPsalm = true
        push(`psalm-${unit}`, block)
        continue
      }
    }
    if (region === 'canticle') {
      if (slot === 'canticle-ant' || slot === 'canticle-ant-end') {
        // What follows the antiphon is the canticle; what follows its repeat is not.
        if (slot === 'canticle-ant') canticleHasBody = true
        push(slot === 'canticle-ant' ? 'canticle' : slot, block)
        continue
      }
      canticleHasBody = canticleHasBody || !rubricsOf(block).some((r) => gospelCanticle.test(r))
    }
    push(slot, block)
  }

  // A slot met twice apart is two parts; number the later ones.
  const seen = new Map<string, number>()
  return parts.map((part) => {
    const n = (seen.get(part.slot) ?? 0) + 1
    seen.set(part.slot, n)
    return n === 1 ? part : { ...part, slot: `${part.slot}~${n}` }
  })
}
