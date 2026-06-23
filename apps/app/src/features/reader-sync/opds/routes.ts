// Maps a GET path to an OPDS feed or a freshly-built EPUB. The local server
// owns sockets and HTTP framing; this module owns content. Built EPUBs are
// cached in memory keyed by id+updated, so a re-download (CrossPoint may refetch)
// is instant and a new day's document misses the cache naturally.

import { packageEpub } from '../epub/packageEpub'
import type { SyncDocument } from '../types'
import { buildAcquisitionFeed, buildNavFeed, type FeedSection } from './buildFeed'

export type SyncResponse = {
  status: number
  contentType: string
  body: Uint8Array
}

const NAV_TYPE = 'application/atom+xml;profile=opds-catalog;kind=navigation'
const ACQ_TYPE = 'application/atom+xml;profile=opds-catalog;kind=acquisition'

// Single source of truth for sections: order, id, and title in one place.
const sections: { category: SyncDocument['category']; id: string; title: string }[] = [
  { category: 'daily', id: 'daily', title: 'Today' },
  { category: 'practice', id: 'practice', title: 'Prayers' },
  { category: 'library', id: 'library', title: 'Library' },
]

const textEncoder = new TextEncoder()

export type Registry = {
  sections: FeedSection[]
  bySection: Map<string, SyncDocument[]>
  byId: Map<string, SyncDocument>
  updated: string
}

export function buildRegistry(documents: SyncDocument[]): Registry {
  const bySection = new Map<string, SyncDocument[]>()
  const byId = new Map<string, SyncDocument>()
  for (const doc of documents) {
    byId.set(doc.id, doc)
    const section = sections.find((s) => s.category === doc.category)
    if (!section) continue
    const list = bySection.get(section.id)
    if (list) list.push(doc)
    else bySection.set(section.id, [doc])
  }

  const feedSections: FeedSection[] = sections
    .filter((s) => bySection.has(s.id))
    .map((s) => ({ id: s.id, title: s.title, path: `/opds/${s.id}` }))

  // ISO timestamps sort lexically — newest doc wins; fall back to now.
  const updated =
    documents
      .map((d) => d.updated)
      .sort()
      .at(-1) ?? new Date().toISOString()

  return { sections: feedSections, bySection, byId, updated }
}

const epubCache = new Map<string, Uint8Array>()

function xml(status: number, contentType: string, body: string): SyncResponse {
  return { status, contentType, body: textEncoder.encode(body) }
}

export async function handleOpdsRequest(
  rawPath: string,
  registry: Registry,
): Promise<SyncResponse> {
  const path = decodeURIComponent(rawPath.split('?')[0].replace(/\/+$/, '') || '/')

  if (path === '/' || path === '/opds') {
    return xml(200, NAV_TYPE, buildNavFeed(registry.sections, registry.updated))
  }

  const sectionMatch = path.match(/^\/opds\/([a-z-]+)$/)
  if (sectionMatch) {
    const section = registry.sections.find((s) => s.id === sectionMatch[1])
    const docs = registry.bySection.get(sectionMatch[1])
    if (!section || !docs) return xml(404, 'text/plain', 'Unknown section')
    return xml(200, ACQ_TYPE, buildAcquisitionFeed(section, docs, registry.updated))
  }

  const epubMatch = path.match(/^\/epub\/(.+)\.epub$/)
  if (epubMatch) {
    const doc = registry.byId.get(epubMatch[1])
    if (!doc) return xml(404, 'text/plain', 'Unknown document')
    const cacheKey = `${doc.id}:${doc.updated}`
    const cached = epubCache.get(cacheKey)
    if (cached) return { status: 200, contentType: 'application/epub+zip', body: cached }
    const input = await doc.build()
    const bytes = await packageEpub(input)
    epubCache.set(cacheKey, bytes)
    return { status: 200, contentType: 'application/epub+zip', body: bytes }
  }

  return xml(404, 'text/plain', 'Not found')
}

export function clearEpubCache(): void {
  epubCache.clear()
}
