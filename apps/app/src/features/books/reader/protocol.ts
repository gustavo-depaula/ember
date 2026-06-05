/**
 * Typed contract between the native React chrome and the `"use dom"` page
 * surface. Imported on both sides. No React, no platform imports — only
 * JSON-serialisable shapes (plus marshalled function props).
 *
 * The DOM bridge serialises every prop on every render that crosses it, so
 * callers MUST memoise these values to avoid unnecessary churn.
 */

import type { DOMProps } from 'expo/dom'

export type ReaderTheme = 'light' | 'dark'
export type ReaderLayout = 'paginated' | 'scroll'

export type ReaderConfig = {
  fontSizePx: number
  lineHeightPx: number
  textAlign: 'justify' | 'left'
  marginPx: number
  fontFamily: string
}

export type ChapterWindow = {
  prevHtml?: string
  curHtml: string
  nextHtml?: string
  prevChapterId?: string
  curChapterId: string
  nextChapterId?: string
}

export type GalleryItem = {
  src: string
  alt?: string
  title?: string
  attribution?: string
  caption?: string
}

export type PageInfo = { page: number; totalPages: number }

export type ChapterCrossInfo = {
  direction: 'next' | 'prev'
  landingPage: number
}

export type GalleryTapInfo = {
  index: number
  items: GalleryItem[]
}

export type ReaderSurfaceProps = {
  /** Passed through to the WebView container on native; `flex: 1` is required
   *  or the WebView collapses to zero height inside a flex parent. */
  dom?: DOMProps
  window: ChapterWindow
  config: ReaderConfig
  theme: ReaderTheme
  layout: ReaderLayout
  /** Chapter-relative page to land on after the next render. -1 = last page. */
  restoreToPage?: number
  onReady: () => void
  onPageChange: (info: PageInfo) => void
  onChapterCross: (info: ChapterCrossInfo) => void
  onCenterTap: () => void
  onBackSwipe: () => void
  onGalleryTap: (info: GalleryTapInfo) => void
}
