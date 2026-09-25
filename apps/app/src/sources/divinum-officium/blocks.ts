// Maps an AssembledMass / assembled hour (per-column item arrays of DO markup
// text) onto the renderer's primitive vocabulary. Items pair positionally
// between the vernacular and Latin columns (both columns walk the same Ordo
// script, so the streams line up — DO renders its two columns the same way).
//
// Line grammar inside an item: '#Label' section head, '!!text' big heading,
// '!text' rubric, 'V./R./S./M. text' versicle-response dialog, 'Ant./R.br./
// Benedictio./Absolutio. text' a line led by a red label, '_' divider, ''
// paragraph break, anything else body text. Lowercase 'v.'/'r.' are not
// dialog: DO sets the line's first letter as an initial (v.) or large red
// letter (r.), so they only open a new paragraph. Inline '(…)' stage
// directions stay in the text (rendered as rubric-toned spans by the text
// component's marker formatting).

import type { BilingualText } from '@ember/content-engine'
import type { Primitive, VersesPrimitive } from '@/content/primitives'

const verseMarker = /^([VRSMAOCDP])\.\s+/
const paragraphMarker = /^[vr]\.\s*/
// DO's red line-leading labels (horas.pl 'red prefix'); Benedictio and
// Absolutio arrive already translated. R.br. takes the ℟ glyph, as DO's
// setvrbar gives it.
const labelMarker =
  /^(Ant\.|R\.br\.|Benedictio\.|Absolutio\.|Bênção\.|Absolvição\.|Benediction\.|Absolution\.)\s+/

function bilingual(primary: string, secondary?: string): BilingualText {
  return secondary !== undefined && secondary !== primary ? { primary, secondary } : { primary }
}

type Line = {
  kind: 'head' | 'heading' | 'rubric' | 'verse' | 'divider' | 'break' | 'text'
  text: string
  role?: 'v' | 'r'
  mark?: string
  paragraph?: boolean
}

// DO's section heads carry a braced source note ('Salmos{do Saltério do dia
// correspondente}'), which it prints small after the heading.
function splitNote(text: string): { text: string; note?: string } {
  const m = /^(.*?)\s*\{([^}]*)\}\s*$/.exec(text)
  if (!m) return { text }
  const note = m[2].replace(/\s+/g, ' ').trim()
  return note ? { text: m[1], note } : { text: m[1] }
}

