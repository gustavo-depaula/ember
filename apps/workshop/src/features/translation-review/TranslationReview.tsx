import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import * as api from '@/fs/contentFs'
import { loc } from '@/lib/localize'
import { type BookOption, BookPicker } from './BookPicker'
import { ChapterList } from './ChapterList'
import { IssueForm, type IssueFormSeed } from './IssueForm'
import { IssueList } from './IssueList'
import { LanguageColumns, type ParagraphTarget, type SelectionTarget } from './LanguageColumns'
import { buildReport } from './report'
import { useIssuesForBook, useReviewStore } from './store'
import styles from './TranslationReview.module.css'
import type { FlagMode, Issue } from './types'

export function TranslationReview({
  initial,
}: {
  initial?: { libraryId: string; bookId: string }
}) {
  const [bookOpt, setBookOpt] = useState<BookOption | undefined>()
  const [chapterId, setChapterId] = useState<string | undefined>()
  const [flagMode, setFlagMode] = useState<FlagMode>('paragraph')
  const [scrollSync, setScrollSync] = useState(true)
  const [showIssues, setShowIssues] = useState(true)
  const [formSeed, setFormSeed] = useState<IssueFormSeed | undefined>()
  const [editing, setEditing] = useState<Issue | undefined>()
  const [toast, setToast] = useState<string | undefined>()
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'downloaded' | 'error'>('idle')
  const [hiddenLangs, setHiddenLangs] = useState<Set<string>>(() => new Set())

  const activeIds = bookOpt ?? initial
  const { data: book } = useQuery({
    queryKey: ['translation-review-book', activeIds?.libraryId, activeIds?.bookId],
    queryFn: () => api.getBook(activeIds?.libraryId as string, activeIds?.bookId as string),
    enabled: Boolean(activeIds),
  })

  useEffect(() => {
    if (initial && book && !bookOpt) {
      setBookOpt({
        libraryId: initial.libraryId,
        bookId: initial.bookId,
        label: loc(book.name) || initial.bookId,
        languages: book.languages,
      })
    }
  }, [initial, book, bookOpt])

  const issues = useIssuesForBook(bookOpt?.libraryId, bookOpt?.bookId)
  const add = useReviewStore((s) => s.add)
  const update = useReviewStore((s) => s.update)
  const remove = useReviewStore((s) => s.remove)
  const clearForBook = useReviewStore((s) => s.clearForBook)

  function handleSelectBook(opt: BookOption) {
    setBookOpt(opt)
    setChapterId(undefined)
    setEditing(undefined)
    setFormSeed(undefined)
    setHiddenLangs(new Set())
  }

  const visibleLanguages = book ? book.languages.filter((l) => !hiddenLangs.has(l)) : []

  function toggleLangVisible(lang: string) {
    if (!book) return
    setHiddenLangs((prev) => {
      const next = new Set(prev)
      if (next.has(lang)) {
        next.delete(lang)
        return next
      }
      const remainingVisible = book.languages.filter((l) => !next.has(l) && l !== lang).length
      if (remainingVisible < 1) return prev
      next.add(lang)
      return next
    })
  }

  const handleFlagParagraph = useCallback(
    (target: ParagraphTarget) => {
      if (!bookOpt || !chapterId || !book) return
      setEditing(undefined)
      setFormSeed({
        libraryId: bookOpt.libraryId,
        bookId: bookOpt.bookId,
        chapterId,
        type: 'completeness',
        languages: [target.lang],
        paragraphIdx: target.paragraphIdx,
        quote: target.quote.slice(0, 600),
        allLanguages: book.languages,
        showTypePicker: true,
      })
    },
    [bookOpt, chapterId, book],
  )

  const handleFlagSelection = useCallback(
    (target: SelectionTarget) => {
      if (!bookOpt || !chapterId || !book) return
      setEditing(undefined)
      setFormSeed({
        libraryId: bookOpt.libraryId,
        bookId: bookOpt.bookId,
        chapterId,
        type: 'note',
        languages: [target.lang],
        selectionLang: target.lang,
        quote: target.quote.slice(0, 600),
        allLanguages: book.languages,
        showTypePicker: false,
      })
    },
    [bookOpt, chapterId, book],
  )

  function handleEditIssue(issue: Issue) {
    if (!book) return
    setEditing(issue)
    setFormSeed({
      libraryId: issue.libraryId,
      bookId: issue.bookId,
      chapterId: issue.chapterId,
      type: issue.type,
      languages: issue.languages,
      paragraphIdx: issue.paragraphIdx,
      selectionLang: issue.selectionLang,
      quote: issue.quote,
      note: issue.note,
      allLanguages: book.languages,
      showTypePicker: issue.type !== 'note',
    })
  }

  async function handleExport() {
    if (!bookOpt || !book) return
    const report = buildReport(bookOpt.libraryId, book, issues)
    try {
      await navigator.clipboard.writeText(report)
      flashCopyState('copied', `Report copied (${report.length.toLocaleString()} chars)`)
    } catch (err) {
      console.error('Clipboard copy failed:', err)
      try {
        downloadReport(report, `${bookOpt.bookId}-translation-review.md`)
        flashCopyState('downloaded', 'Clipboard blocked — downloaded instead')
      } catch (err2) {
        console.error('Download fallback failed:', err2)
        flashCopyState('error', 'Export failed — see console')
      }
    }
  }

  function handleDownload() {
    if (!bookOpt || !book) return
    const report = buildReport(bookOpt.libraryId, book, issues)
    downloadReport(report, `${bookOpt.bookId}-translation-review.md`)
    flashToast('Report downloaded')
  }

  function flashToast(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast(undefined), 2200)
  }

  function flashCopyState(state: 'copied' | 'downloaded' | 'error', toastMsg: string) {
    setCopyState(state)
    flashToast(toastMsg)
    window.setTimeout(() => setCopyState('idle'), 2000)
  }

  function handleClearAll() {
    if (!bookOpt) return
    if (issues.length === 0) return
    if (!window.confirm(`Delete all ${issues.length} flagged issues for this book?`)) return
    clearForBook(bookOpt.libraryId, bookOpt.bookId)
  }

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <BookPicker
          selected={bookOpt ? { libraryId: bookOpt.libraryId, bookId: bookOpt.bookId } : undefined}
          onSelect={handleSelectBook}
        />

        {book && book.languages.length > 1 && (
          <div className={styles.langToggle}>
            {book.languages.map((lang) => {
              const visible = !hiddenLangs.has(lang)
              return (
                <button
                  key={lang}
                  type="button"
                  className={`${styles.langToggleBtn} ${visible ? styles.langToggleOn : ''}`}
                  onClick={() => toggleLangVisible(lang)}
                  title={visible ? `Hide ${lang} column` : `Show ${lang} column`}
                >
                  {lang}
                </button>
              )
            })}
          </div>
        )}

        <div className={styles.toolbarSpacer} />

        <div className={styles.modeToggle}>
          <button
            type="button"
            className={`${styles.toggleBtn} ${flagMode === 'paragraph' ? styles.toggleActive : ''}`}
            onClick={() => setFlagMode('paragraph')}
            title="Click a paragraph to flag it (with taxonomy)"
          >
            ¶ Paragraph
          </button>
          <button
            type="button"
            className={`${styles.toggleBtn} ${flagMode === 'selection' ? styles.toggleActive : ''}`}
            onClick={() => setFlagMode('selection')}
            title="Highlight any text to add a freeform note"
          >
            ✂ Selection
          </button>
        </div>

        <label className={styles.checkRow}>
          <input
            type="checkbox"
            checked={scrollSync}
            onChange={(e) => setScrollSync(e.target.checked)}
          />
          Sync scroll
        </label>

        <button
          type="button"
          className={styles.btnSecondary}
          onClick={() => setShowIssues((v) => !v)}
        >
          {showIssues ? 'Hide' : 'Show'} issues ({issues.length})
        </button>

        <button
          type="button"
          className={`${styles.btnPrimary} ${copyState !== 'idle' ? styles[`btn_${copyState}`] : ''}`}
          onClick={handleExport}
          disabled={!book || issues.length === 0}
        >
          {copyState === 'copied' && '✓ Copied!'}
          {copyState === 'downloaded' && '⬇ Downloaded'}
          {copyState === 'error' && '✗ Failed'}
          {copyState === 'idle' && 'Copy report'}
        </button>
        <button
          type="button"
          className={styles.btnSecondary}
          onClick={handleDownload}
          disabled={!book || issues.length === 0}
          title="Download .md"
        >
          ⬇
        </button>
      </div>

      <div className={styles.body}>
        {!book && (
          <div className={styles.welcome}>
            <h2>Translation Reviewer</h2>
            <p>
              Pick a multilingual book above, then walk through chapters side-by-side. Flag issues
              with a taxonomy (paragraph mode) or freeform notes (selection mode), then export a
              markdown report to hand to an LLM.
            </p>
          </div>
        )}

        {book && activeIds && (
          <>
            <div className={styles.sidePanel}>
              <div className={styles.sidePanelHeader}>
                <h3>{loc(book.name) || book.id}</h3>
                <span className={styles.sideMeta}>{book.languages.join(' · ')}</span>
              </div>
              <ChapterList
                book={book}
                selectedChapter={chapterId}
                onSelect={setChapterId}
                issues={issues}
              />
            </div>

            <div className={styles.main}>
              <LanguageColumns
                libraryId={activeIds.libraryId}
                bookId={activeIds.bookId}
                chapterId={chapterId}
                languages={visibleLanguages}
                flagMode={flagMode}
                scrollSync={scrollSync}
                onFlagParagraph={handleFlagParagraph}
                onFlagSelection={handleFlagSelection}
              />
            </div>

            {showIssues && (
              <div className={styles.issuesPane}>
                <div className={styles.issuesPaneHeader}>
                  <h3>Issues</h3>
                  <button
                    type="button"
                    className={styles.linkBtn}
                    onClick={handleClearAll}
                    disabled={issues.length === 0}
                  >
                    Clear all
                  </button>
                </div>
                <IssueList
                  book={book}
                  issues={issues}
                  onJumpToChapter={setChapterId}
                  onEdit={handleEditIssue}
                  onDelete={remove}
                />
              </div>
            )}
          </>
        )}
      </div>

      {formSeed && (
        <IssueForm
          seed={formSeed}
          existing={editing}
          onCancel={() => {
            setFormSeed(undefined)
            setEditing(undefined)
          }}
          onSave={(draft) => {
            if (editing) {
              update(editing.id, draft)
            } else {
              add(draft)
            }
            setFormSeed(undefined)
            setEditing(undefined)
          }}
        />
      )}

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  )
}

function downloadReport(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
