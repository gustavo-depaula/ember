import {
  type BottomSheetProps,
  BottomSheet as MaterialSheet,
} from '@expo/ui/community/bottom-sheet'
import { useRef } from 'react'
import { useWindowDimensions, View } from 'react-native'

/**
 * Android stand-in for `@expo/ui/community/bottom-sheet`; Metro swaps it in for
 * `platform === 'android'` (see `metro.config.js`). It irons out two places
 * where upstream's Material sheet parts ways with the iOS one.
 *
 * Height: Material's modal sheet knows two heights, half and full, so upstream
 * opens a sheet with one snap point at the full screen whatever the point says
 * — an action row then owns the whole display. A sheet that sizes to its
 * content can be any height, so the one snap point becomes the content's height.
 *
 * Closing: upstream calls `onClose` the moment `index` turns -1, in the same
 * commit. A screen that swaps one sheet for another (`setSheet('toc')` from the
 * reader's menu) then has the menu's `onClose` reset the state it just set, and
 * the second sheet never opens. `onClose` here reports only a dismissal the
 * owner did not ask for: a swipe, the scrim, Back.
 */
export function BottomSheet({
  snapPoints,
  index = 0,
  onClose,
  onDismiss,
  children,
  ...props
}: BottomSheetProps) {
  const { height } = useWindowDimensions()
  const askedToClose = useRef(index < 0)
  askedToClose.current = index < 0

  const only = snapPoints?.length === 1 ? snapPoints[0] : undefined
  const sheetHeight =
    typeof only === 'number'
      ? only
      : only?.endsWith('%')
        ? (height * Number.parseFloat(only)) / 100
        : undefined

  const sheet = {
    ...props,
    index,
    onClose: () => !askedToClose.current && onClose?.(),
    onDismiss: () => !askedToClose.current && onDismiss?.(),
  }

  if (sheetHeight === undefined) {
    return (
      <MaterialSheet snapPoints={snapPoints} {...sheet}>
        {children}
      </MaterialSheet>
    )
  }
  return (
    <MaterialSheet {...sheet}>
      <View style={{ height: sheetHeight }}>{children}</View>
    </MaterialSheet>
  )
}
