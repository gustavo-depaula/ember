import { getPreference, setPreference } from '@/db/repositories/preferences'
import { randomId } from '@/lib/id'

// A stable per-install id sent as `X-Client-Id` on writes. The backend folds it (with the IP) into a
// fingerprint for verify-dedup + rate limiting — it is not an account or anything identifying.
// Generated once and persisted in the preferences KV.

const key = 'mass-times.client-id'
let cached: string | undefined

export async function getClientId(): Promise<string> {
  if (cached) return cached
  const existing = await getPreference(key)
  if (existing) {
    cached = existing
    return existing
  }
  const id = randomId()
  cached = id
  await setPreference(key, id)
  return id
}
