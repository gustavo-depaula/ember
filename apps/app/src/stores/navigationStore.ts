import { format } from 'date-fns'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

type NavigationState = {
  selectedDate: string
  setSelectedDate: (date: string) => void
}

export const useNavigationStore = create<NavigationState>()(
  immer((set) => ({
    selectedDate: format(new Date(), 'yyyy-MM-dd'),

    setSelectedDate: (date) => {
      set((state) => {
        state.selectedDate = date
      })
    },
  })),
)