// DO's last pass before print (webdia.pl): '_' joins words that must stay
// together ('Cântico de_Simeão'), {:…:} are anchors, a backtick is an editor's
// accent mark and waitN a pause code. None is shown. A lone '_' line is a
// divider and is classified before this runs.
function cleanLine(line: string): string {
  return line
    .replace(/_/g, ' ')
    .replace(/\{:.*?:\}/g, '')
    .replace(/`/g, '')
    .replace(/wait\d+/gi, '')
}

function classify(raw: string): Line {
  const trimmed = raw.replace(/\s+$/, '')
  if (/^_\s*$/.test(trimmed)) return { kind: 'divider', text: '' }
  const line = cleanLine(trimmed)
  if (line.startsWith('#')) return { kind: 'head', text: line.replace(/^#+\s*/, '') }
  if (line.startsWith('!!')) return { kind: 'heading', text: line.slice(2).replace(/^#+\s*/, '') }
  // A rubric line is rubric-toned throughout, so its inline '/:…:/' rubric
  // spans (DoInline's job in body text) only need their markers dropped.
  if (line.startsWith('!')) {
    return {
      kind: 'rubric',
      text: line
        .slice(1)
        .replace(/\/:|:\//g, '')
        .trim(),
    }
  }
  if (/^_\s*$/.test(line)) return { kind: 'divider', text: '' }
  if (/^\s*$/.test(line)) return { kind: 'break', text: '' }
  const label = labelMarker.exec(line)
  if (label) {
    const mark = label[1].replace(/^R\./, '℟.')
    return { kind: 'verse', text: line.slice(label[0].length), mark }
  }
  const para = paragraphMarker.exec(line)
  if (para) return { kind: 'text', text: line.slice(para[0].length), paragraph: true }
  const m = verseMarker.exec(line)
  if (m) {
    const role = /^[VSP]$/.test(m[1]) ? 'v' : 'r'
    return { kind: 'verse', text: line.slice(m[0].length), role }
  }
  return { kind: 'text', text: line }
}

// Pair the two columns' lines: when the content-line counts match, pair
// content lines in order. Blank lines are skipped: the columns' files place
// them differently, so equal raw counts can still hide a shift (Prime's
// chapter office, Portuguese: one extra blank after the Pater rubric, one fewer
// at the end). When the content counts differ (translations legitimately split
// prayers across more lines than the Latin), pair greedily by line KIND:
// rubric with rubric, verse with verse, leaving the extra vernacular lines
// unpaired. If that would drop Latin content, fall back to whole-chunk pairing
// (the full Latin chunk as secondary on the first text block).
function pairLines(
  primaryLines: Line[],
  latinLines: Line[] | undefined,
): Array<[Line, Line | undefined]> {
  if (!latinLines) return primaryLines.map((l) => [l, undefined])

  const isContent = (l: Line) => l.kind !== 'break' && l.kind !== 'divider'
  const latinContent = latinLines.filter(isContent)
  if (latinContent.length === primaryLines.filter(isContent).length) {
    let n = 0
    return primaryLines.map((l) => [l, isContent(l) ? latinContent[n++] : undefined])
  }

  const kindPairs: Array<[Line, Line | undefined]> = []
  let j = 0
  for (const l of primaryLines) {
    while (j < latinLines.length && !isContent(latinLines[j])) j++
    if (isContent(l) && j < latinLines.length && latinLines[j].kind === l.kind) {
      kindPairs.push([l, latinLines[j]])
      j++
    } else {
      kindPairs.push([l, undefined])
    }
  }
  const latinFullyConsumed = latinLines.slice(j).every((x) => !isContent(x))
  if (latinFullyConsumed) return kindPairs

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

// Pair segment by segment when both columns split into the same number of
// '_'-separated segments (hymn stanzas, chapter vs hymn), so one stanza whose
// translation runs a line longer (a doxology's closing 'Amen') degrades alone
// instead of sending the whole item to the chunk fallback.
function pairSegments(primaryLines: Line[], latinLines: Line[] | undefined) {
  if (!latinLines) return pairLines(primaryLines, undefined)
  const split = (lines: Line[]) =>
    lines.reduce<Line[][]>(
      (segs, l) => {
        if (l.kind === 'divider') segs.push([l], [])
        else segs[segs.length - 1].push(l)
        return segs
      },
      [[]],
    )
  const ps = split(primaryLines)
  const ls = split(latinLines)
  if (ps.length !== ls.length) return pairLines(primaryLines, latinLines)
  return ps.flatMap((seg, i) => pairLines(seg, ls[i]))
}

export function mapItemsToPrimitives(primaryItems: string[], latinItems?: string[]): Primitive[] {
  const out: Primitive[] = []
  let textBuffer: BilingualText[] = []
  let verseBuffer: VersesPrimitive['items'] = []

  const flushText = () => {
    if (textBuffer.length === 0) return
    out.push({
      type: 'text',
      // DO body text carries inline markup (verse numbers, mediant/pointing
      // marks, small caps); the DO inline renderer styles it.
      markup: 'do',
      text: {
        primary: textBuffer.map((t) => t.primary).join('\n'),
        ...(textBuffer.some((t) => t.secondary !== undefined)
          ? {
              secondary: textBuffer
                .map((t) => t.secondary ?? '')
                .join('\n')
                .replace(/\n+$/, ''),
            }
          : {}),
      },
    })
    textBuffer = []
  }
  const flushVerses = () => {
    if (verseBuffer.length === 0) return
    out.push({ type: 'verses', style: 'vr', markup: 'do', items: verseBuffer })
    verseBuffer = []
  }
  const flushAll = () => {
    flushText()
    flushVerses()
  }

  for (let i = 0; i < primaryItems.length; i++) {
    const primary = primaryItems[i]
    const latin = latinItems?.[i]
    const pairs = pairSegments(primary.split('\n').map(classify), latin?.split('\n').map(classify))

    for (const [p, l] of pairs) {
      switch (p.kind) {
        case 'head': {
          flushAll()
          const head = splitNote(p.text)
          const latinHead = l ? splitNote(l.text) : undefined
          if (head.text) {
            out.push({
              type: 'heading',
              text: bilingual(head.text, latinHead?.text),
              size: 'h1',
              ...(head.note ? { note: bilingual(head.note, latinHead?.note) } : {}),
            })
          }
          break
        }
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
          // A labelled line is a block of its own: its wider mark column
          // would otherwise shift the ℣/℟ lines beside it.
          if (p.mark || verseBuffer.at(-1)?.mark) flushVerses()
          verseBuffer.push({
            text: bilingual(p.text, l?.text),
            ...(p.mark ? { mark: p.mark } : { role: p.role }),
          })
          break
        case 'text':
          flushVerses()
          if (p.paragraph) flushText()
          if (p.text) textBuffer.push(bilingual(p.text, l?.text))
          break
      }
    }
    flushAll()
  }
  flushAll()
  return out
}
