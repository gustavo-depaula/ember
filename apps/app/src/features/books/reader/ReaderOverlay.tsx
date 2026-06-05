import { MoreHorizontal, X } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, View } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from 'tamagui'

import { GlassSurface } from '@/components/GlassSurface'

const PILL_HEIGHT = 36
const ICON_SIZE = 36
const FADE_MS = 180

type Props = {
  title: string
  page: number
  pages: number
  chromeShown: boolean
  background: string
  color: string
  onClose: () => void
  onMenu: () => void
}

/**
 * Apple Books–style minimal chrome: two persistent Liquid Glass pills (book
 * title up top, page indicator at the bottom) that cross-fade their inner
 * content into action buttons (X / •••) when the user taps the page center.
 *
 * `pointer-events: box-none` on the container so taps fall through to the
 * WebView; only the pills capture touches.
 */
export function ReaderOverlay({
  title,
  page,
  pages,
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
      {/* Top pill */}
      <View pointerEvents="box-none" style={styles.row}>
        {chromeShown ? (
          <Animated.View
            key="top-close"
            entering={FadeIn.duration(FADE_MS)}
            exiting={FadeOut.duration(FADE_MS)}
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
                style={[styles.iconPill, { width: ICON_SIZE, height: ICON_SIZE }]}
              >
                <X size={18} color={color} />
              </GlassSurface>
            </Pressable>
          </Animated.View>
        ) : (
          <Animated.View
            key="top-title"
            entering={FadeIn.duration(FADE_MS)}
            exiting={FadeOut.duration(FADE_MS)}
            style={styles.titleWrap}
          >
            <GlassSurface
              isDark={isDark}
              tintColor={tintColor}
              isInteractive={false}
              style={styles.titlePill}
            >
              <Text
                fontFamily="$body"
                fontSize="$1"
                color={color}
                numberOfLines={1}
                style={styles.titleText}
              >
                {title}
              </Text>
            </GlassSurface>
          </Animated.View>
        )}
      </View>

      {/* Spacer */}
      <View pointerEvents="none" style={{ flex: 1 }} />

      {/* Bottom pill */}
      <View pointerEvents="box-none" style={styles.row}>
        {chromeShown ? (
          <Animated.View
            key="bottom-menu"
            entering={FadeIn.duration(FADE_MS)}
            exiting={FadeOut.duration(FADE_MS)}
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
                style={[styles.iconPill, { width: ICON_SIZE, height: ICON_SIZE }]}
              >
                <MoreHorizontal size={20} color={color} />
              </GlassSurface>
            </Pressable>
          </Animated.View>
        ) : (
          <Animated.View
            key="bottom-page"
            entering={FadeIn.duration(FADE_MS)}
            exiting={FadeOut.duration(FADE_MS)}
          >
            <GlassSurface
              isDark={isDark}
              tintColor={tintColor}
              isInteractive={false}
              style={styles.pagePill}
            >
              <Text fontFamily="$body" fontSize="$1" color={color} style={styles.pageText}>
                {t('books.pageOfTotal', {
                  defaultValue: 'Page {{page}} of {{pages}}',
                  page,
                  pages,
                })}
              </Text>
            </GlassSurface>
          </Animated.View>
        )}
      </View>
    </View>
  )
}

// The user's chosen theme bg is the reader's background. We need to pick the
// glass colorScheme so the surface stays legible — anything darker than mid
// gray is "dark."
function isDarkBackground(hex: string): boolean {
  const h = hex.replace('#', '')
  if (h.length !== 6) return false
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return r * 0.299 + g * 0.587 + b * 0.114 < 128
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', justifyContent: 'center' },
  titleWrap: { maxWidth: '80%' },
  titlePill: {
    height: PILL_HEIGHT,
    borderRadius: PILL_HEIGHT / 2,
    paddingHorizontal: 16,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  titleText: { textAlign: 'center' },
  iconPill: {
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
