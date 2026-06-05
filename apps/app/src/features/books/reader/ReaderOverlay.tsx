import { MoreHorizontal, X } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, View } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from 'tamagui'

import { GlassSurface } from '@/components/GlassSurface'

const PILL_HEIGHT = 36
// Apple HIG floor is 44pt; Apple Books's close X looks ~48pt — match that.
const ACTION_SIZE = 48
const FADE_MS = 180
// Side padding for both default-state pills (centered) and action buttons
// (right-aligned). 16pt clears the safe area cleanly without crowding.
const SIDE_PADDING = 16

type Props = {
  title: string
  /** 1-indexed chapter the reader is currently on. */
  chapter: number
  /** Total chapter count (= TOC leaf count). */
  chapters: number
  chromeShown: boolean
  background: string
  color: string
  onClose: () => void
  onMenu: () => void
}

/**
 * Apple Books–style minimal chrome. Default state: two persistent Liquid
 * Glass pills, CENTERED — book title (top) and "Page X of Y" (bottom). On
 * center-tap the chrome mode shows action buttons RIGHT-aligned (top: close
 * X, bottom: menu •••) at ~48pt diameter, matching Apple Books's Reading
 * Now overlay.
 *
 * `pointer-events: box-none` on the container so taps fall through to the
 * WebView; only the pills capture touches.
 */
export function ReaderOverlay({
  title,
  chapter,
  chapters,
  chromeShown,
  background,
  color,
  onClose,
  onMenu,
}: Props) {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const isDark = isDarkBackground(background)
  const tintColor = isDark ? 'rgba(28,26,24,0.6)' : 'rgba(244,240,234,0.7)'

  return (
    <View
      pointerEvents="box-none"
      style={[
        StyleSheet.absoluteFill,
        { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 12 },
      ]}
    >
      {/* Top: centered title pill OR right-aligned close button */}
      {chromeShown ? (
        <Animated.View
          key="top-close"
          pointerEvents="box-none"
          entering={FadeIn.duration(FADE_MS)}
          exiting={FadeOut.duration(FADE_MS)}
          style={[styles.rightRow, { paddingRight: SIDE_PADDING }]}
        >
          <Pressable
            onPress={onClose}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.closeBook', { defaultValue: 'Close book' })}
          >
            <GlassSurface
              isDark={isDark}
              tintColor={tintColor}
              style={[styles.actionPill, { width: ACTION_SIZE, height: ACTION_SIZE }]}
            >
              <X size={22} color={color} />
            </GlassSurface>
          </Pressable>
        </Animated.View>
      ) : (
        <Animated.View
          key="top-title"
          pointerEvents="none"
          entering={FadeIn.duration(FADE_MS)}
          exiting={FadeOut.duration(FADE_MS)}
          style={styles.centerRow}
        >
          <Text
            fontFamily="$body"
            fontSize="$1"
            color={color}
            numberOfLines={1}
            style={[styles.titleText, { opacity: 0.55, maxWidth: '80%' }]}
          >
            {title}
          </Text>
        </Animated.View>
      )}

      {/* Spacer */}
      <View pointerEvents="none" style={{ flex: 1 }} />

      {/* Bottom: centered page pill OR right-aligned menu button */}
      {chromeShown ? (
        <Animated.View
          key="bottom-menu"
          pointerEvents="box-none"
          entering={FadeIn.duration(FADE_MS)}
          exiting={FadeOut.duration(FADE_MS)}
          style={[styles.rightRow, { paddingRight: SIDE_PADDING }]}
        >
          <Pressable
            onPress={onMenu}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('books.menu', { defaultValue: 'Menu' })}
          >
            <GlassSurface
              isDark={isDark}
              tintColor={tintColor}
              style={[styles.actionPill, { width: ACTION_SIZE, height: ACTION_SIZE }]}
            >
              <MoreHorizontal size={24} color={color} />
            </GlassSurface>
          </Pressable>
        </Animated.View>
      ) : (
        <Animated.View
          key="bottom-page"
          pointerEvents="none"
          entering={FadeIn.duration(FADE_MS)}
          exiting={FadeOut.duration(FADE_MS)}
          style={styles.centerRow}
        >
          <Text
            fontFamily="$body"
            fontSize="$1"
            color={color}
            style={[styles.pageText, { opacity: 0.55 }]}
          >
            {t('books.chapterOfTotal', {
              defaultValue: 'Chapter {{chapter}} of {{chapters}}',
              chapter,
              chapters,
            })}
          </Text>
        </Animated.View>
      )}
    </View>
  )
}

// The user's chosen theme bg is the reader's background. We pick the glass
// colorScheme so the surface stays legible — anything darker than mid gray
// is "dark."
function isDarkBackground(hex: string): boolean {
  const h = hex.replace('#', '')
  if (h.length !== 6) return false
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return r * 0.299 + g * 0.587 + b * 0.114 < 128
}

const styles = StyleSheet.create({
  centerRow: { alignItems: 'center', justifyContent: 'center' },
  rightRow: { alignItems: 'flex-end', justifyContent: 'center' },
  titleWrap: { maxWidth: '80%' },
  titlePill: {
    height: PILL_HEIGHT,
    borderRadius: PILL_HEIGHT / 2,
    paddingHorizontal: 16,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  titleText: { textAlign: 'center' },
  actionPill: {
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pagePill: {
    height: PILL_HEIGHT,
    borderRadius: PILL_HEIGHT / 2,
    paddingHorizontal: 14,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pageText: { letterSpacing: 0.3 },
})
