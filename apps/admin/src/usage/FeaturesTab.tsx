import type { Features } from '../../worker/types'
import { DayChart, Meter } from './charts'
import { Item, percent, Table, Tile } from './parts'

// The rest of the app: every screen and every action counted, the choices people make in
// settings, what they share, the TestFlight sheet, and the accounts.

const preferenceLabels: Record<string, string> = {
  translation: 'Bible translation',
  'psalter-cycle': 'Psalter cycle',
  language: 'App language',
  jurisdiction: 'Calendar',
  'content-language': 'Prayer language',
  'secondary-language': 'Second language',
  'display-mode': 'Display',
  'bible-commentary': 'Bible commentary',
}

export function FeaturesTab({ usage }: { usage: Features }) {
  const days = usage.filter.days
  const keys = [...new Set(usage.preferences.map((p) => p.key))]
  const sheet = (action: string) => usage.appStore.find((a) => a.action === action)?.installs ?? 0
  return (
    <>
      <div className="columns">
        <Table
          heading={`Screens · ${days} days`}
          rows={usage.screens}
          rowKey={(s) => s.route}
          name={{ label: '', value: (s) => <code>{s.route}</code> }}
          meter={(s) => s.installs}
          columns={[
            { label: 'Installs', value: (s) => s.installs },
            { label: 'Views', value: (s) => s.views },
          ]}
        />
        <Table
          heading={`Actions · ${days} days`}
          rows={usage.actions}
          rowKey={(a) => a.name}
          name={{ label: '', value: (a) => <code>{a.name}</code> }}
          meter={(a) => a.installs}
          columns={[
            { label: 'Installs', value: (a) => a.installs },
            { label: 'Times', value: (a) => a.times },
          ]}
        />
      </div>

      <section>
        <h2>Settings chosen · {days} days</h2>
        <p className="lede">
          Each install's latest choice, for the settings that follow an account.
        </p>
        {keys.length === 0 ? (
          <p className="muted">No setting changed in the period.</p>
        ) : (
          <div className="columns">
            {keys.map((key) => {
              const rows = usage.preferences.filter((p) => p.key === key)
              const total = rows.reduce((sum, r) => sum + r.installs, 0)
              return (
                <table key={key} className="ranked">
                  <thead>
                    <tr>
                      <th>{preferenceLabels[key] ?? key}</th>
                      <th className="wide" />
                      <th className="num">Installs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.value}>
                        <td>{r.value || 'unset'}</td>
                        <td className="wide">
                          <Meter value={r.installs} of={total} />
                        </td>
                        <td className="num">{r.installs}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            })}
          </div>
        )}
      </section>

      <div className="columns">
        <Table
          heading="Shared"
          rows={usage.shared}
          rowKey={(s) => s.id}
          name={{ label: 'Prayer', value: (s) => <Item id={s.id} /> }}
          meter={(s) => s.installs}
          columns={[
            { label: 'Installs', value: (s) => s.installs },
            { label: 'Times', value: (s) => s.times },
          ]}
        />
        <section>
          <h2>From TestFlight to the App Store</h2>
          <div className="tiles tiles--small">
            <Tile label="Shown the sheet" value={sheet('shown')}>
              installs
            </Tile>
            <Tile label="Went to the store" value={sheet('open')}>
              {percent(sheet('open'), sheet('shown'))} of them
            </Tile>
            <Tile label="Later" value={sheet('later')}>
              installs
            </Tile>
          </div>
        </section>
      </div>

      <Plans usage={usage} />

      <div className="columns">
        <Table
          heading="Opened from a link"
          lede="The website's prayer pages and shared links, opening the app: at launch (cold) or while it ran (warm)."
          rows={usage.links}
          rowKey={(l) => l.id}
          name={{ label: 'Prayer', value: (l) => <Item id={l.id} /> }}
          meter={(l) => l.installs}
          columns={[
            { label: 'Installs', value: (l) => l.installs },
            { label: 'Cold', value: (l) => l.cold },
            { label: 'Warm', value: (l) => l.warm },
          ]}
          empty="No link opened the app in this period."
        />
        <section>
          <h2>Notifications</h2>
          <p className="lede">
            Asked for in the period, and how each install's notifications stand on its latest day:
            reminders that cannot be shown look the same as none set.
          </p>
          <div className="tiles tiles--small">
            {usage.notifications.map((n) => (
              <Tile key={n.asked} label={`Asked, ${n.asked}`} value={n.installs}>
                installs
              </Tile>
            ))}
            {usage.permissions.map((p) => (
              <Tile key={p.status} label={`Now ${p.status}`} value={p.installs}>
                installs
              </Tile>
            ))}
          </div>
        </section>
      </div>

      <Accounts usage={usage} />
    </>
  )
}

const sizeBands = [
  [0, 0],
  [1, 1],
  [2, 3],
  [4, 6],
  [7, 10],
  [11, Number.POSITIVE_INFINITY],
] as const

const band = (n: number) => {
  const [from, to] = sizeBands.find(([f, t]) => n >= f && n <= t) ?? [n, n]
  if (from === to) return String(from)
  return to === Number.POSITIVE_INFINITY ? `${from}+` : `${from}–${to}`
}

// The plans people keep: how many practices and how many of them remind, on each install's
// latest day, and the average of both day by day.
function Plans({ usage }: { usage: Features }) {
  const by = (key: 'practices' | 'reminders') => {
    const counts = new Map<string, number>()
    for (const p of usage.plans)
      counts.set(band(p[key]), (counts.get(band(p[key])) ?? 0) + p.installs)
    return sizeBands
      .map(([f]) => band(f))
      .map((label) => ({ label, installs: counts.get(label) ?? 0 }))
  }
  const daily = usage.planDaily
  return (
    <section>
      <h2>The plan of life · {usage.filter.days} days</h2>
      <div className="columns">
        {(['practices', 'reminders'] as const).map((key) => (
          <Table
            key={key}
            rows={by(key)}
            rowKey={(r) => r.label}
            name={{
              label: key === 'practices' ? 'Practices kept' : 'Reminders',
              value: (r) => r.label,
            }}
            meter={(r) => r.installs}
            columns={[{ label: 'Installs', value: (r) => r.installs }]}
            empty="No plan counted yet: builds before December 2026 don't send it."
          />
        ))}
      </div>
      {daily.length > 0 ? (
        <DayChart
          height={90}
          days={daily.map((d) => d.day)}
          bars={{ values: daily.map((d) => d.practices), label: 'practices per install' }}
          line={{ values: daily.map((d) => d.reminders), label: 'reminders per install' }}
        />
      ) : null}
    </section>
  )
}

function Accounts({ usage }: { usage: Features }) {
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
