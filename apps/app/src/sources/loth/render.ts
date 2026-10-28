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
  // The celebration's name as the calendar writes it. The hours print it in
  // capitals, which a title set in the app's own type does not need.
  celebration?: string
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
  return (
    line
      .filter((seg) => !isMarked(seg, 'link'))
      .map((seg) =>
        isRed(seg) && segText(seg).trim() ? `/:${segText(seg).trim()}:/` : segText(seg),
      )
      .join('')
      .replace(/:\/(?=[\p{L}\p{N}“"'])/gu, ':/ ')
      // The asterisk and the dagger stay with the word they follow.
      .replace(/ (?=[*†](?:\s|$))/g, '\u00A0')
      .trim()
  )
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
  const read = line.map((seg): Seg => {
    if (typeof seg === 'string' || seg.m !== 'link') return seg
    return red ? { m: 'rubric', t: seg.t } : seg.t
  })
  // Some hours print "Ant. 2" or "R." in black with the text; it is the same label.
  const first = read[0]
  const label =
    typeof first === 'string'
      ? (/^\s*(Ant\.\s*\d?)\s*(\S.*)?$/.exec(first) ?? /^\s*([RV]\.)\s+(\S.*)?$/.exec(first))
      : undefined
  if (!label || (!label[2] && read.length === 1)) return read
  return [{ m: 'rubric', t: label[1] }, ` ${label[2] ?? ''}`, ...read.slice(1)]
}

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

// The titles the book sets over a part of the hour, with the citation some
// carry: "Leitura breve Rm 12,1-2", "Responsório Cf. Sl 71(72),6.19".
const sectionTitle =
  /^(Hino|Salmodia|Preces|Intercessões|Oração|Conclusão da Hora|Te Deum|Antífonas? fina(?:l|is) de Nossa Senhora|Leitura breve|Primeira leitura|Segunda leitura|Responsório breve|Responsório|Leitura)(?:\s+(.+))?$/i
const psalmTitle = /^(salmo|c[âa]ntico|sl)\b/i
const psalmPrayer = /^\s*Coleta salm[óo]dica\s*$/i
const gospelCanticle = /^C[âa]ntico evang[ée]lico\s*(?:\(([^)]*)\))?\s*(,\s*Ant\.?)?\s*$/i

function heading(text: string, note?: string): Primitive {
  return {
    type: 'heading',
    text: { primary: text },
    size: 'h2',
    ...(note ? { note: { primary: note } } : {}),
  }
}

// Canticle headings whose antiphon follows unlabelled, in the next block.
const pendingAntiphon = new WeakSet<Primitive>()
// Titles made of a line the hour prints in capitals.
const capitalTitles = new WeakMap<Primitive, string[]>()

// "Cântico evangélico (MAGNIFICAT)", with the citation where the line has it.
function canticleHeading(match: RegExpExecArray, cited: string[]): Primitive {
  const name = match[1] && match[1] === match[1].toUpperCase() ? titleCase(match[1]) : match[1]
  const title = heading('Cântico evangélico', [name, ...cited].filter(Boolean).join(' · '))
  if (match[2]) pendingAntiphon.add(title)
  return title
}

function titled(text: string): Primitive | undefined {
  const section = text.length < 70 ? sectionTitle.exec(text) : undefined
  if (!section) return undefined
  // "Hino" is a title; "Hino Te Deum" names what follows.
  if (section[2] && !/^(leitura|primeira|segunda|respons)/i.test(section[1])) return undefined
  const name = /^te deum$/i.test(section[1]) ? 'Te Deum' : capitalise(section[1])
  return heading(name, section[2])
}

// What opens an hour, before its first part: the names the page already
// carries are left out, and the celebration's is set as the title it is.
const whichVespers = /^I{1,2} V[ée]speras$/i
const hourName =
  /^(laudes|v[ée]speras|completas|of[íi]cio das leituras|hora m[ée]dia|invitat[óo]rio)$/i
const psalterDay =
  /^(?:(?:I|II|III|IV)\s+)?(?:DOMINGO|SEGUNDA|TERÇA|QUARTA|QUINTA|SEXTA|SÁBADO)(?:-FEIRA)?$/
const smallWords = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'no', 'na', 'a', 'o', 'ou'])

