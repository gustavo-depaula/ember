import type { HolyCards } from '../../worker/types'
import { DayChart } from './charts'
import { Bands, percent, Table, Tile, title } from './parts'

const doorLabels: Record<string, string> = {
  office: 'The Office',
  prayedDay: 'A prayed day (Rosary or the day’s three)',
  mass: 'Mass',
  starter: 'Starter cards',
  novena: 'A novena',
  lineage: 'A practice’s lineage',
  book: 'A book',
  triduum: 'The Triduum',
  gaudete: 'Gaudete',
  laetare: 'Laetare',
  seasonSunday: 'A season’s Sunday',
  seasonWeekday: 'A season’s weekday',
  emberDays: 'Ember days',
}

const heldBands = [
  [1, 1],
  [2, 3],
  [4, 7],
  [8, 14],
  [15, 30],
  [31, 60],
  [61, Number.POSITIVE_INFINITY],
] as const

export function CardsTab({ usage }: { usage: HolyCards }) {
  const { totals, daily } = usage
  return (
    <>
      <section>
        <h2>Holy cards · {usage.filter.days} days</h2>
        <p className="lede">
          On {totals.offerDays ?? 0} days an install saw Today offer a card;{' '}
          <strong>{totals.wonDays ?? 0}</strong> of them had one won and waiting, and on{' '}
          <strong>{totals.openedDays ?? 0}</strong> a card was opened (
          {percent(totals.openedDays ?? 0, totals.wonDays ?? 0)} of the won).
        </p>
        <div className="tiles">
          <Tile label="Collectors" value={totals.collectors ?? 0}>
            installs that opened a card
          </Tile>
          <Tile label="Cards opened" value={totals.redeemed ?? 0}>
            in the period
          </Tile>
          <Tile
            label="Won, then opened"
            value={percent(totals.openedDays ?? 0, totals.wonDays ?? 0)}
          >
            of days a card waited
          </Tile>
        </div>
        <DayChart
          height={110}
          days={daily.map((d) => d.day)}
          bars={{ values: daily.map((d) => d.offered), label: 'offered' }}
          line={{ values: daily.map((d) => d.won), label: 'won' }}
          dashed={{ values: daily.map((d) => d.redeemed), label: 'opened' }}
        />
      </section>

      <div className="columns">
        <Table
          heading="How cards are won"
          rows={usage.doors}
          rowKey={(d) => d.door}
          name={{ label: 'Way', value: (d) => doorLabels[d.door] ?? d.door }}
          meter={(d) => d.times}
          columns={[
            { label: 'Cards', value: (d) => d.times },
            { label: 'Installs', value: (d) => d.installs },
          ]}
        />
        <Bands
          heading="Cards held, by install (all time)"
          counts={usage.held.map((h) => ({ n: h.cards, installs: h.installs }))}
          bands={heldBands}
          unit={['card', 'cards']}
        />
      </div>

      <Table
        heading="Saints"
        lede="Cards opened, and installs that looked at the saint's page."
        rows={usage.saints}
        rowKey={(s) => s.card}
        name={{
          label: 'Saint',
          value: (s) => (
            <>
              {title(s.card)} <span className="muted id">{s.card}</span>
            </>
          ),
        }}
        meter={(s) => s.redeemed}
        columns={[
          { label: 'Opened', value: (s) => s.redeemed },
          { label: 'Page viewers', value: (s) => s.viewers },
        ]}
        empty="No card named yet: builds before November 2026 don't say which."
      />
    </>
  )
}
