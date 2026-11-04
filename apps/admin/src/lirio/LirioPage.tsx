import { describeService, kindLabels } from '@ember/api/src/schedule'
import type { Church } from '@ember/api/src/schema'
import {
  type ChangeState,
  type LirioChange,
  type LirioRecord,
  toCreated,
  toRecordChange,
} from '@ember/backend/src/lib/lirio'
import { useEffect, useState } from 'react'
import type { LirioItem } from '../../worker/types'
import { useApplyLirio, useLirio, useMatch, useSkip, useUpload } from './api'

// The Lírio desk: each church Lírio Católico changed since the last upload, his changes beside our
// church as it stands. A change is ticked when it would do something to ours; the rest say why not.

type Shown = 'changed' | 'new' | 'removed'

const kindOf = (item: LirioItem): Shown => {
  if (!item.after) return 'removed'
  return item.church ? 'changed' : 'new'
}

const fieldLabels: Record<string, string> = {
  name: 'Name',
  address: 'Address',
  postalCode: 'CEP',
  phone: 'Phone',
  website: 'Website',
  instagram: 'Instagram',
  pastor: 'Pastor',
  info: 'Notes',
  events: 'Events',
}
const dayNames: Record<string, string> = {
  SU: 'Sun',
  MO: 'Mon',
  TU: 'Tue',
  WE: 'Wed',
  TH: 'Thu',
  FR: 'Fri',
  SA: 'Sat',
}
const stateNotes: Record<ChangeState, string> = {
  ready: '',
  already: 'ours already has this',
  absent: 'ours never had it',
  info: 'ours has no field for this',
  narrower:
    'ours holds this on fewer dates (monthly or seasonal); his grid can only say every week',
}

function describe(change: LirioChange): string {
  if (change.type === 'slot') {
    const time = change.endTime ? `${change.startTime}–${change.endTime}` : change.startTime
    return `${kindLabels[change.kind]} ${dayNames[change.day]} ${time}`
  }
  const label = fieldLabels[change.field]
  if (!change.before) return `${label}: ${change.after}`
  if (!change.after) return `${label}: ${change.before}, cleared`
  return `${label}: ${change.before} → ${change.after}`
}

// Sunday first, as a bulletin lists them; a rule with an ordinal sorts by its weekday.
const weekOrder = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']
function firstDay(rrule: string): number {
  const byDay = rrule.match(/BYDAY=([^;]+)/)?.[1] ?? ''
  const day = weekOrder.indexOf(byDay.split(',')[0]?.replace(/^[+-]?\d/, '') ?? '')
  return day < 0 ? 7 : day
}

