import { BottomSheet, Group, Host, RNHostView } from '@expo/ui/swift-ui'
import {
  type PresentationDetent,
  presentationBackground,
  presentationDetents,
  presentationDragIndicator,
} from '@expo/ui/swift-ui/modifiers'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, ScrollView, StyleSheet, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, YStack } from 'tamagui'
import { create } from 'zustand'

import { Typography } from '@/components'
import type { TodayPlan } from '../useTodayPlan'
import { TodayChecklist } from './TodayChecklist'

// Opens part-way; drags up to the full screen for a long plan. Kept as stable
// values: the native selection compares them.
const detents: PresentationDetent[] = [{ fraction: 0.6 }, 'large']

// The sheet follows the native one step by step rather than by timing:
// iOS can't present while the last sheet is still sliding away, and a guess at
// how long that takes loses on a busy JS thread — the native side then replays
// the toggles it missed as a run of opens and closes. So "closing" lasts until
// the native sheet reports it gone, and a tap meanwhile opens it only then.
// Kept out of Today's state, so toggling it doesn't re-render the screen.
type Phase = 'closed' | 'open' | 'closing'
const useSheet = create<{ phase: Phase; reopen: boolean; detent: number; listShown: boolean }>(
  () => ({ phase: 'closed', reopen: false, detent: 0, listShown: false }),
)

export function openTodayPlan() {
  const { phase } = useSheet.getState()
  if (phase === 'closed') present()
  else if (phase === 'closing') useSheet.setState({ reopen: true })
}

function present() {
  useSheet.setState({ phase: 'open', reopen: false, detent: 0, listShown: false })
  // The native sheet presents only once its content has committed, so the
  // list — the costly part — follows the header a couple of frames later,
  // while the sheet is already rising.
  requestAnimationFrame(() =>
    requestAnimationFrame(() =>
      useSheet.setState((s) => (s.phase === 'open' ? { listShown: true } : s)),
    ),
  )
}

/** Starts the sheet sliding away — from a row, or the user's swipe. */
function closeSheet() {
  useSheet.setState((s) => (s.phase === 'open' ? { phase: 'closing', reopen: false } : s))
}

function dismissed() {
  const { reopen } = useSheet.getState()
  useSheet.setState({ phase: 'closed' })
  if (reopen) present()
}

/** The day's plan of life, drawn up over Today from the Plan of Life card. */
export function TodayPlanSheet({ plan }: { plan: TodayPlan }) {
  const phase = useSheet((s) => s.phase)
  const detent = useSheet((s) => s.detent)
  const listShown = useSheet((s) => s.listShown)
  const { t } = useTranslation()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { width, height } = useWindowDimensions()
  const expanded = detent === detents.length - 1
  // The native sheet hosts its content at a fixed size, so the content follows
  // the detent; the full one sits under the status bar.
  const contentHeight = expanded ? height - insets.top : height * 0.6

  // Leaving Today with the sheet mid-way would strand it "closing".
  useEffect(() => () => useSheet.setState({ phase: 'closed', reopen: false }), [])

  return (
    // On web a stand-in draws the sheet inside the Host, so there it spans the
    // screen and lets taps through to Today.
    <Host
      style={Platform.OS === 'web' ? StyleSheet.absoluteFill : { position: 'absolute', width }}
      pointerEvents={Platform.OS === 'web' ? 'box-none' : 'none'}
    >
      <BottomSheet
        isPresented={phase === 'open'}
        onIsPresentedChange={(presented) => !presented && closeSheet()}
        onDismiss={dismissed}
      >
        <Group
          modifiers={[
            presentationDetents(detents, {
              selection: detents[detent],
              onSelectionChange: (d) =>
                useSheet.setState({ detent: d === 'large' ? detents.length - 1 : 0 }),
            }),
            presentationDragIndicator('visible'),
            presentationBackground(theme.background.val),
          ]}
        >
          <RNHostView>
            <YStack paddingTop="$xl" gap="$md" height={contentHeight}>
              <Typography variant="screen-title" fontSize="$5" paddingHorizontal="$lg">
                {t('home.planOfLife')}
              </Typography>
              {/* Part-way up, a drag moves the sheet rather than the list: the
                  native sheet can't hand an RN scroll over to itself, so the
                  list only scrolls once the sheet is at the top. */}
              <ScrollView showsVerticalScrollIndicator={false} scrollEnabled={expanded}>
                <YStack paddingHorizontal="$lg" paddingBottom={insets.bottom + 48}>
                  {listShown && <TodayChecklist plan={plan} onLeave={closeSheet} />}
                </YStack>
              </ScrollView>
            </YStack>
          </RNHostView>
        </Group>
      </BottomSheet>
    </Host>
  )
}
