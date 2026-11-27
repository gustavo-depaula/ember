import type { Env } from './env'
import type { ChurchUse, UsageFilter } from './types'
import { loadUsage } from './usage'

// The week in Ember, by email, every Monday: a sentence on how the week went, the four numbers
// that say it, the week day by day, and then what was prayed, read and searched, the Mass times,
// the holy cards, the first launch and how the app held up. Each part links to its tab on the
// usage desk, where to read further. Built from the same counts as the desk.
//
// It goes to DIGEST_TO (a secret, so no address sits in the repo) from DIGEST_FROM, an address
// on a domain onboarded to Cloudflare Email Sending. Without DIGEST_TO there is no digest.
//
// Email clients take little: tables for layout, every style inline, no SVG (Gmail drops it), so
// the chart is bars of table cells. The palette is Ember's parchment, ink, gold and burgundy.

// The seven whole days ending yesterday: on Monday morning, today has barely begun.
const lastWeek = (): UsageFilter => ({
  days: 7,
  platform: '',
  language: '',
  until: new Date(Date.now() - 86_400_000).toISOString().slice(0, 10),
})
const desk = 'https://ember-admin.dpgu.workers.dev/usage'

const color = {
  page: '#f3ede3',
  card: '#fffdf9',
  ink: '#2c2418',
  soft: '#6b5d4f',
  muted: '#9a8d7f',
  rule: '#e5ddd2',
  goldPale: '#eadcb4',
  burgundy: '#6b1d2a',
  up: '#2d6a4f',
  down: '#b83a3a',
}
const serif = "Georgia,'Times New Roman',serif"
const sans = "-apple-system,'Segoe UI',Helvetica,Arial,sans-serif"

export type Digest = { subject: string; html: string; text: string }

const escaped = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`

const share = (part: number, whole: number) =>
  whole ? `${Math.round((part / whole) * 100)}%` : '—'

function change(now: number, before: number): { text: string; tone: 'up' | 'down' | 'flat' } {
  if (!before) return now ? { text: 'new', tone: 'up' } : { text: '±0%', tone: 'flat' }
  const delta = Math.round(((now - before) / before) * 100)
  if (delta === 0) return { text: '±0%', tone: 'flat' }
  return { text: `${delta > 0 ? '+' : '−'}${Math.abs(delta)}%`, tone: delta > 0 ? 'up' : 'down' }
}

// `practice/examination-of-conscience` → "Examination of conscience".
function title(id: string): string {
  const slug = id.slice(id.indexOf('/') + 1).replace(/[-_]/g, ' ')
  return slug.charAt(0).toUpperCase() + slug.slice(1)
}

const dayName = (day: string) =>
  new Date(`${day}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })

function range(from: string, to: string): string {
  const fmt = (day: string, withMonth: boolean) =>
    new Date(`${day}T12:00:00Z`).toLocaleDateString('en-US', {
      month: withMonth ? 'short' : undefined,
      day: 'numeric',
      timeZone: 'UTC',
    })
  return `${fmt(from, true)} – ${fmt(to, from.slice(5, 7) !== to.slice(5, 7))}`
}

function needsLook(church: ChurchUse): string | undefined {
  if (!church.name) return undefined
  if (!church.services) return 'no times'
  if (!church.scheduled) return 'times only as text'
  if (!church.verified) return 'never verified'
  return undefined
}

// A part of the email: its heading, the tab it opens on the desk, and its body as HTML and text.
type Body = { html: string; text: string[] }
type Part = Body & { heading: string; tab: string }
type Row = { label: string; note?: string; value: string }