// What a church of ours shares with his, compared as words without accents or punctuation.
function alike(record: LirioRecord, church: Church): string[] {
  const words = (value: string | null | undefined) =>
    (value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
  const name = words(record.nome)
  const street = words(record.endereco).split(' ').slice(0, 4).join(' ')
  return [
    name && [church.name, church.longName].some((n) => words(n) === name) ? 'name' : '',
    street.length > 6 && words(church.address).startsWith(street) ? 'address' : '',
  ].filter(Boolean)
}

const placeOf = (record: LirioRecord | undefined) =>
  [record?.bairro, record?.cidade, record?.uf].filter(Boolean).join(', ')

export function LirioPage() {
  const lirio = useLirio()
  const upload = useUpload()
  const [shown, setShown] = useState<Shown>('changed')
  const [selected, setSelected] = useState<string>()
  const [caseOpen, setCaseOpen] = useState(false)

  const items = lirio.data?.items ?? []
  const listed = items.filter((item) => kindOf(item) === shown)
  const current = listed.find((item) => item.id === selected) ?? listed[0]

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const typing = (event.target as HTMLElement).closest('input, textarea, select')
      if (typing || event.metaKey || event.ctrlKey || !current) return
      const step = event.key === 'j' ? 1 : event.key === 'k' ? -1 : 0
      const next = listed[listed.indexOf(current) + step]
      if (step && next) setSelected(next.id)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!lirio.data) {
    return (
      <div className="splash">
        {lirio.error ? <p className="error">{lirio.error.message}</p> : 'Reading Lírio’s changes…'}
      </div>
    )
  }
  const { data } = lirio
  const count = (kind: Shown) => items.filter((item) => kindOf(item) === kind).length

  return (
    <div className={`desk${caseOpen && current ? ' desk--case' : ''}`}>
      <header className="top">
        <h1>Lírio Católico</h1>
        <a href="/">Mass times desk</a>
        <span className={`target target--${data.target}`}>
          {data.target === 'remote' ? 'Production D1' : 'Local D1'}
        </span>
        <span className="muted">
          {data.held
            ? `${data.held.toLocaleString()} of his churches held · his latest edit ${data.latestEdit?.slice(0, 10) ?? '—'} · ${data.applied} applied · ${data.skipped} skipped`
            : 'No download yet'}
        </span>
        <span className="spacer" />
        {upload.error ? <span className="error">{upload.error.message}</span> : null}
        {upload.data && !upload.isPending ? (
          <span className="muted">{upload.data.report}</span>
        ) : null}
        <label className={`button primary${upload.isPending ? ' disabled' : ''}`}>
          {upload.isPending ? 'Reading…' : 'Upload this week’s zip'}
          <input
            type="file"
            accept=".zip,application/zip"
            hidden
            disabled={upload.isPending}
            onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ''
              if (file) upload.mutate(file)
            }}
          />
        </label>
      </header>

      <nav className="queue">
        <div className="segmented tabs">
          {(['changed', 'new', 'removed'] as const).map((kind) => (
            <button
              type="button"
              key={kind}
              className={kind === shown ? 'on' : ''}
              onClick={() => setShown(kind)}
            >
              {{ changed: 'Changed', new: 'Added', removed: 'Removed' }[kind]} {count(kind)}
            </button>
          ))}
        </div>
        {listed.map((item) => {
          const record = item.after ?? item.before
          const ready = item.changes.filter((c) => c.state === 'ready').length
          return (
            <button
              type="button"
              key={item.id}
              className={`queue-item${item === current ? ' queue-item--current' : ''}`}
              onClick={() => {
                setSelected(item.id)
                setCaseOpen(true)
              }}
            >
              <span className="queue-name">{record?.nome}</span>
              <span className="muted">{placeOf(record)}</span>
              {shown === 'changed' ? (
                <span className={`chip chip--${ready ? 'good' : 'idle'}`}>
                  {ready ? `${ready} to carry over` : 'nothing new for ours'}
                </span>
              ) : null}
            </button>
          )
        })}
      </nav>

      <main className="case">
        {current ? (
          <LirioCase key={current.id} item={current} onBack={() => setCaseOpen(false)} />
        ) : (
          <div className="splash">
            {data.held
              ? 'Nothing waiting here. Upload next week’s zip to see what he changed.'
              : 'Upload his horario_missa.zip to begin.'}
          </div>
        )}
      </main>
    </div>
  )
}

function LirioCase({ item, onBack }: { item: LirioItem; onBack: () => void }) {
  const record = item.after ?? item.before
  const skip = useSkip()
  return (
    <div className="case-scroll">
      <button type="button" className="link back" onClick={onBack}>
        ← All of his changes
      </button>
      <div className="case-head">
        <h2>{record?.nome}</h2>
        <p className="muted">
          {[record?.endereco, placeOf(record)].filter(Boolean).join(' · ')}
          {record?.atualizado ? ` · he edited it ${record.atualizado.slice(0, 10)}` : ''}
          {` · Lírio #${item.lirioId}`}
          {item.church ? ` · ours: ${item.church.id}` : ''}
        </p>
      </div>
      {(() => {
        if (!item.after) return <Removed item={item} />
        if (!item.church) return <Added item={item} record={item.after} />
        return <Changed item={item} church={item.church} />
      })()}
      <div className="lirio-actions">
        {skip.error ? <span className="error">{skip.error.message}</span> : null}
        <button type="button" disabled={skip.isPending} onClick={() => skip.mutate(item.id)}>
          Skip
        </button>
      </div>
    </div>
  )
}

