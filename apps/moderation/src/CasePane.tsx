import type { Church } from '@ember/api/src/schema'
import { useState } from 'react'
import type { Case, Suggestion } from '../server/types'
import { reviewIsCurrent, timeAgo } from './App'
import { photoUrl, useApply, useReview, useStop } from './api'
import {
  countChanges,
  type Draft,
  type FieldKey,
  otherChurch,
  proposalDraft,
  type RecordDraft,
  recordDraft,
  toResolution,
  type Verdict,
} from './draft'
import { ProposalDiff } from './ProposalDiff'
import { RecordEditor } from './RecordEditor'
import { ScheduleEditor } from './ScheduleEditor'
import { describeService } from './schedule'

const kindLabels: Record<string, string> = {
  note: 'Note',
  flag_closed: 'Reported closed',
  edit_service: 'Edit to a time',
  edit_church: 'Edit to the church',
  add_service: 'New time',
}

const verdictLabels: Array<[Verdict | undefined, string]> = [
  ['accepted', 'Accept'],
  ['rejected', 'Reject'],
  ['duplicate', 'Duplicate'],
  [undefined, 'Leave open'],
]

export function CasePane({
  item,
  draft,
  setDraft,
  onBack,
}: {
  item: Case
  draft: Draft
  setDraft: (draft: Draft) => void
  onBack: () => void
}) {
  const apply = useApply()
  const review = useReview()
  const [asking, setAsking] = useState(false)
  const [instruction, setInstruction] = useState('')
  const running = item.run !== undefined && item.run.status !== 'failed'
  const busy = apply.isPending || running
  const changes = countChanges(item, draft)

  const ask = () => {
    review.mutate(
      { churchId: item.churchId, instruction },
      {
        onSuccess: () => {
          setInstruction('')
          setAsking(false)
        },
      },
    )
  }
  const church = item.church
  const website = church?.links?.find((link) => link.kind === 'website')
  const kin = item.others.filter((other) => other.sameParish).map((other) => other.church.name)

  const applyLabel = [
    changes.schedule ? `${changes.schedule} schedule ${plural(changes.schedule, 'change')}` : '',
    changes.details ? `${changes.details} detail ${plural(changes.details, 'change')}` : '',
    changes.created ? `${changes.created} new ${plural(changes.created, 'church')}` : '',
    ...(['accepted', 'rejected', 'duplicate'] as const).map((status) => {
      const count = changes.verdicts.filter((verdict) => verdict === status).length
      return count ? `${count} ${status}` : ''
    }),
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <>
      <div className="case-scroll">
        <header className="case-head">
          <button type="button" className="link back" onClick={onBack}>
            ← Queue
          </button>
          <h2>{church?.name ?? item.churchId}</h2>
          {church ? (
            <p className="muted">
              {[church.address, church.city, church.region].filter(Boolean).join(', ')}
              {website ? (
                <>
                  {' · '}
                  <a href={website.url} target="_blank" rel="noreferrer">
                    website
                  </a>
                </>
              ) : null}
              {' · '}
              {church.lastVerifiedAt
                ? `verified ${timeAgo(church.lastVerifiedAt)} (${church.verifiedSource})`
                : 'never verified'}
              {item.verifications ? ` · ${item.verifications} “times are correct” in 30 days` : ''}
              {kin.length
                ? ` · ${church.parishId ? 'same parish' : 'chapels'}: ${kin.join(', ')}`
                : ''}
            </p>
          ) : (
            <p className="error">
              No church with this id is in the directory, so these can only be rejected.
            </p>
          )}
        </header>

        <ClaudePanel item={item} onAnswer={() => setAsking(true)} />

        {/* Evidence on the left, the change it argues for on the right. */}
        <div className="columns">
          <section>
            <h3>What people sent</h3>
            {item.suggestions.map((suggestion) => (
              <SuggestionCard
                key={suggestion.id}
                item={item}
                suggestion={suggestion}
                verdict={draft.verdicts[suggestion.id]}
                onVerdict={(verdict) =>
                  setDraft({ ...draft, verdicts: { ...draft.verdicts, [suggestion.id]: verdict } })
                }
              />
            ))}
          </section>
          {church ? (
            <div>
              <ProposalDiff item={item} draft={draft} setDraft={setDraft} />
              {/* With no proposal to react to, moderating is editing, so the editors start open. */}
              <details className="by-hand" open={!item.review}>
                <summary>See the whole record and edit it by hand</summary>
                <ByHand item={item} church={church} draft={draft} setDraft={setDraft} />
              </details>
            </div>
          ) : null}
        </div>
      </div>

      <footer className="actions">
        {asking ? (
          <div className="ask-row">
            <textarea
              // biome-ignore lint/a11y/noAutofocus: the box opens because the moderator asked to type in it
              autoFocus
              rows={2}
              value={instruction}
              placeholder={
                item.review?.proposal.question
                  ? 'Answer Claude’s question, or say what should be different'
                  : 'What should be different? (“the Saturday Mass is 17h, look again at the photo”, “don’t trust the website, only the bulletin”)'
              }
              onChange={(event) => setInstruction(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) ask()
              }}
            />
            <button
              type="button"
              className="primary"
              disabled={!instruction.trim() || review.isPending}
              onClick={ask}
            >
              Send to Claude
            </button>
            <button type="button" className="link" onClick={() => setAsking(false)}>
              Cancel
            </button>
          </div>
        ) : null}
        <div className="decisions">
          <button
            type="button"
            className="primary approve"
            disabled={!changes.any || busy}
            onClick={() =>
              apply.mutate({ churchId: item.churchId, resolution: toResolution(item, draft) })
            }
          >
            {(() => {
              if (apply.isPending) return 'Applying…'
              if (!changes.any) return 'Nothing to approve'
              return (
                <>
                  Approve<span className="wide-only"> · {applyLabel}</span>
                </>
              )
            })()}
          </button>
          <button
            type="button"
            className="reject"
            disabled={busy}
            title="Reject every suggestion and leave the church as it is"
            onClick={() =>
              apply.mutate({
                churchId: item.churchId,
                resolution: {
                  fields: {},
                  verdicts: item.suggestions.map((s) => ({ id: s.id, status: 'rejected' })),
                },
              })
            }
          >
            Reject
          </button>
          <button type="button" disabled={busy} onClick={() => setAsking(!asking)}>
            {item.review ? (
              <>
                Ask<span className="wide-only"> for something different</span>
                <span className="narrow-only"> Claude</span>
              </>
            ) : (
              'Ask Claude'
            )}
          </button>
          <span className="spacer" />
          {item.review ? (
            <button type="button" className="link" onClick={() => setDraft(proposalDraft(item))}>
              Back to Claude’s proposal
            </button>
          ) : null}
          <button type="button" className="link" onClick={() => setDraft(recordDraft(item))}>
            Discard edits
          </button>
        </div>
        {apply.error || review.error ? (
          <p className="error">{(apply.error ?? review.error)?.message}</p>
        ) : null}
      </footer>
    </>
  )
}

