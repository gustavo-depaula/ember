import { useState } from 'react'
import type { Case, Suggestion } from '../server/types'
import { reviewIsCurrent, timeAgo } from './App'
import { photoUrl, useApply, useReview, useStop } from './api'
import {
  countChanges,
  type Draft,
  proposalDraft,
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
}: {
  item: Case
  draft: Draft
  setDraft: (draft: Draft) => void
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

  const applyLabel = [
    changes.schedule ? `${changes.schedule} schedule ${plural(changes.schedule, 'change')}` : '',
    changes.details ? `${changes.details} detail ${plural(changes.details, 'change')}` : '',
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
            </p>
          ) : (
            <p className="error">
              No church with this id is in the directory, so these can only be rejected.
            </p>
          )}
        </header>

        <ClaudePanel item={item} />

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
                <ScheduleEditor church={church} draft={draft} setDraft={setDraft} />
                <RecordEditor item={item} draft={draft} setDraft={setDraft} />
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
              placeholder="What should be different? (“the Saturday Mass is 17h, look again at the photo”, “don’t trust the website, only the bulletin”)"
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
            {apply.isPending
              ? 'Applying…'
              : changes.any
                ? `Approve · ${applyLabel}`
                : 'Nothing to approve'}
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
            {item.review ? 'Ask for something different' : 'Ask Claude'}
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

function plural(count: number, word: string): string {
  return count === 1 ? word : `${word}s`
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

function ClaudePanel({ item }: { item: Case }) {
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
                <p className="error">
                  Suggestions arrived or were settled since this review. Ask Claude again.
                </p>
              )}
              <p className="summary">{proposal.summary}</p>
              <p className="meta">
                <span className={`chip chip--${proposal.confidence === 'high' ? 'good' : 'warn'}`}>
                  {proposal.confidence} confidence
                </span>{' '}
                reviewed {timeAgo(item.review?.reviewedAt ?? '')}
              </p>
              {proposal.question ? <p className="question">{proposal.question}</p> : null}
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