function Changed({ item, church }: { item: LirioItem; church: Church }) {
  const apply = useApplyLirio()
  const [picked, setPicked] = useState(
    () =>
      new Set(
        item.changes.filter((c) => c.state === 'ready' && c.type !== 'note').map((c) => c.key),
      ),
  )
  const chosen = item.changes.filter((change) => picked.has(change.key))
  const touched = new Set(chosen.flatMap((change) => (change.type === 'slot' ? [change.kind] : [])))

  return (
    <div className="columns">
      <section className="card">
        <h3>His changes</h3>
        <ul className="lirio-changes">
          {item.changes.map((change) => {
            const open = change.state === 'ready' || change.state === 'narrower'
            const mark = change.type === 'slot' ? (change.op === 'add' ? '+' : '−') : '~'
            return (
              <li key={change.key} className={open ? '' : 'lirio-change--closed'}>
                <label>
                  <input
                    type="checkbox"
                    disabled={!open || change.type === 'note'}
                    checked={picked.has(change.key)}
                    onChange={(event) => {
                      const next = new Set(picked)
                      if (event.target.checked) next.add(change.key)
                      else next.delete(change.key)
                      setPicked(next)
                    }}
                  />
                  <span
                    className={`mark mark--${mark === '+' ? 'add' : mark === '−' ? 'remove' : 'edit'}`}
                  >
                    {mark}
                  </span>
                  <span>{describe(change)}</span>
                </label>
                {stateNotes[change.state] ? (
                  <span className={`muted${change.state === 'narrower' ? ' warn' : ''}`}>
                    {stateNotes[change.state]}
                  </span>
                ) : null}
              </li>
            )
          })}
        </ul>
        <div className="lirio-actions">
          {apply.error ? <span className="error">{apply.error.message}</span> : null}
          <button
            type="button"
            className="primary"
            disabled={chosen.length === 0 || apply.isPending}
            onClick={() =>
              apply.mutate({
                item,
                resolution: { ...toRecordChange(church, chosen), verdicts: [] },
              })
            }
          >
            {apply.isPending ? 'Applying…' : `Apply ${chosen.length}`}
          </button>
        </div>
      </section>
      <section className="card">
        <h3>Ours now</h3>
        <Ours church={church} touched={touched} />
      </section>
    </div>
  )
}

// Our church's schedule, with the rules his grid can't speak for marked as safe from it.
function Ours({ church, touched }: { church: Church; touched: Set<string> }) {
  const services = church.services ?? []
  const kinds = ['mass', 'confession', 'adoration'].filter((kind) =>
    services.some((service) => service.kind === kind),
  )
  return (
    <>
      <p className="muted">
        {[
          church.longName ?? church.name,
          church.phoneE164,
          ...(church.links ?? []).map((l) => l.url),
        ]
          .filter(Boolean)
          .join(' · ')}
      </p>
      {kinds.length === 0 ? <p className="muted">No times on record.</p> : null}
      {kinds.map((kind) => (
        <div key={kind}>
          <h4>
            {kindLabels[kind]}
            {touched.has(kind) ? <span className="muted">his changes land here</span> : null}
          </h4>
          <ul className="lirio-ours">
            {services
              .filter((service) => service.kind === kind)
              .sort(
                (a, b) =>
                  firstDay(a.rrule) - firstDay(b.rrule) || a.startTime.localeCompare(b.startTime),
              )
              .map((service) => {
                const weekly = /^FREQ=WEEKLY;BYDAY=[A-Z,]+$/.test(service.rrule)
                return (
                  <li key={service.id}>
                    {describeService(service)}
                    {weekly ? null : <span className="muted"> · untouched by his grid</span>}
                  </li>
                )
              })}
          </ul>
        </div>
      ))}
      {church.texts?.length ? (
        <div className="lirio-listed">
          <h4>As the parish lists it</h4>
          {church.texts.map((text) => (
            <blockquote key={text.kind}>{text.rawText}</blockquote>
          ))}
        </div>
      ) : null}
    </>
  )
}

