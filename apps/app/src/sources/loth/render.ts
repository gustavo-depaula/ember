// The Liturgy of the Hours' text to renderer primitives. A part of an hour is
// blocks of lines; what each line is (a rubric, a versicle, an antiphon, a
// verse of a psalm) is read from the red label that opens it, as in the book.

import type { Block, HourPart, Line, Seg } from '@ember/loth'
import { lineText, segText } from '@ember/loth'
import type { Primitive, VersesPrimitive } from '@/content/primitives'

export interface RenderContext {
  // The complementary texts an hour links to (Latin versions, the
  // examination of conscience), by id.
  extras: Record<string, Block[]>
}

const isMarked = (seg: Seg, ...marks: string[]) => typeof seg !== 'string' && marks.includes(seg.m)
const isRed = (seg: Seg) => isMarked(seg, 'rubric', 'note', 'num')

const superscripts: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  a: 'ᵃ',
  b: 'ᵇ',
  c: 'ᶜ',
  d: 'ᵈ',
}

// The inline markup the psalm renderer knows: /:…:/ sets a run small and red,
// and it colours the asterisk and the dagger of the pointing itself.
function pointed(line: Line): string {
  return line
    .filter((seg) => !isMarked(seg, 'link'))
    .map((seg) => (isRed(seg) && segText(seg).trim() ? `/:${segText(seg).trim()}:/` : segText(seg)))
    .join('')
    .replace(/:\/(?=[\p{L}\p{N}“"'])/gu, ':/ ')
    .trim()
}

function wrap(text: string, mark: string): string {
  if (!text.trim()) return text
  const lead = text.match(/^\s*/)?.[0] ?? ''
  const trail = text.match(/\s*$/)?.[0] ?? ''
  return `${lead}${mark}${text.trim()}${mark}${trail}`
}

function markdown(line: Line): string {
  return line
    .filter((seg) => !isMarked(seg, 'link'))
    .map((seg) => {
      if (typeof seg === 'string') return seg
      if (seg.m === 'bold') return wrap(seg.t, '**')
      if (seg.m === 'num') return [...seg.t.trim()].map((c) => superscripts[c] ?? c).join('')
      return wrap(seg.t, '*')
    })
    .join('')
    .trim()
}

const versicle = /^\s*(?:[℣V])\s*[/.]{0,2}\s*$/
const response = /^\s*(?:[℟R])\s*[/.]{0,2}\s*$/
const antiphon = /^\s*Ant\s*\.?\s*(\d)?\s*\.?\s*$/i
// A verse of a psalm opens with the dash or the double dash of its pointing.
const opensVerse = (line: Line) =>
  /^\s*[–—=-]/.test(lineText(line)) || line.some((seg) => isMarked(seg, 'num'))

type Kind = 'rubric' | 'versicle' | 'response' | 'antiphon' | 'styled' | 'pointed'

function kindOf(line: Line): Kind {
  const shown = line.filter((seg) => !isMarked(seg, 'link') && segText(seg).trim())
  const first = shown[0]
  if (first && isMarked(first, 'rubric')) {
    const label = segText(first)
    if (shown.length > 1) {
      if (versicle.test(label)) return 'versicle'
      if (response.test(label)) return 'response'
    }
    if (antiphon.test(label)) return 'antiphon'
  }
  if (shown.length > 0 && shown.every(isRed)) return 'rubric'
  if (shown.some((seg) => isMarked(seg, 'bold', 'italic'))) return 'styled'
  return 'pointed'
}

// The doxology that closes the opening versicle is said by all, not by the
// one who answers.
const doxology = /^\s*Glória ao Pai e ao Filho/

function continues(verses: VersesPrimitive, runsOn: 'antiphon' | 'sentence', line: Line): boolean {
  if (opensVerse(line) || doxology.test(lineText(line))) return false
  if (runsOn === 'antiphon') return true
  const said = verses.items[verses.items.length - 1].text.primary
  return isRed(line[0]) || !/[.!?…”"»]$/.test(said.trim())
}

/**
 * A line as it is read. A link that stands alone is only a pointer and is
 * left out (what it points to is unfolded below it); one inside a sentence
 * is part of the sentence.
 */
function inSentence(line: Line): Line {
  const rest = line.filter((seg) => !isMarked(seg, 'link') && segText(seg).trim())
  if (rest.length === 0) return []
  const red = rest.every(isRed)
  return line.map((seg): Seg => {
    if (typeof seg === 'string' || seg.m !== 'link') return seg
    return red ? { m: 'rubric', t: seg.t } : seg.t
  })
}

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

function renderBlock(block: Block, ctx: RenderContext, out: Primitive[], depth: number) {
  if (block.k === 'title') {
    const text = lineText(block.lines[0]).trim()
    if (/^(salmo|c[âa]ntico|sl)\b/i.test(text))
      out.push({ type: 'rubric', text: { primary: text } })
    else out.push({ type: 'heading', text: { primary: text }, size: 'h2' })
    return
  }

  // The primitive the block is still adding lines to.
  let open: Primitive | undefined
  // Whether the open verse may still take a line that runs on from it: an
  // antiphon until its psalm begins, a versicle or response until its sentence ends.
  let runsOn: 'antiphon' | 'sentence' | undefined
  for (const line of block.lines) {
    const shown = inSentence(line)
    const kind = kindOf(shown)
    if (shown.some((seg) => segText(seg).trim())) {
      if (kind === 'rubric') {
        const text = lineText(shown).trim()
        if (open?.type === 'rubric') open.text.primary += `\n${text}`
        else {
          open = { type: 'rubric', text: { primary: text } }
          out.push(open)
        }
        runsOn = undefined
      } else if (kind === 'versicle' || kind === 'response' || kind === 'antiphon') {
        const label = segText(shown[0]).trim()
        const number = antiphon.exec(label)?.[1]
        const item: VersesPrimitive['items'][number] = {
          text: { primary: pointed(shown.slice(1)) },
          ...(kind === 'antiphon'
            ? { mark: number ? `Ant. ${number}` : 'Ant.' }
            : { role: kind === 'versicle' ? ('v' as const) : ('r' as const) }),
        }
        const last = out[out.length - 1]
        if (open?.type === 'verses' || (!open && last?.type === 'verses' && last.style === 'vr')) {
          const verses = (open ?? last) as VersesPrimitive
          verses.items.push(item)
          open = verses
        } else {
          open = { type: 'verses', style: 'vr', markup: 'do', items: [item] }
          out.push(open)
        }
        runsOn = kind === 'antiphon' ? 'antiphon' : 'sentence'
      } else if (open?.type === 'verses' && runsOn && continues(open, runsOn, shown)) {
        // The second line of an antiphon or of a response.
        const item = open.items[open.items.length - 1]
        item.text.primary += `\n${pointed(shown)}`
      } else if (/^[_\s]{5,}$/.test(lineText(shown))) {
        // A ruled line typed out in the source.
        out.push({ type: 'divider' })
        open = undefined
        runsOn = undefined
      } else {
        const text = kind === 'styled' ? markdown(shown) : pointed(shown)
        const markup = kind === 'styled' ? undefined : ('do' as const)
        if (open?.type === 'text' && open.markup === markup) open.text.primary += `\n${text}`
        else {
          open = { type: 'text', text: { primary: text }, ...(markup ? { markup } : {}) }
          out.push(open)
        }
        runsOn = undefined
      }
    }
    for (const seg of line) {
      if (typeof seg === 'string' || seg.m !== 'link' || !seg.to) continue
      const extra = ctx.extras[seg.to]
      // A link inside a linked text is not followed again.
      if (!extra || depth > 0) continue
      out.push({
        type: 'container',
        behavior: {
          kind: 'collapsible',
          title: { primary: capitalise(seg.t.trim()) },
          defaultOpen: false,
        },
        children: renderBlocks(extra, ctx, depth + 1),
      })
      open = undefined
    }
  }
}

export function renderBlocks(blocks: Block[], ctx: RenderContext, depth = 0): Primitive[] {
  const out: Primitive[] = []
  for (const block of blocks) renderBlock(block, ctx, out, depth)
  return out
}

const isPsalmPrayer = (slot: string) => /^(canticle-)?collect\b/.test(slot)

/** An hour's parts as primitives; the psalm-prayers are folded away, as the book makes them optional. */
export function renderParts(parts: HourPart[], ctx: RenderContext): Primitive[] {
  return parts.flatMap((part): Primitive[] => {
    if (!isPsalmPrayer(part.slot)) return renderBlocks(part.blocks, ctx)
    const [title, ...body] = part.blocks
    if (title?.k !== 'title') return renderBlocks(part.blocks, ctx)
    return [
      {
        type: 'container',
        behavior: {
          kind: 'collapsible',
          title: { primary: lineText(title.lines[0]).trim() },
          defaultOpen: false,
        },
        children: renderBlocks(body, ctx),
      },
    ]
  })
}
