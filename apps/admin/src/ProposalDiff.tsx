import type { Church } from '@ember/api/src/schema'
import { type ReactNode, useState } from 'react'
import type { Case } from '../worker/types'
import { useSearch } from './api'
import {
  changedFields,
  type Draft,
  fieldLabels,
  otherChurch,
  type RecordDraft,
  recordOf,
} from './draft'
import { asProposed, describeService, diffSchedule, kindLabels } from './schedule'

type Change = {
  key: string
  mark: '+' | '~' | '−'
  label: string
  before?: ReactNode
  after?: ReactNode
  // The record without this change.
  drop: () => RecordDraft
}

const markClass = { '+': 'add', '~': 'mod', '−': 'del' }

// Whole entries of a list (notes, links) that one side has and the other lacks.
function onlyIn<T>(these: T[], those: T[]): T[] {
  const others = new Set(those.map((entry) => JSON.stringify(entry)))
  return these.filter((entry) => !others.has(JSON.stringify(entry)))
}

// What a record changes on its church. `nameOf` turns a parish id into the parish's name.
function listChanges(
  church: Church | undefined,
  record: RecordDraft,
  nameOf: (id: string) => string,
): Change[] {
  const setServices = (services: RecordDraft['services']) => ({ ...record, services })

  const schedule = diffSchedule(church?.services ?? [], record.services).flatMap(
    (row): Change[] => {
      if (row.state === 'same') return []
      if (row.state === 'removed') {
        return [
          {
            key: `removed-${row.before.id}`,
            mark: '−',
            label: kindLabels[row.before.kind] ?? row.before.kind,
            before: describeService(row.before),
            drop: () => setServices([...record.services, asProposed(row.before)]),
          },
        ]
      }
      const { index, service } = row
      const label = kindLabels[service.kind] ?? service.kind
      const details = [service.language, service.locationNote, service.note]
        .filter(Boolean)
        .join(' · ')
      const after = `${describeService(service)}${details ? ` · ${details}` : ''}`
      if (row.state === 'added') {
        return [
          {
            key: `added-${index}`,
            mark: '+',
            label,
            after,
            drop: () => setServices(record.services.filter((_, i) => i !== index)),
          },
        ]
      }
      return [
        {
          key: `changed-${index}`,
          mark: '~',
          label,
          before: describeService(row.before),
          after,
          drop: () =>
            setServices(record.services.map((s, i) => (i === index ? asProposed(row.before) : s))),
        },
      ]
    },
  )

  const shown = (key: string, value: string) => (key === 'parishId' ? nameOf(value) : value)
  const fields = changedFields(church, record).map((key): Change => {
    const was = church?.[key] ?? ''
    const now = record.fields[key].trim()
    return {
      key: `field-${key}`,
      mark: was ? '~' : '+',
      label: fieldLabels[key],
      before: was ? shown(key, was) : undefined,
      after: now ? shown(key, now) : 'cleared',
      drop: () => ({ ...record, fields: { ...record.fields, [key]: was } }),
    }
  })

  // Notes and links change as whole lists, so each is one change, kept or dropped together.
  const lists: Change[] = []
  const oldTexts = onlyIn(church?.texts ?? [], record.texts)
  const newTexts = onlyIn(record.texts, church?.texts ?? [])
  if (oldTexts.length || newTexts.length) {
    lists.push({
      key: 'texts',
      mark: oldTexts.length ? (newTexts.length ? '~' : '−') : '+',
      label: 'Note beside the times',
      before: oldTexts.map((text) => text.rawText).join('\n\n') || undefined,
      after: newTexts.map((text) => text.rawText).join('\n\n') || undefined,
      drop: () => ({ ...record, texts: church?.texts ?? [] }),
    })
  }
  const oldLinks = onlyIn(church?.links ?? [], record.links)
  const newLinks = onlyIn(record.links, church?.links ?? [])
  if (oldLinks.length || newLinks.length) {
    lists.push({
      key: 'links',
      mark: oldLinks.length ? (newLinks.length ? '~' : '−') : '+',
      label: 'Links',
      before: oldLinks.map((link) => `${link.kind}: ${link.url}`).join('\n') || undefined,
      after: newLinks.map((link) => `${link.kind}: ${link.url}`).join('\n') || undefined,
      drop: () => ({ ...record, links: church?.links ?? [] }),
    })
  }

  return [...schedule, ...fields, ...lists]
}

function Changes({
  changes,
  onDrop,
  empty,
}: {
  changes: Change[]
  onDrop: (record: RecordDraft) => void
  empty: string
}) {
  if (changes.length === 0) return <p className="muted">{empty}</p>
  return changes.map((change) => (
    <div key={change.key} className="change">
      <span className={`mark mark--${markClass[change.mark]}`}>{change.mark}</span>
      <span className="change-label">{change.label}</span>
      <span className="change-body">
        {change.before ? <del>{change.before}</del> : null}
        {change.after ? <ins>{change.after}</ins> : null}
      </span>
      <button type="button" className="link" onClick={() => onDrop(change.drop())}>
        Drop
      </button>
    </div>
  ))
}

