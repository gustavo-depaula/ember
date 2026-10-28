import { z } from 'zod'
import { churchChangesSchema } from './validators'

// The moderation contract: what a reviewer (Claude, then the moderator) says should happen to one
// church and its pending corrections. A `Proposal` is the reviewer's draft with its reasoning; a
// `Resolution` is the part that gets written. Both describe the record AFTER the change rather than
// a list of edits, so the moderation desk can diff it against the live church and a human can edit
// it as a plain schedule.

const frequencies = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']

// Why an rrule can't be stored, or undefined when it can. Deliberately shallow: it catches what a
// reviewer gets wrong (prose, a missing FREQ, two rules in one string) and leaves the rest to the
// expander, so a rule already in the directory always round-trips.
export function ruleProblem(rrule: string): string | undefined {
  const parts = rrule.split(';').map((part) => part.split('='))
  if (parts.some((part) => part.length !== 2 || !/^[A-Z]+$/.test(part[0]) || !part[1])) {
    return 'not KEY=VALUE pairs joined by ";"'
  }
  const freq = parts.filter(([key]) => key === 'FREQ')
  if (freq.length !== 1) return 'needs exactly one FREQ'
  if (!frequencies.includes(freq[0][1])) return `unknown FREQ ${freq[0][1]}`
  return undefined
}

const clock = z.string().regex(/^\d{1,2}:\d{2}$/, 'must be HH:MM')

const proposedServiceSchema = z.object({
  // The id of the current service this entry continues, carried so a moved Mass reads as one changed
  // row instead of a removal and an addition. Stored ids are derived from the slot when applying.
  id: z.string().optional(),
  kind: z.enum(['mass', 'confession', 'adoration']),
  rite: z.string().optional(),
  language: z.string().optional(),
  rrule: z.string().superRefine((rrule, ctx) => {
    const problem = ruleProblem(rrule)
    if (problem) ctx.addIssue({ code: 'custom', message: `rrule ${problem}` })
  }),
  startTime: clock,
  endTime: clock.optional(),
  exdate: z.string().optional(),
  rdate: z.string().optional(),
  locationNote: z.string().optional(),
  note: z.string().optional(),
})

const verdictStatus = z.enum(['accepted', 'rejected', 'duplicate'])

// What changes on one church's record.
const recordSchema = z.object({
  // Only the church fields that change; an empty string clears one. `parishId` is the id of the
  // parish church this one belongs to (see `church.parishId`).
  fields: churchChangesSchema.extend({ parishId: z.string().optional() }),
  // Each list is the whole of it after the change; omitted means untouched.
  services: z.array(proposedServiceSchema).optional(),
  texts: z
    .array(
      z.object({ kind: z.string(), rawText: z.string(), sourceUpdatedAt: z.string().optional() }),
    )
    .optional(),
  links: z.array(z.object({ kind: z.string(), url: z.string() })).optional(),
})

// A church the directory lacks, usually a chapel named on its parish's bulletin. It is created as
// part of the parish of the church the corrections are about, and takes that church's country and
// timezone.
const createdChurchSchema = z.object({
  name: z.string().trim().min(1),
  address: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  postalCode: z.string().optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  services: z.array(proposedServiceSchema),
  texts: recordSchema.shape.texts,
  links: recordSchema.shape.links,
})

// A parish and its chapels often share one schedule, so one correction can call for changes to
// several churches: the one it was sent about, others already in the directory (`related`), and
// ones that are missing from it (`created`).
export const resolutionSchema = recordSchema.extend({
  related: z.array(recordSchema.extend({ churchId: z.string() })).optional(),
  created: z.array(createdChurchSchema).optional(),
  // A correction with no verdict stays pending.
  verdicts: z.array(z.object({ id: z.string(), status: verdictStatus })),
})

export const proposalSchema = resolutionSchema.extend({
  summary: z.string(),
  reasoning: z.string(),
  confidence: z.enum(['high', 'medium', 'low']),
  evidence: z.array(z.object({ source: z.string(), says: z.string() })),
  verdicts: z.array(z.object({ id: z.string(), status: verdictStatus, reason: z.string() })),
  // What the reviewer would need to know to decide what it left undecided.
  question: z.string().optional(),
})

// The shape a headless reviewer is held to (`claude --json-schema`), which resolves no `$schema`
// dialect reference and refuses a schema that carries one.
export function proposalJsonSchema(): unknown {
  const { $schema, ...schema } = z.toJSONSchema(proposalSchema)
  return schema
}

export type RecordChange = z.infer<typeof recordSchema>
export type CreatedChurch = z.infer<typeof createdChurchSchema>
export type ProposedService = z.infer<typeof proposedServiceSchema>
export type Resolution = z.infer<typeof resolutionSchema>
export type Proposal = z.infer<typeof proposalSchema>
