import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import type { Usage, UsageFilter } from '../../worker/types'
import { Change, DayChart, Meter, shade } from './charts'

// How Ember is used, from the counts installs send (lib/usage.ts in the app). It answers, in
// order: is anyone here, do they come back, do they pray, what do they pray and read and when,
// who they are, and how many keep an account.

async function fetchUsage(filter: UsageFilter): Promise<Usage> {
  const query = new URLSearchParams({
    days: String(filter.days),
    platform: filter.platform,
    language: filter.language,
  })
  const response = await fetch(`/api/usage?${query}`)
  const data = await response.json()
  if (!response.ok) throw new Error(data.error ?? response.statusText)
  return data as Usage
}

const percent = (part: number, whole: number) =>
  whole ? `${Math.round((part / whole) * 100)}%` : '—'

// `practice/examination-conscience` → "Examination conscience". The panel has no corpus to
// look titles up in, and the id under it says exactly which one.
function title(id: string): string {
  const slug = id.slice(id.indexOf('/') + 1).replace(/-/g, ' ')
  return slug.charAt(0).toUpperCase() + slug.slice(1)
}

export function UsagePage() {
  const [filter, setFilter] = useState<UsageFilter>({ days: 28, platform: '', language: '' })
  const usage = useQuery({
    queryKey: ['usage', filter],
    queryFn: () => fetchUsage(filter),
    placeholderData: (previous) => previous,
  })
  const set = (change: Partial<UsageFilter>) => setFilter({ ...filter, ...change })

  return (
    <div className="usage">
      <header className="top">
        <h1>Usage</h1>
        <a href="/">Mass times desk</a>
        <span className="spacer" />
        <div className="segmented">
          {[7, 28, 90].map((days) => (
            <button
              type="button"
              key={days}
              className={filter.days === days ? 'on' : ''}
              onClick={() => set({ days })}
            >
              {days} days
            </button>
          ))}
        </div>
        <select value={filter.platform} onChange={(e) => set({ platform: e.target.value })}>
          <option value="">Every platform</option>
          <option value="ios">iOS</option>
          <option value="android">Android</option>
          <option value="web">Web</option>
        </select>
        <select value={filter.language} onChange={(e) => set({ language: e.target.value })}>
          <option value="">Every language</option>
          <option value="pt-BR">Português</option>
          <option value="en-US">English</option>
        </select>
      </header>
      {(() => {
        if (usage.error) return <p className="error usage-body">{usage.error.message}</p>
        if (!usage.data) return <p className="muted usage-body">Reading the counts…</p>
        return <Body usage={usage.data} />
      })()}
    </div>
  )
}

function Body({ usage }: { usage: Usage }) {
  const { pulse, newcomers, daily } = usage
  const days = usage.filter.days
  return (
    <div className="usage-body">
      <section>
        <h2>Pulse · up to {usage.today}</h2>
        <div className="tiles">
          <Tile label="Today" value={pulse.today}>
            <Change now={pulse.today} before={pulse.yesterday} /> on yesterday
          </Tile>
          <Tile label="Last 7 days" value={pulse.week}>
            <Change now={pulse.week} before={pulse.weekBefore} /> on the 7 before
          </Tile>
          <Tile label="Last 28 days" value={pulse.month}>
            <Change now={pulse.month} before={pulse.monthBefore} /> on the 28 before
          </Tile>
          <Tile label="Prayed this week" value={pulse.prayingWeek}>
            {percent(pulse.prayingWeek, pulse.week)} of the week's ·{' '}
            <Change now={pulse.prayingWeek} before={pulse.prayingWeekBefore} />
          </Tile>
          <Tile label="Stickiness" value={percent(pulse.today, pulse.month)}>
            today's share of the month's
          </Tile>
          <Tile label={`New in ${days} days`} value={newcomers.period}>
            <Change now={newcomers.period} before={newcomers.before} /> · {pulse.ever} ever
          </Tile>
        </div>
      </section>

      <section>
        <h2>Every day</h2>
        <DayChart
          days={daily.map((d) => d.day)}
          bars={{ values: daily.map((d) => d.active), label: 'opened Ember' }}
          line={{ values: daily.map((d) => d.praying), label: 'prayed' }}
          dashed={{ values: daily.map((d) => d.week), label: 'seen in the 7 days up to it' }}
        />
        <div className="pair">
          <DayChart
            height={90}
            days={daily.map((d) => d.day)}
            bars={{ values: daily.map((d) => d.new), label: 'new installs' }}
          />
          <DayChart
            height={90}
            days={daily.map((d) => d.day)}
            bars={{
              values: daily.map((d) => (d.active ? Math.round((d.opens / d.active) * 10) / 10 : 0)),
              label: 'opens per install',
            }}
          />
        </div>
      </section>

      <div className="columns">
        <Cohorts usage={usage} />
        <Habit usage={usage} />
      </div>

      <Practices usage={usage} />

      <div className="columns">
        <Hours usage={usage} />
        <Books usage={usage} />
      </div>

      <div className="columns">
        <Audience usage={usage} />
        <Accounts usage={usage} />
      </div>

      <div className="columns">
        <Ranked
          title={`Screens · ${days} days`}
          rows={usage.screens.map((s) => ({
            label: s.route,
            installs: s.installs,
            times: s.views,
          }))}
          times="views"
        />
        <Ranked
          title={`Actions · ${days} days`}
          rows={usage.actions.map((a) => ({ label: a.name, installs: a.installs, times: a.times }))}
          times="times"
        />
      </div>

      <section className="blind">
        <h2>What this cannot see</h2>
        <p>
          Anyone who switched counting off, and every development build. An install that switches it
          off and on again comes back as a new one, and so does a reinstall; on the web, each
          browser is an install. Days and hours are the device's own clock. Counts from builds
          before 1.1.0's usage update carry no hour and no update.
        </p>
      </section>
    </div>
  )
}

