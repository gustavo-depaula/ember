/**
 * Per-device cache of Escrivá chapter HTML fetched from escriva.org.
 *
 * Reuses the existing `external_content` table (no migration): the chapter body
 * HTML is stored as a JSON string in `payload_json`, keyed by producer + book
 * slug + chapter id + language. This is the on-demand half of the integration —
 * a chapter is fetched once on first open, then read offline thereafter.
 */

import { escrivaProducerId } from '@/content/escrivaWorks'
import type { BookEntry } from '@/content/manifestTypes'
import { getDb } from '../client'

const producerVersion = '1'

// A reserved chapter id under which the assembled BookEntry manifest (toc +
// external chapter refs) is cached, so the chapter list isn't re-fetched from
// escriva.org on every launch. `lang = '*'` since the manifest spans languages.
const manifestParamsKey = '__manifest__'

export async function getEscrivaBookEntry(slug: string): Promise<BookEntry | undefined> {
  const row = await getDb().getFirstAsync<{ payload_json: string }>(
    `SELECT payload_json FROM external_content
       WHERE producer_id = ? AND producer_version = ? AND lang = ?
         AND cache_key = ? AND params_key = ?`,
    [escrivaProducerId, producerVersion, '*', slug, manifestParamsKey],
  )
  if (!row) return undefined
  return JSON.parse(row.payload_json) as BookEntry
}

export async function putEscrivaBookEntry(
  slug: string,
  entry: BookEntry,
  fetchedAt: number = Date.now(),
): Promise<void> {
  await getDb().runAsync(
    `INSERT INTO external_content
       (producer_id, producer_version, lang, cache_key, params_key,
        payload_json, fetched_at, pinned)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0)
       ON CONFLICT (producer_id, producer_version, lang, cache_key, params_key)
       DO UPDATE SET payload_json = excluded.payload_json,
                     fetched_at = excluded.fetched_at`,
    [
      escrivaProducerId,
      producerVersion,
      '*',
      slug,
      manifestParamsKey,
      JSON.stringify(entry),
      fetchedAt,
    ],
  )
}

export async function getEscrivaChapterHtml(
  slug: string,
  chapterId: string,
  lang: string,
): Promise<string | undefined> {
  const row = await getDb().getFirstAsync<{ payload_json: string }>(
    `SELECT payload_json FROM external_content
       WHERE producer_id = ? AND producer_version = ? AND lang = ?
         AND cache_key = ? AND params_key = ?`,
    [escrivaProducerId, producerVersion, lang, slug, chapterId],
  )
  if (!row) return undefined
  return JSON.parse(row.payload_json) as string
}

export async function putEscrivaChapterHtml(
  slug: string,
  chapterId: string,
  lang: string,
  html: string,
  fetchedAt: number = Date.now(),
): Promise<void> {
  await getDb().runAsync(
    `INSERT INTO external_content
       (producer_id, producer_version, lang, cache_key, params_key,
        payload_json, fetched_at, pinned)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0)
       ON CONFLICT (producer_id, producer_version, lang, cache_key, params_key)
       DO UPDATE SET payload_json = excluded.payload_json,
                     fetched_at = excluded.fetched_at`,
    [escrivaProducerId, producerVersion, lang, slug, chapterId, JSON.stringify(html), fetchedAt],
  )
}
