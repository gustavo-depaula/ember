import { env } from 'cloudflare:test'
import { beforeEach, describe, expect, it } from 'vitest'
import { pruneAnalytics } from '../src/prune'
import { ensureSchema } from '../src/schema'

type Row = { day: string; install: string; name: string; props: string | null }

async function insert(rows: Row[]) {
  await env.DB.batch(
    rows.map((r) =>
      env.DB.prepare(
        `INSERT INTO analytics (day, install, platform, version, language, name, props)
        VALUES (?, ?, 'ios', '1.2.0', 'pt-BR', ?, ?)`,
      ).bind(r.day, r.install, r.name, r.props),
    ),
  )
}

async function rows() {
  const { results } = await env.DB.prepare(
    'SELECT day, install, name, props FROM analytics ORDER BY day, install, id',
  ).all<Row>()
  return results
}

describe('pruneAnalytics', () => {
  beforeEach(async () => {
    await ensureSchema(env.DB)
    await env.DB.prepare('DELETE FROM analytics').run()
  })

  it('keeps an aged install-day as one mark and its cards, and leaves recent days whole', async () => {
    const card = JSON.stringify({ card: 'gall', door: 'office' })
    const screen = JSON.stringify({ route: '/' })
    await insert([
      // 190 days before 2026-11-26: past the line, within a night's reach.
      { day: '2026-05-20', install: 'a', name: 'app_opened', props: null },
      { day: '2026-05-20', install: 'a', name: 'screen', props: screen },
      { day: '2026-05-20', install: 'a', name: 'HolyCardRedeemed', props: card },
      { day: '2026-05-20', install: 'b', name: 'screen', props: screen },
      // Recent.
      { day: '2026-11-20', install: 'a', name: 'app_opened', props: null },
      { day: '2026-11-20', install: 'a', name: 'screen', props: screen },
    ])

    await pruneAnalytics(env.DB, '2026-11-26')
    const after = await rows()
    expect(after).toEqual([
      { day: '2026-05-20', install: 'a', name: 'seen', props: null },
      { day: '2026-05-20', install: 'a', name: 'HolyCardRedeemed', props: card },
      { day: '2026-05-20', install: 'b', name: 'seen', props: null },
      { day: '2026-11-20', install: 'a', name: 'app_opened', props: null },
      { day: '2026-11-20', install: 'a', name: 'screen', props: screen },
    ])

    // A second run the same night changes nothing.
    await pruneAnalytics(env.DB, '2026-11-26')
    expect(await rows()).toEqual(after)
  })
})
