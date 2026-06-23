import type { ChildNode, Element } from 'domhandler'
import { parseDocument } from 'htmlparser2'
import type { Primitive, RubricPrimitive, VersesPrimitive } from '@/content/primitives'
import { findElement, findElementInList, hasClass, isTag } from '../dom'
import {
  type DaytimeHour,
  daytimeHours,
  daytimeMarkers,
  type HourId,
  type IbLang,
  isDaytimeHour,
} from './config'

// iBreviary serves one office as linear HTML, but the two editions mark it up
// differently: PT uses many small <p>s (one per stanza/rubric), EN packs whole
// sections into giant <p>s separated by <br><br>. The common denominator is a
// run/line/block model: inline runs styled by their enclosing span class,
// lines split on <br>, blocks split on blank lines or </p>. Blocks then map
// onto primitives line-by-line.

type RunStyle = 'plain' | 'rubric' | 'italic'
type Run = { style: RunStyle; text: string }
type Line = Run[]
type Block = Line[]

// — DOM → blocks —

type Collector = {
  blocks: Block[]
  line: Line
  block: Block
}

function pushRun(c: Collector, style: RunStyle, text: string) {
  if (!text) return
  c.line.push({ style, text })
}

function endLine(c: Collector) {
  const hasText = c.line.some((r) => r.text.trim().length > 0)
  if (hasText) {
    c.block.push(c.line)
    c.line = []
    return false // line had content
  }
  c.line = []
  return true // blank line
}

function endBlock(c: Collector) {
  endLine(c)
  if (c.block.length > 0) c.blocks.push(c.block)
  c.block = []
}

// iBreviary's rubric red. Rubrics normally carry class="rubrica", but a few
// hand-edited days inline the colour on a bare <span> instead (no class) — e.g.
// some "SEGUNDA LEITURA" labels. Treat that exact red as a rubric too, so the
// label anchors second-reading extraction and renders red like every other day.
const rubricRed = /color:\s*#dc2300/i

// `rubrica` and `capolettera_piccolo` (EN section labels) both render red;
// `citazione`/<em> are italic. `sezione` is the page title — the practice UI
// already names the hour, so it's dropped.
function spanStyle(el: Element, inherited: RunStyle): RunStyle | 'skip' {
  if (hasClass(el, 'sezione')) return 'skip'
  if (hasClass(el, 'rubrica') || hasClass(el, 'capolettera_piccolo')) return 'rubric'
  if (rubricRed.test(el.attribs.style ?? '')) return 'rubric'
  if (hasClass(el, 'citazione')) return 'italic'
  return inherited
}

function walkInline(nodes: ChildNode[], style: RunStyle, c: Collector) {
  for (const n of nodes) {
    if (n.type === 'text') {
      pushRun(c, style, n.data)
      continue
    }
    if (!isTag(n)) continue
    if (n.name === 'br') {
      const blank = endLine(c)
      if (blank) endBlock(c) // <br><br> → block boundary
      continue
    }
    if (n.name === 'a' || n.name === 'script') continue // nav links and scripts carry no prayer text
    if (n.name === 'em' || n.name === 'i') {
      walkInline(n.children, 'italic', c)
      continue
    }
    if (n.name === 'span') {
      const s = spanStyle(n, style)
      if (s !== 'skip') walkInline(n.children, s, c)
      continue
    }
    // strong/b and anything else: style passes through
    walkInline(n.children, style, c)
  }
}

function collectBlocks(inner: Element): Block[] {
  const c: Collector = { blocks: [], line: [], block: [] }
  for (const child of inner.children) {
    if (!isTag(child)) continue
    if (child.name !== 'p') continue // h1 page title, scripts, layout divs
    const style: RunStyle = hasClass(child, 'rubrica') ? 'rubric' : 'plain'
    walkInline(child.children, style, c)
    endBlock(c)
  }
  endBlock(c)
  return c.blocks
}

// — lines → primitives —

const lineText = (line: Line) => normalize(line.map((r) => r.text).join(''))

