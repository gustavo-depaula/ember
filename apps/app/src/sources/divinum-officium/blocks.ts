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
  return secondary !== undefined && secondary !== primary
    ? { primary, secondary, secondaryLanguage: 'la' }
    : { primary }
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
//
// '%Laudes%' names an hour DO links to ('Pule o resto, a menos que ore
// %Laudes% separadamente'); the name is read without the link. A translator's
// HTML space ('Credo&nbsp;') is a space.
function cleanLine(line: string): string {
  return line
    .replace(/&nbsp;/g, ' ')
    .replace(/%([^%]+)%/g, '$1')
    .replace(/_/g, ' ')
    .replace(/\{:.*?:\}/g, '')
    .replace(/`/g, '')
    .replace(/wait\d+/gi, '')
}

// A responsory's repeat runs on to a line of its own ('R. Credo quod Redémptor
// meus vivit, … surrectúrus sum,' / '* Et in carne mea vidébo Deum'), which is
// still the response: it is joined to the ℣ or ℟ above it.
function linesOf(item: string): string[] {
  const out: string[] = []
  for (const line of item.split('\n')) {
    const above = out.at(-1)
    if (/^\*\s/.test(line) && above && /^(?:[VR]\.|R\.br\.)\s/.test(above))
      out[out.length - 1] = `${above.replace(/\s+$/, '')} ${line}`
    else out.push(line)
  }
  return out
}

function classify(raw: string): Line {
  const trimmed = raw.replace(/\s+$/, '')
  if (/^_\s*$/.test(trimmed)) return { kind: 'divider', text: '' }
  const line = cleanLine(trimmed)
  if (line.startsWith('#')) return { kind: 'head', text: line.replace(/^#+\s*/, '').trim() }
  // '!!' heads a part, '!!!' the words of consecration, larger still.
  if (line.startsWith('!!'))
    return {
      kind: 'heading',
      text: line
        .replace(/^!+\s*/, '')
        .replace(/^#+\s*/, '')
        .trim(),
    }
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

/** The lines with each unmarked line of body text joined to the spoken line it directly follows. */
function joinRuns(lines: Line[]): Line[] {
  const out: Line[] = []
  for (const line of lines) {
    const above = out.at(-1)
    const continues =
      line.kind === 'text' &&
      !line.paragraph &&
      above !== undefined &&
      (above.kind === 'verse' || above.kind === 'text')
    // A sentence a rubric interrupts runs on in lowercase after it ("Por Ele…
    // Espírito Santo" / "!Eleva um pouco o Cálice" / "pertence, e Vos é
    // dada…"): the rubric goes inline, in brackets, as the Latin sets it.
    const before = out.at(-2)
    const resumes =
      line.kind === 'text' &&
      !line.paragraph &&
      /^\p{Ll}/u.test(line.text) &&
      above?.kind === 'rubric' &&
      before !== undefined &&
      (before.kind === 'verse' || before.kind === 'text')
    if (continues) out[out.length - 1] = { ...above, text: `${above.text}\n${line.text}` }
    else if (resumes)
      out.splice(-2, 2, { ...before, text: `${before.text} (${above.text}) ${line.text}` })
    else out.push(line)
  }
  return out
}

// Pair the two columns' lines: when the content-line counts match, pair
// content lines in order. Blank lines are skipped: the columns' files place
// them differently, so equal raw counts can still hide a shift (Prime's
// chapter office, Portuguese: one extra blank after the Pater rubric, one fewer
// at the end). When the counts differ, the columns are aligned (`align`).
function pairLines(
  primaryLines: Line[],
  latinLines: Line[] | undefined,
): Array<[Line, Line | undefined]> {
  if (!latinLines) return primaryLines.map((l) => [l, undefined])

  // In order only where every pair agrees in kind: two columns can count
  // alike and still place their rubrics differently (the Communion of the
  // faithful: as many lines, a rubric where the other has a prayer).
  const inOrder = inOrderPairs(primaryLines, latinLines)
  if (inOrder) return inOrder
  // A prayer one column sets over several lines and the other on one: the
  // Portuguese Confiteor runs on to "Por minha culpa…" and "Portanto, rogo…",
  // and sets a prayer's Amém on a line of its own, where the Latin has each
  // whole. Each line joined with the unmarked lines that directly continue it,
  // the prayers pair one to one.
  const primaryRuns = joinRuns(primaryLines)
  const latinRuns = joinRuns(latinLines)
  const runsInOrder = inOrderPairs(primaryRuns, latinRuns)
  if (runsInOrder) return runsInOrder
  // Otherwise the columns are aligned, line by line or prayer by prayer,
  // whichever fits the better: a reading the two set verse by verse pairs by
  // its verses, a Confiteor one column splits pairs whole.
  const byLine = align(primaryLines, latinLines)
  const byRun = align(primaryRuns, latinRuns)
  return (byRun.score > byLine.score ? byRun : byLine).pairs
}

/**
 * The lines paired in order, where both columns count alike and every pair
 * agrees in kind: two columns can count alike and still place their rubrics
 * differently (the Communion of the faithful: as many lines, a rubric where
 * the other has a prayer).
 */
function inOrderPairs(
  primaryLines: Line[],
  latinLines: Line[],
): Array<[Line, Line | undefined]> | undefined {
  const latinContent = latinLines.filter(isContent)
  const primaryContent = primaryLines.filter(isContent)
  if (latinContent.length !== primaryContent.length) return undefined
  if (!primaryContent.every((p, i) => spoken(p) === spoken(latinContent[i]))) return undefined
  let n = 0
  return primaryLines.map((l) => [l, isContent(l) ? latinContent[n++] : undefined])
}

const isContent = (l: Line) => l.kind !== 'break' && l.kind !== 'divider'
const spoken = (l: Line) => l.kind === 'verse' || l.kind === 'text'

// How well two lines pair: a rubric only with a rubric, a heading with its
// heading, a spoken line with a spoken line, the better the nearer their
// lengths (Latin runs a little shorter than its translation).
function matchScore(p: Line, l: Line): number {
  if (spoken(p) !== spoken(l)) return Number.NEGATIVE_INFINITY
  if (!spoken(p)) return p.kind === l.kind ? 2 : Number.NEGATIVE_INFINITY
  const ratio = (l.text.length + 20) / (p.text.length + 20)
  if (ratio > 0.5 && ratio < 2) return 4
  return ratio > 0.25 && ratio < 4 ? 2 : 0
}

// Leaving a line unpaired: a rubric or a heading costs little, for the
// translations add, drop and reword the rubrics freely ("Et pronuntians:
// Inítium, sive Sequéntia…" has no Portuguese); a spoken line costs more.
const skipCost = (l: Line) => (spoken(l) ? 3 : 1)

/**
 * The columns aligned as two sequences, so a rubric one column has and the
 * other lacks shifts nothing after it. A Latin spoken line left unpaired goes
 * with the pair before it (or, at the start, after it), so a reader praying in
 * Latin still reads it.
 */
function align(
  primaryLines: Line[],
  latinLines: Line[],
): { pairs: Array<[Line, Line | undefined]>; score: number } {
  const ps = primaryLines.filter(isContent)
  const ls = latinLines.filter(isContent)
  const n = ps.length
  const m = ls.length
  // best[i][j]: the best score aligning ps[i..] with ls[j..].
  const best = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0))
  for (let i = n; i >= 0; i--) {
    for (let j = m; j >= 0; j--) {
      if (i === n && j === m) continue
      const options = [
        i < n ? best[i + 1][j] - skipCost(ps[i]) : Number.NEGATIVE_INFINITY,
        j < m ? best[i][j + 1] - skipCost(ls[j]) : Number.NEGATIVE_INFINITY,
        i < n && j < m ? best[i + 1][j + 1] + matchScore(ps[i], ls[j]) : Number.NEGATIVE_INFINITY,
      ]
      best[i][j] = Math.max(...options)
    }
  }
  const partner = new Map<Line, Line>()
  const leftover: Array<{ line: Line; after: Line | undefined }> = []
  let lastPaired: Line | undefined
  let i = 0
  let j = 0
  while (i < n || j < m) {
    const match =
      i < n && j < m ? best[i + 1][j + 1] + matchScore(ps[i], ls[j]) : Number.NEGATIVE_INFINITY
    if (match === best[i][j]) {
      partner.set(ps[i], ls[j])
      if (spoken(ps[i])) lastPaired = ps[i]
      i++
      j++
    } else if (i < n && best[i + 1][j] - skipCost(ps[i]) === best[i][j]) {
      i++
    } else {
      if (spoken(ls[j]) && ls[j].text.trim()) leftover.push({ line: ls[j], after: lastPaired })
      j++
    }
  }
  for (const { line, after } of leftover) {
    // Before any pair, it opens the first one ("Benedícat vos omnípotens Deus,"
    // ahead of "Pater, et Fílius…"); otherwise it follows the pair before it.
    const host = after ?? ps.find((p) => spoken(p) && partner.has(p))
    const was = host && partner.get(host)
    if (!host || !was) continue
    const text = after ? `${was.text}\n${line.text}` : `${line.text}\n${was.text}`
    partner.set(host, { ...was, text })
  }
  return { pairs: primaryLines.map((l) => [l, partner.get(l)]), score: best[0][0] }
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
  // `latin`: the line's Latin as paired, kept even where it reads as the
  // vernacular does, so a paragraph whose other lines differ keeps it.
  let textBuffer: Array<BilingualText & { latin?: string }> = []
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
                .map((t) => t.latin ?? '')
                .join('\n')
                .replace(/\n+$/, ''),
              secondaryLanguage: 'la' as const,
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
    const pairs = pairSegments(
      linesOf(primary).map(classify),
      latin === undefined ? undefined : linesOf(latin).map(classify),
    )

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
            // The speaker is read from the Latin column: there S. is the priest
            // (Sacerdos) and M. the server, while the English and Portuguese
            // files letter them P. and S., so their S. is the response.
            ...(p.mark ? { mark: p.mark } : { role: l?.role ?? p.role }),
          })
          break
        case 'text':
          flushVerses()
          if (p.paragraph) flushText()
          if (p.text) textBuffer.push({ ...bilingual(p.text, l?.text), latin: l?.text })
          break
      }
    }
    flushAll()
  }
  flushAll()
  return out
}