const newChurchFields: FieldKey[] = ['name', 'address', 'city', 'region', 'postalCode']

// The full editors, for one church of the draft at a time.
function ByHand({
  item,
  church,
  draft,
  setDraft,
}: {
  item: Case
  church: Church
  draft: Draft
  setDraft: (draft: Draft) => void
}) {
  const [picked, setPicked] = useState('main')
  const related = draft.related.find((r) => r.churchId === picked)
  const created = draft.created.find((c) => c.key === picked)
  const tabs = [
    { key: 'main', label: church.name },
    ...draft.related.map((r) => ({
      key: r.churchId,
      label: otherChurch(item, r.churchId)?.name ?? r.churchId,
    })),
    ...draft.created.map((c) => ({ key: c.key, label: c.record.fields.name || 'New church' })),
  ]

  // What is being edited: its church as the directory has it, its record, and how to save it.
  const target = (() => {
    if (related) {
      return {
        church: otherChurch(item, related.churchId),
        record: related.record,
        set: (record: RecordDraft) =>
          setDraft({
            ...draft,
            related: draft.related.map((r) => (r === related ? { ...r, record } : r)),
          }),
      }
    }
    if (created) {
      return {
        church: undefined,
        record: created.record,
        set: (record: RecordDraft) =>
          setDraft({
            ...draft,
            created: draft.created.map((c) => (c === created ? { ...c, record } : c)),
          }),
      }
    }
    return {
      church,
      record: draft.record,
      set: (record: RecordDraft) => setDraft({ ...draft, record }),
    }
  })()

  // A parish is a church that is nobody's chapel, and no church is its own.
  const parishes = [church, ...item.others.map((other) => other.church)].filter(
    (candidate) => !candidate.parishId && candidate.id !== target.church?.id,
  )
  const setPlace = (place: { lat?: string; lng?: string }) =>
    setDraft({
      ...draft,
      created: draft.created.map((c) => (c === created ? { ...c, ...place } : c)),
    })

  return (
    <>
      {tabs.length > 1 ? (
        <div className="segmented tabs">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.key}
              className={tab.key === (related || created ? picked : 'main') ? 'on' : ''}
              onClick={() => setPicked(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      ) : null}
      {created ? (
        <div className="card fields">
          <label>
            Latitude
            <input value={created.lat} onChange={(e) => setPlace({ lat: e.target.value })} />
          </label>
          <label>
            Longitude
            <input value={created.lng} onChange={(e) => setPlace({ lng: e.target.value })} />
          </label>
        </div>
      ) : null}
      <ScheduleEditor church={target.church} draft={target.record} setDraft={target.set} />
      <RecordEditor
        church={target.church}
        draft={target.record}
        setDraft={target.set}
        parishes={parishes}
        only={created ? newChurchFields : undefined}
      />
    </>
  )
}

function plural(count: number, word: string): string {
  if (count === 1) return word
  return word.endsWith('ch') ? `${word}es` : `${word}s`
}

function SuggestionCard({
  item,
  suggestion,
  verdict,
  onVerdict,
}: {
  item: Case
  suggestion: Suggestion
  verdict: Verdict | undefined
  onVerdict: (verdict: Verdict | undefined) => void
}) {
  const [zoomed, setZoomed] = useState<string>()
  const target = item.church?.services?.find((service) => service.id === suggestion.serviceId)
  const claude = item.review?.proposal.verdicts.find((v) => v.id === suggestion.id)
  const { accepted, rejected } = suggestion.reporter

  return (
    <article className="card">
      <p className="meta">
        <strong>{kindLabels[suggestion.kind] ?? suggestion.kind}</strong>
        {target ? ` · about ${describeService(target)}` : ''}
        {' · '}
        {timeAgo(suggestion.createdAt)}
        {accepted || rejected
          ? ` · this sender: ${accepted} accepted, ${rejected} rejected before`
          : ''}
      </p>
      {suggestion.comment ? <blockquote>{suggestion.comment}</blockquote> : null}
      {suggestion.changes ? (
        <dl className="changes">
          {Object.entries(suggestion.changes).map(([key, value]) => (
            <div key={key}>
              <dt>{key}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {suggestion.attachmentKeys.length ? (
        <div className="photos">
          {suggestion.attachmentKeys.map((key) => (
            <button
              type="button"
              key={key}
              className={`photo${zoomed === key ? ' photo--zoomed' : ''}`}
              onClick={() => setZoomed(zoomed === key ? undefined : key)}
            >
              <img src={photoUrl(item.churchId, key)} alt="Sent with the suggestion" />
            </button>
          ))}
        </div>
      ) : null}
      {claude ? <p className="claude-says">Claude: {claude.reason}</p> : null}
      <div className="segmented">
        {verdictLabels.map(([value, label]) => (
          <button
            type="button"
            key={label}
            className={verdict === value ? `on on--${value ?? 'open'}` : ''}
            disabled={value === 'accepted' && !item.church}
            onClick={() => onVerdict(value)}
          >
            {label}
          </button>
        ))}
      </div>
    </article>
  )
}

function ClaudePanel({ item, onAnswer }: { item: Case; onAnswer: () => void }) {
  const review = useReview()
  const stop = useStop()
  const [instruction, setInstruction] = useState('')
  const proposal = item.review?.proposal
  const run = item.run

  return (
    <section>
      <h3>Claude’s read</h3>
      <div className="card claude">
        <div className="claude-text">
          {run && run.status !== 'failed' ? (
            <>
              <p className="meta">
                <span className="pulse" />{' '}
                {run.status === 'queued' ? 'Waiting its turn…' : 'Working…'}
                <button type="button" className="link" onClick={() => stop.mutate(item.churchId)}>
                  Stop
                </button>
              </p>
              <ol className="activity">
                {run.activity.map((line, index) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: an append-only log
                  <li key={index}>{line}</li>
                ))}
              </ol>
            </>
          ) : null}

          {run?.status === 'failed' ? <p className="error">{run.error}</p> : null}

          {proposal && !(run && run.status !== 'failed') ? (
            <>
              {reviewIsCurrent(item) ? null : (
                <p className="question">
                  {item.review?.outdated
                    ? 'This review is from before the desk could change a parish’s chapels and search the directory, so it only covers this one church.'
                    : 'Suggestions arrived or were settled since this review.'}{' '}
                  <button
                    type="button"
                    className="link"
                    onClick={() => review.mutate({ churchId: item.churchId })}
                  >
                    Review again
                  </button>
                </p>
              )}
              <p className="summary">{proposal.summary}</p>
              <p className="meta">
                <span className={`chip chip--${proposal.confidence === 'high' ? 'good' : 'warn'}`}>
                  {proposal.confidence} confidence
                </span>{' '}
                reviewed {timeAgo(item.review?.reviewedAt ?? '')}
              </p>
              {proposal.question ? (
                <p className="question">
                  {proposal.question}{' '}
                  <button type="button" className="link" onClick={onAnswer}>
                    Answer
                  </button>
                </p>
              ) : null}
              <p>{proposal.reasoning}</p>
              <details>
                <summary>Where it looked ({proposal.evidence.length})</summary>
                <ul className="evidence">
                  {proposal.evidence.map((evidence) => (
                    <li key={evidence.source + evidence.says}>
                      <strong>{evidence.source}</strong>: {evidence.says}
                    </li>
                  ))}
                </ul>
              </details>
            </>
          ) : null}

          {!proposal && !run ? (
            <p className="muted">
              Claude hasn’t looked at this church yet. It will read the notes and photos, check the
              parish’s own site, and draft the change for you to approve.
            </p>
          ) : null}
        </div>

        {run && run.status !== 'failed' ? null : (
          <div className="ask">
            {proposal ? null : (
              <textarea
                rows={3}
                value={instruction}
                placeholder="Anything Claude should know first (optional)"
                onChange={(event) => setInstruction(event.target.value)}
              />
            )}
            <button
              type="button"
              className={proposal ? '' : 'primary'}
              onClick={() => review.mutate({ churchId: item.churchId, instruction })}
            >
              {proposal ? 'Review again from scratch' : 'Review with Claude'}
            </button>
            {review.error ? <span className="error">{review.error.message}</span> : null}
          </div>
        )}
      </div>
    </section>
  )
}
