import { useEffect, useState } from 'react'
import type { Case, Desk, HistoryEntry } from '../server/types'
import { useDesk, useRefresh, useReviewAll, useUndo } from './api'
import { CasePane } from './CasePane'
import { ChangeLog } from './ChangeLog'
import { type Draft, proposalDraft } from './draft'

// Whether Claude's draft still covers exactly the suggestions that are waiting.
export function reviewIsCurrent(item: Case): boolean {
  const ids = item.review?.suggestionIds
  return (
    ids !== undefined &&
    ids.length === item.suggestions.length &&
    item.suggestions.every((suggestion) => ids.includes(suggestion.id))
  )
}

function caseState(item: Case): { label: string; tone: string } {
  if (item.run?.status === 'failed') return { label: 'Review failed', tone: 'bad' }
  if (item.run) return { label: 'Claude is reading…', tone: 'busy' }
  if (!item.review) return { label: 'Not reviewed', tone: 'idle' }
  if (!reviewIsCurrent(item)) return { label: 'New since review', tone: 'warn' }
  if (item.review.proposal.question) return { label: 'Needs you', tone: 'warn' }
  return { label: `Ready · ${item.review.proposal.confidence}`, tone: 'good' }
}

export function timeAgo(iso: string): string {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (minutes < 60) return `${minutes} min ago`
  if (minutes < 60 * 48) return `${Math.round(minutes / 60)} h ago`
  return `${Math.round(minutes / 60 / 24)} days ago`
}

export function App() {
  const desk = useDesk()
  const refresh = useRefresh()
  const reviewAll = useReviewAll()
  const [selected, setSelected] = useState<string>()
  // A phone shows one pane at a time: the queue, then the church picked from it.
  const [caseOpen, setCaseOpen] = useState(false)
  const [logOpen, setLogOpen] = useState(false)
  const open = (churchId: string) => {
    setLogOpen(false)
    setSelected(churchId)
    setCaseOpen(true)
  }
  // Drafts outlive the selection, so moving through the queue never loses an edit. A draft belongs
  // to one review: when Claude redrafts, the key changes and the new proposal takes its place.
  const [drafts, setDrafts] = useState<Record<string, Draft>>({})

  const cases = desk.data?.cases ?? []
  const current = cases.find((item) => item.churchId === selected) ?? cases[0]

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const typing = (event.target as HTMLElement).closest('input, textarea, select')
      if (typing || event.metaKey || event.ctrlKey || !current) return
      const step = event.key === 'j' ? 1 : event.key === 'k' ? -1 : 0
      const next = cases[cases.indexOf(current) + step]
      if (step && next) setSelected(next.churchId)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (desk.isPending) return <Splash>Reading the queue from D1…</Splash>
  if (desk.error) {
    return (
      <Splash>
        <p className="error">{desk.error.message}</p>
        <p className="muted">
          The desk reads D1 through wrangler. If you are not logged in, run{' '}
          <code>pnpm --filter @ember/backend exec wrangler login</code>.
        </p>
        <button type="button" onClick={() => desk.refetch()}>
          Try again
        </button>
      </Splash>
    )
  }

  const unreviewed = cases.filter(
    (item) => (!item.run || item.run.status === 'failed') && !reviewIsCurrent(item),
  ).length
  const suggestions = cases.reduce((sum, item) => sum + item.suggestions.length, 0)
  const draftKey = current ? `${current.churchId}|${current.review?.reviewedAt ?? ''}` : ''

  return (
    <div className={`desk${logOpen || (caseOpen && current) ? ' desk--case' : ''}`}>
      <header className="top">
        <h1>Mass times desk</h1>
        <span className={`target target--${desk.data.target}`}>
          {desk.data.target === 'remote' ? 'Production D1' : 'Local D1'}
        </span>
        <span className="muted">
          {cases.length} {cases.length === 1 ? 'church' : 'churches'} · {suggestions} suggestions
        </span>
        <span className="spacer" />
        {refresh.error || reviewAll.error ? (
          <span className="error">{(refresh.error ?? reviewAll.error)?.message}</span>
        ) : null}
        <button
          type="button"
          className="primary"
          disabled={unreviewed === 0}
          onClick={() => reviewAll.mutate()}
        >
          {unreviewed ? `Have Claude review ${unreviewed}` : 'All reviewed'}
        </button>
        <button type="button" onClick={() => setLogOpen(!logOpen)}>
          {(() => {
            if (logOpen) return 'Back to the queue'
            const unsent = desk.data.log.filter((entry) => !entry.sharedAt).length
            return unsent ? `Change log · ${unsent} to send` : 'Change log'
          })()}
        </button>
        <button type="button" disabled={refresh.isPending} onClick={() => refresh.mutate()}>
          {refresh.isPending ? 'Refreshing…' : 'Refresh'}
        </button>
      </header>

      <nav className="queue">
        {cases.map((item) => {
          const state = caseState(item)
          return (
            <button
              type="button"
              key={item.churchId}
              className={`queue-item${item === current && !logOpen ? ' queue-item--current' : ''}`}
              onClick={() => open(item.churchId)}
            >
              <span className="queue-name">{item.church?.name ?? item.churchId}</span>
              <span className="muted">
                {[item.church?.city, item.church?.region].filter(Boolean).join(', ') ||
                  'not in the directory'}
                {' · '}
                {item.suggestions.length}
              </span>
              <span className={`chip chip--${state.tone}`}>{state.label}</span>
            </button>
          )
        })}
        <History desk={desk.data} />
      </nav>

      <main className="case">
        {(() => {
          if (logOpen) return <ChangeLog desk={desk.data} onBack={() => setLogOpen(false)} />
          if (!current) {
            return <Splash>Nothing is waiting. The directory is as people last saw it.</Splash>
          }
          return (
            <CasePane
              key={draftKey}
              item={current}
              onBack={() => setCaseOpen(false)}
              draft={drafts[draftKey] ?? proposalDraft(current)}
              setDraft={(draft) => setDrafts((all) => ({ ...all, [draftKey]: draft }))}
            />
          )
        })()}
      </main>
    </div>
  )
}

function History({ desk }: { desk: Desk }) {
  const undo = useUndo()
  if (desk.history.length === 0) return null
  return (
    <section className="history">
      <h2>Recently applied</h2>
      {undo.error ? <p className="error">{undo.error.message}</p> : null}
      {desk.history.map((entry: HistoryEntry) => (
        <div key={entry.id} className={`history-item${entry.undoneAt ? ' undone' : ''}`}>
          <span className="queue-name">{entry.churchName}</span>
          <span className="muted">
            {entry.summary} · {timeAgo(entry.appliedAt)}
          </span>
          {entry.undoneAt ? (
            <span className="muted">undone</span>
          ) : (
            <button
              type="button"
              className="link"
              disabled={undo.isPending}
              onClick={() => undo.mutate(entry.id)}
            >
              Undo
            </button>
          )}
        </div>
      ))}
    </section>
  )
}

function Splash({ children }: { children: React.ReactNode }) {
  return <div className="splash">{children}</div>
}
