// An hour cut into its parts. The cut is made line by line, at the titles and
// labels the book prints ("Hino", "Ant. 1", "Leitura breve"), read from the
// words and not from how a given hour happens to mark them up: the source
// loses a red label here and runs a psalm into its antiphon there, and the
// same words must be the same part wherever they are prayed.

import type { Block, Line } from '../../packages/loth/src/text'
import { lineText } from '../../packages/loth/src/text'

export interface Part {
  slot: string
  blocks: Block[]
}

const isRed = (line: Line) =>
  line.length > 0 && line.every((seg) => typeof seg !== 'string' && (seg.m === 'rubric' || seg.m === 'note'))

type Cue =
  | { at: 'intro' | 'hymn' | 'te-deum' | 'psalmody' | 'collect' | 'canticle' | 'intercessions' | 'prayer' | 'conclusion' | 'psalm' | 'responsory' }
  | { at: 'antiphon'; n?: number }
  | { at: 'reading'; which: 'reading' | 'reading-1' | 'reading-2' }

function cueOf(line: Line, title: boolean): Cue | undefined {
  const text = lineText(line).trim()
  if (!text) return undefined
  // A label is a short line; a sentence that happens to open with the same
  // word is not one.
  const label = title || isRed(line) || line.length === 1
  const antiphon = /^Ant\s*\.?\s*(\d)?\s*\.?(?=\s|$|\p{Lu})/u.exec(text)
  if (antiphon && !/^Ant[íi]fona/i.test(text)) return { at: 'antiphon', ...(antiphon[1] ? { n: Number(antiphon[1]) } : {}) }
  if (/^[℣V]\s*\.?\s*Vinde, ó Deus, em meu aux/i.test(text)) return { at: 'intro' }
  if (text.length > 90 || !label) {
    // The one label met run into its text: "Leitura breveSb 7,13-14".
    return /^Leitura breve\S/.test(text) && text.length < 60 ? { at: 'reading', which: 'reading' } : undefined
  }
  if (/^c[âa]ntico\s+evang[ée]lico/i.test(text)) return { at: 'canticle' }
  if (/^(hino\s+)?te deum\b/i.test(text)) return { at: 'te-deum' }
  if (/^hino$/i.test(text)) return { at: 'hymn' }
  if (/^salmodia$/i.test(text)) return { at: 'psalmody' }
  if (/^coleta salm[óo]dica$/i.test(text)) return { at: 'collect' }
  if (/^leitura breve/i.test(text)) return { at: 'reading', which: 'reading' }
  if (/^primeira leitura$/i.test(text)) return { at: 'reading', which: 'reading-1' }
  if (/^segunda leitura$/i.test(text)) return { at: 'reading', which: 'reading-2' }
  if (/^respons[óo]rio(\s|$)/i.test(text) && text.length < 70) return { at: 'responsory' }
  if (/^(preces|intercess[õo]es)$/i.test(text)) return { at: 'intercessions' }
  if (/^ora[çc][ãa]o$/i.test(text)) return { at: 'prayer' }
  if (/^conclus[ãa]o da hora$/i.test(text)) return { at: 'conclusion' }
  if (/^(salmo|c[âa]ntico)\s+(\d|[A-Z][a-z]?\w*\.?\s*\d|cf\.|de\s)/i.test(text) && text.length < 60 && /\d/.test(text))
    return { at: 'psalm' }
  return undefined
}

