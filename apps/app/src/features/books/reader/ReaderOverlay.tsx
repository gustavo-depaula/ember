import { ArrowLeft, MoreHorizontal, X } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, View } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from 'tamagui'

import { GlassSurface } from '@/components/GlassSurface'
import { ChapterScrubber } from './ChapterScrubber'

// Apple HIG floor is 44pt; Apple Books's close X looks ~48pt — match that.
const ACTION_SIZE = 48
const FADE_MS = 180
const SIDE_PADDING = 16

type Props = {
  title: string
  chapter: number
  chapters: number
  pagesLeft: number
  /** Rounded minutes left in chapter, derived from recent page-turn pace. */
  minutesLeft?: number
  /** Current chapter-fraction 0..1, drives the chrome scrubber thumb. */
  fraction: number
  /** Foliate's total page count for the current chapter (sentinel-inclusive). */
  pages: number
  /** Foliate's 1-indexed current page within the chapter. */
  page: number
  /** Bookmark fractions in the current chapter — surfaced as ticks on the scrubber. */
  bookmarkFractions?: number[]
  /** Highlight markers in the current chapter — colored dots on the scrubber. */
  highlightMarkers?: { id: string; fraction: number; color: string }[]
  chromeShown: boolean
  /** Show a back-arrow pill at top-left when the reader followed a cross-ref. */
  canGoBack: boolean
  isDark: boolean
  color: string
  onClose: () => void
  onMenu: () => void
  onBack: () => void
  /** Called continuously during a scrubber drag. */
  onScrub: (fraction: number) => void
  /** Called once when the user releases the scrubber. */
  onScrubEnd: (fraction: number) => void
}

export function ReaderOverlay({
  title,
  chapter,
  chapters,
  pagesLeft,
  minutesLeft,
  fraction,
  pages,
  page,
  bookmarkFractions,
  highlightMarkers,
  chromeShown,
  canGoBack,
  isDark,
  color,
  onClose,
  onMenu,
  onBack,
  onScrub,
  onScrubEnd,
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
        <Animated.View
          key="bottom-chrome"
          entering={FadeIn.duration(FADE_MS)}
          exiting={FadeOut.duration(FADE_MS)}
          style={[styles.bottomRow, { paddingHorizontal: SIDE_PADDING }]}
        >
          {pages > 3 ? (
            <ChapterScrubber
              fraction={fraction}
              pages={pages}
              page={page}
              color={color}
              isDark={isDark}
              bookmarkFractions={bookmarkFractions}
              highlightMarkers={highlightMarkers}
              onScrub={onScrub}
              onScrubEnd={onScrubEnd}
            />
          ) : (
            <View style={{ flex: 1 }} pointerEvents="none" />
          )}
          <Pressable
            onPress={onMenu}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('books.menu', { defaultValue: 'Menu' })}
            style={{ marginLeft: 10 }}
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
              <PagesLeftLine pagesLeft={pagesLeft} minutesLeft={minutesLeft} color={color} />
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

function PagesLeftLine({
  pagesLeft,
  minutesLeft,
  color,
}: {
  pagesLeft: number
  minutesLeft?: number
  color: string
}) {
  const { t } = useTranslation()
  const pagesText = t('books.pagesLeftInChapter', {
    defaultValue: '{{count}} pages left in chapter',
    count: pagesLeft,
  })
  const minutesText =
    minutesLeft !== undefined
      ? t('books.minutesLeft', { defaultValue: '~{{count}} min', count: minutesLeft })
      : undefined
  return (
    <Text
      fontFamily="$body"
      fontSize="$1"
      color={color}
      style={[styles.text, { opacity: 0.4, marginTop: 2 }]}
    >
      {minutesText ? `${pagesText} · ${minutesText}` : pagesText}
    </Text>
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
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
})
