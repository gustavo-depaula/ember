import type { Health } from '../../worker/types'
import { DayChart } from './charts'
import { percent, Table, Tile } from './parts'

// How the app holds up: the errors it meets (counted by where and what failed, never by their
// messages), the crashes, and each update set against the others, so a bad one shows.

const whereLabels: Record<string, string> = {
  query: 'A read',
  mutation: 'A write',
  uncaught: 'Uncaught',
  fatal: 'Crash',
}

export function HealthTab({ usage }: { usage: Health }) {
  const { totals, daily } = usage
  return (
    <>
      <section>
        <h2>Health · {usage.filter.days} days</h2>
        <div className="tiles">
          <Tile label="Met an error" value={percent(totals.erring ?? 0, totals.active ?? 0)}>
            {totals.erring ?? 0} of {totals.active ?? 0} installs
          </Tile>
          <Tile label="Errors" value={totals.errors ?? 0}>
            {totals.active ? ((totals.errors ?? 0) / totals.active).toFixed(2) : '0'} per install
          </Tile>
          <Tile label="Crashes" value={totals.fatal ?? 0}>
            counted on the launch after
          </Tile>
        </div>
        <DayChart
          height={110}
          days={daily.map((d) => d.day)}
          bars={{ values: daily.map((d) => d.erring), label: 'installs that met an error' }}
          line={{ values: daily.map((d) => d.errors), label: 'errors' }}
        />
      </section>

      <Table
        heading="By update"
        lede="Each update the app ran, newest first. A rise in errors, or a fall in Amens, after an update is the update."
        rows={usage.builds}
        rowKey={(b) => b.build}
        name={{ label: 'Update', value: (b) => <code>{b.build}</code> }}
        meter={(b) => b.installs}
        columns={[
          { label: 'Installs', value: (b) => b.installs },
          { label: 'Met an error', value: (b) => percent(b.erring, b.installs) },
          { label: 'Errors', value: (b) => b.errors },
          { label: 'Crashes', value: (b) => b.fatal || '' },
          { label: 'Said Amen', value: (b) => percent(b.amen, b.installs) },
        ]}
      />

      <div className="columns">
        <Table
          heading="What failed"
          lede="A read is named by its query's first key: a content source, the Mass times, a book."
          rows={usage.sources}
          rowKey={(s) => `${s.source}|${s.where}`}
          name={{
            label: 'Source',
            value: (s) => (
              <>
                <code>{s.source}</code>{' '}
                <span className="muted id">{whereLabels[s.where] ?? s.where}</span>
              </>
            ),
          }}
          meter={(s) => s.installs}
          columns={[
            { label: 'Installs', value: (s) => s.installs },
            { label: 'Times', value: (s) => s.times },
          ]}
          empty="No error in this period."
        />
        <Table
          heading="Of what kind"
          rows={usage.kinds}
          rowKey={(k) => `${k.where}|${k.kind}|${k.status}`}
          name={{
            label: 'Kind',
            value: (k) => (
              <>
                <code>{k.kind}</code>
                {k.status ? ` ${k.status}` : ''}{' '}
                <span className="muted id">{whereLabels[k.where] ?? k.where}</span>
              </>
            ),
          }}
          meter={(k) => k.installs}
          columns={[
            { label: 'Installs', value: (k) => k.installs },
            { label: 'Times', value: (k) => k.times },
          ]}
          empty="No error in this period."
        />
      </div>

      <Table
        heading="On which screen"
        rows={usage.routes}
        rowKey={(r) => r.route}
        name={{ label: 'Screen', value: (r) => <code>{r.route}</code> }}
        meter={(r) => r.installs}
        columns={[
          { label: 'Installs', value: (r) => r.installs },
          { label: 'Times', value: (r) => r.times },
        ]}
        empty="No error in this period."
      />
    </>
  )
}