function isCapitals(line: Line): boolean {
  const text = lineText(line).trim()
  return (
    line.every((seg) => typeof seg === 'string' || seg.m === 'bold') &&
    text.replace(/[^\p{L}]/gu, '').length >= 4 &&
    text === text.toUpperCase()
  )
}

const titleCase = (text: string) =>
  text
    .toLowerCase()
    .split(' ')
    .map((word, i) => (i > 0 && smallWords.has(word) ? word : capitalise(word)))
    .join(' ')
    .replace(/\b([ivx]+)\b(?= (domingo|semana))/gi, (roman) => roman.toUpperCase())

const letters = (text: string) => text.toUpperCase().replace(/[^\p{L}\p{N}]/gu, '')

/** A title printed in capitals, in the calendar's own casing where it is the celebration's. */
function named(capitals: string, celebration: string | undefined): string {
  const known = celebration?.replace(/\s*\n\s*/g, ' — ')
  if (!known || letters(known) !== letters(capitals)) return titleCase(capitals)
  // Easter Sunday is in capitals in the calendar too.
  return known === known.toUpperCase() ? titleCase(known) : known
}

// Lines the book breaks itself are verse where they are pointed for singing
// (a psalm) or short (a hymn, a formula); a reading broken into paragraphs is
// still prose.
const pointing = /^\s*[–—=]|[*†]\s*$/
function isVerse(text: string): boolean {
  const lines = text.split('\n')
  return lines.some((line) => pointing.test(line)) || lines.every((line) => line.length <= 70)
}

interface BlockOptions {
  depth: number
  // The block opens the hour.
  head?: boolean
}

