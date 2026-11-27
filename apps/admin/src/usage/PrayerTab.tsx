import type { Prayer } from '../../worker/types'
import { Change, shade } from './charts'
import { Bands, Item, percent, Table, Tile } from './parts'

const habitBands = [
  [0, 0],
  [1, 1],
  [2, 3],
  [4, 7],
  [8, 14],
  [15, 21],
  [22, 28],
  [29, 60],
  [61, 90],
] as const

export function PrayerTab({ usage }: { usage: Prayer }) {
  const { pulse, unfinished } = usage
  const days = usage.filter.days
  const habit = (what: 'opened' | 'amen') =>
    usage.habit.filter((h) => h.what === what).map((h) => ({ n: h.days, installs: h.installs }))
  const bands = habitBands
    .filter(([from]) => from <= days)
    .map(([f, t]) => [f, Math.min(t, days)] as const)
  return (
    <>
      {/* The prayer app's own measure, as two: on how many days of the period each install opened
          a prayer, and on how many it tapped the Amen at the end. The gap between them is prayer
          the Amen never recorded, or prayer left unfinished. */}
      <section>
        <h2>Do they pray? · {days} days</h2>
        <p className="lede">
          Of the {pulse.period} installs seen, <strong>{pulse.opened}</strong> opened a prayer and{' '}
          <strong>{pulse.amen}</strong> said Amen at its end.{' '}
          <strong>{unfinished.neverAmen}</strong> opened one and never said Amen; of the{' '}
          {unfinished.openedDays} days on which someone opened a prayer,{' '}
          <strong>{percent(unfinished.amenDays, unfinished.openedDays)}</strong> ended in an Amen.
        </p>
        <div className="columns">
          <Bands
            heading="Opened a prayer"
            counts={habit('opened')}
            bands={bands}
            unit={['day', 'days']}
          />
          <Bands heading="Said Amen" counts={habit('amen')} bands={bands} unit={['day', 'days']} />
        </div>
        <p className="muted">
          Amen is the button that ends the prayer screen; a tick on the plan and a Mass check-in are
          neither. Builds that don't yet say which it was count a completion as an Amen on a day the
          install opened a prayer.
        </p>
      </section>

      <Arc usage={usage} />

      <Table
        heading={`What is prayed · ${days} days`}
        lede={
          <>
            By installs that marked it done at least once, by Amen or by a tick. <em>Finished</em>{' '}
            is the share of installs that opened the prayer and marked it done; <em>change</em>{' '}
            compares with the period before.
          </>
        }
        rows={usage.practices}
        rowKey={(p) => p.id}
        name={{ label: 'Practice', value: (p) => <Item id={p.id} /> }}
        meter={(p) => p.installs}
        columns={[
          { label: 'Installs', value: (p) => p.installs },
          { label: 'Change', value: (p) => <Change now={p.installs} before={p.before} /> },
          { label: 'Times', value: (p) => p.times },
          { label: 'Per install', value: (p) => (p.times / p.installs).toFixed(1) },
          { label: 'Finished', value: (p) => (p.opened ? percent(p.installs, p.opened) : '—') },
        ]}
      />

      <Table
        heading="How far they read"
        lede={
          <>
            Each time a prayer's page was left: how far down it was read on average, how often to
            its end, and how it was left. <em>Mass</em> is the daily liturgy marked as the Mass, or
            a check-in.
          </>
        }
        rows={usage.reading}
        rowKey={(r) => r.id}
        name={{ label: 'Prayer', value: (r) => <Item id={r.id} /> }}
        meter={(r) => r.sessions}
        columns={[
          { label: 'Times', value: (r) => r.sessions },
          { label: 'Installs', value: (r) => r.installs },
          { label: 'Read', value: (r) => `${r.depth}%` },
          { label: 'To the end', value: (r) => percent(r.whole, r.sessions) },
          { label: 'Amen', value: (r) => percent(r.amen, r.sessions) },
          { label: 'Mass', value: (r) => (r.mass ? percent(r.mass, r.sessions) : '') },
          { label: 'Just left', value: (r) => percent(r.left, r.sessions) },
        ]}
        empty="Nothing counted yet: builds before December 2026 don't send it."
      />

      <div className="columns">
        <Hours usage={usage} />
        <Table
          heading="Reminders tapped"
          lede="The practice a reminder was for, and how often it was prayed the day it was tapped."
          rows={usage.reminders}
          rowKey={(r) => r.id}
          name={{ label: 'Practice', value: (r) => <Item id={r.id} /> }}
          meter={(r) => r.installs}
          columns={[
            { label: 'Installs', value: (r) => r.installs },
            { label: 'Taps', value: (r) => r.times },
            { label: 'Prayed', value: (r) => percent(r.prayed, r.times) },
          ]}
          empty="No reminder tapped yet: builds before November 2026 don't count them."
        />
      </div>

      <Table
        heading="Languages changed"
        lede="What people do in a prayer's language sheet: what they pray in, the companion beside it, and whether it is for this prayer or every one."
        rows={usage.languages}
        rowKey={(l) => `${l.action}|${l.value}`}
        name={{ label: 'Change', value: (l) => `${l.action}${l.value ? ` → ${l.value}` : ''}` }}
        meter={(l) => l.times}
        columns={[
          { label: 'Times', value: (l) => l.times },
          { label: 'Installs', value: (l) => l.installs },
        ]}
        empty="No language changed in this period."
      />
    </>
  )
}

// The prayed day (packages/holy-cards): the offering, the midday and the examen, or the Rosary.
function Arc({ usage }: { usage: Prayer }) {
  const of = (stations: number, rosary?: number) =>
    usage.arc
      .filter((a) => a.stations === stations && (rosary === undefined || a.rosary === rosary))
      .reduce((sum, a) => sum + a.days, 0)
  const rosaryDays = usage.arc.filter((a) => a.rosary).reduce((s, a) => s + a.days, 0)
  const prayed = usage.arc
    .filter((a) => a.stations === 3 || a.rosary)
    .reduce((s, a) => s + a.days, 0)
  const markedDays = usage.arc.reduce((s, a) => s + a.days, 0)
  return (
    <section>
      <h2>The prayed day · {usage.filter.days} days</h2>
      <p className="lede">
        Of {markedDays} days on which an install marked a prayer, <strong>{prayed}</strong> were
        prayed days, the Rosary or all three of the day's prayers, and won its holy card that way.
      </p>
      <div className="tiles tiles--small">
        <Tile label="One of the three" value={of(1, 0)}>
          days, without the Rosary
        </Tile>
        <Tile label="Two of the three" value={of(2, 0)}>
          days, without the Rosary
        </Tile>
        <Tile label="All three" value={of(3)}>
          days
        </Tile>
        <Tile label="The Rosary" value={rosaryDays}>
          days
        </Tile>
        <Tile label="Morning offering" value={usage.stations.offering}>
          installs
        </Tile>
        <Tile label="Angelus, Regina Caeli or liturgy" value={usage.stations.midday}>
          installs
        </Tile>
        <Tile label="Examen" value={usage.stations.examen}>
          installs
        </Tile>
      </div>
    </section>
  )
}

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function Hours({ usage }: { usage: Prayer }) {
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
