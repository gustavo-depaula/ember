import { useCallback, useEffect, useMemo, useRef } from 'react'
import { ChapterColumn } from './ChapterColumn'
import styles from './TranslationReview.module.css'
import type { FlagMode } from './types'

export type ParagraphTarget = {
  lang: string
  paragraphIdx: number
  quote: string
}

export type SelectionTarget = {
  lang: string
  quote: string
}

const noopRef = () => {}

export function LanguageColumns({
  libraryId,
  bookId,
  chapterId,
  languages,
  flagMode,
  scrollSync,
  onFlagParagraph,
  onFlagSelection,
}: {
  libraryId: string
  bookId: string
  chapterId: string | undefined
  languages: string[]
  flagMode: FlagMode
  scrollSync: boolean
  onFlagParagraph: (target: ParagraphTarget) => void
  onFlagSelection: (target: SelectionTarget) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const syncingRef = useRef(false)

  const scrollRefSetters = useMemo(() => {
    const map = new Map<string, (el: HTMLDivElement | null) => void>()
    for (const lang of languages) {
      map.set(lang, (el) => {
        if (el) scrollRefs.current.set(lang, el)
        else scrollRefs.current.delete(lang)
      })
    }
    return map
  }, [languages])

  const handleScroll = useCallback(
    (lang: string, scrollTop: number) => {
      if (!scrollSync) return
      if (syncingRef.current) return
      syncingRef.current = true
      for (const [otherLang, el] of scrollRefs.current.entries()) {
        if (otherLang !== lang && el && el.scrollTop !== scrollTop) {
          el.scrollTop = scrollTop
        }
      }
      requestAnimationFrame(() => {
        syncingRef.current = false
      })
    },
    [scrollSync],
  )

  // Paragraph-mode: delegate clicks
  useEffect(() => {
    if (flagMode !== 'paragraph') return
    const el = containerRef.current
    if (!el) return

    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null
      const block = target?.closest('[data-paragraph-idx]') as HTMLElement | null
      if (!block) return
      const lang = block.getAttribute('data-lang') ?? ''
      const idxStr = block.getAttribute('data-paragraph-idx') ?? ''
      const paragraphIdx = Number.parseInt(idxStr, 10)
      if (Number.isNaN(paragraphIdx)) return
      const quote = (block.textContent ?? '').trim()
      onFlagParagraph({ lang, paragraphIdx, quote })
    }

    el.addEventListener('click', handleClick)
    return () => el.removeEventListener('click', handleClick)
  }, [flagMode, onFlagParagraph])

  // Selection-mode: capture mouseup -> active selection
  useEffect(() => {
    if (flagMode !== 'selection') return
    const el = containerRef.current
    if (!el) return

    function handleMouseUp() {
      const sel = window.getSelection()
      if (!sel || sel.isCollapsed) return
      const text = sel.toString().trim()
      if (!text) return
      const anchor = sel.anchorNode
      const node =
        anchor?.nodeType === Node.ELEMENT_NODE ? (anchor as HTMLElement) : anchor?.parentElement
      const column = node?.closest('[data-column-lang]') as HTMLElement | null
      if (!column) return
      const lang = column.getAttribute('data-column-lang') ?? ''
      onFlagSelection({ lang, quote: text })
      sel.removeAllRanges()
    }

    el.addEventListener('mouseup', handleMouseUp)
    return () => el.removeEventListener('mouseup', handleMouseUp)
  }, [flagMode, onFlagSelection])

  return (
    <div
      ref={containerRef}
      className={styles.columns}
      style={{ gridTemplateColumns: `repeat(${languages.length}, minmax(0, 1fr))` }}
    >
      {languages.map((lang) => (
        <ChapterColumn
          key={lang}
          libraryId={libraryId}
          bookId={bookId}
          chapterId={chapterId}
          lang={lang}
          flagMode={flagMode}
          scrollRef={scrollRefSetters.get(lang) ?? noopRef}
          onScroll={handleScroll}
        />
      ))}
    </div>
  )
}
