import type { ReactNode } from 'react'
import type { Case } from '../server/types'
import { changedFields, type Draft, fieldLabels } from './draft'
import { asProposed, describeService, diffSchedule, kindLabels } from './schedule'

type Change = {
  key: string
  mark: '+' | '~' | '−'
  label: string
  before?: ReactNode
  after?: ReactNode
  // The draft without this change.
  drop: () => Draft
}

// Whole entries of a list (notes, links) that one side has and the other lacks.
function onlyIn<T>(these: T[], those: T[]): T[] {
  const others = new Set(those.map((entry) => JSON.stringify(entry)))
  return these.filter((entry) => !others.has(JSON.stringify(entry)))
}

function listChanges(item: Case, draft: Draft): Change[] {
  const church = item.church
  if (!church) return []
  const setServices = (services: Draft['services']) => ({ ...draft, services })

  const schedule = diffSchedule(church.services ?? [], draft.services).flatMap((row): Change[] => {
    if (row.state === 'same') return []
    if (row.state === 'removed') {
      return [
        {
          key: `removed-${row.before.id}`,
          mark: '−',
          label: kindLabels[row.before.kind] ?? row.before.kind,
          before: describeService(row.before),
          drop: () => setServices([...draft.services, asProposed(row.before)]),
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
          drop: () => setServices(draft.services.filter((_, i) => i !== index)),
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
          setServices(draft.services.map((s, i) => (i === index ? asProposed(row.before) : s))),
      },
    ]
  })

  const fields = changedFields(item, draft).map(
    (key): Change => ({
      key: `field-${key}`,
      mark: church[key] ? '~' : '+',
      label: fieldLabels[key],
      before: church[key] || undefined,
      after: draft.fields[key].trim() || 'cleared',
      drop: () => ({ ...draft, fields: { ...draft.fields, [key]: church[key] ?? '' } }),
    }),
  )

  // Notes and links change as whole lists, so each is one change, kept or dropped together.
  const lists: Change[] = []
  const oldTexts = onlyIn(church.texts ?? [], draft.texts)
  const newTexts = onlyIn(draft.texts, church.texts ?? [])
  if (oldTexts.length || newTexts.length) {
    lists.push({
      key: 'texts',
      mark: oldTexts.length ? (newTexts.length ? '~' : '−') : '+',
      label: 'Note beside the times',
      before: oldTexts.map((text) => text.rawText).join('\n\n') || undefined,
      after: newTexts.map((text) => text.rawText).join('\n\n') || undefined,
      drop: () => ({ ...draft, texts: church.texts ?? [] }),
    })
  }
  const oldLinks = onlyIn(church.links ?? [], draft.links)
  const newLinks = onlyIn(draft.links, church.links ?? [])
  if (oldLinks.length || newLinks.length) {
    lists.push({
      key: 'links',
      mark: oldLinks.length ? (newLinks.length ? '~' : '−') : '+',
      label: 'Links',
      before: oldLinks.map((link) => `${link.kind}: ${link.url}`).join('\n') || undefined,
      after: newLinks.map((link) => `${link.kind}: ${link.url}`).join('\n') || undefined,
      drop: () => ({ ...draft, links: church.links ?? [] }),
    })
  }

  return [...schedule, ...fields, ...lists]
}

// Everything approving would change on the church, one line per change, each droppable on its own.
export function ProposalDiff({
  item,
  draft,
  setDraft,
}: {
  item: Case
  draft: Draft
  setDraft: (draft: Draft) => void
}) {
  const changes = listChanges(item, draft)
  return (
    <section>
      <h3>What would change</h3>
      <div className="card diff">
        {changes.length === 0 ? (
          <p className="muted">Nothing on the church’s record.</p>
        ) : (
          changes.map((change) => (
            <div key={change.key} className="change">
              <span
                className={`mark mark--${change.mark === '+' ? 'add' : change.mark === '−' ? 'del' : 'mod'}`}
              >
                {change.mark}
              </span>
              <span className="change-label">{change.label}</span>
              <span className="change-body">
                {change.before ? <del>{change.before}</del> : null}
                {change.after ? <ins>{change.after}</ins> : null}
              </span>
              <button type="button" className="link" onClick={() => setDraft(change.drop())}>
                Drop
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
