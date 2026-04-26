import { useMemo } from 'react'
import type { BookManifest } from '@/types/content'
import styles from './TranslationReview.module.css'
import { flattenToc } from './tocUtils'
import type { Issue } from './types'

export function ChapterList({
  book,
  selectedChapter,
  onSelect,
  issues,
}: {
  book: BookManifest
  selectedChapter: string | undefined
  onSelect: (chapterId: string) => void
  issues: Issue[]
}) {
  const flat = useMemo(() => flattenToc(book.toc), [book.toc])

  const counts = useMemo(() => {
    const m = new Map<string, number>()
    for (const i of issues) m.set(i.chapterId, (m.get(i.chapterId) ?? 0) + 1)
    return m
  }, [issues])

  return (
    <div className={styles.chapterList}>
      {flat.map((node) => {
        const count = counts.get(node.id) ?? 0
        return (
          <button
            type="button"
            key={node.id}
            className={`${styles.chapterItem} ${selectedChapter === node.id ? styles.chapterSelected : ''} ${node.isLeaf ? '' : styles.chapterGroup}`}
            style={{ paddingLeft: `${8 + node.depth * 12}px` }}
            onClick={() => node.isLeaf && onSelect(node.id)}
            disabled={!node.isLeaf}
          >
            <span className={styles.chapterTitle}>{node.title}</span>
            {count > 0 && <span className={styles.chapterBadge}>{count}</span>}
          </button>
        )
      })}
    </div>
  )
}
