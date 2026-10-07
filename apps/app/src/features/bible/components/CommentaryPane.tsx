import { ChevronRight, X } from 'lucide-react-native'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  clamp,
  FadeIn,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, View, XStack, YStack } from 'tamagui'

import { PrayerSpinner, Typography } from '@/components'
import { useBottomClearance } from '@/components/tabAccessory'
import { useBibleStore } from '@/stores/bibleStore'

import {
  type CommentarySource,
  entriesForVerse,
  excerpt,
  readingMinutes,
  spanForVerse,
  spanLabel,
} from '../commentary'
import type { useChapterCommentary } from '../hooks'
import { CommentaryVoices } from './CommentaryVoices'

// About what fills the half page at the default size; more than that is read
// on the verse's own page.
const excerptBudget = 700

/**
 * The lower half of the divided page: what the commentator in hand says of the
 * verse marked above. The bar names the commentator and drags to give either
 * half more room; dragged to the foot, it closes.
 */
export function CommentaryPane({
  chapter,
  verse,
  commentary,
  initialHeight,
  maxHeight,
  onResize,
  onClose,
  onReadOn,
}: {
  chapter: number
  verse: number
  commentary: ReturnType<typeof useChapterCommentary>
  initialHeight: number
  maxHeight: number
  /** The height the reader left it at, to open at next time. */
  onResize: (height: number) => void
  onClose: () => void
  onReadOn: () => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const bottomClearance = useBottomClearance()
  const chosen = useBibleStore((s) => s.commentarySource)
  const setSource = useBibleStore((s) => s.setCommentarySource)
  const [choosing, setChoosing] = useState(false)

  const { sources, bySource, isLoading, error } = commentary
  // The commentator last chosen may not comment this book (the Catena outside
  // the Gospels): the first that does stands in, and the choice is kept.
  const source = sources.find((s) => s.id === chosen) ?? sources[0]
  const all = bySource[source.id]
  const entries = all ? entriesForVerse(all, verse) : []
  const span = all ? spanForVerse(all, verse) : undefined
  const voices = entries.flatMap((e) => e.voices)
  const shown = excerpt(voices, excerptBudget)
  const elsewhere = sources.filter(
    (s) => s.id !== source.id && entriesForVerse(bySource[s.id] ?? [], verse).length > 0,
  )

  const minHeight = 120
  const height = useSharedValue(initialHeight)
  const startHeight = useSharedValue(initialHeight)
  const drag = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY([-6, 6])
        .onStart(() => {
          startHeight.value = height.value
        })
        .onUpdate((e) => {
          height.value = clamp(startHeight.value - e.translationY, 0, maxHeight)
        })
        .onEnd(() => {
          if (height.value < minHeight) runOnJS(onClose)()
          else runOnJS(onResize)(height.value)
        }),
    [height, startHeight, maxHeight, onClose, onResize],
  )
  const heightStyle = useAnimatedStyle(() => ({ height: height.value }))

  function choose(next: CommentarySource) {
    setSource(next.id)
    setChoosing(false)
  }

  function renderBody() {
    if (choosing) {
      return (
        <YStack accessibilityRole="radiogroup">
          {sources.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => choose(s)}
              accessibilityRole="radio"
              accessibilityLabel={s.name}
              accessibilityState={{ selected: s.id === source.id }}
              aria-checked={s.id === source.id}
            >
              <YStack paddingVertical="$sm" minHeight={44} justifyContent="center">
                <Typography
                  variant="sacred-title"
                  textAlign="left"
                  tone={s.id === source.id ? 'default' : 'muted'}
                >
                  {s.name}
                  {s.id === source.id ? <Typography color="$accent"> ✠</Typography> : undefined}
                </Typography>
                <Typography variant="annotation">{t(`bible.commentary.about.${s.id}`)}</Typography>
              </YStack>
            </Pressable>
          ))}
        </YStack>
      )
    }
    if (error) {
      return <Typography variant="annotation">{t('common.couldntLoad')}</Typography>
    }
    if (isLoading) return <PrayerSpinner />
    if (voices.length === 0) {
      return (
        <YStack gap="$sm">
          <Typography variant="caption" fontSize="$3">
            {t('bible.commentary.silent', { source: source.name, verse })}
          </Typography>
          {elsewhere.length > 0 ? (
            <XStack gap="$md" flexWrap="wrap" alignItems="baseline">
              <Typography variant="annotation" fontSize="$2">
                {t('bible.commentary.elsewhere')}
              </Typography>
              {elsewhere.map((s) => (
                <Pressable
                  key={s.id}
                  onPress={() => choose(s)}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel={s.name}
                >
                  <Typography fontSize="$3" color="$colorBurgundy">
                    {s.name}
                  </Typography>
                </Pressable>
              ))}
            </XStack>
          ) : undefined}
        </YStack>
      )
    }
    return (
      <YStack gap="$md">
        <CommentaryVoices voices={shown.voices} />
        {shown.cut ? (
          <Pressable
            onPress={onReadOn}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={t('bible.commentary.readOn', { count: readingMinutes(entries) })}
          >
            <Typography variant="caption" fontSize="$3" color="$colorBurgundy">
              {t('bible.commentary.readOn', { count: readingMinutes(entries) })}
            </Typography>
          </Pressable>
        ) : undefined}
      </YStack>
    )
  }

  return (
    <Animated.View entering={FadeIn.duration(180)} style={heightStyle}>
      <YStack
        flex={1}
        backgroundColor="$background"
        borderTopWidth={1}
        borderTopColor="$borderColor"
      >
        <GestureDetector gesture={drag}>
          <YStack paddingHorizontal="$lg" paddingTop={6} paddingBottom="$xs">
            <View
              alignSelf="center"
              width={36}
              height={3}
              borderRadius={2}
              backgroundColor="$borderColor"
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            />
            <XStack alignItems="center" justifyContent="space-between" gap="$sm" minHeight={44}>
              <Pressable
                onPress={() => setChoosing((v) => !v)}
                disabled={sources.length < 2}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={t('a11y.chooseCommentator', { name: source.name })}
                accessibilityState={{ expanded: choosing }}
                aria-expanded={choosing}
              >
                <XStack alignItems="center" gap="$xs">
                  <Typography variant="section-title">
                    {choosing ? t('bible.commentary.commentators') : source.name}
                  </Typography>
                  {sources.length > 1 && !choosing ? (
                    <ChevronRight size={16} color={theme.colorSecondary.val} />
                  ) : undefined}
                </XStack>
              </Pressable>
              <XStack alignItems="center" gap="$md">
                <Typography variant="label" fontSize="$1" color="$colorBurgundy">
                  {`${chapter}:${span ? spanLabel(span) : verse}`}
                </Typography>
                <Pressable
                  onPress={onClose}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel={t('a11y.closeCommentary')}
                >
                  <X size={18} color={theme.colorSecondary.val} />
                </Pressable>
              </XStack>
            </XStack>
          </YStack>
        </GestureDetector>
        <ScrollView
          // A new verse opens at its beginning, not where the last was left.
          key={`${source.id}-${verse}-${choosing}`}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 4,
            // The tab bar floats over the foot of the pane; the last line clears it.
            paddingBottom: insets.bottom + bottomClearance + 24,
          }}
        >
          {renderBody()}
        </ScrollView>
      </YStack>
    </Animated.View>
  )
}
