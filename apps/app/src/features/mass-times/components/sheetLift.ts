import { createContext, useContext } from 'react'

/**
 * Raises the sheet to its full height. A form opening inside the sheet calls it
 * before its field can take focus: the pane scrolls a focused field clear of the
 * keyboard by where it sits on screen, which is only true once the sheet is up.
 */
export const SheetLiftContext = createContext<() => void>(() => {})

export function useSheetLift() {
  return useContext(SheetLiftContext)
}
