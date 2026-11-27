import type { Search, SearchScope } from '../../worker/types'
import { Item, percent, Table, Tile } from './parts'

// What people search for, in the app's search and the Mass-times church search: the words they
// settled on (cleaned on the device: folded, and nothing that looks like an address or a phone
// number), what they found, and what they opened.

export function SearchTab({ usage }: { usage: Search }) {
  return (
    <>
      <Scope
        heading={`Prayers, books and saints · ${usage.filter.days} days`}
        scope={usage.corpus}
        opened={(id) => <Item id={id} />}
      />
      <Scope
        heading={`Churches by name · ${usage.filter.days} days`}
        scope={usage.churches}
        opened={(id) => usage.names[id] ?? id}
      />
    </>
  )
}

const positionLabel = (at: number) => (at > 10 ? 'below the tenth' : `${at}`)

function Scope({
  heading,
  scope,
  opened,
}: {
  heading: string
  scope: SearchScope
  opened: (id: string) => React.ReactNode
}) {
  const { totals } = scope
  return (
    <>
      <section>
        <h2>{heading}</h2>
        <div className="tiles tiles--small">
          <Tile label="Searches" value={totals.searches ?? 0}>
            by {totals.installs ?? 0} installs
          </Tile>
          <Tile label="Opened a result" value={percent(totals.opened ?? 0, totals.searches ?? 0)}>
            of searches
          </Tile>
          <Tile label="Found nothing" value={percent(totals.empty ?? 0, totals.searches ?? 0)}>
            {totals.empty ?? 0} searches
          </Tile>
        </div>
      </section>
      <div className="columns">
        <Table
          heading="What they search for"
          rows={scope.queries}
          rowKey={(q) => q.q}
          name={{ label: 'Words', value: (q) => q.q }}
          meter={(q) => q.installs}
          columns={[
            { label: 'Installs', value: (q) => q.installs },
            { label: 'Results', value: (q) => q.results },
            { label: 'Opened', value: (q) => percent(q.opened, q.times) },
          ]}
        />
        <Table
          heading="Searched, and found nothing"
          lede="What the corpus (or the church list) is missing, or what it calls by another name."
          rows={scope.empty}
          rowKey={(q) => q.q}
          name={{ label: 'Words', value: (q) => q.q }}
          meter={(q) => q.installs}
          columns={[
            { label: 'Installs', value: (q) => q.installs },
            { label: 'Times', value: (q) => q.times },
          ]}
          empty="Every search found something."
        />
      </div>
      <div className="columns">
        <Table
          heading="Opened from a search"
          rows={scope.opened}
          rowKey={(o) => o.id}
          name={{ label: 'Result', value: (o) => opened(o.id) }}
          meter={(o) => o.installs}
          columns={[
            { label: 'Installs', value: (o) => o.installs },
            { label: 'Place in the list', value: (o) => o.at },
          ]}
        />
        <Table
          heading="Where in the list the opened result was"
          rows={scope.positions}
          rowKey={(p) => String(p.at)}
          name={{ label: 'Place', value: (p) => positionLabel(p.at) }}
          meter={(p) => p.times}
          columns={[{ label: 'Times', value: (p) => p.times }]}
        />
      </div>
    </>
  )
}
