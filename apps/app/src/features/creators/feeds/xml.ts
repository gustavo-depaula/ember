/**
 * Shared XML parser for podcast / YouTube / RSS feeds. One configured instance
 * keeps all three parsers seeing the same option flags.
 */

import { XMLParser } from 'fast-xml-parser'

export const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  cdataPropName: '__cdata',
  isArray: (name) =>
    ['item', 'entry', 'enclosure', 'media:content', 'media:thumbnail', 'podcast:chapters'].includes(
      name,
    ),
})

/** Read a possibly-CDATA text node into a plain string. */
export function textOf(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  if (typeof value === 'object') {
    const v = value as Record<string, unknown>
    if (typeof v.__cdata === 'string') return v.__cdata
    if (typeof v['#text'] === 'string') return v['#text']
  }
  return ''
}

/** Read an attribute value off a parsed node. */
export function attrOf(value: unknown, attr: string): string | undefined {
  if (!value || typeof value !== 'object') return undefined
  const v = (value as Record<string, unknown>)[`@_${attr}`]
  return typeof v === 'string' ? v : undefined
}

/** Parse an RFC-822 / ISO date to ms-since-epoch; undefined when unparseable. */
export function parseDate(value: unknown): number | undefined {
  if (typeof value !== 'string') return undefined
  const t = Date.parse(value)
  return Number.isFinite(t) ? t : undefined
}

/** Some XML fields appear as a single value or an array depending on count. */
export function pickFirst<T>(value: T | T[] | undefined): T | undefined {
  return Array.isArray(value) ? value[0] : value
}

/** "MM:SS" / "HH:MM:SS" → seconds; undefined for unparseable input. */
export function parseClock(value: string): number | undefined {
  const parts = value.split(':').map((p) => Number.parseInt(p, 10))
  if (parts.some(Number.isNaN)) return undefined
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  return undefined
}
