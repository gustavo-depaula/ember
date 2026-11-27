import type { Overview } from '../../worker/types'
import { Change, DayChart, Meter, shade } from './charts'
import { percent, Table, Tile } from './parts'

export function OverviewTab({ usage }: { usage: Overview }) {
  const { pulse, newcomers, daily } = usage
  const days = usage.filter.days
  return (
    <>
      <section>
        <h2>Pulse · up to {usage.today}</h2>
        <div className="tiles">
          <Tile label="Today" value={pulse.today}>
            <Change now={pulse.today} before={pulse.yesterday} /> on yesterday
          </Tile>
          <Tile label={`Last ${days} days`} value={pulse.period}>
            <Change now={pulse.period} before={pulse.periodBefore} /> on the {days} before
          </Tile>
          <Tile label="Opened a prayer" value={pulse.opened}>
            {percent(pulse.opened, pulse.period)} of the {days} days' ·{' '}
            <Change now={pulse.opened} before={pulse.openedBefore} />
          </Tile>
          <Tile label="Said Amen" value={pulse.amen}>
            {percent(pulse.amen, pulse.period)} of the {days} days' ·{' '}
            <Change now={pulse.amen} before={pulse.amenBefore} />
          </Tile>
          <Tile label="Stickiness" value={percent(pulse.today, pulse.period)}>
            today's share of the {days} days'
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
          line={{ values: daily.map((d) => d.opened), label: 'opened a prayer' }}
          dashed={{ values: daily.map((d) => d.amen), label: 'said Amen' }}
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

      <Cohorts usage={usage} />
      <Predictors usage={usage} />
      <Audience usage={usage} />
    </>
  )
}

// Of the installs first seen in a week, the share still seen 1, 2, … weeks later.
function Cohorts({ usage }: { usage: Overview }) {
  const weeks = [...new Set(usage.cohorts.map((c) => c.cohort))]
  const span = Array.from({ length: 9 }, (_, i) => i)
  return (
    <section>
      <h2>Do they come back?</h2>
      <p className="lede">
        Installs by the week they first opened Ember, and the share seen again each week after.
        Always the last twelve weeks, whatever the period.
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

// Which first-week acts go with staying. Correlation, not cause: the devout do more of
// everything, so read the gap between rows, not one row's lift alone.
function Predictors({ usage }: { usage: Overview }) {
  const rows = usage.predictors
    .map((p) => {
      const kept = p.did ? p.didKept / p.did : 0
      const others = p.didNot ? p.didNotKept / p.didNot : 0
      // A difference needs both sides: an act everyone did, or no one, compares with nothing.
      const lift = p.did && p.didNot ? kept - others : undefined
      return { ...p, kept, others, lift }
    })
    .sort((a, b) => (b.lift ?? -2) - (a.lift ?? -2))
  const total = (rows[0]?.did ?? 0) + (rows[0]?.didNot ?? 0)
  return (
    <Table
      heading="What their first week predicts"
      lede={
        <>
          Of the {total} installs first seen four to seventeen weeks ago, the share still here in
          their fourth week, by what they did in their first. Whatever the period; the platform and
          language filters apply.
        </>
      }
      rows={rows}
      rowKey={(r) => r.behavior}
      name={{ label: 'In the first week', value: (r) => r.behavior }}
      meter={(r) => Math.max(0, r.lift ?? 0)}
      columns={[
        { label: 'Did it', value: (r) => r.did },
        { label: 'Week 4, did', value: (r) => percent(r.didKept, r.did) },
        { label: 'Week 4, didn’t', value: (r) => percent(r.didNotKept, r.didNot) },
        {
          label: 'Difference',
          value: (r) =>
            r.lift === undefined
              ? '—'
              : `${r.lift >= 0 ? '+' : '−'}${Math.round(Math.abs(r.lift) * 100)}`,
        },
      ]}
      empty="No installs old enough yet."
    />
  )
}

const facets = [
  ['platform', 'Platform'],
  ['language', 'Language'],
  ['version', 'App version'],
  ['update', 'Update it runs'],
] as const

function Audience({ usage }: { usage: Overview }) {
  return (
    <section>
      <h2>Who · {usage.filter.days} days</h2>
      <div className="columns">
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
      </div>
    </section>
  )
}
