import { Highlighter } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { GlassSurface } from '@/components/GlassSurface'
import { HIGHLIGHT_COLORS } from './highlightColors'

const PILL_HEIGHT = 44
const TOOLBAR_WIDTH = 110

type Props = {
  /** Bounding rect of the live selection, in WebView-screen coords. */
  rect: { x: number; y: number; width: number; height: number } | undefined
  isDark: boolean
  onHighlightYellow: () => void
}

/**
 * Floating glass toolbar that pops above (or below, if near the top) the
 * current text selection. Phase 1: single yellow swatch. Phase 2 adds the
 * full color palette + copy / note actions.
 */
export function ReaderSelectionToolbar({ rect, isDark, onHighlightYellow }: Props) {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const { width: screenWidth } = useWindowDimensions()
  if (!rect) return null

  const tintColor = isDark ? 'rgba(28,26,24,0.78)' : 'rgba(244,240,234,0.85)'
  // Prefer above the selection; flip below when there's not enough room above
  // the selection once we account for the safe-area inset (notch).
  const above = rect.y > insets.top + PILL_HEIGHT + 8
  const top = above ? rect.y - PILL_HEIGHT - 8 : rect.y + rect.height + 8
  // Centred on the selection, then clamped to both edges to keep the pill on screen.
  const idealLeft = rect.x + rect.width / 2 - TOOLBAR_WIDTH / 2
  const left = Math.max(8, Math.min(screenWidth - TOOLBAR_WIDTH - 8, idealLeft))

  return (
    <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, { left: 0, top: 0 }]}>
      <Animated.View
        entering={FadeIn.duration(120)}
        exiting={FadeOut.duration(120)}
        style={[styles.wrap, { top, left }]}
      >
        <GlassSurface isDark={isDark} tintColor={tintColor} style={styles.pill}>
          <Pressable
            onPress={onHighlightYellow}
            accessibilityRole="button"
            accessibilityLabel={t('books.highlightYellow', { defaultValue: 'Highlight yellow' })}
            style={styles.action}
            hitSlop={6}
          >
            <View style={[styles.swatch, { backgroundColor: HIGHLIGHT_COLORS.yellow.swatch }]} />
            <Highlighter size={18} color={isDark ? '#EDE4D8' : '#1a1815'} />
          </Pressable>
        </GlassSurface>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', width: TOOLBAR_WIDTH },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: PILL_HEIGHT,
    paddingHorizontal: 14,
    borderRadius: 9999,
    overflow: 'hidden',
    gap: 10,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  swatch: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
})
