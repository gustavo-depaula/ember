import { format } from 'date-fns'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

type PracticeStoreState = {
  selectedDate: string
  setSelectedDate: (date: string) => void
}

export const usePracticeStore = create<PracticeStoreState>()(
  immer((set) => ({
    selectedDate: format(new Date(), 'yyyy-MM-dd'),

    setSelectedDate: (date) => {
      set((state) => {
        state.selectedDate = date
      })
    },
  })),
)
