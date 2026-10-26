import { env } from 'cloudflare:test'
import { beforeEach, describe, expect, it } from 'vitest'
import app from '../src/app'
import { resetTables } from './helpers'

type Changes = {
  changes: Array<{ id: string; churches: Array<{ id: string; name: string }>; message: string }>
  next?: string
}

const church = (id: string, name: string, timezone: string, startTime: string) => ({
  id,
  name,
  lat: -23.55,
  lng: -46.63,
  timezone,
  city: 'São Paulo',
  services: [{ id: `${id}-mass`, kind: 'mass', rrule: 'FREQ=WEEKLY;BYDAY=SU', startTime }],
})

async function logChange(
  appliedAt: string,
  churchId: string,
  records: Array<{ before?: object; after: object }>,
  undoneAt?: string,
) {
  const after = records[0]?.after as { services?: Array<{ id: string }> } | undefined
  await env.DB.prepare(
    'INSERT INTO moderation_change (id, church_id, church_name, applied_at, summary, records, resolution, basis, undone_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
  )
    .bind(
      `${appliedAt}-${churchId}`,
      churchId,
      churchId,
      appliedAt,
      '1 church updated',
      JSON.stringify(records),
      JSON.stringify({ services: after?.services, verdicts: [] }),
      'The bulletin photo a parishioner sent',
      undoneAt ?? null,
    )
    .run()
}

const get = async (query = '') => (await app.request(`/changes${query}`, {}, env)).json<Changes>()

beforeEach(async () => {
  await resetTables('moderation_change')
  const carmo = church('carmo', 'Nossa Senhora do Carmo', 'America/Sao_Paulo', '08:00')
  await logChange('2026-10-01T10:00:00.000Z', 'carmo', [
    {
      before: carmo,
      after: church('carmo', 'Nossa Senhora do Carmo', 'America/Sao_Paulo', '09:00'),
    },
  ])
  const mary = church('mary', 'Saint Mary', 'America/New_York', '10:00')
  await logChange('2026-10-02T10:00:00.000Z', 'mary', [{ before: mary, after: mary }])
  // Undone, and one that only settled suggestions: neither is in the log.
  await logChange('2026-10-03T10:00:00.000Z', 'carmo', [{ after: carmo }], '2026-10-04T00:00:00Z')
  await logChange('2026-10-05T10:00:00.000Z', 'mary', [])
})

describe('GET /changes', () => {
  it('lists the standing changes newest first, each with the change-log message', async () => {
    const { changes, next } = await get()
    expect(changes.map((change) => change.churches[0].id)).toEqual(['mary', 'carmo'])
    expect(next).toBeUndefined()
    const carmo = changes[1].message
    expect(carmo).toContain('Missa: Dom 08:00 → Dom 09:00')
    expect(carmo).toContain('Confirmado em 2026-10-01')
    expect(JSON.stringify(changes)).not.toContain('bulletin photo')
  })

  // Church names are mostly accented: without the charset a browser shows "São" as "SÃ£o".
  it('declares its JSON as UTF-8', async () => {
    const res = await app.request('/changes', {}, env)
    expect(res.headers.get('Content-Type')).toBe('application/json; charset=utf-8')
  })

  it('writes every message in the language asked for', async () => {
    const { changes } = await get('?lang=en')
    expect(changes[1].message).toContain('Mass: Sun 08:00 → Sun 09:00')
  })

  it('pages with before and keeps in step with since', async () => {
    const first = await get('?limit=1')
    expect(first.changes.map((change) => change.churches[0].id)).toEqual(['mary'])
    const second = await get(`?limit=1&before=${encodeURIComponent(first.next ?? '')}`)
    expect(second.changes.map((change) => change.churches[0].id)).toEqual(['carmo'])
    const since = await get(`?since=${encodeURIComponent('2026-10-01T08:00:00-03:00')}`)
    expect(since.changes.map((change) => change.churches[0].id)).toEqual(['mary'])
  })
})