// One hour's source runs the title "Hino" into the rubric before it.
function unglued(block: Block): Block {
  if (block.k === 'title') return block
  return {
    ...block,
    lines: block.lines.flatMap((line): Line[] => {
      const last = line[line.length - 1]
      const match = typeof last === 'string' && line.length > 1 ? /^(.*\S)?\s*\bHino$/.exec(last) : undefined
      if (!match || !/^\(?Esta introdução/i.test(lineText(line))) return [line]
      return [[...line.slice(0, -1), ...(match[1] ? [match[1]] : [])], ['Hino']]
    }),
  }
}

export function slotsOf(blocks: Block[], hour: string): Part[] {
  const parts: Part[] = []
  let slot = 'head'
  let region: 'head' | 'psalmody' | 'canticle' | 'other' = 'head'
  // The psalm of the psalmody being read, and how far into it we are.
  let unit = 0
  let unitHasPsalm = false
  let unitClosed = true
  let lastReading = ''
  let canticleHasBody = false
  let hymnSeen = false

  const put = (name: string, line: Line, title: boolean, opensBlock: boolean) => {
    const last = parts[parts.length - 1]
    const part = last && last.slot === name ? last : { slot: name, blocks: [] as Block[] }
    if (part !== last) parts.push(part)
    const open = part.blocks[part.blocks.length - 1]
    if (title || opensBlock || !open || open.k === 'title') part.blocks.push({ k: title ? 'title' : 'p', lines: [line] })
    else open.lines.push(line)
    slot = name
  }
  const openUnit = (n?: number) => {
    unit = n ?? unit + 1
    unitHasPsalm = false
    unitClosed = false
  }

  for (const block of blocks.map(unglued)) {
    block.lines.forEach((line, i) => {
      const title = block.k === 'title'
      const cue = cueOf(line, title)
      const place = (name: string) => put(name, line, title, i === 0 || name !== slot)

      switch (cue?.at) {
        case 'intro':
          region = 'head'
          return place('intro')
        case 'hymn':
          // The hymn that follows the readings is the Te Deum.
          region = 'other'
          if (lastReading || hymnSeen) return place(lastReading ? 'te-deum' : 'hymn')
          hymnSeen = true
          return place('hymn')
        case 'te-deum':
          region = 'other'
          return place('te-deum')
        case 'psalmody':
          region = 'psalmody'
          unit = 0
          unitClosed = true
          return place('psalmody')
        case 'collect':
          if (region === 'canticle') return place('canticle-collect')
          region = 'psalmody'
          if (unit === 0) openUnit()
          unitClosed = true
          return place(`collect-${unit}`)
        case 'canticle':
          // Night Prayer on some days gives the antiphon first and the
          // canticle's name after it.
          if (region === 'canticle' && slot === 'canticle-ant') {
            canticleHasBody = true
            return place('canticle')
          }
          region = 'canticle'
          canticleHasBody = false
          return place('canticle-title')
        case 'psalm':
          if (region === 'canticle') {
            canticleHasBody = true
            return place('canticle')
          }
          if (region === 'other' && lastReading) return place(slot)
          region = 'psalmody'
          if (unit === 0 || unitClosed) openUnit()
          unitHasPsalm = true
          return place(`psalm-${unit}`)
        case 'antiphon':
          // After the short responsory the next antiphon is the Gospel
          // canticle's, whether or not the canticle is announced.
          if (region === 'other' && slot === 'responsory') {
            region = 'canticle'
            canticleHasBody = false
          }
          if (region === 'canticle') return place(canticleHasBody ? 'canticle-ant-end' : 'canticle-ant')
          if (region === 'other') return place(slot)
          region = 'psalmody'
          if (cue.n !== undefined) {
            openUnit(cue.n)
            return place(`ant-${unit}`)
          }
          if (unit > 0 && unitHasPsalm && !unitClosed) {
            unitClosed = true
            return place(`ant-${unit}-end`)
          }
          openUnit()
          return place(`ant-${unit}`)
        case 'reading':
          region = 'other'
          lastReading = cue.which
          return place(cue.which)
        case 'responsory':
          region = 'other'
          return place(lastReading.includes('-') ? lastReading.replace('reading', 'responsory') : 'responsory')
        case 'intercessions':
        case 'prayer':
        case 'conclusion':
          region = 'other'
          return place(cue.at)
      }

      // No label: the line belongs to what is open.
      const text = lineText(line).trim()
      // What opens the hour is a line of each kind, and each has its own
      // reason to change: the celebration's name with the celebration, its
      // rank with the season, the weekday's name with the weekday.
      if (region === 'head' && slot.startsWith('head')) {
        if (!text) return place(slot)
        const letters = text.replace(/[^\p{L}]/gu, '')
        if (/^(mem[óo]ria|festa|solenidade)(\s+facultativa)?$/i.test(text)) return place('head-rank')
        if (/^\(?\s*do comum\b/i.test(text)) return place('head-common')
        if (/^(i{1,2}\s+)?(laudes|v[ée]speras|completas|of[íi]cio das leituras|hora m[ée]dia|invitat[óo]rio)$/i.test(text))
          return place('head-hour')
        if (/^((I|II|III|IV)\s+)?(DOMINGO|SEGUNDA|TERÇA|QUARTA|QUINTA|SEXTA|SÁBADO)(-FEIRA)?$/.test(text))
          return place('head-day')
        if (letters.length >= 4 && text === text.toUpperCase()) return place('head-title')
        return place('head-text')
      }
      // The rubric under the opening versicle names the hour, and is not it.
      if (slot === 'intro' && /^\(?Esta introdução/i.test(text)) return place('intro-note')
      if (slot === 'intro-note' && text && !/^\(?Esta introdução/i.test(text) && !isRed(line)) return place('opening')
      if (region === 'psalmody') {
        // The versicle that leads from the psalms to the readings.
        if (hour === 'leituras' && unitClosed && /^[℣V]\s*\.?\s*\S/.test(text) && text.length > 6) return place('verse')
        if (slot === 'verse') return place('verse')
        if (unit > 0 && /^ant-\d+$/.test(slot) && /^[–—=]|^\p{Lu}.*\*\s*$/u.test(text)) {
          // The psalm begins under its antiphon without a title of its own.
          unitHasPsalm = true
          return place(`psalm-${unit}`)
        }
      }
      if (region === 'canticle' && (slot === 'canticle-ant' || slot === 'canticle-title')) {
        // The canticle itself begins at its first verse, or at the title the
        // book sets over it in bold.
        const bold = line.length > 0 && line.every((seg) => typeof seg !== 'string' && seg.m === 'bold')
        if (/^[–—=]/.test(text) || (bold && slot === 'canticle-ant')) {
          canticleHasBody = true
          return place('canticle')
        }
      }
      return place(slot)
    })
  }

  // A slot met twice apart is two parts; number the later ones.
  const seen = new Map<string, number>()
  return parts.map((part) => {
    const n = (seen.get(part.slot) ?? 0) + 1
    seen.set(part.slot, n)
    return n === 1 ? part : { ...part, slot: `${part.slot}~${n}` }
  })
}