// Collapse internal whitespace but keep a two-space indent where the source
// indented the line (psalm verse continuations use &nbsp; runs).
function normalize(raw: string): string {
  const indented = /^[\s ]{2,}/.test(raw)
  const text = raw.replace(/[\s ]+/g, ' ').trim()
  return indented && text ? `  ${text}` : text
}

const isFlexMark = (t: string) => /^[*†+]$/.test(t)
const isDash = (t: string) => /^[—–-]$/.test(t)
const vrRole = (t: string): 'v' | 'r' | undefined =>
  /^(V\.|℣\.?)$/.test(t) ? 'v' : /^(R\.|℟\.?)$/.test(t) ? 'r' : undefined

type Item =
  // `rest` is the text after a leading inline label ('Ant. 1', 'LEITURA
  // BREVE …') — the caller emits it as a separate text item after the rubric.
  | { tag: 'rubric'; text: string; rest?: string }
  | { tag: 'italic'; text: string }
  | { tag: 'text'; text: string }
  | { tag: 'verse'; role: 'v' | 'r'; text: string }

const restOfLine = (line: Line, lead: Run) =>
  normalize(
    line
      .slice(line.indexOf(lead) + 1)
      .map((r) => r.text)
      .join(''),
  )

function classifyLine(line: Line): Item {
  const runs = line.filter((r) => r.text.trim().length > 0)
  const allRubric = runs.every((r) => r.style === 'rubric')
  if (allRubric) return { tag: 'rubric', text: lineText(line) }

  const lead = runs[0]
  if (lead.style === 'rubric') {
    const label = normalize(lead.text)
    const rest = restOfLine(line, lead)
    const role = vrRole(label)
    if (role) return { tag: 'verse', role, text: rest }
    if (isDash(label)) return { tag: 'text', text: `— ${rest}` }
    // A leading label becomes its own rubric with the remainder carried as
    // `rest`; mid-line rubric runs (flex marks, lone parens) fold into the
    // plain text below instead.
    const isLabel = !isFlexMark(label) && /[\p{L}\d]/u.test(label)
    if (isLabel) return { tag: 'rubric', text: label, rest }
  }
  if (lead.style === 'italic') return { tag: 'italic', text: lineText(line) }
  return { tag: 'text', text: lineText(line) }
}

function blockToItems(block: Block): Item[] {
  const items: Item[] = []
  for (const line of block) {
    if (!line.some((r) => r.text.trim().length > 0)) continue
    const item = classifyLine(line)
    items.push(item)
    if (item.tag === 'rubric' && item.rest) items.push({ tag: 'text', text: item.rest })
  }
  return items
}

function itemsToPrimitives(items: Item[]): Primitive[] {
  const out: Primitive[] = []
  for (const item of items) {
    const prev = out[out.length - 1]
    switch (item.tag) {
      case 'verse': {
        if (prev?.type === 'verses') {
          prev.items.push({ text: { primary: item.text }, role: item.role })
        } else {
          const verses: VersesPrimitive = {
            type: 'verses',
            style: 'vr',
            items: [{ text: { primary: item.text }, role: item.role }],
          }
          out.push(verses)
        }
        break
      }
      case 'rubric': {
        if (prev?.type === 'rubric') {
          prev.text.primary += `\n${item.text}`
        } else {
          const rubric: RubricPrimitive = { type: 'rubric', text: { primary: item.text } }
          out.push(rubric)
        }
        break
      }
      case 'italic':
      case 'text': {
        // Multi-line versicles ("V. May the Lord bless us,\nprotect us…"):
        // plain continuation lines after a V/R line belong to that verse.
        if (item.tag === 'text' && prev?.type === 'verses') {
          const last = prev.items[prev.items.length - 1]
          last.text.primary += `\n${item.text}`
          break
        }
        const style = item.tag === 'italic' ? ('italic' as const) : undefined
        if (prev?.type === 'text' && prev.style === style) {
          prev.text.primary += `\n${item.text}`
        } else {
          out.push({ type: 'text', text: { primary: item.text }, ...(style ? { style } : {}) })
        }
        break
      }
    }
  }
  return out
}

