import type { ProducerResult } from '@/producers/types'
import { getDb } from '../client'

export type ExternalContentKey = {
  producerId: string
  producerVersion: string
  lang: string
  cacheKey: string
  paramsKey: string
}

export type ExternalContentRow = {
  payload: ProducerResult
  fetchedAt: number
  pinned: boolean
}

export async function getExternalContent(
  key: ExternalContentKey,
): Promise<ExternalContentRow | undefined> {
  const row = await getDb().getFirstAsync<{
    payload_json: string
    fetched_at: number
    pinned: number
  }>(
    `SELECT payload_json, fetched_at, pinned FROM external_content
       WHERE producer_id = ? AND producer_version = ? AND lang = ?
         AND cache_key = ? AND params_key = ?`,
    [key.producerId, key.producerVersion, key.lang, key.cacheKey, key.paramsKey],
  )
  if (!row) return undefined
  return {
    payload: JSON.parse(row.payload_json) as ProducerResult,
    fetchedAt: row.fetched_at,
    pinned: row.pinned !== 0,
  }
}

export async function putExternalContent(
  key: ExternalContentKey,
  payload: ProducerResult,
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
      key.producerId,
      key.producerVersion,
      key.lang,
      key.cacheKey,
      key.paramsKey,
      JSON.stringify(payload),
      fetchedAt,
    ],
  )
}

export async function deleteExternalContent(key: ExternalContentKey): Promise<void> {
  await getDb().runAsync(
    `DELETE FROM external_content
       WHERE producer_id = ? AND producer_version = ? AND lang = ?
         AND cache_key = ? AND params_key = ?`,
    [key.producerId, key.producerVersion, key.lang, key.cacheKey, key.paramsKey],
  )
}

export async function setExternalContentPinned(
  key: ExternalContentKey,
  pinned: boolean,
): Promise<void> {
  await getDb().runAsync(
    `UPDATE external_content SET pinned = ?
       WHERE producer_id = ? AND producer_version = ? AND lang = ?
         AND cache_key = ? AND params_key = ?`,
    [pinned ? 1 : 0, key.producerId, key.producerVersion, key.lang, key.cacheKey, key.paramsKey],
  )
}
