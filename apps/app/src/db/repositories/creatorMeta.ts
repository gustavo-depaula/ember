/**
 * Per-creator channel metadata. Today it's just the channel-level image
 * (podcast `<itunes:image>` / RSS `<image>` / Atom `<icon|logo>`), which we
 * use as the creator avatar when the manifest doesn't ship one. Distinct
 * from feed_items.image_url, which is per-episode.
 */

import { getDb } from '../client'

export async function setCreatorImage(creatorId: string, imageUrl: string): Promise<void> {
  await getDb().runAsync(
    `INSERT INTO creator_meta (creator_id, image_url, updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT (creator_id) DO UPDATE SET
       image_url = excluded.image_url,
       updated_at = excluded.updated_at`,
    [creatorId, imageUrl, Date.now()],
  )
}

export async function getCreatorImage(creatorId: string): Promise<string | null> {
  const row = await getDb().getFirstAsync<{ image_url: string | null }>(
    'SELECT image_url FROM creator_meta WHERE creator_id = ?',
    [creatorId],
  )
  return row?.image_url ?? null
}