const blockText = (block: Block) => block.map(lineText).join('\n')

// '******' opens iBreviary's trailing junk: donate/newsletter links and the
// alternate-texts appendix the main flow links into. Everything from it on is
// dropped (the office proper is complete before it).
const isJunkBoundary = (block: Block) => /^\*{3,}$/.test(blockText(block).trim())

export function parseHour(html: string): Primitive[] {
  const doc = parseDocument(html, { decodeEntities: true })
  const contenuto = findElementInList(doc.children, (el) => el.attribs.id === 'contenuto')
  const inner = contenuto && findElement(contenuto, (el) => hasClass(el, 'inner'))
  if (!inner) throw new Error('ibreviary: #contenuto .inner not found (page layout changed?)')

  const primitives: Primitive[] = []
  for (const block of collectBlocks(inner)) {
    if (isJunkBoundary(block)) break
    primitives.push(...itemsToPrimitives(blockToItems(block)))
  }
  if (primitives.length === 0) throw new Error('ibreviary: page parsed to no content')
  return primitives
}

// — daytime (ora_media) splitting —

const primitiveFirstLine = (p: Primitive): string => {
  if (p.type === 'rubric' || p.type === 'heading') return p.text.primary.split('\n')[0]
  if (p.type === 'text') return p.text.primary.split('\n')[0]
  return ''
}

// A primitive that returns the stream to common (shared by all three hours)
// after an hour-specific block, per edition. EN prints the concluding prayer
// + acclamation once after the last hour's reading; PT repeats the oration
// per hour and shares only the closing Benedicamus versicle; LA returns to
// common twice — at the psalmody (after the per-hour hymns) and at the
// shared oration.
const commonStarts: Record<IbLang, (p: Primitive) => boolean> = {
  en: (p) => p.type === 'rubric' && /^(CONCLUDING PRAYER|ACCLAMATION)/i.test(p.text.primary),
  pt: (p) => p.type === 'verses' && /^Bendigamos/.test(p.items[0]?.text.primary ?? ''),
  la: (p) => p.type === 'rubric' && /^(PSALMODIA|ORATIO)/i.test(p.text.primary),
}

// ora_media carries the three little hours on one page, alternating shared
// parts (opening, psalmody, ending) with hour-specific blocks introduced by
// marker paragraphs. Walk the stream tracking the current region: a marker
// switches to its hour, a commonStarts hit switches back; common primitives
// go to all three hours, hour primitives only to theirs.
export function splitDaytime(
  primitives: Primitive[],
  ibLang: IbLang,
): Record<DaytimeHour, Primitive[]> {
  const markers = daytimeMarkers[ibLang]
  const markerHourOf = (p: Primitive): DaytimeHour | undefined => {
    const first = primitiveFirstLine(p).toUpperCase()
    const i = markers.findIndex((m) => first.startsWith(m.toUpperCase()))
    return i === -1 ? undefined : daytimeHours[i]
  }

  const out: Record<DaytimeHour, Primitive[]> = { terce: [], sext: [], none: [] }
  let region: DaytimeHour | 'common' = 'common'
  const seen = new Set<DaytimeHour>()
  for (const p of primitives) {
    const hour = markerHourOf(p)
    if (hour) {
      region = hour
      seen.add(hour)
      continue // the marker itself is dropped — the hour picker already names it
    }
    if (region !== 'common' && commonStarts[ibLang](p)) region = 'common'
    if (region === 'common') {
      for (const h of daytimeHours) out[h].push(p)
    } else {
      out[region].push(p)
    }
  }
  if (seen.size < daytimeHours.length) {
    throw new Error(`ibreviary: daytime hour markers not found (${markers.join(', ')})`)
  }
  return out
}

export function parseHourPage(html: string, hour: HourId, ibLang: IbLang): Primitive[] {
  const primitives = parseHour(html)
  if (isDaytimeHour(hour)) return splitDaytime(primitives, ibLang)[hour]
  return primitives
}