function rows(list: Row[]): Body {
  const cell = (i: number) => (i ? `border-top:1px solid ${color.rule};` : '')
  const html = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">${list
    .map(
      (r, i) => `<tr>
  <td style="padding:9px 0;${cell(i)}font:16px/1.35 ${serif};color:${color.ink}">${escaped(r.label)}${r.note ? `<br><span style="font:12px/1.4 ${sans};color:${color.muted}">${escaped(r.note)}</span>` : ''}</td>
  <td align="right" style="padding:9px 0 9px 12px;${cell(i)}font:14px/1.35 ${sans};color:${color.soft};white-space:nowrap;vertical-align:top">${escaped(r.value)}</td>
</tr>`,
    )
    .join('')}</table>`
  return { html, text: list.map((r) => `  ${r.label}${r.note ? ` (${r.note})` : ''}: ${r.value}`) }
}

function prose(sentence: string): Body {
  return {
    html: `<p style="margin:0;font:16px/1.5 ${serif};color:${color.ink}">${escaped(sentence)}</p>`,
    text: [`  ${sentence}`],
  }
}

function stacked(...bodies: Body[]): Body {
  return {
    html: bodies.map((b) => b.html).join('<div style="height:12px;line-height:12px">&nbsp;</div>'),
    text: bodies.flatMap((b) => b.text),
  }
}

// The week day by day: a bar for the installs that opened Ember, its lower part the ones that
// said an Amen.
function chart(days: { day: string; active: number; amen: number }[]): string {
  const top = Math.max(1, ...days.map((d) => d.active))
  const tall = 76
  const block = (height: number, background: string, radius: string) =>
    `<tr><td height="${height}" style="height:${height}px;line-height:1px;font-size:1px;background:${background};border-radius:${radius}">&nbsp;</td></tr>`
  const cells = days
    .map((d) => {
      const all = Math.max(2, Math.round((d.active / top) * tall))
      const amen = Math.min(all, Math.round((d.amen / top) * tall))
      const rest = all - amen
      return `<td align="center" valign="bottom" style="padding:0 4px">
  <div style="font:11px ${sans};color:${color.muted};padding-bottom:4px">${d.active}</div>
  <table role="presentation" cellpadding="0" cellspacing="0" width="28" style="border-collapse:collapse">
    ${rest > 0 ? block(rest, color.goldPale, amen ? '3px 3px 0 0' : '3px') : ''}
    ${amen > 0 ? block(amen, color.burgundy, rest ? '0 0 3px 3px' : '3px') : ''}
  </table>
  <div style="font:11px ${sans};color:${color.soft};padding-top:6px">${dayName(d.day)}</div>
</td>`
    })
    .join('')
  const key = (background: string) =>
    `<span style="display:inline-block;width:10px;height:10px;background:${background};border-radius:2px"></span>`
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse"><tr>${cells}</tr></table>
<p style="margin:10px 0 0;font:12px ${sans};color:${color.muted}">${key(color.goldPale)} opened Ember &nbsp; ${key(color.burgundy)} said Amen</p>`
}

function figure(label: string, value: number, before: number): string {
  const c = change(value, before)
  const tone = { up: color.up, down: color.down, flat: color.muted }[c.tone]
  return `<td width="25%" valign="top" style="padding:0 6px">
  <div style="font:600 11px ${sans};letter-spacing:.06em;text-transform:uppercase;color:${color.muted}">${escaped(label)}</div>
  <div style="font:34px/1.15 ${serif};color:${color.ink};padding-top:4px">${value}</div>
  <div style="font:600 13px ${sans};color:${tone};padding-top:2px">${c.text}</div>
</td>`
}