function renderBlock(block: Block, ctx: RenderContext, out: Primitive[], options: BlockOptions) {
  if (block.k === 'title') {
    const text = lineText(block.lines[0]).trim()
    const canticle = gospelCanticle.exec(text)
    if (canticle) out.push(canticleHeading(canticle, []))
    else if (psalmTitle.test(text)) out.push({ type: 'rubric', text: { primary: text } })
    else out.push(titled(text) ?? heading(text))
    return
  }

  // The primitive the block is still adding lines to.
  let open: Primitive | undefined
  // Whether the open verse may still take a line that runs on from it: an
  // antiphon until its psalm begins, a versicle or response until its sentence ends.
  let runsOn: 'antiphon' | 'sentence' | undefined
  // The antiphon of the Gospel canticle, where the book prints its label in
  // the canticle's title instead of before it.
  let unlabelledAntiphon = false
  const last = out[out.length - 1]
  // The rank and the Common come as paragraphs of their own under the name.
  if (options.head && last?.type === 'heading' && capitalTitles.has(last)) open = last
  // A label alone on its line: the antiphon is the paragraph after it.
  if (last?.type === 'verses' && last.items[last.items.length - 1].text.primary === '') {
    open = last
    runsOn = 'antiphon'
  }
  if (
    last?.type === 'heading' &&
    last.text.primary === 'Cântico evangélico' &&
    pendingAntiphon.has(last)
  ) {
    unlabelledAntiphon = true
    pendingAntiphon.delete(last)
  } else if (last?.type === 'heading' && last.text.primary === 'Cântico evangélico') {
    // The citation and the Latin stand in the paragraph under the title.
    const first = block.lines[0] ?? []
    if (first.every((seg) => isMarked(seg, 'link', 'rubric', 'note'))) open = last
  }

  for (const line of block.lines) {
    const shown = inSentence(line)
    const kind = kindOf(shown)
    const text = lineText(shown).trim()
    if (text) {
      // The canticle's title may share its line with the link to the Latin
      // and with the citation.
      const label = shown.find((seg) => segText(seg).trim())
      const canticle =
        kind === 'rubric' && label ? gospelCanticle.exec(segText(label).trim()) : undefined
      const told = shown.filter((seg) => segText(seg).trim())
      const section = told.length === 1 && kind !== 'antiphon' ? titled(text) : undefined
      const alone = told.length === 1 && (kind === 'styled' || kind === 'pointed')
      const celebrated =
        alone && ctx.celebration !== undefined && letters(text) === letters(ctx.celebration)
      if (alone && (hourName.test(text) || (options.head && psalterDay.test(text)))) {
        // The page already says which hour this is, and of which day.
      } else if (alone && whichVespers.test(text)) {
        open = { type: 'rubric', text: { primary: text } }
        out.push(open)
        runsOn = undefined
      } else if ((options.head && isCapitals(shown)) || celebrated) {
        const above = out[out.length - 1]
        const over = above?.type === 'heading' ? capitalTitles.get(above) : undefined
        // A title too long for its line runs on into the next: "…, BISPO" /
        // "E DOUTOR DA IGREJA", "NOSSO SENHOR JESUS CRISTO," / "REI DO UNIVERSO".
        const runOn =
          over &&
          (/^(E|DE|DA|DO|DAS|DOS|NA|NO)\s/.test(text) ||
            over[over.length - 1].endsWith(',') ||
            (ctx.celebration !== undefined &&
              letters(`${over[over.length - 1]}${text}`) === letters(ctx.celebration)))
            ? over[over.length - 1]
            : undefined
        const title = named(runOn ? `${runOn} ${text}` : text, ctx.celebration)
        if (above?.type === 'heading' && over && runOn) {
          over[over.length - 1] = `${runOn} ${text}`
          above.text = { primary: title }
          open = above
        } else if (
          above?.type === 'heading' &&
          over &&
          above.note?.primary === over.slice(0, -1).map(titleCase).join(' · ')
        ) {
          // "Tríduo Pascal" over "Sexta-feira da Paixão": the day is the
          // title, and what it belongs to is set under it.
          over.push(text)
          above.text = { primary: title }
          above.note = { primary: over.slice(0, -1).map(titleCase).join(' · ') }
          open = above
        } else if (above?.type === 'heading' && over && !above.note) {
          over.push(text)
          above.text = { primary: title }
          above.note = { primary: titleCase(over[0]) }
          open = above
        } else {
          open = heading(title)
          capitalTitles.set(open, [text])
          out.push(open)
        }
        runsOn = undefined
      } else if (open?.type === 'heading' && kind === 'rubric' && !canticle && !section) {
        // Under a title: the rank, the Common it draws on, the citation.
        const note = text.replace(/^\((.*)\)$/, '$1')
        open.note = { primary: open.note ? `${open.note.primary} · ${note}` : note }
      } else if (canticle) {
        const cited = line
          .filter((seg) => seg !== label && isMarked(seg, 'rubric', 'note') && segText(seg).trim())
          .map((seg) => segText(seg).trim())
        open = canticleHeading(canticle, cited)
        out.push(open)
        runsOn = undefined
      } else if (section) {
        open = section
        out.push(open)
        runsOn = undefined
      } else if (kind === 'rubric') {
        // The fifth part of a long psalm, which the source took for a versicle.
        const said = text === '℣.' ? 'V' : text
        if (open?.type === 'rubric') open.text.primary += `\n${said}`
        else {
          open = { type: 'rubric', text: { primary: said } }
          out.push(open)
        }
        runsOn = undefined
      } else if (
        kind === 'versicle' ||
        kind === 'response' ||
        kind === 'antiphon' ||
        unlabelledAntiphon
      ) {
        const labelled = !unlabelledAntiphon
        const label = labelled ? segText(shown[0]).trim() : 'Ant.'
        const number = antiphon.exec(label)?.[1]
        const item: VersesPrimitive['items'][number] = {
          text: { primary: pointed(labelled ? shown.slice(1) : shown) },
          ...(kind === 'antiphon' || !labelled
            ? // The number stays on the label's own line.
              { mark: number ? `Ant. ${number}` : 'Ant.' }
            : { role: kind === 'versicle' ? ('v' as const) : ('r' as const) }),
        }
        const before = out[out.length - 1]
        if (
          open?.type === 'verses' ||
          (!open && before?.type === 'verses' && before.style === 'vr')
        ) {
          const verses = (open ?? before) as VersesPrimitive
          verses.items.push(item)
          open = verses
        } else {
          open = { type: 'verses', style: 'vr', markup: 'do', items: [item] }
          out.push(open)
        }
        runsOn = kind === 'versicle' || kind === 'response' ? 'sentence' : 'antiphon'
        unlabelledAntiphon = false
      } else if (
        open?.type === 'verses' &&
        runsOn &&
        kind === 'pointed' &&
        continues(open, runsOn, shown)
      ) {
        // The second line of an antiphon or of a response: one sentence, so
        // it runs on as prose and the column sets it.
        const item = open.items[open.items.length - 1]
        item.text.primary = `${item.text.primary} ${pointed(shown)}`.trim()
      } else if (/^[_\s]{5,}$/.test(text)) {
        // A ruled line typed out in the source.
        out.push({ type: 'divider' })
        open = undefined
        runsOn = undefined
      } else if (
        told.length === 1 &&
        text.length < 60 &&
        psalmTitle.test(text) &&
        /\d/.test(text)
      ) {
        // A psalm named in black: "Salmo 150", "Cântico Dn 3,52-57".
        open = { type: 'rubric', text: { primary: text } }
        out.push(open)
        runsOn = undefined
      } else if (kind === 'styled') {
        // A psalm's title, the sentence under it: each a paragraph of its own.
        open = { type: 'text', text: { primary: markdown(shown) } }
        out.push(open)
        runsOn = undefined
      } else {
        const said = pointed(shown)
        if (open?.type === 'text' && open.markup === 'do') {
          open.text.primary += `\n${said}`
          if (isVerse(open.text.primary)) open.layout = 'verse'
          else delete open.layout
        } else {
          open = { type: 'text', text: { primary: said }, markup: 'do' }
          out.push(open)
        }
        runsOn = undefined
      }
    }
    for (const seg of line) {
      if (typeof seg === 'string' || seg.m !== 'link' || !seg.to) continue
      const extra = ctx.extras[seg.to]
      // A link inside a linked text is not followed again.
      if (!extra || options.depth > 0) continue
      out.push({
        type: 'container',
        behavior: {
          kind: 'collapsible',
          title: { primary: capitalise(seg.t.trim()) },
          defaultOpen: false,
        },
        children: renderBlocks(extra, ctx, { depth: options.depth + 1 }),
      })
      // A title keeps taking what is set under it.
      if (open?.type !== 'heading') open = undefined
    }
  }
}

