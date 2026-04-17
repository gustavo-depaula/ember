import type { RepeatEntry } from '@ember/content-engine'
import { useState } from 'react'
import styles from './FlowDataEditor.module.css'

export function FlowDataEditor({
  data,
  onChange,
}: {
  data: Record<string, RepeatEntry[]>
  onChange: (data: Record<string, RepeatEntry[]>) => void
}) {
  const keys = Object.keys(data)
  const [selectedKey, setSelectedKey] = useState(keys[0] ?? '')
  const [newKeyName, setNewKeyName] = useState('')
  const [showNewKeyInput, setShowNewKeyInput] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const entries = selectedKey ? (data[selectedKey] ?? []) : []

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Flow Data</h3>
        <p className={styles.hint}>
          Data arrays used by repeat/cycle/select nodes via template variables.
        </p>
      </div>

      <div className={styles.keyTabs}>
        {keys.map((key) => (
          <button
            type="button"
            key={key}
            className={`${styles.keyTab} ${key === selectedKey ? styles.keyTabActive : ''}`}
            onClick={() => setSelectedKey(key)}
          >
            {key}
            <span className={styles.countBadge}>{data[key]?.length ?? 0}</span>
          </button>
        ))}
        {showNewKeyInput ? (
          <form
            className={styles.newKeyForm}
            onSubmit={(e) => {
              e.preventDefault()
              const key = newKeyName.trim()
              if (key && !data[key]) {
                onChange({ ...data, [key]: [] })
                setSelectedKey(key)
              }
              setNewKeyName('')
              setShowNewKeyInput(false)
            }}
          >
            <input
              className={styles.newKeyInput}
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="key name"
              onBlur={() => setShowNewKeyInput(false)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setShowNewKeyInput(false)
              }}
            />
          </form>
        ) : (
          <button
            type="button"
            className={styles.addKeyBtn}
            onClick={() => setShowNewKeyInput(true)}
          >
            +
          </button>
        )}
      </div>

      {selectedKey && (
        <div className={styles.entries}>
          <div className={styles.entriesHeader}>
            <span className={styles.entriesTitle}>
              {selectedKey} ({entries.length} entries)
            </span>
            <div className={styles.entriesActions}>
              <button
                type="button"
                className={styles.smallBtn}
                onClick={() => {
                  const template = entries[0] ?? {}
                  const newEntry: RepeatEntry = {}
                  for (const k of Object.keys(template)) {
                    newEntry[k] =
                      typeof template[k] === 'string' ? '' : { 'en-US': '', 'pt-BR': '' }
                  }
                  onChange({ ...data, [selectedKey]: [...entries, newEntry] })
                }}
              >
                + Add Entry
              </button>
              {confirmDelete ? (
                <>
                  <span className={styles.confirmText}>Delete "{selectedKey}"?</span>
                  <button
                    type="button"
                    className={styles.smallBtnDanger}
                    onClick={() => {
                      const next = { ...data }
                      delete next[selectedKey]
                      onChange(next)
                      setSelectedKey(Object.keys(next)[0] ?? '')
                      setConfirmDelete(false)
                    }}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className={styles.smallBtn}
                    onClick={() => setConfirmDelete(false)}
                  >
                    No
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className={styles.smallBtnDanger}
                  onClick={() => setConfirmDelete(true)}
                >
                  Delete Key
                </button>
              )}
            </div>
          </div>

          <div className={styles.entryList}>
            {entries.map((entry, idx) => (
              <EntryEditor
                // biome-ignore lint/suspicious/noArrayIndexKey: read-only rendered list
                key={idx}
                entry={entry}
                index={idx}
                onChange={(updated) => {
                  const next = [...entries]
                  next[idx] = updated
                  onChange({ ...data, [selectedKey]: next })
                }}
                onRemove={() => {
                  onChange({ ...data, [selectedKey]: entries.filter((_, i) => i !== idx) })
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function EntryEditor({
  entry,
  index,
  onChange,
  onRemove,
}: {
  entry: RepeatEntry
  index: number
  onChange: (e: RepeatEntry) => void
  onRemove: () => void
}) {
  const fields = Object.keys(entry)

  return (
    <div className={styles.entryCard}>
      <div className={styles.entryHeader}>
        <span className={styles.entryIndex}>#{index + 1}</span>
        <button type="button" className={styles.removeBtn} onClick={onRemove}>
          ×
        </button>
      </div>
      {fields.map((field) => {
        const value = entry[field]
        if (typeof value === 'string') {
          return (
            <label key={field} className={styles.entryField}>
              <span className={styles.entryLabel}>{field}</span>
              <input
                className={styles.entryInput}
                value={value}
                onChange={(e) => onChange({ ...entry, [field]: e.target.value })}
              />
            </label>
          )
        }
        if (value && typeof value === 'object') {
          // LocalizedText
          const lt = value as Record<string, string | undefined>
          return (
            <div key={field} className={styles.entryField}>
              <span className={styles.entryLabel}>{field}</span>
              {Object.entries(lt).map(([lang, text]) => (
                <div key={lang} className={styles.langRow}>
                  <span className={styles.langBadge}>{lang}</span>
                  <input
                    className={styles.entryInput}
                    value={text ?? ''}
                    onChange={(e) =>
                      onChange({ ...entry, [field]: { ...lt, [lang]: e.target.value } })
                    }
                  />
                </div>
              ))}
            </div>
          )
        }
        return null
      })}
    </div>
  )
}
