import * as cheerio from 'cheerio'
import type { AnyNode, Element } from 'domhandler'
import { isTag } from 'domhandler'
import { classes } from './segments'
import type { CycleClass, SlotGroup, SlotType, SourceLang, StructDay, StructPart } from './types'
import { slotTypes, sourceLangs } from './types'

const slotTypeSet = new Set<string>(slotTypes)

// Ordinary Time ferial year-cycles spell I/II as annoprimo/annosecundo.
const cycleNormalize: Record<string, CycleClass> = {
  cicloA: 'cicloA',
  cicloB: 'cicloB',
  cicloC: 'cicloC',
  cicloI: 'cicloI',
  cicloII: 'cicloII',
  annoprimo: 'cicloI',
  annosecundo: 'cicloII',
}

function firstSlotClass(el: Element): SlotType | undefined {
  for (const c of classes(el)) if (slotTypeSet.has(c)) return c as SlotType
  return undefined
}

function firstCycleClass(el: Element): CycleClass | undefined {
  for (const c of classes(el)) {
    const norm = cycleNormalize[c]
    if (norm) return norm
  }
  return undefined
}

function padreIndex(el: Element): number | undefined {
  for (const c of classes(el)) {
    if (c.startsWith('padre_')) {
      const n = Number(c.slice('padre_'.length))
      return Number.isInteger(n) ? n : undefined
    }
  }
  return undefined
}

/**
 * Walk a scope and produce slots in document order.
 * Mirrors convert.py's collect_slots: slot divs (SLOT_TYPES), cycle wrappers,
 * agrupado_* groups inside slots, plain padre divs as 'generic' slots, with a
 * seen-padres set preventing double emission.
 */
export function collectParts(scope: Element): StructPart[] {
  const parts: StructPart[] = []
  const seenPadres = new Set<number>()

  function collectInsideSlot(child: AnyNode, slot: Extract<StructPart, { kind: 'slot' }>): void {
    if (!isTag(child)) return
    const cls = classes(child)

    for (const c of cls) {
      if (c.startsWith('agrupado_')) {
        const group: SlotGroup['group'] = c.slice('agrupado_'.length)
        const idx = padreIndex(child)
        if (idx !== undefined && !seenPadres.has(idx)) {
          slot.groups.push({ group, padre: idx })
          seenPadres.add(idx)
        }
        return
      }
    }

    const idx = padreIndex(child)
    if (idx !== undefined && !seenPadres.has(idx)) {
      const extras = cls.filter((c) => c !== 'padre' && !c.startsWith('padre_'))
      slot.padres.push(idx)
      seenPadres.add(idx)
      if (extras.length > 0) {
        slot.padreClasses = slot.padreClasses ?? {}
        slot.padreClasses[String(idx)] = extras
      }
      // Pentecost nests the sequence body (padre_42) inside the sequence
      // label (padre_41); without descending the inner padre is dropped.
    }
    for (const sub of child.children) collectInsideSlot(sub, slot)
  }

  function walk(el: AnyNode): void {
    if (!isTag(el)) return

    const slotClass = firstSlotClass(el)
    if (slotClass) {
      const slot: Extract<StructPart, { kind: 'slot' }> = {
        kind: 'slot',
        type: slotClass,
        id: el.attribs?.id,
        padres: [],
        groups: [],
      }
      // The slot div itself may carry a padre (e.g. x_titulo padre padre_1).
      const selfIdx = padreIndex(el)
      if (selfIdx !== undefined && !seenPadres.has(selfIdx)) {
        slot.padres.push(selfIdx)
        seenPadres.add(selfIdx)
      }
      for (const child of el.children) collectInsideSlot(child, slot)
      parts.push(slot)
      return
    }

    const cycle = firstCycleClass(el)
    if (cycle) {
      parts.push({ kind: 'cycle_start', cycle })
      for (const child of el.children) walk(child)
      parts.push({ kind: 'cycle_end', cycle })
      return
    }

    const idx = padreIndex(el)
    if (idx !== undefined && !seenPadres.has(idx)) {
      const extras = classes(el).filter((c) => c !== 'padre' && !c.startsWith('padre_'))
      parts.push({
        kind: 'slot',
        type: 'generic',
        padres: [idx],
        groups: [],
        ...(extras.length > 0 ? { classes: extras } : {}),
      })
      seenPadres.add(idx)
      return
    }

    for (const child of el.children) walk(child)
  }

  for (const child of scope.children) walk(child)
  return parts
}

function parseDia(dia: Element): StructDay {
  const langSet = new Set<string>(sourceLangs)
  const languages = classes(dia)
    .filter((c) => c.startsWith('x') && langSet.has(c.slice(1)))
    .map((c) => c.slice(1) as SourceLang)
  return {
    id: dia.attribs?.id,
    languages,
    parts: collectParts(dia),
  }
}

/** Parse an estructura file into a list of days with typed slots. */
export function parseEstructura(html: string): StructDay[] {
  const $ = cheerio.load(html)
  const diaNodes = $('div.dia').toArray()
  if (diaNodes.length > 0) return diaNodes.map(parseDia)

  // plegarias_euc / prefacios intro sections have no dia containers —
  // fall back to flat slot collection over the whole document.
  const root = $('body').toArray()[0] ?? $.root().toArray()[0]
  return [{ id: undefined, languages: [], parts: root ? collectParts(root as Element) : [] }]
}
