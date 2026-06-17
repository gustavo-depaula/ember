// Thin typed client for the Mass Times backend (Cloudflare Worker + D1). The response shapes are
// the `@ember/api` row types (the schema is the contract): `/near` augments a church with
// `distanceKm` + its services; `/:id` nests services/texts/links. Reads need no auth; writes carry
// a stable per-install id in `X-Client-Id` (fingerprinted server-side for dedup + rate limiting).

import type {
  Church,
  ChurchLink,
  ChurchText,
  CorrectionBody,
  Service,
  ServiceKind,
} from '@ember/api'

const baseUrl = 'https://ember-mass-times.dpgu.workers.dev'

export type NearbyChurch = Church & { distanceKm: number; services: Service[] }
export type ChurchDetail = Church & {
  services: Service[]
  texts: ChurchText[]
  links: ChurchLink[]
}

export type NearbyParams = {
  lat: number
  lng: number
  radiusKm?: number
  kind?: ServiceKind
  limit?: number
}

async function getJson<T>(path: string, query?: Record<string, string | number | undefined>) {
  const url = new URL(path, baseUrl)
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value))
  }
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`mass-times ${path} → ${res.status}`)
  return (await res.json()) as T
}

async function postJson<T>(path: string, body: unknown, clientId: string) {
  const res = await fetch(new URL(path, baseUrl), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Client-Id': clientId },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`mass-times ${path} → ${res.status}`)
  return (await res.json()) as T
}

export async function fetchNearbyChurches(params: NearbyParams): Promise<NearbyChurch[]> {
  const { churches } = await getJson<{ churches: NearbyChurch[] }>('/churches/near', {
    lat: params.lat,
    lng: params.lng,
    radius_km: params.radiusKm,
    kind: params.kind,
    limit: params.limit,
  })
  return churches
}

export async function searchChurches(q: string, limit?: number): Promise<Church[]> {
  const { churches } = await getJson<{ churches: Church[] }>('/churches', { q, limit })
  return churches
}

export function fetchChurch(id: string): Promise<ChurchDetail> {
  return getJson<ChurchDetail>(`/churches/${id}`)
}

export function verifyChurch(id: string, clientId: string): Promise<{ deduped: boolean }> {
  return postJson(`/churches/${id}/verify`, {}, clientId)
}

export function submitCorrection(
  id: string,
  body: CorrectionBody,
  clientId: string,
): Promise<{ id: string }> {
  return postJson(`/churches/${id}/corrections`, body, clientId)
}

// Upload a (compressed) image as a correction attachment. The route stores the raw bytes and returns
// a key to reference in the correction's `attachmentKeys`. Caller keeps it under the 1 MB cap.
export async function uploadAttachment(
  id: string,
  fileUri: string,
  contentType: string,
  clientId: string,
): Promise<string> {
  const blob = await (await fetch(fileUri)).blob()
  const res = await fetch(new URL(`/churches/${id}/corrections/attachments`, baseUrl), {
    method: 'POST',
    headers: { 'Content-Type': contentType, 'X-Client-Id': clientId },
    body: blob,
  })
  if (!res.ok) throw new Error(`mass-times attachment → ${res.status}`)
  const { key } = (await res.json()) as { key: string }
  return key
}
