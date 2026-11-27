import type { Library } from '../../worker/types'
import { Item, percent, Table, Tile } from './parts'

export function LibraryTab({ usage }: { usage: Library }) {
  const days = usage.filter.days
  const { collections, bibleTotals } = usage
  return (
    <>
      <div className="columns">
        <Table
          heading={`What is read · ${days} days`}
          rows={usage.books}
          rowKey={(b) => b.id}
          name={{ label: 'Book', value: (b) => <Item id={b.id} /> }}
          meter={(b) => b.installs}
          columns={[
            { label: 'Installs', value: (b) => b.installs },
            { label: 'Days read', value: (b) => b.sittings },
            { label: 'Minutes', value: (b) => b.minutes },
          ]}
          empty="No book named yet: builds before November 2026 sent book ids the desk could not read."
        />
        <Table
          heading="How far in they get"
          lede="Chapters each reader stayed in at least twenty seconds."
          rows={usage.reach}
          rowKey={(r) => r.id}
          name={{ label: 'Book', value: (r) => <Item id={r.id} /> }}
          columns={[
            { label: 'Readers', value: (r) => r.readers },
            { label: 'Chapters each', value: (r) => r.average },
            { label: 'Most', value: (r) => r.most },
            { label: '5 or more', value: (r) => percent(r.far, r.readers) },
          ]}
        />
      </div>

      <section>
        <h2>Saved and collected · {days} days</h2>
        <div className="tiles tiles--small">
          <Tile label="Bible readers" value={bibleTotals.installs ?? 0}>
            {bibleTotals.chapters ?? 0} chapters read
          </Tile>
          <Tile label="Collections made" value={collections.made ?? 0}>
            by {collections.makers ?? 0} installs
          </Tile>
          <Tile label="Added to a collection" value={collections.added ?? 0}>
            by {collections.adders ?? 0} installs
          </Tile>
          <Tile label="Saved" value={usage.saved.reduce((sum, s) => sum + s.times, 0)}>
            items
          </Tile>
        </div>
      </section>

      <div className="columns">
        <Table
          heading="The Bible"
          rows={usage.bible}
          rowKey={(b) => b.book}
          name={{ label: 'Book', value: (b) => b.book }}
          meter={(b) => b.installs}
          columns={[
            { label: 'Installs', value: (b) => b.installs },
            { label: 'Chapters', value: (b) => b.chapters },
          ]}
        />
        <Table
          heading="Saved, by kind"
          rows={usage.saved}
          rowKey={(s) => s.kind}
          name={{ label: 'Kind', value: (s) => s.kind }}
          meter={(s) => s.times}
          columns={[
            { label: 'Saved', value: (s) => s.times },
            { label: 'Installs', value: (s) => s.installs },
          ]}
        />
      </div>

      <div className="columns">
        <Table
          heading="Most saved"
          rows={usage.savedItems}
          rowKey={(s) => s.id}
          name={{ label: 'Item', value: (s) => <Item id={s.id} /> }}
          meter={(s) => s.installs}
          columns={[{ label: 'Installs', value: (s) => s.installs }]}
        />
        <Table
          heading="Most put in a collection"
          rows={usage.collected}
          rowKey={(s) => s.id}
          name={{ label: 'Item', value: (s) => <Item id={s.id} /> }}
          meter={(s) => s.installs}
          columns={[{ label: 'Installs', value: (s) => s.installs }]}
        />
      </div>
    </>
  )
}
