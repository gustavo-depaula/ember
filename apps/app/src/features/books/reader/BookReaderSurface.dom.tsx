'use dom'

import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { surfaceCss } from './BookReaderSurface.dom.css'
import type { ReaderSurfaceProps } from './protocol'

/**
 * The reader's page surface, rendered as a real DOM tree.
 *
 * On native this runs inside Expo's DOM-Component WebView; on web it's a
 * normal React DOM subtree. Props are serialised across the bridge on every
 * render — callers MUST memoise `window`, `config`, and every callback or
 * the WebView re-evaluates effects on cosmetic re-renders.
 */
export default function BookReaderSurface(props: ReaderSurfaceProps) {
  const readyFired = useRef(false)
  useEffect(() => {
    if (readyFired.current) return
    readyFired.current = true
    props.onReady()
  }, [props.onReady])

  return (
    <>
      <StyleTag css={surfaceCss} />
      {props.layout === 'paginated' ? (
        <PaginatedSurface {...props} />
      ) : (
        <ScrollSurface {...props} />
      )}
    </>
  )
}

// Shared root styles. Background and color are hard-coded as a defensive
// fallback so a missing `.dark`/`.light` class on the surface can't leave
// text invisible on a transparent WebView.
function rootStyle(
  config: ReaderSurfaceProps['config'],
  theme: ReaderSurfaceProps['theme'],
): React.CSSProperties {
  return {
    backgroundColor: theme === 'dark' ? '#0E0D0C' : '#FAF6F0',
    color: theme === 'dark' ? '#EDE4D8' : '#1a1815',
    fontFamily: config.fontFamily,
    fontSize: `${config.fontSizePx}px`,
    lineHeight: `${config.lineHeightPx}px`,
    textAlign: config.textAlign,
  }
}

// --- scroll mode ------------------------------------------------------------

function ScrollSurface({ window: chapterWindow, config, theme }: ReaderSurfaceProps) {
  return (
    <div
      className={`reader-surface reader-scroll ${theme}`}
      style={{ ...rootStyle(config, theme), padding: `1em ${config.marginPx}px` }}
    >
      <ChapterSection slot="cur" id={chapterWindow.curChapterId} html={chapterWindow.curHtml} />
    </div>
  )
}

// --- paginated mode --------------------------------------------------------

type Bounds = { curStart: number; nextStart: number; hasPrev: boolean; hasNext: boolean }

const tapZoneRatio = 0.3
const swipeDistancePx = 40
const swipeVelocityPxPerMs = 0.3
const edgeSwipePx = 20
const transitionMs = 280

