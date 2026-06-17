import type { CorrectionBody, VerifyBody } from '@ember/api'
import type { Db } from '../../db'
import { hasRecentVerification, insertCorrection, insertVerification } from './queries'

const verifyWindowDays = 30

// Append-only: corrections never touch canonical data, they land in the moderation queue as
// `pending`. The payload is the structured edit / free text / attachment keys, minus the routing
// fields (kind, serviceId, clientId) which become columns / fold into the fingerprint.
export async function submitCorrection(
  db: Db,
  churchId: string,
  fingerprint: string,
  body: CorrectionBody,
): Promise<{ id: string }> {
  const id = crypto.randomUUID()
  const serviceId = 'serviceId' in body ? body.serviceId : undefined
  const { kind, ...rest } = body
  const payload = JSON.stringify(rest)
  await insertCorrection(db, { id, churchId, serviceId, kind, payload, fingerprint })
  return { id }
}

// One verify per (church, fingerprint) per 30-day window. A duplicate is a no-op, not an error.
export async function submitVerification(
  db: Db,
  churchId: string,
  fingerprint: string,
  body: VerifyBody,
  now: Date,
): Promise<{ deduped: boolean }> {
  const since = new Date(now.getTime() - verifyWindowDays * 24 * 60 * 60 * 1000).toISOString()
  if (await hasRecentVerification(db, churchId, fingerprint, since)) return { deduped: true }
  await insertVerification(db, {
    id: crypto.randomUUID(),
    churchId,
    serviceId: body.serviceId,
    fingerprint,
  })
  return { deduped: false }
}
