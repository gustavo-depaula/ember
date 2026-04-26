import { useEffect, useState } from 'react'
import styles from './TranslationReview.module.css'
import {
  type Issue,
  type IssueDraft,
  type IssueType,
  issueTypeLabels,
  taxonomyTypes,
} from './types'

export type IssueFormSeed = {
  libraryId: string
  bookId: string
  chapterId: string
  type: IssueType
  languages: string[]
  paragraphIdx?: number
  selectionLang?: string
  quote: string
  note?: string
  allLanguages: string[]
  showTypePicker: boolean
}

export function IssueForm({
  seed,
  existing,
  onSave,
  onCancel,
}: {
  seed: IssueFormSeed
  existing?: Issue
  onSave: (draft: IssueDraft) => void
  onCancel: () => void
}) {
  const [type, setType] = useState<IssueType>(existing?.type ?? seed.type)
  const [languages, setLanguages] = useState<string[]>(existing?.languages ?? seed.languages)
  const [note, setNote] = useState<string>(existing?.note ?? seed.note ?? '')

  useEffect(() => {
    setType(existing?.type ?? seed.type)
    setLanguages(existing?.languages ?? seed.languages)
    setNote(existing?.note ?? seed.note ?? '')
  }, [existing, seed.type, seed.languages, seed.note])

  function toggleLang(lang: string) {
    setLanguages((curr) => (curr.includes(lang) ? curr.filter((l) => l !== lang) : [...curr, lang]))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!note.trim()) return
    onSave({
      libraryId: seed.libraryId,
      bookId: seed.bookId,
      chapterId: seed.chapterId,
      type,
      languages,
      paragraphIdx: existing?.paragraphIdx ?? seed.paragraphIdx,
      selectionLang: existing?.selectionLang ?? seed.selectionLang,
      quote: existing?.quote ?? seed.quote,
      note: note.trim(),
    })
  }

  return (
    /* biome-ignore lint/a11y/noStaticElementInteractions: modal overlay backdrop */
    <div
      className={styles.modalBackdrop}
      role="presentation"
      onClick={onCancel}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onCancel()
      }}
    >
      <form
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h3 className={styles.modalTitle}>{existing ? 'Edit issue' : 'New issue'}</h3>

        {seed.showTypePicker && (
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Type</span>
            <select
              className={styles.fieldSelect}
              value={type}
              onChange={(e) => setType(e.target.value as IssueType)}
            >
              {taxonomyTypes.map((t) => (
                <option key={t} value={t}>
                  {issueTypeLabels[t]}
                </option>
              ))}
            </select>
          </label>
        )}

        <fieldset className={styles.field}>
          <legend className={styles.fieldLabel}>Affected languages</legend>
          <div className={styles.langCheckRow}>
            {seed.allLanguages.map((lang) => (
              <label key={lang} className={styles.langCheck}>
                <input
                  type="checkbox"
                  checked={languages.includes(lang)}
                  onChange={() => toggleLang(lang)}
                />
                {lang}
              </label>
            ))}
          </div>
        </fieldset>

        <div className={styles.field}>
          <span className={styles.fieldLabel}>Quote</span>
          <div className={styles.quote}>{existing?.quote ?? seed.quote}</div>
        </div>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Note</span>
          <textarea
            className={styles.fieldTextarea}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="What's wrong, and what should it be?"
            // biome-ignore lint/a11y/noAutofocus: modal's primary input
            autoFocus
          />
        </label>

        <div className={styles.modalActions}>
          <button type="button" className={styles.btnSecondary} onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className={styles.btnPrimary} disabled={!note.trim()}>
            {existing ? 'Save' : 'Add issue'}
          </button>
        </div>
      </form>
    </div>
  )
}