function Tile({
  label,
  value,
  children,
}: {
  label: string
  value: number | string
  children: React.ReactNode
}) {
  return (
    <div className="tile">
      <span className="tile-label">{label}</span>
      <span className="tile-value">{value}</span>
      <span className="tile-note">{children}</span>
    </div>
  )
}

// Of the installs first seen in a week, the share still seen 1, 2, … weeks later.
function Cohorts({ usage }: { usage: Usage }) {
  const weeks = [...new Set(usage.cohorts.map((c) => c.cohort))]
  const span = Array.from({ length: 9 }, (_, i) => i)
  return (
    <section>
      <h2>Do they come back?</h2>
      <p className="lede">
        Installs by the week they first opened Ember, and the share seen again each week after.
      </p>
      <table className="cohorts">
        <thead>
          <tr>
            <th>First week</th>
            <th>Installs</th>
            {span.slice(1).map((w) => (
              <th key={w}>W{w}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => {
            const of = (w: number) =>
              usage.cohorts.find((c) => c.cohort === week && c.week === w)?.installs
            const size = of(0) ?? 0
            const elapsed = Math.floor(
              (Date.parse(usage.today) - Date.parse(week)) / (7 * 86_400_000),
            )
            return (
              <tr key={week}>
                <td>{week.slice(5)}</td>
                <td>{size}</td>
                {span.slice(1).map((w) => {
                  if (w > elapsed) return <td key={w} />
                  const share = (of(w) ?? 0) / (size || 1)
                  return (
                    <td key={w} style={shade(share)} title={`${of(w) ?? 0} of ${size}`}>
                      {Math.round(share * 100)}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </section>
  )
}

// The prayer app's own measure: of those here this month, on how many days each prayed.
function Habit({ usage }: { usage: Usage }) {
  const bands = [
    { label: 'Not at all', from: 0, to: 0 },
    { label: '1 day', from: 1, to: 1 },
    { label: '2–3 days', from: 2, to: 3 },
    { label: '4–7 days', from: 4, to: 7 },
    { label: '8–14 days', from: 8, to: 14 },
    { label: '15–21 days', from: 15, to: 21 },
    { label: '22–28 days', from: 22, to: 28 },
  ].map((band) => ({
    ...band,
    installs: usage.habit
      .filter((h) => h.days >= band.from && h.days <= band.to)
      .reduce((sum, h) => sum + h.installs, 0),
  }))
  const total = bands.reduce((sum, b) => sum + b.installs, 0)
  const faithful = bands.filter((b) => b.from >= 8).reduce((sum, b) => sum + b.installs, 0)
  const top = Math.max(1, ...bands.map((b) => b.installs))
  return (
    <section>
      <h2>Do they pray?</h2>
      <p className="lede">
        Of the {total} installs seen in the last 28 days, how many days each prayed.{' '}
        <strong>{percent(faithful, total)}</strong> prayed on 8 days or more, about twice a week.
      </p>
      <table className="ranked">
        <tbody>
          {bands.map((band) => (
            <tr key={band.label}>
              <td>{band.label}</td>
              <td className="wide">
                <Meter value={band.installs} of={top} />
              </td>
              <td className="num">{band.installs}</td>
              <td className="num muted">{percent(band.installs, total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

function Practices({ usage }: { usage: Usage }) {
  const top = Math.max(1, ...usage.practices.map((p) => p.installs))
  return (
    <section>
      <h2>What is prayed · {usage.filter.days} days</h2>
      <p className="lede">
        By installs that finished it at least once. <em>Finished</em> is the share of installs that
        opened the prayer and reached its end; <em>change</em> compares with the period before.
      </p>
      <table className="ranked">
        <thead>
          <tr>
            <th>Practice</th>
            <th className="wide" />
            <th className="num">Installs</th>
            <th className="num">Change</th>
            <th className="num">Times</th>
            <th className="num">Per install</th>
            <th className="num">Finished</th>
          </tr>
        </thead>
        <tbody>
          {usage.practices.map((p) => (
            <tr key={p.id}>
              <td>
                {title(p.id)} <span className="muted id">{p.id}</span>
              </td>
              <td className="wide">
                <Meter value={p.installs} of={top} />
              </td>
              <td className="num">{p.installs}</td>
              <td className="num">
                <Change now={p.installs} before={p.before} />
              </td>
              <td className="num">{p.times}</td>
              <td className="num">{(p.times / p.installs).toFixed(1)}</td>
              <td className="num">{p.opened ? percent(p.installs, p.opened) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function Hours({ usage }: { usage: Usage }) {
  const top = Math.max(1, ...usage.hours.map((h) => h.times))
  const at = (weekday: number, hour: number) =>
    usage.hours.find((h) => h.weekday === weekday && h.hour === hour)?.times ?? 0
  const hours = Array.from({ length: 24 }, (_, i) => i)
  return (
    <section>
      <h2>When they pray</h2>
      <p className="lede">Prayers finished, by weekday and the hour on the person's own clock.</p>
      {usage.hours.length === 0 ? (
        <p className="muted">No counts with an hour yet.</p>
      ) : (
        <table className="heat">
          <thead>
            <tr>
              <th />
              {hours.map((h) => (
                <th key={h}>{h % 3 === 0 ? h : ''}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weekdays.map((day, weekday) => (
              <tr key={day}>
                <th>{day}</th>
                {hours.map((hour) => (
                  <td
                    key={hour}
                    style={shade(at(weekday, hour) / top)}
                    title={`${day} ${hour}:00 · ${at(weekday, hour)}`}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

function Books({ usage }: { usage: Usage }) {
  return (
    <section>
      <h2>What is read · {usage.filter.days} days</h2>
      <table className="ranked">
        <thead>
          <tr>
            <th>Book</th>
            <th className="num">Installs</th>
            <th className="num">Days read</th>
            <th className="num">Minutes</th>
          </tr>
        </thead>
        <tbody>
          {usage.books.map((b) => (
            <tr key={b.id}>
              <td>
                {title(b.id)} <span className="muted id">{b.id}</span>
              </td>
              <td className="num">{b.installs}</td>
              <td className="num">{b.sittings}</td>
              <td className="num">{b.minutes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

const facets = [
  ['platform', 'Platform'],
  ['language', 'Language'],
  ['version', 'App version'],
  ['update', 'Update it runs'],
] as const

function Audience({ usage }: { usage: Usage }) {
  return (
    <section>
      <h2>Who · last 7 days</h2>
      {facets.map(([facet, label]) => {
        const rows = usage.audience
          .filter((a) => a.facet === facet)
          .sort((a, b) => b.installs - a.installs)
        const total = rows.reduce((sum, r) => sum + r.installs, 0)
        return (
          <table key={facet} className="ranked">
            <thead>
              <tr>
                <th>{label}</th>
                <th className="wide" />
                <th className="num" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.value}>
                  <td>{r.value}</td>
                  <td className="wide">
                    <Meter value={r.installs} of={total} />
                  </td>
                  <td className="num">{percent(r.installs, total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      })}
    </section>
  )
}

function Accounts({ usage }: { usage: Usage }) {
  const a = usage.accounts
  const devices = a.devices.reduce((sum, d) => sum + d.accounts, 0)
  return (
    <section>
      <h2>Accounts</h2>
      <p className="lede">
        Sums over the relay's accounts; nothing here reads one. Unlike the rest, these ignore the
        filters: an account is not tied to an install.
      </p>
      <div className="tiles tiles--small">
        <Tile label="Accounts" value={a.accounts}>
          {a.deleted} deleted
        </Tile>
        <Tile label="Synced this week" value={a.activeWeek}>
          {percent(a.activeWeek, a.accounts)} of accounts
        </Tile>
        <Tile label="Can be reached" value={a.reachable}>
          {a.news} want news
        </Tile>
        <Tile label="Recovery copy" value={a.recovery}>
          {percent(a.recovery, a.accounts)} of accounts
        </Tile>
      </div>
      <table className="ranked">
        <thead>
          <tr>
            <th>Devices</th>
            <th className="wide" />
            <th className="num">Accounts</th>
          </tr>
        </thead>
        <tbody>
          {a.devices.map((d) => (
            <tr key={d.devices}>
              <td>{d.devices}</td>
              <td className="wide">
                <Meter value={d.accounts} of={devices} />
              </td>
              <td className="num">{d.accounts}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <DayChart
        height={80}
        days={a.weekly.map((w) => w.week)}
        bars={{ values: a.weekly.map((w) => w.created), label: 'accounts made, by week' }}
        line={{ values: a.weekly.map((w) => w.deleted), label: 'of them deleted' }}
      />
    </section>
  )
}

function Ranked({
  title: heading,
  rows,
  times,
}: {
  title: string
  rows: { label: string; installs: number; times: number }[]
  times: string
}) {
  const top = Math.max(1, ...rows.map((r) => r.installs))
  return (
    <section>
      <h2>{heading}</h2>
      <table className="ranked">
        <thead>
          <tr>
            <th />
            <th className="wide" />
            <th className="num">Installs</th>
            <th className="num">{times}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <td>
                <code>{r.label}</code>
              </td>
              <td className="wide">
                <Meter value={r.installs} of={top} />
              </td>
              <td className="num">{r.installs}</td>
              <td className="num">{r.times}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
