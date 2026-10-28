// The desk's charts, drawn as plain SVG: a handful of shapes needs no library.

const width = 720

// Bars for one series of days, a line for another, a dashed line for a third.
export function DayChart({
  days,
  bars,
  line,
  dashed,
  height = 180,
}: {
  days: string[]
  bars: { values: number[]; label: string }
  line?: { values: number[]; label: string }
  dashed?: { values: number[]; label: string }
  height?: number
}) {
  const top = Math.max(1, ...bars.values, ...(line?.values ?? []), ...(dashed?.values ?? []))
  const step = width / Math.max(1, days.length)
  const y = (value: number) => height - (value / top) * (height - 12)
  const path = (values: number[]) =>
    values.map((v, i) => `${i ? 'L' : 'M'}${(i + 0.5) * step},${y(v)}`).join(' ')
  const ticks = days.filter((_, i) => i % Math.ceil(days.length / 6) === 0)
  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${width} ${height + 18}`} role="img" aria-label={bars.label}>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} className="grid" x1={0} x2={width} y1={y(top * f)} y2={y(top * f)} />
        ))}
        {bars.values.map((value, i) => (
          <rect
            key={days[i]}
            className="bar"
            x={i * step + step * 0.15}
            width={step * 0.7}
            y={y(value)}
            height={height - y(value)}
          >
            <title>
              {days[i]}: {value} {bars.label}
              {line ? ` · ${line.values[i]} ${line.label}` : ''}
              {dashed ? ` · ${dashed.values[i]} ${dashed.label}` : ''}
            </title>
          </rect>
        ))}
        {dashed ? <path className="line line--dashed" d={path(dashed.values)} /> : null}
        {line ? <path className="line" d={path(line.values)} /> : null}
        {ticks.map((day) => (
          <text key={day} className="tick" x={(days.indexOf(day) + 0.5) * step} y={height + 14}>
            {day.slice(5)}
          </text>
        ))}
        <text className="tick tick--top" x={width} y={10}>
          {top}
        </text>
      </svg>
      <figcaption>
        <span className="key key--bar" /> {bars.label}
        {line ? (
          <>
            <span className="key key--line" /> {line.label}
          </>
        ) : null}
        {dashed ? (
          <>
            <span className="key key--dashed" /> {dashed.label}
          </>
        ) : null}
      </figcaption>
    </figure>
  )
}

// A bar that fills its cell, for tables that rank.
export function Meter({ value, of }: { value: number; of: number }) {
  return (
    <span className="meter">
      <span style={{ width: `${of ? (value / of) * 100 : 0}%` }} />
    </span>
  )
}

// A cell tinted by how large its share is, from nothing to all.
export function shade(share: number): React.CSSProperties {
  return {
    background: `color-mix(in srgb, var(--accent) ${Math.round(Math.min(1, share) * 85)}%, var(--surface))`,
  }
}

// The change from one period to the one before it, as a signed percentage.
export function Change({ now, before }: { now: number; before: number }) {
  if (!before) return now ? <span className="change change--up">new</span> : null
  const change = (now - before) / before
  if (Math.abs(change) < 0.005) return <span className="change">±0%</span>
  return (
    <span className={`change change--${change > 0 ? 'up' : 'down'}`}>
      {change > 0 ? '+' : '−'}
      {Math.round(Math.abs(change) * 100)}%
    </span>
  )
}
