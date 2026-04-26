import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import * as api from '@/fs/contentFs'
import { loc, locIn } from '@/lib/localize'
import { parseMarkdown } from '@/lib/markdown'
import { useWorkspace } from '@/stores/workspace'
import type { TocNode } from '@/types/content'
import styles from './BookViewer.module.css'

export function BookViewer({ libraryId, bookId }: { libraryId: string; bookId: string }) {
  const { data: book, isLoading } = useQuery({
    queryKey: ['book', libraryId, bookId],
    queryFn: () => api.getBook(libraryId, bookId),
  })

  const [selectedChapter, setSelectedChapter] = useState<string | undefined>()
  const [viewLang, setViewLang] = useState<string>('en-US')

  if (isLoading || !book) {
    return <div className={styles.loading}>Loading book...</div>
  }

  return (
    <div className={styles.viewer}>
      <div className={styles.sidebar}>
        <div className={styles.bookHeader}>
          <h2 className={styles.bookTitle}>{loc(book.name)}</h2>
          {book.author && <p className={styles.bookAuthor}>{loc(book.author)}</p>}
          {book.composed && <p className={styles.bookDate}>c. {book.composed}</p>}
          <div className={styles.langBadges}>
            {book.languages.map((l) => (
              <button
                type="button"
                key={l}
                className={`${styles.langBtn} ${l === viewLang ? styles.langActive : ''}`}
                onClick={() => setViewLang(l)}
              >
                {l}
              </button>
            ))}
            {book.languages.length >= 2 && (
              <button
                type="button"
                className={styles.reviewBtn}
                title="Open this book in the translation reviewer"
                onClick={() =>
                  useWorkspace
                    .getState()
                    .openTab(
                      libraryId,
                      { type: 'translation-review', id: bookId },
                      `Review: ${loc(book.name) || bookId}`,
                    )
                }
              >
                Review →
              </button>
            )}
          </div>
        </div>

        <div className={styles.toc}>
          {book.toc.map((node) => (
            <TocItem
              key={node.id}
              node={node}
              selected={selectedChapter}
              onSelect={setSelectedChapter}
              depth={0}
              lang={viewLang}
            />
          ))}
        </div>
      </div>

      <div className={styles.chapterPane}>
        {selectedChapter ? (
          <ChapterView
            libraryId={libraryId}
            bookId={bookId}
            chapterId={selectedChapter}
            lang={viewLang}
          />
        ) : (
          <div className={styles.placeholder}>
            <p>Select a chapter from the table of contents.</p>
            {book.description && <p className={styles.description}>{loc(book.description)}</p>}
          </div>
        )}
      </div>
    </div>
  )
}

function TocItem({
  node,
  selected,
  onSelect,
  depth,
  lang,
}: {
  node: TocNode
  selected: string | undefined
  onSelect: (id: string) => void
  depth: number
  lang: string
}) {
  const isLeaf = !node.children || node.children.length === 0

  return (
    <>
      <button
        type="button"
        className={`${styles.tocItem} ${selected === node.id ? styles.tocSelected : ''}`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
        onClick={() => isLeaf && onSelect(node.id)}
      >
        {!isLeaf && <span className={styles.groupIcon}>▸</span>}
        <span className={isLeaf ? styles.tocLeaf : styles.tocGroup}>{locIn(node.title, lang)}</span>
      </button>
      {node.children?.map((child) => (
        <TocItem
          key={child.id}
          node={child}
          selected={selected}
          onSelect={onSelect}
          depth={depth + 1}
          lang={lang}
        />
      ))}
    </>
  )
}

function ChapterView({
  libraryId,
  bookId,
  chapterId,
  lang,
}: {
  libraryId: string
  bookId: string
  chapterId: string
  lang: string
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['bookChapter', libraryId, bookId, chapterId, lang],
    queryFn: () => api.getBookChapter(libraryId, bookId, chapterId, lang),
    retry: 2,
    staleTime: 0,
  })

  const html = useMemo(() => {
    if (!data) return ''
    return data.format === 'html' ? data.text : parseMarkdown(data.text)
  }, [data])

  if (isLoading) return <div className={styles.loading}>Loading chapter...</div>
  if (error) return <div className={styles.error}>Chapter not available in {lang}</div>
  if (!data) return null

  return (
    <div className={styles.chapter}>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: trusted local content */}
      <div className={styles.chapterContent} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
