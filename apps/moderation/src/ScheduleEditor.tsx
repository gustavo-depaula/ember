import type { ProposedService } from '@ember/api/src/moderation'
import type { Church } from '@ember/api/src/schema'
import { useState } from 'react'
import type { Draft } from './draft'
import {
  asProposed,
  dayCodes,
  describeRule,
  describeTime,
  diffSchedule,
  kindLabels,
  type ScheduleRow,
  serviceKinds,
  weeklyDays,
  weeklyRule,
} from './schedule'

const marks = { same: '', changed: '~', added: '+', removed: '−' }

// The schedule as it will be, set against the schedule as it is: one line per time, the changed
// ones marked, each editable in place.
export function ScheduleEditor({
  church,
  draft,
  setDraft,
}: {
  church: Church
  draft: Draft
  setDraft: (draft: Draft) => void
}) {
  const [editing, setEditing] = useState<number>()
  const rows = diffSchedule(church.services ?? [], draft.services)
  const setServices = (services: ProposedService[]) => setDraft({ ...draft, services })

  const update = (index: number, patch: Partial<ProposedService>) =>
    setServices(draft.services.map((s, i) => (i === index ? { ...s, ...patch } : s)))
  const remove = (index: number) => {
    setEditing(undefined)
    setServices(draft.services.filter((_, i) => i !== index))
  }
  const add = (kind: ProposedService['kind']) => {
    // A new Mass is most likely in the rite and language of the church's others.
    const like = draft.services.find((service) => service.kind === kind)
    setServices([
      ...draft.services,
      {
        kind,
        rite: like?.rite,
        language: like?.language,
        rrule: 'FREQ=WEEKLY;BYDAY=SU',
        startTime: '09:00',
      },
    ])
    setEditing(draft.services.length)
  }

  return (
    <section>
      <h3>Schedule</h3>
      <div className="card schedule">
        {serviceKinds.map((kind) => {
          const ofKind = rows.filter(
            (row) => (row.state === 'removed' ? row.before : row.service).kind === kind,
          )
          return (
            <div key={kind} className="kind">
              <h4>
                {kindLabels[kind]}
                <button type="button" className="link" onClick={() => add(kind)}>
                  + add a time
                </button>
              </h4>
              {ofKind.length === 0 ? <p className="muted">None on record.</p> : null}
              {ofKind.map((row) => (
                <Line
                  key={row.state === 'removed' ? `removed-${row.before.id}` : `row-${row.index}`}
                  row={row}
                  open={row.state !== 'removed' && editing === row.index}
                  onToggle={(index) => setEditing(editing === index ? undefined : index)}
                  onUpdate={update}
                  onRemove={remove}
                  onRestore={(service) => setServices([...draft.services, asProposed(service)])}
                />
              ))}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function Line({
  row,
  open,
  onToggle,
  onUpdate,
  onRemove,
  onRestore,
}: {
  row: ScheduleRow
  open: boolean
  onToggle: (index: number) => void
  onUpdate: (index: number, patch: Partial<ProposedService>) => void
  onRemove: (index: number) => void
  onRestore: (service: NonNullable<Church['services']>[number]) => void
}) {
  const service = row.state === 'removed' ? row.before : row.service
  const details = [service.language, service.rite, service.locationNote, service.note]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className={`line line--${row.state}`}>
      <div className="line-main">
        <span className="mark">{marks[row.state]}</span>
        <span className="days">{describeRule(service.rrule)}</span>
        <span className="time">{describeTime(service)}</span>
        <span className="muted details">{details}</span>
        {row.state === 'changed' ? (
          <span className="was">
            was {describeRule(row.before.rrule)} {describeTime(row.before)}
          </span>
        ) : null}
        {row.state === 'removed' ? (
          <button type="button" className="link" onClick={() => onRestore(row.before)}>
            Keep
          </button>
        ) : (
          <>
            <button type="button" className="link" onClick={() => onToggle(row.index)}>
              {open ? 'Done' : 'Edit'}
            </button>
            <button type="button" className="link" onClick={() => onRemove(row.index)}>
              Remove
            </button>
          </>
        )}
      </div>
      {open && row.state !== 'removed' ? (
        <ServiceForm service={row.service} onChange={(patch) => onUpdate(row.index, patch)} />
      ) : null}
    </div>
  )
}

function ServiceForm({
  service,
  onChange,
}: {
  service: ProposedService
  onChange: (patch: Partial<ProposedService>) => void
}) {
  const days = weeklyDays(service.rrule)
  const text = (key: 'language' | 'rite' | 'locationNote' | 'note' | 'endTime', label: string) => (
    <label>
      {label}
      <input
        type={key === 'endTime' ? 'time' : 'text'}
        value={service[key] ?? ''}
        onChange={(event) => onChange({ [key]: event.target.value || undefined })}
      />
    </label>
  )

  return (
    <div className="service-form">
      {days ? (
        <div className="day-chips">
          {dayCodes.map((code, day) => {
            const on = days.includes(day)
            const next = on ? days.filter((d) => d !== day) : [...days, day]
            return (
              <button
                type="button"
                key={code}
                className={on ? 'on' : ''}
                disabled={on && days.length === 1}
                onClick={() => onChange({ rrule: weeklyRule(next) })}
              >
                {code}
              </button>
            )
          })}
        </div>
      ) : null}
      <label className="wide">
        Rule
        <input
          type="text"
          value={service.rrule}
          spellCheck={false}
          onChange={(event) => onChange({ rrule: event.target.value.trim() })}
        />
      </label>
      <label>
        Starts
        <input
          type="time"
          value={service.startTime.padStart(5, '0')}
          onChange={(event) => onChange({ startTime: event.target.value })}
        />
      </label>
      {text('endTime', 'Ends')}
      <label>
        Kind
        <select
          value={service.kind}
          onChange={(event) => onChange({ kind: event.target.value as ProposedService['kind'] })}
        >
          {serviceKinds.map((kind) => (
            <option key={kind} value={kind}>
              {kindLabels[kind]}
            </option>
          ))}
        </select>
      </label>
      {text('language', 'Language')}
      {text('rite', 'Rite')}
      {text('locationNote', 'Where')}
      {text('note', 'Note')}
    </div>
  )
}