function Added({ item, record }: { item: LirioItem; record: LirioRecord }) {
  const match = useMatch()
  const apply = useApplyLirio()
  const [lat, setLat] = useState(record.lat === undefined ? '' : String(record.lat))
  const [lng, setLng] = useState(record.lng === undefined ? '' : String(record.lng))
  const place =
    lat && lng && Number.isFinite(+lat) && Number.isFinite(+lng)
      ? { lat: +lat, lng: +lng }
      : undefined
  const created = place && toCreated(record, place)
  const notes = item.changes.filter((change) => change.type === 'note')
  // He corrects coordinates as he goes, so a church of ours he moved reads as one he added: one
  // nearby by the same name or at the same address is most likely it.
  const nearby = item.nearby
    .map((n) => ({ ...n, alike: alike(record, n.church) }))
    .sort((a, b) => Number(b.alike.length > 0) - Number(a.alike.length > 0))
  const likely = nearby.some((n) => n.alike.length > 0)

  return (
    <div className="columns">
      <section className="card">
        <h3>Is it one of ours?</h3>
        {item.nearby.length === 0 ? (
          <p className="muted">
            {record.lat === undefined
              ? 'He gives no coordinates, so the desk can’t look around it.'
              : 'No church of ours within a kilometre.'}
          </p>
        ) : null}
        <ul className="lirio-nearby">
          {nearby.map(({ church, distanceKm, alike }) => (
            <li key={church.id}>
              <span>
                {alike.length ? (
                  <span className="chip chip--warn">same {alike.join(' and ')}</span>
                ) : null}{' '}
                <strong>{church.longName ?? church.name}</strong>
                <span className="muted">
                  {' '}
                  {[church.address, `${Math.round(distanceKm * 1000)} m`]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </span>
              <button
                type="button"
                disabled={match.isPending}
                onClick={() => match.mutate({ id: item.id, churchId: church.id })}
              >
                It’s this one
              </button>
            </li>
          ))}
        </ul>
        {match.error ? <p className="error">{match.error.message}</p> : null}
      </section>
      <section className="card">
        <h3>Add it as a church of its own</h3>
        <div className="fields">
          <label>
            Latitude
            <input value={lat} onChange={(event) => setLat(event.target.value)} />
          </label>
          <label>
            Longitude
            <input value={lng} onChange={(event) => setLng(event.target.value)} />
          </label>
        </div>
        {place ? (
          <a
            href={`https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lng}#map=18/${place.lat}/${place.lng}`}
            target="_blank"
            rel="noreferrer"
          >
            See it on the map
          </a>
        ) : null}
        <ul className="lirio-ours">
          {(created?.services ?? []).map((service) => (
            <li key={`${service.kind}${service.rrule}${service.startTime}`}>
              {kindLabels[service.kind]} {describeService(service)}
            </li>
          ))}
        </ul>
        <p className="muted">
          His grid is weekly only: a first-Friday or seasonal Mass of this parish is either missing
          or written as every week. Check the parish’s own page before adding it.
        </p>
        {notes.map((note) => (
          <p key={note.key} className="muted">
            {describe(note)}
          </p>
        ))}
        <div className="lirio-actions">
          {apply.error ? <span className="error">{apply.error.message}</span> : null}
          <button
            type="button"
            className={likely ? '' : 'primary'}
            disabled={!created || apply.isPending}
            onClick={() =>
              created &&
              apply.mutate({ item, resolution: { fields: {}, created: [created], verdicts: [] } })
            }
          >
            {(() => {
              if (apply.isPending) return 'Adding…'
              return likely ? 'Add anyway' : 'Add to the directory'
            })()}
          </button>
        </div>
      </section>
    </div>
  )
}

function Removed({ item }: { item: LirioItem }) {
  const apply = useApplyLirio()
  return (
    <section className="card">
      <p>He took this church out of his directory.</p>
      {item.church ? (
        <>
          <p className="muted">
            Ours: {item.church.longName ?? item.church.name} ({item.church.status ?? 'active'}). He
            may have closed it, or merged a duplicate.
          </p>
          <div className="lirio-actions">
            {apply.error ? <span className="error">{apply.error.message}</span> : null}
            <button
              type="button"
              disabled={apply.isPending || item.church.status === 'closed'}
              onClick={() =>
                apply.mutate({ item, resolution: { fields: { status: 'closed' }, verdicts: [] } })
              }
            >
              Mark ours closed
            </button>
          </div>
        </>
      ) : (
        <p className="muted">We hold no church of ours for it, so there is nothing to change.</p>
      )}
    </section>
  )
}
