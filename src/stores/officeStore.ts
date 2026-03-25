import { format } from 'date-fns'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

type OfficeStoreState = {
	selectedDate: string
	setSelectedDate: (date: string) => void
}

export const useOfficeStore = create<OfficeStoreState>()(
	immer((set) => ({
		selectedDate: format(new Date(), 'yyyy-MM-dd'),

		setSelectedDate: (date) => {
			set((state) => {
				state.selectedDate = date
			})
		},
	})),
)