// Everything approving would change, church by church and one line per change, each droppable on
// its own. A parish's chapels share its schedule, so the change can reach other churches: ones the
// directory already has, and ones it is missing.
export function ProposalDiff({
  item,
  draft,
  setDraft,
}: {
  item: Case
  draft: Draft
  setDraft: (draft: Draft) => void
}) {
  const search = useSearch()
  const [query, setQuery] = useState('')
  const names = new Map(item.others.map((other) => [other.church.id, other.church.name]))
  if (item.church) names.set(item.church.id, item.church.name)
  const nameOf = (id: string) => names.get(id) ?? id

  const unused = item.others.filter(
    (other) => !draft.related.some((related) => related.churchId === other.church.id),
  )
  const setRelated = (churchId: string, record: RecordDraft) =>
    setDraft({
      ...draft,
      related: draft.related.map((r) => (r.churchId === churchId ? { ...r, record } : r)),
    })
  const setCreated = (key: string, record: RecordDraft) =>
    setDraft({
      ...draft,
      created: draft.created.map((c) => (c.key === key ? { ...c, record } : c)),
    })

  return (
    <section>
      <h3>What would change</h3>
      <div className="card diff">
        {item.church ? (
          <div className="church-diff">
            {draft.related.length + draft.created.length > 0 ? <h4>{item.church.name}</h4> : null}
            <Changes
              changes={listChanges(item.church, draft.record, nameOf)}
              onDrop={(record) => setDraft({ ...draft, record })}
              empty="Nothing on this church’s record."
            />
          </div>
        ) : null}

        {draft.related.map(({ churchId, record }) => {
          const other = item.others.find((o) => o.church.id === churchId)
          return (
            <div key={churchId} className="church-diff">
              <h4>
                {nameOf(churchId)}
                <span className="muted">
                  {other?.church.address} · {other?.distanceKm} km
                </span>
                <button
                  type="button"
                  className="link"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      related: draft.related.filter((r) => r.churchId !== churchId),
                    })
                  }
                >
                  Leave out
                </button>
              </h4>
              <Changes
                changes={listChanges(other?.church, record, nameOf)}
                onDrop={(next) => setRelated(churchId, next)}
                empty="No change to this church yet. Edit it by hand below."
              />
            </div>
          )
        })}

        {draft.created.map(({ key, lat, lng, record }) => (
          <div key={key} className="church-diff">
            <h4>
              <span className="chip chip--good">new</span>
              {record.fields.name || 'Unnamed church'}
              <span className="muted">
                {record.fields.address}
                {' · '}
                <a
                  href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {lat}, {lng}
                </a>
              </span>
              <button
                type="button"
                className="link"
                onClick={() =>
                  setDraft({ ...draft, created: draft.created.filter((c) => c.key !== key) })
                }
              >
                Leave out
              </button>
            </h4>
            <Changes
              changes={listChanges(undefined, record, nameOf).filter(
                (change) => !['field-name', 'field-address'].includes(change.key),
              )}
              onDrop={(next) => setCreated(key, next)}
              empty="No times yet. Add them by hand below."
            />
          </div>
        ))}

        {item.church ? (
          <div className="add-church">
            <select
              value=""
              onChange={(event) => {
                const church = otherChurch(item, event.target.value)
                if (!church) return
                setDraft({
                  ...draft,
                  related: [...draft.related, { churchId: church.id, record: recordOf(church) }],
                })
              }}
            >
              <option value="">Change another church too…</option>
              {unused.map(({ church, distanceKm, sameParish }) => (
                <option key={church.id} value={church.id}>
                  {church.name} · {sameParish ? 'same parish' : `${distanceKm} km`}
                  {church.address ? ` · ${church.address}` : ''}
                </option>
              ))}
            </select>
            <form
              className="search"
              onSubmit={(event) => {
                event.preventDefault()
                search.mutate({ churchId: item.churchId, query })
              }}
            >
              <input
                value={query}
                placeholder="Find a church further away by name"
                onChange={(event) => setQuery(event.target.value)}
              />
              <button type="submit" disabled={!query.trim() || search.isPending}>
                {search.isPending ? 'Searching…' : 'Search'}
              </button>
            </form>
            {search.error ? <p className="error">{search.error.message}</p> : null}
            {search.data ? (
              <p className="muted">
                {search.data.matches.length
                  ? `${search.data.matches.length} found; pick one from the list above.`
                  : 'No church by that name.'}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() =>
                setDraft({
                  ...draft,
                  created: [
                    ...draft.created,
                    {
                      key: `new-${Date.now()}`,
                      lat: String(item.church?.lat ?? ''),
                      lng: String(item.church?.lng ?? ''),
                      record: recordOf(undefined),
                    },
                  ],
                })
              }
            >
              Add a missing chapel
            </button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
