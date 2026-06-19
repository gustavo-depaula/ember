import { z } from 'zod'

// Request schemas — the wire contract. The backend validates with these (@hono/zod-validator) and
// the frontend reuses them for form validation. Query params arrive as strings → coerce.

const limit = z.coerce.number().int().min(1).max(100).default(25)
const offset = z.coerce.number().int().min(0).default(0)

// "near me" — geo is REQUIRED and bounded (an unbounded geo query is the only thing that blows up).
export const nearQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().positive().max(50).default(10),
  kind: z.string().optional(),
  rite: z.string().optional(),
  institute: z.string().optional(),
  status: z.string().optional(),
  limit,
})

// bbox = "minLng,minLat,maxLng,maxLat"
const bbox = z.string().transform((s, ctx) => {
  const parts = s.split(',').map(Number)
  if (parts.length !== 4 || parts.some(Number.isNaN)) {
    ctx.addIssue({ code: 'custom', message: 'bbox must be "minLng,minLat,maxLng,maxLat"' })
    return z.NEVER
  }
  const [minLng, minLat, maxLng, maxLat] = parts
  return { minLng, minLat, maxLng, maxLat }
})

// Every branch must be index-backed: `q` → FTS5, `bbox` → geohash. An unbounded list has no indexed
// answer (the only church indexes are FTS, the PK, and geohash), so require one of the two — the
// contract can't express a full table scan.
export const churchesQuerySchema = z
  .object({
    q: z.string().optional(), // FTS5 name search
    bbox: bbox.optional(), // map viewport → geohash covering-set
    kind: z.string().optional(),
    rite: z.string().optional(),
    institute: z.string().optional(),
    status: z.string().optional(),
    limit,
    offset,
  })
  .refine((v) => v.q !== undefined || v.bbox !== undefined, {
    message: 'provide q (name search) or bbox (map viewport)',
  })

export const verificationsQuerySchema = z.object({ limit, offset })

// ── Writes ──────────────────────────────────────────────────────────────────

const comment = z.string().trim().min(1).max(2000)
const attachmentKeys = z.array(z.string().max(256)).max(8)
// Note: the caller's identity (IP + optional `X-Client-Id` header) is folded into the fingerprint
// server-side — it is NOT part of any request body.

const serviceChanges = z
  .object({
    kind: z.string(),
    rite: z.string(),
    language: z.string(),
    rrule: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    exdate: z.string(),
    rdate: z.string(),
    locationNote: z.string(),
    note: z.string(),
  })
  .partial()

const churchChanges = z
  .object({
    name: z.string(),
    longName: z.string(),
    address: z.string(),
    city: z.string(),
    region: z.string(),
    postalCode: z.string(),
    country: z.string(),
    phoneE164: z.string(),
    email: z.string(),
    status: z.string(),
    administration: z.string(),
    institute: z.string(),
    canonicalStatus: z.string(),
    note: z.string(),
  })
  .partial()

// A correction may be a structured edit, free text, attachments, or any mix — per-kind shape.
export const correctionBodySchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('edit_service'),
    serviceId: z.string(),
    changes: serviceChanges,
    comment: comment.optional(),
    attachmentKeys: attachmentKeys.optional(),
  }),
  z.object({
    kind: z.literal('edit_church'),
    changes: churchChanges,
    comment: comment.optional(),
    attachmentKeys: attachmentKeys.optional(),
  }),
  z.object({
    kind: z.literal('add_service'),
    changes: serviceChanges.extend({ kind: z.string(), rrule: z.string(), startTime: z.string() }),
    comment: comment.optional(),
    attachmentKeys: attachmentKeys.optional(),
  }),
  z.object({
    kind: z.literal('flag_closed'),
    serviceId: z.string().optional(),
    comment: comment.optional(),
    attachmentKeys: attachmentKeys.optional(),
  }),
  z.object({
    kind: z.literal('note'),
    serviceId: z.string().optional(),
    comment, // free text required for a bare note
    attachmentKeys: attachmentKeys.optional(),
  }),
])

export const verifyBodySchema = z.object({
  serviceId: z.string().optional(),
})

export type NearQuery = z.infer<typeof nearQuerySchema>
export type ChurchesQuery = z.infer<typeof churchesQuerySchema>
export type CorrectionBody = z.infer<typeof correctionBodySchema>
export type VerifyBody = z.infer<typeof verifyBodySchema>