function PaginatedSurface({
  window: chapterWindow,
  config,
  theme,
  restoreToPage,
  onPageChange,
  onChapterCross,
  onCenterTap,
  onBackSwipe,
}: ReaderSurfaceProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const hostRef = useRef<HTMLDivElement>(null)

  const [pageWidth, setPageWidth] = useState(0)
  const [bounds, setBounds] = useState<Bounds>({
    curStart: 0,
    nextStart: 0,
    hasPrev: false,
    hasNext: false,
  })
  const [absPage, setAbsPage] = useState(0)
  const [dragDx, setDragDx] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  // Settled relative page for the current chapter; reported up only when it
  // actually changes (settle-only — never per drag frame).
  const lastReportedRef = useRef<{ page: number; total: number } | null>(null)

  const measure = useCallback(() => {
    const viewport = viewportRef.current
    const host = hostRef.current
    if (!viewport || !host) return
    const width = viewport.offsetWidth
    if (width === 0) return
    setPageWidth(width)
    const sections = host.querySelectorAll<HTMLElement>('[data-ch]')
    const elLeft = host.getBoundingClientRect().left
    const padLeft = Number.parseFloat(getComputedStyle(host).paddingLeft || '0')
    const startPage = (panel: HTMLElement): number => {
      const rect = panel.getBoundingClientRect()
      return Math.round((rect.left - elLeft - padLeft) / width)
    }
    let curStart = 0
    let nextStart = Math.max(1, Math.round(host.scrollWidth / width))
    let hasPrev = false
    let hasNext = false
    for (const section of Array.from(sections)) {
      const slot = section.dataset.ch
      if (slot === 'prev') hasPrev = true
      if (slot === 'cur') curStart = startPage(section)
      if (slot === 'next') {
        hasNext = true
        nextStart = startPage(section)
      }
    }
    setBounds({ curStart, nextStart, hasPrev, hasNext })
  }, [])

  // Re-measure synchronously on mount, on every chapter HTML change (column
  // count changes), and on font/layout changes (column widths change). Doing
  // this inside useLayoutEffect (not behind requestAnimationFrame) is what
  // lets subsequent useEffects in the same commit see fresh `bounds` — the
  // restoreToPage and chapter-change effects below race otherwise.
  // measure() forces a sync reflow via offsetWidth/getBoundingClientRect;
  // that's the cost we pay for ordering correctness.
  // Biome can't tell these primitive deps are needed because `measure()`
  // reads the DOM directly; they trigger re-measurement on content change.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see comment above
  useLayoutEffect(() => {
    measure()
  }, [
    measure,
    chapterWindow.curChapterId,
    chapterWindow.prevChapterId,
    chapterWindow.nextChapterId,
    config.fontSizePx,
    config.lineHeightPx,
    config.marginPx,
    config.fontFamily,
  ])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport || typeof ResizeObserver === 'undefined') return
    // ResizeObserver fires asynchronously; coalesce its bursts through RAF so
    // we don't churn during continuous resize (drag a window edge).
    let raf = 0
    const ro = new ResizeObserver(() => {
      if (raf) cancelAnimationFrame(raf)
      raf = requestAnimationFrame(measure)
    })
    ro.observe(viewport)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [measure])

  // Settle absPage exactly once per chapter — when curChapterId changes AND
  // bounds have been measured for the new content. `restoreToPage` < 0 lands
  // on the last page (backward chapter cross); undefined falls back to page
  // 0 (TOC nav / fresh open with no cursor). The ref guard prevents resize
  // events from re-snapping the user back after they've moved.
  const settledChapterRef = useRef<string | undefined>(undefined)
  useEffect(() => {
    if (settledChapterRef.current === chapterWindow.curChapterId) return
    if (pageWidth === 0 || bounds.nextStart <= bounds.curStart) return
    const chapterPages = Math.max(1, bounds.nextStart - bounds.curStart)
    let rel = 0
    if (restoreToPage !== undefined) {
      rel = restoreToPage < 0 ? chapterPages - 1 : Math.min(restoreToPage, chapterPages - 1)
    }
    setAbsPage(bounds.curStart + rel)
    settledChapterRef.current = chapterWindow.curChapterId
  }, [chapterWindow.curChapterId, restoreToPage, pageWidth, bounds])

  // Settle-only page reports.
  useEffect(() => {
    if (isDragging) return
    if (bounds.nextStart <= bounds.curStart) return
    const rel = Math.max(0, absPage - bounds.curStart)
    const total = bounds.nextStart - bounds.curStart
    const last = lastReportedRef.current
    if (last?.page === rel && last.total === total) return
    lastReportedRef.current = { page: rel, total }
    onPageChange({ page: rel, totalPages: total })
  }, [isDragging, absPage, bounds, onPageChange])

  // --- Pointer handling ----------------------------------------------------

  // stepPage advances absPage by ±1, firing onChapterCross when we run off
  // the cur chapter's column range.
  const stepPage = useCallback(
    (delta: 1 | -1) => {
      const next = absPage + delta
      const chapterPages = bounds.nextStart - bounds.curStart
      if (delta === 1) {
        const relNext = next - bounds.curStart
        if (relNext >= chapterPages && bounds.hasNext) {
          onChapterCross({ direction: 'next', landingPage: 0 })
          return
        }
        if (relNext >= chapterPages) {
          setAbsPage(bounds.curStart + Math.max(0, chapterPages - 1))
          return
        }
      } else {
        if (next < bounds.curStart && bounds.hasPrev) {
          onChapterCross({ direction: 'prev', landingPage: -1 })
          return
        }
        if (next < bounds.curStart) {
          setAbsPage(bounds.curStart)
          return
        }
      }
      setAbsPage(next)
    },
    [absPage, bounds, onChapterCross],
  )

  const dragRef = useRef<{
    startX: number
    startY: number
    startTime: number
    pointerId: number
    edge: boolean
    blocked: boolean
    moved: boolean
  } | null>(null)

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startTime: Date.now(),
      pointerId: e.pointerId,
      edge: e.clientX < edgeSwipePx,
      blocked: false,
      moved: false,
    }
    setDragDx(0)
    e.currentTarget.setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const d = dragRef.current
      if (!d || d.pointerId !== e.pointerId || d.blocked) return
      const dx = e.clientX - d.startX
      const dy = e.clientY - d.startY
      if (!d.moved && Math.abs(dy) > Math.abs(dx) + 6) {
        d.blocked = true
        return
      }
      if (Math.abs(dx) > 4) d.moved = true
      setIsDragging(true)
      // Resistance at boundaries: damp the drag if there's nothing on that side.
      let clamped = dx
      if (dx > 0 && absPage <= 0 && !bounds.hasPrev) clamped = dx * 0.3
      if (dx < 0 && !bounds.hasNext && bounds.nextStart > 0 && absPage >= bounds.nextStart - 1) {
        clamped = dx * 0.3
      }
      setDragDx(clamped)
    },
    [absPage, bounds.hasPrev, bounds.hasNext, bounds.nextStart],
  )

  const onPointerUp = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const d = dragRef.current
      if (!d || d.pointerId !== e.pointerId) return
      const dx = e.clientX - d.startX
      const dy = e.clientY - d.startY
      const elapsed = Math.max(1, Date.now() - d.startTime)
      const velocity = Math.abs(dx) / elapsed
      const distance = Math.abs(dx)
      const viewport = viewportRef.current
      const width = viewport?.offsetWidth ?? pageWidth
      const wasDragging = d.moved
      dragRef.current = null
      e.currentTarget.releasePointerCapture(e.pointerId)
      setIsDragging(false)
      setDragDx(0)

      if (!wasDragging && distance < 8 && Math.abs(dy) < 8) {
        const x = e.clientX
        if (x < width * tapZoneRatio) stepPage(-1)
        else if (x > width * (1 - tapZoneRatio)) stepPage(1)
        else onCenterTap()
        return
      }

      if (d.edge && dx > swipeDistancePx) {
        onBackSwipe()
        return
      }

      const overThreshold =
        distance > swipeDistancePx || (velocity > swipeVelocityPxPerMs && distance > 10)
      if (overThreshold) stepPage(dx < 0 ? 1 : -1)
    },
    [pageWidth, onBackSwipe, onCenterTap, stepPage],
  )

  // --- render --------------------------------------------------------------

  const padPx = config.marginPx
  const translate = -absPage * pageWidth + dragDx
  // CSS calc sizes columns from the very first render (no waiting on a
  // measure pass) so the user sees a properly laid-out page instead of a
  // blank screen while pageWidth=0. The invariant is: column width + gap =
  // viewport width, so each absPage step translates by exactly pageWidth.
  const hostStyle: React.CSSProperties = {
    columnFill: 'auto',
    columnWidth: `calc(100vw - ${padPx * 2}px)`,
    columnGap: `${padPx * 2}px`,
    height: '100vh',
    padding: `1em ${padPx}px`,
    boxSizing: 'border-box',
    transform: `translateX(${translate}px)`,
    transition: isDragging ? 'none' : `transform ${transitionMs}ms cubic-bezier(0.2,0,0,1)`,
    willChange: 'transform',
  }

  return (
    <div
      ref={viewportRef}
      className={`reader-surface reader-paginated ${theme}`}
      style={{
        ...rootStyle(config, theme),
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        touchAction: 'pan-y',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div ref={hostRef} style={hostStyle}>
        {/* Explicit keys = chapter ids so React reuses the same DOM node
            when the window shifts (old cur → new prev, old next → new cur).
            Without keys, every cross would replace innerHTML on all three
            slots, fighting CSS column reflow and adding flash. */}
        {chapterWindow.prevHtml && chapterWindow.prevChapterId ? (
          <ChapterSection
            key={chapterWindow.prevChapterId}
            slot="prev"
            id={chapterWindow.prevChapterId}
            html={chapterWindow.prevHtml}
          />
        ) : null}
        <ChapterSection
          key={chapterWindow.curChapterId}
          slot="cur"
          id={chapterWindow.curChapterId}
          html={chapterWindow.curHtml}
        />
        {chapterWindow.nextHtml && chapterWindow.nextChapterId ? (
          <ChapterSection
            key={chapterWindow.nextChapterId}
            slot="next"
            id={chapterWindow.nextChapterId}
            html={chapterWindow.nextHtml}
          />
        ) : null}
      </div>
    </div>
  )
}

// --- shared bits -----------------------------------------------------------

// surfaceCss is a static, in-repo constant; no user input flows in.
function StyleTag({ css }: { css: string }) {
  // biome-ignore lint/security/noDangerouslySetInnerHtml: static authored constant, no user input
  return <style dangerouslySetInnerHTML={{ __html: css }} />
}

// Chapter HTML is produced by `loadChapterHtml` (marked + galleryExtension —
// which escapes user content; cf. its tests — plus marked-footnote). The
// reader has no untrusted-author input pathway, so this injection is safe.
function ChapterSection({
  slot,
  id,
  html,
}: {
  slot: 'prev' | 'cur' | 'next'
  id: string
  html: string
}) {
  return (
    <section
      className="ch-panel"
      data-ch={slot}
      data-chapter-id={id}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: see component-level note
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
