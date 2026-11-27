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

      <Accounts usage={usage} />
    </>
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
