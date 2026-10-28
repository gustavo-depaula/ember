import { changeMessage, churchLang } from '@ember/api/src/changeMessage'
import type { Lang } from '@ember/api/src/schedule'
import { useState } from 'react'
import type { Desk } from '../worker/types'
import { timeAgo } from './App'
import { useMarkShared } from './api'

// Every change the desk has made to a church that still stands, each as a message ready to pass on
// to other Mass-times directories, with a tick for the ones already sent.
export function ChangeLog({ desk, onBack }: { desk: Desk; onBack: () => void }) {
  const markShared = useMarkShared()
  // Each church's message starts in its own language; this overrides them all.
  const [lang, setLang] = useState<Lang | 'auto'>('auto')
  const [copied, setCopied] = useState<string>()
  const [failure, setFailure] = useState<string>()

  const messages = desk.log.map((entry) => ({
    entry,
    text: changeMessage(entry, lang === 'auto' ? churchLang(entry.records[0]?.after) : lang),
  }))
  const unsent = messages.filter(({ entry }) => !entry.sharedAt)

  const copy = (key: string, text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setFailure(undefined)
        setCopied(key)
      },
      (error: Error) => setFailure(`Could not copy: ${error.message}`),
    )
  }

  return (
    <div className="case-scroll log">
      <header className="case-head">
        <button type="button" className="link back" onClick={onBack}>
          ← Queue
        </button>
        <h2>Change log</h2>
        <p className="muted">
          What the desk changed, as messages for other Mass-times directories.
        </p>
      </header>

      <div className="log-bar">
        <button
          type="button"
          className="primary"
          disabled={unsent.length === 0}
          onClick={() => copy('all', unsent.map(({ text }) => text).join('\n\n———\n\n'))}
        >
          {copied === 'all' ? 'Copied' : `Copy the ${unsent.length} not yet sent`}
        </button>
        <button
          type="button"
          disabled={unsent.length === 0 || markShared.isPending}
          onClick={() =>
            markShared.mutate({ ids: unsent.map(({ entry }) => entry.id), shared: true })
          }
        >
          Mark them sent
        </button>
        <select value={lang} onChange={(event) => setLang(event.target.value as Lang | 'auto')}>
          <option value="auto">Each church’s language</option>
          <option value="en">English</option>
          <option value="pt">Português</option>
        </select>
        {failure || markShared.error ? (
          <span className="error">{failure ?? markShared.error?.message}</span>
        ) : null}
      </div>

      {messages.length === 0 ? (
        <p className="muted">No change has been applied yet.</p>
      ) : (
        messages.map(({ entry, text }) => (
          <article key={entry.id} className={`card${entry.sharedAt ? ' sent' : ''}`}>
            <p className="meta">
              <strong>{entry.churchName}</strong> · {timeAgo(entry.appliedAt)}
              {entry.sharedAt ? <span className="chip chip--good">sent</span> : null}
            </p>
            {entry.basis ? <p className="claude-says">Basis: {entry.basis}</p> : null}
            <pre className="message">{text}</pre>
            <div className="decisions">
              <button type="button" onClick={() => copy(entry.id, text)}>
                {copied === entry.id ? 'Copied' : 'Copy'}
              </button>
              <button
                type="button"
                className="link"
                disabled={markShared.isPending}
                onClick={() => markShared.mutate({ ids: [entry.id], shared: !entry.sharedAt })}
              >
                {entry.sharedAt ? 'Mark not sent' : 'Mark sent'}
              </button>
            </div>
          </article>
        ))
      )}
    </div>
  )
}
