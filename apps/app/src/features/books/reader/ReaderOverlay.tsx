import { ArrowLeft, MoreHorizontal, X } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, View } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from 'tamagui'

import { GlassSurface } from '@/components/GlassSurface'

// Apple HIG floor is 44pt; Apple Books's close X looks ~48pt — match that.
const ACTION_SIZE = 48
const FADE_MS = 180
const SIDE_PADDING = 16

type Props = {
  title: string
  chapter: number
  chapters: number
  pagesLeft: number
  chromeShown: boolean
  /** Show a back-arrow pill at top-left when the reader followed a cross-ref. */
  canGoBack: boolean
  isDark: boolean
  color: string
  onClose: () => void
  onMenu: () => void
  onBack: () => void
}

export function ReaderOverlay({
  title,
  chapter,
  chapters,
  pagesLeft,
  chromeShown,
  canGoBack,
  isDark,
  color,
  onClose,
  onMenu,
  onBack,
}: Props) {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const tintColor = isDark ? 'rgba(28,26,24,0.6)' : 'rgba(244,240,234,0.7)'

  return (
    // pointer-events: box-none — taps fall through to the WebView except on
    // the action buttons themselves.
    <View
      pointerEvents="box-none"
      style={[
        StyleSheet.absoluteFill,
        { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 12 },
      ]}
    >
      {canGoBack ? (
        <View
          pointerEvents="box-none"
          style={[styles.backWrap, { paddingLeft: SIDE_PADDING, top: insets.top + 8 }]}
        >
          <Pressable
            onPress={onBack}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('books.backToPrevious', {
              defaultValue: 'Back to previous location',
            })}
          >
            <GlassSurface
              isDark={isDark}
              tintColor={tintColor}
              style={[styles.actionPill, { width: ACTION_SIZE, height: ACTION_SIZE }]}
            >
              <ArrowLeft size={22} color={color} />
            </GlassSurface>
          </Pressable>
        </View>
      ) : null}

      {chromeShown ? (
        <ChromeRow key="top-close" align="right">
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
        </ChromeRow>
      ) : (
        <ChromeRow key="top-title" align="center" pointerEvents="none">
          <Text
            fontFamily="$body"
            fontSize="$1"
            color={color}
            numberOfLines={1}
            style={[styles.text, { opacity: 0.55, maxWidth: '80%' }]}
          >
            {title}
          </Text>
        </ChromeRow>
      )}

      <View pointerEvents="none" style={{ flex: 1 }} />

      {chromeShown ? (
        <ChromeRow key="bottom-menu" align="right">
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
        </ChromeRow>
      ) : (
        <ChromeRow key="bottom-page" align="center" pointerEvents="none">
          <View style={{ alignItems: 'center' }}>
            <Text
              fontFamily="$body"
              fontSize="$1"
              color={color}
              style={[styles.text, { opacity: 0.55 }]}
            >
              {t('books.chapterOfTotal', {
                defaultValue: 'Chapter {{chapter}} of {{chapters}}',
                chapter,
                chapters,
              })}
            </Text>
            {pagesLeft > 0 ? (
              <Text
                fontFamily="$body"
                fontSize="$1"
                color={color}
                style={[styles.text, { opacity: 0.4, marginTop: 2 }]}
              >
                {t('books.pagesLeftInChapter', {
                  defaultValue: '{{count}} pages left in chapter',
                  count: pagesLeft,
                })}
              </Text>
            ) : null}
          </View>
        </ChromeRow>
      )}
    </View>
  )
}

function ChromeRow({
  align,
  pointerEvents = 'box-none',
  children,
}: {
  align: 'center' | 'right'
  pointerEvents?: 'box-none' | 'none'
  children: React.ReactNode
}) {
  return (
    <Animated.View
      pointerEvents={pointerEvents}
      entering={FadeIn.duration(FADE_MS)}
      exiting={FadeOut.duration(FADE_MS)}
      style={[
        align === 'right' ? styles.right : styles.center,
        align === 'right' && { paddingRight: SIDE_PADDING },
      ]}
    >
      {children}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  right: { alignItems: 'flex-end', justifyContent: 'center' },
  text: { textAlign: 'center', letterSpacing: 0.3 },
  backWrap: { position: 'absolute', left: 0 },
  actionPill: {
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
})