export function renderBlocks(
  blocks: Block[],
  ctx: RenderContext,
  options: BlockOptions = { depth: 0 },
): Primitive[] {
  const out: Primitive[] = []
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]
    const prayer = blocks[i + 1]
    // The psalm-prayer is optional in the book: folded away, and only it,
    // whatever the source ran on after it.
    if (block.k === 'title' && psalmPrayer.test(lineText(block.lines[0])) && prayer?.k === 'p') {
      out.push({
        type: 'container',
        behavior: {
          kind: 'collapsible',
          title: { primary: lineText(block.lines[0]).trim() },
          defaultOpen: false,
        },
        children: renderBlocks([prayer], ctx, { depth: options.depth + 1 }),
      })
      i++
      continue
    }
    renderBlock(block, ctx, out, options)
  }
  // On the Sundays of Lent and Easter the corpus has the Gospel canticle's
  // label and no antiphon under it; a label with nothing to say is not shown.
  const said = out.flatMap((p): Primitive[] => {
    if (p.type !== 'verses') return [p]
    const items = p.items.filter((item) => item.text.primary.trim() !== '')
    return items.length > 0 ? [{ ...p, items }] : []
  })
  return options.depth === 0 ? alternatives(said) : said
}

const isChoice = (p: Primitive) =>
  p.type === 'rubric' && /^(Ou|Aut)\s*:?$/i.test(p.text.primary.trim())
