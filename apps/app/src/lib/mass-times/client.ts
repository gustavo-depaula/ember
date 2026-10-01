// Thin typed client for the Mass Times backend (Cloudflare Worker + D1). The response shapes are
// the `@ember/api` row types (the schema is the contract): a viewport returns churches (with their
// services) plus counted clusters when zoomed out; `/:id` nests services/texts/links. Reads need no auth; writes carry
// a stable per-install id in `X-Client-Id` (fingerprinted server-side for dedup + rate limiting).

import type {
  Church,
  ChurchLink,
  ChurchText,
  CorrectionBody,
  Service,
  ServiceKind,
} from '@ember/api'

// Overridable so a dev build can point at `wrangler dev` while backend changes are unreleased.
const baseUrl =
  process.env.EXPO_PUBLIC_MASS_TIMES_URL ?? 'https://ember-mass-times.dpgu.workers.dev'

// `distanceKm` is from the user, and only known once they've shared their location.
export type NearbyChurch = Church & { distanceKm?: number; services: Service[] }

// Churches grouped into one map marker when the viewport holds too many to list. A one-church
// cluster carries its church, so it renders as that church's pin.
export type Cluster = {
  id: string
  lat: number
  lng: number
  count: number
  church?: { id: string; name: string }
}
export type ChurchDetail = Church & {
  services: Service[]
  texts: ChurchText[]
  links: ChurchLink[]
}

export type Bbox = { minLng: number; minLat: number; maxLng: number; maxLat: number }

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

// Churches within a map viewport, at any zoom. Up to `limit` churches nearest the view center; past
// that many in view, `clusters` also covers the whole box.
export function fetchViewport(
  bbox: Bbox,
  opts: { kind?: ServiceKind; limit?: number } = {},
): Promise<{ churches: Church[]; clusters: Cluster[] }> {
  return getJson('/churches', {
    bbox: `${bbox.minLng},${bbox.minLat},${bbox.maxLng},${bbox.maxLat}`,
    kind: opts.kind,
    limit: opts.limit,
  })
}

export async function searchChurches(
  q: string,
  opts: { kind?: ServiceKind; limit?: number; near?: { lat: number; lng: number } } = {},
): Promise<Church[]> {
  const { near, ...rest } = opts
  const { churches } = await getJson<{ churches: Church[] }>('/churches', {
    q,
    ...rest,
    ...(near ? { near: `${near.lat},${near.lng}` } : {}),
  })
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
