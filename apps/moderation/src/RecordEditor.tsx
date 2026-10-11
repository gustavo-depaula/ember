import type { Church } from '@ember/api/src/schema'
import { changedFields, type FieldKey, fieldLabels, type RecordDraft, recordChanges } from './draft'

const statuses = ['', 'active', 'temporarily_closed', 'closed']

// Everything about the church that isn't its schedule: its details, the free-text notes shown
// beside the times, and its links. Folded away unless something in it is changing.
// `parishes` are the churches this one could be a chapel of.
export function RecordEditor({
  church,
  draft,
  setDraft,
  parishes,
  only,
}: {
  church: Church | undefined
  draft: RecordDraft
  setDraft: (draft: RecordDraft) => void
  parishes: Array<{ id: string; name: string }>
  // The fields worth asking for; a church being created takes the rest from its parish.
  only?: FieldKey[]
}) {
  const changed = changedFields(church, draft)
  const changes = recordChanges(church, draft)
  const options: Partial<Record<FieldKey, Array<{ value: string; label: string }>>> = {
    status: statuses.map((status) => ({ value: status, label: status || 'unknown' })),
    parishId: [
      { value: '', label: 'no parish recorded' },
      ...parishes.map((parish) => ({ value: parish.id, label: parish.name })),
    ],
  }
  const setField = (key: FieldKey, value: string) =>
    setDraft({ ...draft, fields: { ...draft.fields, [key]: value } })
  const setTexts = (texts: RecordDraft['texts']) => setDraft({ ...draft, texts })
  const setLinks = (links: RecordDraft['links']) => setDraft({ ...draft, links })

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
        {(only ?? (Object.keys(fieldLabels) as FieldKey[])).map((key) => (
          <label
            key={key}
            htmlFor={`field-${key}`}
            className={changed.includes(key) ? 'changed' : ''}
          >
            {fieldLabels[key]}
            {options[key] ? (
              <select
                id={`field-${key}`}
                value={draft.fields[key]}
                onChange={(event) => setField(key, event.target.value)}
              >
                {options[key].map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
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
              <span className="was">was {church?.[key] || 'empty'}</span>
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