const isText = (p: Primitive) => p.type === 'text' || p.type === 'verses'

function firstWords(option: Primitive[]): string {
  const first = option[0]
  const text =
    first?.type === 'text'
      ? first.text.primary
      : first?.type === 'verses'
        ? first.items[0].text.primary
        : ''
  const line = text
    .split('\n')[0]
    .replace(/\/:.*?:\//g, '')
    .replace(/[ *†]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[,;:.!]+$/, '')
  return line.length > 36 ? `${line.slice(0, line.lastIndexOf(' ', 34))}…` : line
}

/**
 * Texts the book offers one of, set apart by "Ou:" (the hymns of Night
 * Prayer, the antiphons of Our Lady), become a choice instead of a column to
 * scroll past. Each runs from one rubric or title to the next.
 */
function alternatives(primitives: Primitive[]): Primitive[] {
  const out: Primitive[] = []
  let i = 0
  while (i < primitives.length) {
    if (!isText(primitives[i])) {
      out.push(primitives[i++])
      continue
    }
    const options: Primitive[][] = [[]]
    let j = i
    for (; j < primitives.length; j++) {
      const p = primitives[j]
      if (isText(p)) options[options.length - 1].push(p)
      else if (isChoice(p) && j + 1 < primitives.length && isText(primitives[j + 1]))
        options.push([])
      else break
    }
    // An antiphon on either side of "Ou:" is two psalms meeting, not a choice.
    const whole = options.every((option) => option.some((p) => p.type === 'text'))
    if (options.length === 1 || !whole) {
      out.push(...primitives.slice(i, j))
    } else {
      // The title the choice stands under is its label: "Hino", then the two.
      const above = out[out.length - 1]
      const label = above?.type === 'heading' && !above.note ? above.text.primary : ''
      if (label) out.pop()
      out.push({
        type: 'container',
        behavior: {
          kind: 'options',
          label: { primary: label },
          pickerStyle: 'chips',
          options: options.map((children, n) => ({
            id: String(n + 1),
            label: { primary: firstWords(children) },
            children,
          })),
        },
      })
    }
    i = j
  }
  return out
}

/**
 * A part the book leaves to choice (the two hymns of a little hour): the
 * texts in the book's order with "Ou:" between, which `alternatives` makes a
 * choice of, opened on the one the breviary this corpus was drawn from prints
 * that day.
 */
function chosenAmong(choices: Block[][], chosen: number, ctx: RenderContext): Primitive[] {
  const or: Block = { k: 'p', lines: [[{ m: 'rubric', t: 'Ou:' }]] }
  const [first, ...others] = choices
  // Each comes under the part's title ("Hino"); it is said once.
  const untitled = (blocks: Block[]) => (blocks[0]?.k === 'title' ? blocks.slice(1) : blocks)
  return renderBlocks([...first, ...others.flatMap((other) => [or, ...untitled(other)])], ctx).map(
    (p): Primitive =>
      p.type === 'container' && p.behavior.kind === 'options'
        ? { ...p, behavior: { ...p.behavior, initialId: String(chosen + 1) } }
        : p,
  )
}

/** An hour's parts as primitives. */
export function renderParts(parts: HourPart[], ctx: RenderContext): Primitive[] {
  // What opens the hour comes as a part to each kind of line (the name, the
  // rank, the Common); it is read as the one heading it is.
  const opening = parts.filter((part) => part.slot.startsWith('head'))
  const rest = parts.filter((part) => !part.slot.startsWith('head'))
  return [
    ...renderBlocks(
      opening.flatMap((part) => part.blocks),
      ctx,
      { depth: 0, head: true },
    ),
    ...rest.flatMap((part) =>
      part.choices
        ? chosenAmong(part.choices, part.chosen ?? 0, ctx)
        : renderBlocks(part.blocks, ctx),
    ),
  ]
}
