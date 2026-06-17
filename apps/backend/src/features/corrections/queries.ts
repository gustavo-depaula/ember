import { attachment, correction, verificationEvent } from '@ember/api'
import { and, eq, gte } from 'drizzle-orm'
import type { Db } from '../../db'

export type NewCorrection = {
  id: string
  churchId: string
  serviceId?: string
  kind: string
  payload: string
  fingerprint: string
}

export function insertCorrection(db: Db, row: NewCorrection) {
  return db.insert(correction).values({
    id: row.id,
    churchId: row.churchId,
    serviceId: row.serviceId,
    kind: row.kind,
    payload: row.payload,
    fingerprint: row.fingerprint,
    status: 'pending',
  })
}

// Has this fingerprint already verified this church inside the dedup window?
export async function hasRecentVerification(
  db: Db,
  churchId: string,
  fingerprint: string,
  sinceIso: string,
): Promise<boolean> {
  const rows = await db
    .select({ id: verificationEvent.id })
    .from(verificationEvent)
    .where(
      and(
        eq(verificationEvent.churchId, churchId),
        eq(verificationEvent.fingerprint, fingerprint),
        gte(verificationEvent.createdAt, sinceIso),
      ),
    )
    .limit(1)
  return rows.length > 0
}

export function insertVerification(
  db: Db,
  row: { id: string; churchId: string; serviceId?: string; fingerprint: string },
) {
  return db.insert(verificationEvent).values(row)
}

export function insertAttachment(
  db: Db,
  row: { id: string; churchId: string; contentType: string; data: string },
) {
  return db.insert(attachment).values(row)
}
