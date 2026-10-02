import { BottomSheet, Group, Host, RNHostView } from '@expo/ui/swift-ui'
import {
  ignoreSafeArea,
  interactiveDismissDisabled,
  type PresentationDetent,
  presentationBackground,
  presentationBackgroundInteraction,
  presentationDetents,
  presentationDragIndicator,
} from '@expo/ui/swift-ui/modifiers'
import type { ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTheme } from 'tamagui'

/** How far up the sheet rides: just its search field, half the screen, or all of it. */
export type SheetDetent = 'peek' | 'half' | 'full'

// Stable detent identities (the native selection compares by value — keep them steady). The peek is a
// fixed height sized to the search bar (grabber + search row + home-indicator inset), so minimized the
// sheet shrinks to just the search field, Apple-Maps style — not a fraction that leaves content peeking.
const detents: Record<SheetDetent, PresentationDetent> = {
  peek: { height: 96 },
  half: { fraction: 0.55 },
  full: 'large',
}
const detentList = Object.values(detents)

// The native side hands back a detent equal by value, not the object above.
function detentName(detent: PresentationDetent): SheetDetent {
  if (detent === 'large') return 'full'
  return typeof detent === 'object' && 'height' in detent ? 'peek' : 'half'
}

// Paper with the map faintly behind it: the default sheet glass lets the map's colours wash through
// the text, a solid sheet loses the sense of the map underneath.
const sheetOpacity = 'CC'

/**
 * A live map with a sheet that never leaves riding over it. Everything lives in ONE SwiftUI `Host`:
 * the map is the Host's background content (so `presentationBackgroundInteraction` keeps it LIVE
 * behind the sheet), and the native `BottomSheet` rides over it.
 */
export function MapSheet({
  map,
  detent,
  onDetent,
  children,
}: {
  map: ReactNode
  detent: SheetDetent
  onDetent: (detent: SheetDetent) => void
  children: ReactNode
}) {
  const theme = useTheme()

  return (
    // ignoreSafeArea="all" so the hosted map bleeds edge to edge (through the notch + home indicator)
    // instead of the SwiftUI host insetting it and leaving black bars.
    <Host style={StyleSheet.absoluteFill} ignoreSafeArea="all">
      <RNHostView>
        <View style={styles.fill}>{map}</View>
      </RNHostView>

      <BottomSheet isPresented onIsPresentedChange={noop}>
        <Group
          modifiers={[
            presentationDetents(detentList, {
              selection: detents[detent],
              onSelectionChange: (selected) => onDetent(detentName(selected)),
            }),
            presentationBackground(`${theme.background?.val ?? '#FFFFFF'}${sheetOpacity}`),
            presentationBackgroundInteraction('enabled'),
            interactiveDismissDisabled(true),
            presentationDragIndicator('visible'),
            // Let the content fill through the home-indicator safe area instead of stopping above it
            // and leaving a bare strip of sheet material (the "footer" seam).
            ignoreSafeArea({ edges: 'bottom' }),
          ]}
        >
          <RNHostView>
            <View style={styles.fill}>{children}</View>
          </RNHostView>
        </Group>
      </BottomSheet>
    </Host>
  )
}

function noop() {}

const styles = StyleSheet.create({
  fill: { flex: 1 },
})
