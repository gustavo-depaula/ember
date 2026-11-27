import type { ReactNode } from 'react'
import { Meter } from './charts'

// What every tab is built of: tiles for the headline counts and ranked tables for the rest.

export const percent = (part: number, whole: number) =>
  whole ? `${Math.round((part / whole) * 100)}%` : '—'

// `practice/examination-of-conscience` → "Examination of conscience". The panel has no corpus to
// look titles up in, and the id under it says exactly which one.
export function title(id: string): string {
  const slug = id
    .slice(id.indexOf('/') + 1)
    .replace(/[-_]/g, ' ')
    .trim()
  return slug.charAt(0).toUpperCase() + slug.slice(1)
}

// A corpus item, titled, with its id beside it.
export function Item({ id }: { id: string }) {
  if (!id.includes('/')) return <>{id}</>
  return (
    <>
      {title(id)} <span className="muted id">{id}</span>
    </>
  )
}

export function Tile({
  label,
  value,
  children,
}: {
  label: string
  value: number | string
  children?: ReactNode
}) {
  return (
    <div className="tile">
      <span className="tile-label">{label}</span>
      <span className="tile-value">{value ?? 0}</span>
      {children ? <span className="tile-note">{children}</span> : null}
    </div>
  )
}

export type Column<T> = { label: string; value: (row: T) => ReactNode; num?: boolean }

/**
 * A ranked table: the first column names the row, `meter` draws its share of the largest, and the
 * other columns follow. An empty table says what it is waiting for instead.
 */
export function Table<T>({
  heading,
  lede,
  rows,
  name,
  meter,
  columns,
  empty = 'Nothing counted yet.',
  rowKey,
}: {
  heading?: string
  lede?: ReactNode
  rows: T[]
  name: Column<T>
  meter?: (row: T) => number
  columns: Column<T>[]
  empty?: string
  rowKey: (row: T) => string
}) {
  const top = meter ? Math.max(1, ...rows.map(meter)) : 1
  return (
    <section>
      {heading ? <h2>{heading}</h2> : null}
      {lede ? <p className="lede">{lede}</p> : null}
      {rows.length === 0 ? (
        <p className="muted">{empty}</p>
      ) : (
        <table className="ranked">
          <thead>
            <tr>
              <th>{name.label}</th>
              {meter ? <th className="wide" /> : null}
              {columns.map((c) => (
                <th key={c.label} className={c.num === false ? undefined : 'num'}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={rowKey(row)}>
                <td>{name.value(row)}</td>
                {meter ? (
                  <td className="wide">
                    <Meter value={meter(row)} of={top} />
                  </td>
                ) : null}
                {columns.map((c) => (
                  <td key={c.label} className={c.num === false ? undefined : 'num'}>
                    {c.value(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

// A funnel: each step's installs, as a bar against the first and a share of the one before.
export function Funnel({ steps }: { steps: { label: string; installs: number }[] }) {
  const first = steps[0]?.installs ?? 0
  return (
    <table className="ranked funnel">
      <tbody>
        {steps.map((step, i) => (
          <tr key={step.label}>
            <td>{step.label}</td>
            <td className="wide">
              <Meter value={step.installs} of={first} />
            </td>
            <td className="num">{step.installs}</td>
            <td className="num muted">{percent(step.installs, first)}</td>
            <td className="num muted">
              {i > 0 ? `${percent(step.installs, steps[i - 1]?.installs ?? 0)} of the last` : ''}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// Counts that come in bands: how many installs did a thing on 0, 1, 2–3, … days.
export function Bands({
  heading,
  counts,
  bands,
  unit,
}: {
  heading: string
  counts: { n: number; installs: number }[]
  bands: readonly (readonly [number, number])[]
  unit: [string, string]
}) {
  const rows = bands.map(([from, to]) => ({
    label: (() => {
      if (from === to) return `${from} ${from === 1 ? unit[0] : unit[1]}`
      if (to === Number.POSITIVE_INFINITY) return `${from}+ ${unit[1]}`
      return `${from}–${to} ${unit[1]}`
    })(),
    installs: counts.filter((c) => c.n >= from && c.n <= to).reduce((s, c) => s + c.installs, 0),
  }))
  const total = rows.reduce((sum, r) => sum + r.installs, 0)
  return (
    <Table
      heading={heading}
      rows={rows}
      rowKey={(r) => r.label}
      name={{ label: '', value: (r) => r.label }}
      meter={(r) => r.installs}
      columns={[
        { label: 'Installs', value: (r) => r.installs },
        { label: '', value: (r) => <span className="muted">{percent(r.installs, total)}</span> },
      ]}
    />
  )
}
