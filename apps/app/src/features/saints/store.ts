import { create } from 'zustand'

// The gallery and the full-screen pager must agree on swipe order: whatever
// order the wall is currently showing (a grouping/filter lens reorders it) is
// the order you swipe through after tapping a card. The wall publishes its flat
// display order here just before navigating; the pager reads it. Falls back to
// calendar order when empty (e.g. a cold deep-link straight into the pager).
type SaintsViewState = {
  orderedIds: string[]
  setOrderedIds: (ids: string[]) => void
}

export const useSaintsViewStore = create<SaintsViewState>((set) => ({
  orderedIds: [],
  setOrderedIds: (orderedIds) => set({ orderedIds }),
}))
