import type { Case } from '../server/types'
import { changedFields, countChanges, type Draft, type FieldKey, fieldLabels } from './draft'

const statuses = ['', 'active', 'temporarily_closed', 'closed']

// Everything about the church that isn't its schedule: its details, the free-text notes shown
// beside the times, and its links. Folded away unless something in it is changing.
export function RecordEditor({
  item,
  draft,
  setDraft,
}: {
  item: Case
  draft: Draft
  setDraft: (draft: Draft) => void
}) {
  const changed = changedFields(item, draft)
  const changes = countChanges(item, draft)
  const setField = (key: FieldKey, value: string) =>
    setDraft({ ...draft, fields: { ...draft.fields, [key]: value } })
  const setTexts = (texts: Draft['texts']) => setDraft({ ...draft, texts })
  const setLinks = (links: Draft['links']) => setDraft({ ...draft, links })

  return (
    <details className="card record" open={changes.details > 0}>
      <summary>
        Church details, notes and links
        {changes.details ? (
          <span className="chip chip--warn">
            {changes.details} {changes.details === 1 ? 'change' : 'changes'}
          </span>
        ) : null}
      </summary>

      <div className="fields">
        {(Object.keys(fieldLabels) as FieldKey[]).map((key) => (
          <label
            key={key}
            htmlFor={`field-${key}`}
            className={changed.includes(key) ? 'changed' : ''}
          >
            {fieldLabels[key]}
            {key === 'status' ? (
              <select
                id={`field-${key}`}
                value={draft.fields[key]}
                onChange={(event) => setField(key, event.target.value)}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status || 'unknown'}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={`field-${key}`}
                type="text"
                value={draft.fields[key]}
                onChange={(event) => setField(key, event.target.value)}
              />
            )}
            {changed.includes(key) ? (
              <span className="was">was {item.church?.[key] || 'empty'}</span>
            ) : null}
          </label>
        ))}
      </div>

      <h4>
        Notes shown beside the times {changes.texts ? <span className="was">edited</span> : null}
        <button
          type="button"
          className="link"
          onClick={() => setTexts([...draft.texts, { kind: 'mass_times', rawText: '' }])}
        >
          + add a note
        </button>
      </h4>
      {draft.texts.map((text, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: rows have no identity but their place
        <div key={index} className="row">
          <input
            type="text"
            value={text.kind}
            onChange={(event) =>
              setTexts(
                draft.texts.map((t, i) => (i === index ? { ...t, kind: event.target.value } : t)),
              )
            }
          />
          <textarea
            rows={3}
            value={text.rawText}
            onChange={(event) =>
              setTexts(
                draft.texts.map((t, i) =>
                  i === index ? { ...t, rawText: event.target.value } : t,
                ),
              )
            }
          />
          <button
            type="button"
            className="link"
            onClick={() => setTexts(draft.texts.filter((_, i) => i !== index))}
          >
            Remove
          </button>
        </div>
      ))}

      <h4>
        Links {changes.links ? <span className="was">edited</span> : null}
        <button
          type="button"
          className="link"
          onClick={() => setLinks([...draft.links, { kind: 'website', url: '' }])}
        >
          + add a link
        </button>
      </h4>
      {draft.links.map((link, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: rows have no identity but their place
        <div key={index} className="row">
          <input
            type="text"
            value={link.kind}
            onChange={(event) =>
              setLinks(
                draft.links.map((l, i) => (i === index ? { ...l, kind: event.target.value } : l)),
              )
            }
          />
          <input
            type="url"
            value={link.url}
            onChange={(event) =>
              setLinks(
                draft.links.map((l, i) => (i === index ? { ...l, url: event.target.value } : l)),
              )
            }
          />
          <button
            type="button"
            className="link"
            onClick={() => setLinks(draft.links.filter((_, i) => i !== index))}
          >
            Remove
          </button>
        </div>
      ))}
    </details>
  )
}
