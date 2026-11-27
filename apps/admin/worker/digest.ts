import type { Env } from './env'
import type { ChurchUse } from './types'
import { loadUsage } from './usage'

// The week in Ember, by email, every Monday: the pulse, how the app held up, the first launch,
// what people searched for and did not find, and the churches worth a look on the desk. Built
// from the same counts as the usage desk; the desk is where to read further.
//
// It goes to DIGEST_TO (a secret, so no address sits in the repo) from DIGEST_FROM, an address
// on a domain onboarded to Cloudflare Email Sending. Until both are set there is no digest.

const week = { days: 7, platform: '', language: '' }

type Line = [label: string, value: string]

export type Digest = { subject: string; html: string; text: string }

const change = (now: number, before: number) => {
  if (!before) return now ? 'new' : '±0%'
  const delta = Math.round(((now - before) / before) * 100)
  return `${delta >= 0 ? '+' : '−'}${Math.abs(delta)}%`
}

const installs = (n: number) => `${n} ${n === 1 ? 'install' : 'installs'}`

const share = (part: number, whole: number) =>
  whole ? `${Math.round((part / whole) * 100)}%` : '—'

const escaped = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function needsLook(church: ChurchUse): string | undefined {
  if (!church.name) return undefined
  if (!church.services) return 'no times at all'
  if (!church.scheduled) return 'times only as text'
  if (!church.verified) return 'never verified'
  return undefined
}

export async function buildDigest(env: Env): Promise<Digest> {
  const dbs = { relay: env.RELAY, mass: env.DB }
  const [overview, health, onboarding, search, mass] = await Promise.all([
    loadUsage(dbs, 'overview', week),
    loadUsage(dbs, 'health', week),
    loadUsage(dbs, 'onboarding', week),
    loadUsage(dbs, 'search', week),
    loadUsage(dbs, 'mass', week),
  ])
  const { pulse, newcomers } = overview
  const worstBuild = [...health.builds]
    .filter((b) => b.installs >= 5 && b.erring > 0)
    .sort((a, b) => b.erring / b.installs - a.erring / a.installs)[0]

  const all: { heading: string; lines: Line[] }[] = [
    {
      heading: `The week to ${overview.today}`,
      lines: [
        ['Installs', `${pulse.period} (${change(pulse.period, pulse.periodBefore)})`],
        ['Opened a prayer', `${pulse.opened} (${change(pulse.opened, pulse.openedBefore)})`],
        ['Said Amen', `${pulse.amen} (${change(pulse.amen, pulse.amenBefore)})`],
        ['New installs', `${newcomers.period} (${change(newcomers.period, newcomers.before)})`],
      ],
    },
    {
      heading: 'Health',
      lines: [
        ['Errors', `${health.totals.errors ?? 0}, on ${health.totals.erring ?? 0} installs`],
        ['Crashes', String(health.totals.fatal ?? 0)],
        ...(worstBuild
          ? ([
              [
                'Most errors, by update',
                `${worstBuild.build}: ${share(worstBuild.erring, worstBuild.installs)} of its installs`,
              ],
            ] as Line[])
          : []),
        ...health.sources
          .slice(0, 3)
          .map(
            (s): Line => [
              `Failing: ${s.where === 'mutation' ? `a save (${s.source})` : s.source}`,
              installs(s.installs),
            ],
          ),
      ],
    },
    {
      heading: 'First launch',
      lines: [
        ['Began the onboarding', String(onboarding.funnel.started ?? 0)],
        [
          'Finished it',
          `${onboarding.funnel.finished ?? 0} (${share(onboarding.funnel.finished ?? 0, onboarding.funnel.started ?? 0)})`,
        ],
      ],
    },
    {
      heading: 'Searched, and found nothing',
      lines: [
        ...search.corpus.empty
          .slice(0, 5)
          .map((q): Line => [`“${q.q}”`, `${installs(q.installs)}`]),
        ...search.churches.empty
          .slice(0, 3)
          .map((q): Line => [`Church: “${q.q}”`, `${installs(q.installs)}`]),
      ],
    },
    {
      heading: 'Churches worth a look',
      lines: mass.churches
        .map((c) => ({ c, why: needsLook(c) }))
        .filter((x) => x.why)
        .slice(0, 5)
        .map(
          ({ c, why }): Line => [
            [c.name, c.city].filter(Boolean).join(', '),
            `${why}, opened by ${c.openers}`,
          ],
        ),
    },
  ]
  const sections = all.filter((s) => s.lines.length > 0)

  const text = sections
    .map((s) => [s.heading, ...s.lines.map(([l, v]) => `  ${l}: ${v}`)].join('\n'))
    .join('\n\n')
  const html = `<div style="font-family:Georgia,serif;color:#2c2418;max-width:560px">
${sections
  .map(
    (
      s,
    ) => `<h3 style="font:600 12px sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#9a8d7f;margin:24px 0 8px">${escaped(s.heading)}</h3>
<table style="width:100%;border-collapse:collapse;font-size:15px">${s.lines
      .map(
        ([l, v]) =>
          `<tr><td style="padding:4px 0;border-top:1px solid #e5ddd2">${escaped(l)}</td><td style="padding:4px 0;border-top:1px solid #e5ddd2;text-align:right">${escaped(v)}</td></tr>`,
      )
      .join('')}</table>`,
  )
  .join('\n')}
</div>`
  return {
    subject: `Ember this week: ${pulse.period} installs, ${pulse.amen} said Amen`,
    html,
    text,
  }
}

/** Sends the digest. Throws when the binding refuses it, so a failed run shows in the logs. */
export async function sendDigest(env: Env): Promise<{ sent: boolean; reason?: string }> {
  if (!env.EMAIL || !env.DIGEST_TO || !env.DIGEST_FROM)
    return { sent: false, reason: 'DIGEST_TO, DIGEST_FROM and the EMAIL binding must all be set' }
  const digest = await buildDigest(env)
  await env.EMAIL.send({
    to: env.DIGEST_TO,
    from: { email: env.DIGEST_FROM, name: 'Ember usage' },
    subject: digest.subject,
    html: digest.html,
    text: digest.text,
  })
  return { sent: true }
}
