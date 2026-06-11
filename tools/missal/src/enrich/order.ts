import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import type { EucharisticPrayer, OrderItem, OrderOfMass } from '@ember/missal-schema'
import type { ParsedFile } from '../parse/types'
import { type EnrichCtx, toLocalized } from './localized'
import { splitOrdinary } from './order-split'
import { toRichText } from './richtext'
import { prettifyTitle } from './title'

/** EPs whose preface is intrinsic to the prayer (renderer hides the day-preface picker). */
export const intrinsicPrefaceEpIds = new Set(['4', '5-i', '5-ii', '5-iii', '5-iv', 'rec-i', 'rec-ii'])

function readMonoItem(dataDir: string, rel: string, id: string, ctx: EnrichCtx): OrderItem | undefined {
  const d = JSON.parse(readFileSync(join(dataDir, rel), 'utf-8')) as { title?: unknown; body?: unknown }
  const body = toRichText(d.body, ctx)
  if (!body) return undefined
  const title = toLocalized(d.title, ctx)
  const item: OrderItem = { id, body }
  if (title) item.title = prettifyTitle(title)
  return item
}

function loadEucharisticPrayers(dataDir: string, patches: EnrichCtx['patches']): EucharisticPrayer[] {
  const dir = join(dataDir, 'library', 'eucharistic-prayer')
  const out: EucharisticPrayer[] = []
  for (const f of readdirSync(dir).sort()) {
    if (!f.endsWith('.json') || f.startsWith('_')) continue
    const epId = f.replace(/\.json$/, '')
    const d = JSON.parse(readFileSync(join(dir, f), 'utf-8')) as { title?: unknown; body?: unknown }
    const ctx: EnrichCtx = { patches, id: `order.eucharistic-prayer.${epId}` }
    const body = toRichText(d.body, ctx)
    if (!body) continue
    const label = prettifyTitle(toLocalized(d.title, ctx) ?? { 'pt-BR': `Oração Eucarística ${epId}` })
    out.push({ id: `order.eucharistic-prayer.${epId}`, label, body })
  }
  return out
}

/**
 * The Order of Mass bundle. The ordinary is carved into per-moment items from
 * the upstream `ordinario` (aligned hijo blocks) when `ordinario` is provided;
 * otherwise the baseline mono-blob frame is emitted whole as a fallback. The
 * universal prayer, solemn blessings, and prayers-over-the-people stay whole
 * (lossless); EPs are already separate.
 */
export function buildOrderOfMass(
  dataDir: string,
  patches: EnrichCtx['patches'],
  ordinario?: ParsedFile,
): OrderOfMass {
  const ctx = (id: string): EnrichCtx => ({ patches, id })
  const items: Record<string, OrderItem> = {}

  if (ordinario) {
    Object.assign(items, splitOrdinary(ordinario))
  } else {
    const frame = readMonoItem(dataDir, 'library/ordinary/ordinario.json', 'order.ordinary-frame', ctx('order.ordinary-frame'))
    if (frame) items[frame.id] = frame
  }

  const universalPrayer = readMonoItem(dataDir, 'library/ordinary/oracion-fieles.json', 'order.universal-prayer', ctx('order.universal-prayer'))
  if (universalPrayer) items[universalPrayer.id] = universalPrayer

  const blessings = readMonoItem(dataDir, 'library/ordinary/bendiciones.json', 'order.solemn-blessings', ctx('order.solemn-blessings'))
  const prayersOverPeople = readMonoItem(dataDir, 'library/ordinary/oraciones-pueblo.json', 'order.prayers-over-the-people', ctx('order.prayers-over-the-people'))

  return {
    items,
    eucharisticPrayers: loadEucharisticPrayers(dataDir, patches),
    solemnBlessings: blessings ? [{ id: blessings.id, title: blessings.title, body: blessings.body }] : [],
    prayersOverThePeople: prayersOverPeople ? [prayersOverPeople] : [],
    solemnBlessingDefaults: {},
  }
}
