import { useIsFocused } from 'expo-router'
import { useEffect, useMemo, useRef } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { YStack } from 'tamagui'

import { createSheet, NativeSheet } from '@/components/NativeSheet'

import { PaneBar, PaneKinds, paneFraction, type VersePaneProps } from './VersePaneContent'

/**
 * Everything on a verse, on a native sheet that leaves the chapter behind it
 * in use: it opens part-way, the page above it still scrolls and takes taps,
 * and drawn up it covers the page for a long read. Swiped down, it closes.
 */
export function VersePane({ verse, onClose, ...content }: VersePaneProps) {
  const insets = useSafeAreaInsets()
  const sheet = useMemo(createSheet, [])
  // A sheet stands over the whole window, so it steps aside for a page the
  // reader opens from it (an article, a homily) and returns with the reader.
  const focused = useIsFocused()
  const shown = verse !== undefined && focused
  // The verse let go of stays on the sheet while it slides away.
  const held = useRef(verse)
  if (verse !== undefined) held.current = verse
  const showing = held.current

  useEffect(() => {
    if (shown) sheet.open()
    else sheet.close()
  }, [shown, sheet])

  // Swiped away by hand: the verse is let go of. Not so when the reader
  // closed it, or when it is on its way down only to come up again.
  const phase = sheet.store((s) => s.phase)
  // biome-ignore lint/correctness/useExhaustiveDependencies: the sheet's phase is the trigger
  useEffect(() => {
    if (phase === 'closing' && shown && !sheet.store.getState().reopen) onClose()
  }, [phase])

  return (
    <NativeSheet sheet={sheet} fraction={paneFraction} letsThrough>
      {({ height }) => (
        <YStack height={height} paddingTop="$md">
          {showing === undefined ? undefined : (
            <>
              <YStack paddingHorizontal="$lg">
                <PaneBar {...content} verse={showing} onClose={onClose} />
              </YStack>
              <PaneKinds {...content} verse={showing} bottomPadding={insets.bottom + 24} />
            </>
          )}
        </YStack>
      )}
    </NativeSheet>
  )
}
