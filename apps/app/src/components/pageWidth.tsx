import { createContext, type ReactNode, useContext } from 'react'
import { useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { breakpoints, gridCells, pageGutter, pageOuterWidth } from '@/lib/layout'

const PageWidthContext = createContext<number | undefined>(undefined)
const FrameWidthContext = createContext<number | undefined>(undefined)
const RoomWidthContext = createContext<number | undefined>(undefined)

/** Tells a screen it has less than the window: it stands beside the system sidebar. */
export function RoomWidth({ width, children }: { width: number; children: ReactNode }) {
  return <RoomWidthContext.Provider value={width}>{children}</RoomWidthContext.Provider>
}

/**
 * The width a screen is drawn in, inside its safe area. Measure from this, not
 * from the window: beside an open sidebar the window is wider than the screen.
 */
export function useRoomWidth(): number {
  const room = useContext(RoomWidthContext)
  const { width } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  return room ?? width - insets.left - insets.right
}

/**
 * Narrows the room a page has to lay itself out in: a reader between its
 * rails is a page in a column, not in the window.
 */
export function FrameWidth({ width, children }: { width: number; children: ReactNode }) {
  return <FrameWidthContext.Provider value={width}>{children}</FrameWidthContext.Provider>
}

/** The room a page has, edge to edge: the screen inside its safe area, or an enclosing frame. */
export function useFrameWidth(): number {
  const framed = useContext(FrameWidthContext)
  const room = useRoomWidth()
  return framed ?? room
}

/**
 * Tells everything beneath it how wide the column it stands in is. Tiles,
 * grids and banners size themselves from this instead of the window, so the
 * same component fits a phone, a wide page and one column of a split page.
 */
export function PageWidth({ width, children }: { width: number; children: ReactNode }) {
  return <PageWidthContext.Provider value={width}>{children}</PageWidthContext.Provider>
}

/** Width of the enclosing content column, inside its gutters. */
export function usePageWidth(): number {
  const inherited = useContext(PageWidthContext)
  const frame = useFrameWidth()
  return inherited ?? pageOuterWidth(frame, 'column') - pageGutter * 2
}

/**
 * A grid that fills its column: at least `minColumns` across on a phone, and
 * as many more as fit once a cell would otherwise outgrow `minCell`.
 */
export function useGridCells(
  minCell: number,
  gap: number,
  minColumns = 1,
): { columns: number; cell: number } {
  return gridCells(usePageWidth(), minCell, gap, minColumns)
}

/**
 * Which of the wide layouts the screen has room for. Follows live resizing, and
 * the system sidebar as it opens and closes.
 */
export function useWidthClass(): { medium: boolean; expanded: boolean; rails: boolean } {
  const width = useRoomWidth()
  return {
    medium: width >= breakpoints.medium,
    expanded: width >= breakpoints.expanded,
    rails: width >= breakpoints.rails,
  }
}
