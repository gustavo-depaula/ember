import { useMemo } from 'react'
import type { BookManifest } from '@/types/content'
import styles from './TranslationReview.module.css'
import { chapterTitleMap } from './tocUtils'
import { type Issue, issueTypeLabels } from './types'

export function IssueList({
  book,
  issues,
  onJumpToChapter,
  onEdit,
  onDelete,
}: {
  book: BookManifest
  issues: Issue[]
  onJumpToChapter: (chapterId: string) => void
  onEdit: (issue: Issue) => void
  onDelete: (id: string) => void
}) {
  const titles = useMemo(() => chapterTitleMap(book.toc), [book.toc])

  const grouped = useMemo(() => {
    const m = new Map<string, Issue[]>()
    for (const i of issues) {
      const arr = m.get(i.chapterId) ?? []
      arr.push(i)
      m.set(i.chapterId, arr)
    }
    return Array.from(m.entries())
  }, [issues])

  if (issues.length === 0) {
    return <div className={styles.issuesEmpty}>No issues flagged yet.</div>
  }

  return (
    <div className={styles.issuesList}>
      {grouped.map(([chapterId, chapterIssues]) => (
        <div key={chapterId} className={styles.issuesGroup}>
          <button
            type="button"
            className={styles.issuesGroupHeader}
            onClick={() => onJumpToChapter(chapterId)}
          >
            {titles.get(chapterId) ?? chapterId}
            <span className={styles.issuesGroupCount}>{chapterIssues.length}</span>
          </button>
          {chapterIssues.map((issue) => (
            <div key={issue.id} className={styles.issueCard}>
              <div className={styles.issueHead}>
                <span className={`${styles.issueType} ${styles[`issueType_${issue.type}`] ?? ''}`}>
                  {issueTypeLabels[issue.type]}
                </span>
                <span className={styles.issueLangs}>{issue.languages.join(', ')}</span>
                <button
                  type="button"
                  className={styles.iconBtn}
                  title="Edit"
                  onClick={() => onEdit(issue)}
                >
                  ✎
                </button>
                <button
                  type="button"
                  className={styles.iconBtn}
                  title="Delete"
                  onClick={() => onDelete(issue.id)}
                >
                  ×
                </button>
              </div>
              {issue.quote && <div className={styles.issueQuote}>"{issue.quote}"</div>}
              <div className={styles.issueNote}>{issue.note}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
