import type { ChurchUse, MassTimes } from '../../worker/types'
import { DayChart } from './charts'
import { percent, Table, Tile } from './parts'

// Where people look for Mass, which churches they open and go to, and the churches their looking
// shows to be worth a look on the Mass-times desk.

// A verification older than this is stale enough to look at again.
const staleDays = 365

function reasonsToLook(church: ChurchUse, today: string): string[] {
  if (!church.name) return ['not in the database']
  const reasons: string[] = []
  if (!church.services) reasons.push('no times at all')
  else if (!church.scheduled) reasons.push('times only as text')
  if (!church.verified) reasons.push('never verified')
  else if ((Date.parse(today) - Date.parse(church.verified)) / 86_400_000 > staleDays)
    reasons.push(`verified ${church.verified}`)
  return reasons
}

function ChurchName({ church }: { church: ChurchUse }) {
  return (
    <>
      {church.name ?? church.id}{' '}
      <span className="muted id">{[church.city, church.region].filter(Boolean).join(', ')}</span>
    </>
  )
}

export function MassTab({ usage }: { usage: MassTimes }) {
  const { totals, daily } = usage
  const days = usage.filter.days
  const worth = usage.churches
    .map((church) => ({ church, reasons: reasonsToLook(church, usage.today) }))
    .filter((c) => c.reasons.length > 0)
    .slice(0, 25)
  const empty = usage.places.filter((p) => p.empty > 0).sort((a, b) => b.empty - a.empty)
  return (
    <>
      <section>
        <h2>Mass times · {days} days</h2>
        <div className="tiles">
          <Tile label="Opened Mass times" value={totals.visitors}>
            installs
          </Tile>
          <Tile label="Opened a church" value={totals.openers}>
            installs · {totals.opened} times
          </Tile>
          <Tile label="Checked in" value={totals.checkers}>
            installs · {totals.checkins} check-ins
          </Tile>
          <Tile label="Saved a church" value={totals.favorites ?? 0}>
            times
          </Tile>
          <Tile label="Confirmed the times" value={totals.verified ?? 0}>
            {totals.corrections ?? 0} corrections sent
          </Tile>
        </div>
        <DayChart
          height={110}
          days={daily.map((d) => d.day)}
          bars={{ values: daily.map((d) => d.visitors), label: 'opened Mass times' }}
          line={{ values: daily.map((d) => d.checkins), label: 'check-ins' }}
        />
      </section>

      <Table
        heading="Where they look"
        lede={
          <>
            Each map view held still, named by the city most of its churches are in.{' '}
            <em>Around them</em> is the share of views near the person's own location; the rest they
            looked up. <em>Found none</em> counts views that listed no church.
          </>
        }
        rows={usage.places.slice(0, 30)}
        rowKey={(p) => `${p.city}|${p.region}`}
        name={{
          label: 'Place',
          value: (p) => (
            <>
              {p.city} <span className="muted id">{p.region}</span>
            </>
          ),
        }}
        meter={(p) => p.installs}
        columns={[
          { label: 'Installs', value: (p) => p.installs },
          { label: 'Views', value: (p) => p.views },
          { label: 'Around them', value: (p) => percent(p.here, p.views) },
          { label: 'Found none', value: (p) => p.empty || '' },
        ]}
        empty="No map view counted yet: builds before November 2026 don't send them."
      />

      <Table
        heading="Churches"
        lede="By installs that opened the church, with what they did there."
        rows={usage.churches.slice(0, 30)}
        rowKey={(c) => c.id}
        name={{ label: 'Church', value: (c) => <ChurchName church={c} /> }}
        meter={(c) => c.openers}
        columns={[
          { label: 'Opened by', value: (c) => c.openers },
          { label: 'Times', value: (c) => c.opens },
          { label: 'Check-ins', value: (c) => c.checkins },
          { label: 'Checked in', value: (c) => c.checkers },
          { label: 'Directions', value: (c) => c.directions },
          { label: 'Call, mail, site', value: (c) => c.contact },
          { label: 'Saved', value: (c) => c.favorites },
        ]}
      />

      <div className="columns">
        <Table
          heading="Worth a look on the desk"
          lede="Churches people open whose times are missing, only in text, or unverified for a year."
          rows={worth}
          rowKey={(w) => w.church.id}
          name={{ label: 'Church', value: (w) => <ChurchName church={w.church} /> }}
          columns={[
            { label: 'Opened by', value: (w) => w.church.openers },
            { label: 'Why', value: (w) => w.reasons.join(' · '), num: false },
          ]}
          empty="Every church people open has times verified this year."
        />
        <Table
          heading="Looked, and found none"
          lede="Places whose map views listed no church: a gap in the data, or a view too far out."
          rows={empty.slice(0, 20)}
          rowKey={(p) => `${p.city}|${p.region}`}
          name={{
            label: 'Place',
            value: (p) => (
              <>
                {p.city} <span className="muted id">{p.region}</span>
              </>
            ),
          }}
          columns={[
            { label: 'Empty views', value: (p) => p.empty },
            { label: 'Installs', value: (p) => p.installs },
          ]}
          empty="Every view listed churches."
        />
      </div>

      <div className="columns">
        <Table
          heading="What they ask for"
          rows={usage.asked.slice(0, 15)}
          rowKey={(a) => `${a.intent}|${a.when}`}
          name={{ label: 'Asked', value: (a) => `${a.intent} · ${a.when}` }}
          meter={(a) => a.times}
          columns={[{ label: 'Views', value: (a) => a.times }]}
        />
        <Table
          heading="Check-ins, by kind"
          rows={usage.kinds}
          rowKey={(k) => k.kind}
          name={{ label: 'Kind', value: (k) => k.kind }}
          meter={(k) => k.times}
          columns={[
            { label: 'Check-ins', value: (k) => k.times },
            { label: 'Installs', value: (k) => k.installs },
          ]}
        />
        <Table
          heading="Where a church was opened from"
          rows={usage.from}
          rowKey={(f) => f.from ?? 'not named'}
          name={{ label: 'From', value: (f) => f.from ?? 'not named' }}
          meter={(f) => f.times}
          columns={[{ label: 'Times', value: (f) => f.times }]}
        />
      </div>
    </>
  )
}