export async function buildDigest(env: Env): Promise<Digest> {
  const dbs = { relay: env.RELAY, mass: env.DB }
  const week = lastWeek()
  const [overview, prayer, mass, cards, library, search, health, onboarding] = await Promise.all([
    loadUsage(dbs, 'overview', week),
    loadUsage(dbs, 'prayer', week),
    loadUsage(dbs, 'mass', week),
    loadUsage(dbs, 'cards', week),
    loadUsage(dbs, 'library', week),
    loadUsage(dbs, 'search', week),
    loadUsage(dbs, 'health', week),
    loadUsage(dbs, 'onboarding', week),
  ])
  const { pulse, newcomers } = overview
  const days = overview.daily.slice(-7)
  const when = range(days[0]?.day ?? overview.today, overview.today)

  const installs = change(pulse.period, pulse.periodBefore)
  const compared =
    installs.tone === 'flat'
      ? 'as many as'
      : installs.text === 'new'
        ? 'the first counted since'
        : `${installs.text.slice(1)} ${installs.tone === 'up' ? 'more' : 'fewer'} than`
  const lede = `${plural(pulse.period, 'install')} opened Ember this week, ${compared} the week before. ${pulse.opened} opened a prayer and ${pulse.amen} prayed one to its Amen; ${newcomers.period} ${newcomers.period === 1 ? 'was' : 'were'} new.`

  const parts: Part[] = []

  const prayed = prayer.practices.slice(0, 5)
  if (prayed.length) {
    parts.push({
      heading: 'What was prayed',
      tab: 'prayer',
      ...rows(
        prayed.map((p) => ({
          label: title(p.id),
          value: `${plural(p.installs, 'install')} · ${change(p.installs, p.before).text}`,
        })),
      ),
    })
  }

  const read = library.books.slice(0, 3)
  const bible = library.bibleTotals.installs ?? 0
  if (read.length || bible) {
    parts.push({
      heading: 'What was read',
      tab: 'library',
      ...rows([
        ...read.map((b) => ({
          label: title(b.id),
          value: `${plural(b.installs, 'reader')} · ${b.minutes} min`,
        })),
        ...(bible
          ? [
              {
                label: 'The Bible',
                value: `${plural(bible, 'reader')} · ${plural(library.bibleTotals.chapters ?? 0, 'chapter')}`,
              },
            ]
          : []),
      ]),
    })
  }

  const m = mass.totals
  if ((m.visitors ?? 0) > 0) {
    const places = mass.places.slice(0, 3).map((p) => [p.city, p.region].filter(Boolean).join(', '))
    const churches = mass.churches.slice(0, 3)
    parts.push({
      heading: 'Mass times',
      tab: 'mass',
      ...stacked(
        prose(
          // Builds before the counts of November 2026 send no church opened: a zero is silence.
          `${plural(m.visitors ?? 0, 'install')} looked for Mass${(m.opened ?? 0) > 0 ? `, opened ${plural(m.opened ?? 0, 'church', 'churches')}` : ''} and checked in ${plural(m.checkins ?? 0, 'time')}.${places.length ? ` Most looked in ${places.join('; ')}.` : ''}`,
        ),
        ...(churches.length
          ? [
              rows(
                churches.map((c) => ({
                  label: c.name ?? c.id,
                  note: [c.city, c.region].filter(Boolean).join(', ') || undefined,
                  value: `opened by ${c.openers} · ${plural(c.checkins, 'check-in')}`,
                })),
              ),
            ]
          : []),
      ),
    })
  }

  const worth = mass.churches
    .map((c) => ({ c, why: needsLook(c) }))
    .filter((x) => x.why)
    .slice(0, 5)
  if (worth.length) {
    parts.push({
      heading: 'Churches worth a look',
      tab: 'mass',
      ...rows(
        worth.map(({ c, why }) => ({
          label: c.name ?? c.id,
          note: [c.city, c.region].filter(Boolean).join(', ') || undefined,
          value: `${why} · opened by ${c.openers}`,
        })),
      ),
    })
  }

  const t = cards.totals
  if ((t.redeemed ?? 0) > 0) {
    const saint = cards.saints[0]
    parts.push({
      heading: 'Holy cards',
      tab: 'cards',
      ...prose(
        `${plural(t.redeemed ?? 0, 'card')} opened by ${plural(t.collectors ?? 0, 'collector')}.${(t.wonDays ?? 0) > 0 ? ` Of the days a card was won, ${share(t.openedDays ?? 0, t.wonDays ?? 0)} saw it opened.` : ''}${saint?.card ? ` Most opened: ${title(saint.card)}.` : ''}`,
      ),
    })
  }

  const empty: Row[] = [
    ...search.corpus.empty
      .slice(0, 5)
      .map((q) => ({ label: `“${q.q}”`, value: plural(q.installs, 'install') })),
    ...search.churches.empty
      .slice(0, 3)
      .map((q) => ({ label: `“${q.q}”`, note: 'a church', value: plural(q.installs, 'install') })),
  ]
  if (empty.length) {
    parts.push({ heading: 'Searched, and found nothing', tab: 'search', ...rows(empty) })
  }

  const f = onboarding.funnel
  parts.push({
    heading: 'First launch',
    tab: 'onboarding',
    ...((f.started ?? 0) > 0
      ? prose(
          `${plural(f.started ?? 0, 'install')} began the onboarding and ${f.finished ?? 0} finished it (${share(f.finished ?? 0, f.started ?? 0)}); ${f.skipped ?? 0} skipped it.`,
        )
      : prose(
          'No install went through the onboarding. It came by an update, and a new install’s first launch runs the build from the store, so it reaches newcomers only once a store build carries it.',
        )),
  })

  const h = health.totals
  const worst = [...health.builds]
    .filter((b) => b.installs >= 5 && b.erring > 0)
    .sort((a, b) => b.erring / b.installs - a.erring / a.installs)[0]
  const failing = health.sources[0]
  parts.push({
    heading: 'Health',
    tab: 'health',
    ...prose(
      (h.errors ?? 0) === 0 && (h.fatal ?? 0) === 0
        ? 'No errors and no crashes counted this week.'
        : `${plural(h.errors ?? 0, 'error')} on ${plural(h.erring ?? 0, 'install')} (${share(h.erring ?? 0, h.active ?? 0)} of them) and ${plural(h.fatal ?? 0, 'crash', 'crashes')}.${worst ? ` The update of ${worst.build} met the most, on ${share(worst.erring, worst.installs)} of its installs.` : ''}${failing ? ` Most often failing: ${failing.source}.` : ''}`,
    ),
  })

  const subject = `Ember this week: ${plural(pulse.period, 'install')} (${installs.text}), ${pulse.amen} prayed to the Amen`
  const preheader = `${when}: ${pulse.opened} opened a prayer, ${newcomers.period} new installs.`

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escaped(subject)}</title></head>
<body style="margin:0;padding:0;background:${color.page}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escaped(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${color.page}"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">
  <tr><td style="padding:0 8px 18px">
    <div style="font:600 12px ${sans};letter-spacing:.28em;color:${color.burgundy}">✠ EMBER</div>
    <div style="font:30px/1.2 ${serif};color:${color.ink};padding-top:8px">The week of ${escaped(when)}</div>
  </td></tr>
  <tr><td style="background:${color.card};border-radius:14px;padding:26px 24px">
    <p style="margin:0 0 22px;font:18px/1.5 ${serif};color:${color.ink}">${escaped(lede)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse"><tr>
      ${figure('Installs', pulse.period, pulse.periodBefore)}
      ${figure('Opened a prayer', pulse.opened, pulse.openedBefore)}
      ${figure('Said Amen', pulse.amen, pulse.amenBefore)}
      ${figure('New', newcomers.period, newcomers.before)}
    </tr></table>
    <div style="height:26px;line-height:26px">&nbsp;</div>
    ${chart(days)}
  </td></tr>
  ${parts
    .map(
      (p) => `<tr><td style="height:14px;line-height:14px">&nbsp;</td></tr>
  <tr><td style="background:${color.card};border-radius:14px;padding:20px 24px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse"><tr>
      <td style="font:600 11px ${sans};letter-spacing:.12em;text-transform:uppercase;color:${color.burgundy};padding-bottom:12px">${escaped(p.heading)}</td>
      <td align="right" style="font:12px ${sans};padding-bottom:12px"><a href="${desk}/${p.tab}" style="color:${color.soft};text-decoration:none">Open on the desk →</a></td>
    </tr></table>
    ${p.html}
  </td></tr>`,
    )
    .join('\n  ')}
  <tr><td style="padding:22px 8px 0;font:12px/1.6 ${sans};color:${color.muted}">
    Sent every Monday by the Ember admin, from the counts installs share: development builds and anyone who turned counting off are not in them, and days are each device's own.
    <a href="${desk}" style="color:${color.soft}">The usage desk</a> has the rest.
  </td></tr>
</table>
</td></tr></table>
</body></html>`

  const text = [
    `EMBER · The week of ${when}`,
    '',
    lede,
    '',
    `Installs ${pulse.period} (${installs.text}) · Opened a prayer ${pulse.opened} (${change(pulse.opened, pulse.openedBefore).text}) · Said Amen ${pulse.amen} (${change(pulse.amen, pulse.amenBefore).text}) · New ${newcomers.period} (${change(newcomers.period, newcomers.before).text})`,
    '',
    ...days.map((d) => `  ${dayName(d.day)}: ${d.active} opened Ember, ${d.amen} said Amen`),
    ...parts.flatMap((p) => ['', p.heading.toUpperCase(), ...p.text, `  ${desk}/${p.tab}`]),
    '',
    `The usage desk: ${desk}`,
  ].join('\n')

  return { subject, html, text }
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
