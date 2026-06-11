// Maps an AssembledMass / assembled hour (per-column item arrays of DO markup
// text) onto the renderer's primitive vocabulary. Items pair positionally
// between the vernacular and Latin columns (both columns walk the same Ordo
// script, so the streams line up — DO renders its two columns the same way).
//
// Line grammar inside an item: '#Label' section head, '!!text' big heading,
// '!text' rubric, 'V./R./S./M./v./r. text' versicle-response dialog, '_'
// divider, '' paragraph break, anything else body text. Inline '(…)' stage
// directions stay in the text (rendered as rubric-toned spans by the text
// component's marker formatting).

import type { BilingualText } from '@ember/content-engine'
import type { Primitive, VersesPrimitive } from '@/content/primitives'

const verseMarker = /^([VRSMAOCDPvr])\.\s+/

function bilingual(primary: string, secondary?: string): BilingualText {
  return secondary !== undefined && secondary !== primary ? { primary, secondary } : { primary }
}

type Line = {
  kind: 'head' | 'heading' | 'rubric' | 'verse' | 'divider' | 'break' | 'text'
  text: string
  role?: 'v' | 'r'
}

function classify(raw: string): Line {
  const line = raw.replace(/\s+$/, '')
  if (line.startsWith('#')) return { kind: 'head', text: line.replace(/^#+\s*/, '') }
  if (line.startsWith('!!')) return { kind: 'heading', text: line.slice(2).replace(/^#+\s*/, '') }
  if (line.startsWith('!')) return { kind: 'rubric', text: line.slice(1).trim() }
  if (/^_\s*$/.test(line)) return { kind: 'divider', text: '' }
  if (/^\s*$/.test(line)) return { kind: 'break', text: '' }
  const m = verseMarker.exec(line)
  if (m) {
    const role = /^[VSPv]$/.test(m[1]) ? 'v' : 'r'
    return { kind: 'verse', text: line.slice(m[0].length), role }
  }
  return { kind: 'text', text: line }
}

// Pair the two columns' lines: when the line counts match, pair index-wise;
// otherwise fall back to whole-chunk pairing (vernacular text with the full
// Latin chunk as secondary on the first block).
function pairLines(
  primaryLines: Line[],
  latinLines: Line[] | undefined,
): Array<[Line, Line | undefined]> {
  if (!latinLines) return primaryLines.map((l) => [l, undefined])
  if (latinLines.length === primaryLines.length) {
    return primaryLines.map((l, i) => [l, latinLines[i]])
  }
  // Structure diverged (translation gap): keep primary structure, attach the
  // Latin text block-level via the first text line.
  let attached = false
  return primaryLines.map((l) => {
    if (!attached && (l.kind === 'text' || l.kind === 'verse')) {
      attached = true
      return [
        l,
        {
          kind: l.kind,
          text: latinLines
            .filter((x) => x.kind === 'text' || x.kind === 'verse')
            .map((x) => x.text)
            .join('\n'),
        },
      ]
    }
    return [l, undefined]
  })
}

export function mapItemsToPrimitives(primaryItems: string[], latinItems?: string[]): Primitive[] {
  const out: Primitive[] = []
  let textBuffer: BilingualText[] = []
  let verseBuffer: VersesPrimitive['items'] = []

  const flushText = () => {
    if (textBuffer.length === 0) return
    out.push({
      type: 'text',
      text: {
        primary: textBuffer.map((t) => t.primary).join('\n'),
        ...(textBuffer.some((t) => t.secondary !== undefined)
          ? { secondary: textBuffer.map((t) => t.secondary ?? '').join('\n') }
          : {}),
      },
    })
    textBuffer = []
  }
  const flushVerses = () => {
    if (verseBuffer.length === 0) return
    out.push({ type: 'verses', style: 'vr', items: verseBuffer })
    verseBuffer = []
  }
  const flushAll = () => {
    flushText()
    flushVerses()
  }

  for (let i = 0; i < primaryItems.length; i++) {
    const primary = primaryItems[i]
    const latin = latinItems?.[i]
    const pairs = pairLines(primary.split('\n').map(classify), latin?.split('\n').map(classify))

    for (const [p, l] of pairs) {
      switch (p.kind) {
        case 'head':
          flushAll()
          if (p.text) out.push({ type: 'heading', text: bilingual(p.text, l?.text), size: 'h1' })
          break
        case 'heading':
          flushAll()
          if (p.text) out.push({ type: 'heading', text: bilingual(p.text, l?.text), size: 'h2' })
          break
        case 'rubric':
          flushAll()
          if (p.text) out.push({ type: 'rubric', text: bilingual(p.text, l?.text) })
          break
        case 'divider':
          flushAll()
          out.push({ type: 'divider' })
          break
        case 'break':
          flushAll()
          break
        case 'verse':
          flushText()
          verseBuffer.push({ text: bilingual(p.text, l?.text), role: p.role })
          break
        case 'text':
          flushVerses()
          if (p.text) textBuffer.push(bilingual(p.text, l?.text))
          break
      }
    }
    flushAll()
  }
  flushAll()
  return out
}
