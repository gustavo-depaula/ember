import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import * as api from '@/fs/contentFs'
import { parseMarkdown } from '@/lib/markdown'
import styles from './TranslationReview.module.css'

function annotateBlocks(html: string, lang: string): string {
  if (typeof document === 'undefined') return html
  const tmpl = document.createElement('template')
  tmpl.innerHTML = html
  let idx = 0
  for (const child of Array.from(tmpl.content.children)) {
    if (child instanceof HTMLElement) {
      child.setAttribute('data-paragraph-idx', String(idx))
      child.setAttribute('data-lang', lang)
      idx += 1
    }
  }
  return tmpl.innerHTML
}

export function ChapterColumn({
  libraryId,
  bookId,
  chapterId,
  lang,
  flagMode,
  scrollRef,
  onScroll,
}: {
  libraryId: string
  bookId: string
  chapterId: string | undefined
  lang: string
  flagMode: 'paragraph' | 'selection'
  scrollRef: (el: HTMLDivElement | null) => void
  onScroll: (lang: string, scrollTop: number) => void
}) {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['translation-review-chapter', libraryId, bookId, chapterId, lang],
    queryFn: () => api.getBookChapter(libraryId, bookId, chapterId as string, lang),
    enabled: Boolean(chapterId),
    retry: 2,
    staleTime: 0,
  })

  const html = useMemo(() => {
    if (!data) return ''
    if (data.format === 'html') return annotateBlocks(data.text, lang)
    return annotateBlocks(parseMarkdown(data.text), lang)
  }, [data, lang])

  return (
    <div className={styles.column}>
      <div className={styles.columnHeader}>
        <span className={styles.langTag}>{lang}</span>
      </div>
      <div
        ref={scrollRef}
        className={`${styles.columnBody} ${flagMode === 'paragraph' ? styles.paragraphMode : ''}`}
        onScroll={(e) => onScroll(lang, e.currentTarget.scrollTop)}
        data-column-lang={lang}
      >
        {!chapterId && <div className={styles.placeholder}>Select a chapter</div>}
        {chapterId && (isLoading || isFetching) && !data && (
          <div className={styles.placeholder}>Loading…</div>
        )}
        {chapterId && error && !isFetching && (
          <div className={styles.errorMsg}>
            <p>Chapter not available in {lang}</p>
            <button type="button" className={styles.retryBtn} onClick={() => refetch()}>
              Retry
            </button>
          </div>
        )}
        {chapterId && data && (
          // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted local content
          <div className={styles.chapterContent} dangerouslySetInnerHTML={{ __html: html }} />
        )}
      </div>
    </div>
  )
}
