import {
  changeDetails,
  changeMessage,
  changesQuerySchema,
  churchLang,
  moderationChange,
} from '@ember/api'
import { zValidator } from '@hono/zod-validator'
import { and, desc, gt, isNull, lt, sql } from 'drizzle-orm'
import { Hono } from 'hono'
import type { Env } from '../../app'
import { createDb } from '../../db'

// The changes the moderation desk applied to the directory and that still stand, each with the
// message the desk's change log shows, so another Mass-times directory can follow along. The
// review behind a change (its basis) stays on the desk: it quotes what people sent in.
export const changesRouter = new Hono<{ Bindings: Env }>().get(
  '/',
  zValidator('query', changesQuerySchema),
  async (c) => {
    const { since, before, church, lang, limit } = c.req.valid('query')
    const rows = await createDb(c.env.DB)
      .select()
      .from(moderationChange)
      .where(
        and(
          isNull(moderationChange.undoneAt),
          // A resolution that only settled suggestions changed no church.
          sql`json_array_length(${moderationChange.records}) > 0`,
          // Stored in UTC, so an instant given with an offset is moved to UTC to compare as text.
          since ? gt(moderationChange.appliedAt, new Date(since).toISOString()) : undefined,
          before ? lt(moderationChange.id, before) : undefined,
          church
            ? sql`exists (select 1 from json_each(${moderationChange.records}) where json_extract(value, '$.after.id') = ${church})`
            : undefined,
        ),
      )
      .orderBy(desc(moderationChange.id))
      .limit(limit)
    const changes = rows.map((entry) => {
      const language = lang ?? churchLang(entry.records[0]?.after)
      return {
        id: entry.id,
        appliedAt: entry.appliedAt,
        churches: changeDetails(entry, language),
        message: changeMessage(entry, language),
      }
    })
    // A full page may have more behind it; a short one is the end.
    const next = changes.length === limit ? changes[changes.length - 1].id : undefined
    return c.json({ changes, next })
  },
)
