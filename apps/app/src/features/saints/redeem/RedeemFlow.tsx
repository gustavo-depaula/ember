import { drawCard, type Grant } from '@ember/holy-cards'
import { useQuery } from '@tanstack/react-query'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native'
import Animated, {
  Easing,
  Extrapolation,
  FadeIn,
  interpolate,
  type SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, YStack } from 'tamagui'

import { InlineRetry } from '@/components'
import { ProseBlock } from '@/components/prayer'
import { Typography } from '@/components/typography'
import { loadBookChapterText } from '@/content/books'
import { useEventStore } from '@/db/events'
import { useToday } from '@/hooks/useToday'
import { lightTap, mediumTap, selectionTick, successBuzz } from '@/lib/haptics'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { SaintCard, SaintEncounterHeader, saintCardWidth } from '../components'
import { type SaintEntry, useSaintsCatalog } from '../data/catalog'
import { useRedeemHolyCard } from '../usePendingHolyCards'
import { useSaintCollect } from '../useSaintCollect'
import { Envelope, envelopeCard } from './Envelope'
import { envelopeDate, howWon, openBy } from './envelopeText'

const openDuration = 3200
const livesBook = 'pictorial-lives-of-saints'

/**
 * Redeeming one envelope, as two pages you swipe between — the sealed
 * envelope (with the choice of saint, when the act offers several), then the
 * saint's introduction and prayer — until Amen breaks the seal: the card rises
 * out and settles, and its Life waits beneath it.
 */
export function RedeemFlow({
  grant,
  next,
  onNext,
  onDone,
}: {
  grant: Grant
  /** Another envelope waiting, offered once this one is open. */
  next: Grant | undefined
  onNext: () => void
  onDone: () => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { width, height } = useWindowDimensions()
  const today = useToday()
  const { byId } = useSaintsCatalog()
  const [card, setCard] = useState<string | undefined>(() => {
    if (grant.drawn) return drawCard(grant, [...useEventStore.getState().holyCards.values()])
    return grant.choice.length === 1 ? grant.choice[0] : undefined
  })
  const [phase, setPhase] = useState<'reading' | 'opening' | 'card'>('reading')
  const [lifeRequested, setLifeRequested] = useState(false)
  const redeem = useRedeemHolyCard()
  const progress = useSharedValue(0)
  const open = useSharedValue(0)
  const lifeShown = useSharedValue(0)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  const saint = card ? byId[card] : undefined

  const onScroll = useAnimatedScrollHandler((e) => {
    progress.value = Math.min(Math.max(e.contentOffset.x / width, 0), 1)
  })
  const lifeStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - lifeShown.value) * height }],
  }))

  const amen = () => {
    if (!card) return
    redeem.mutate(
      { grant, card },
      {
        onSuccess: () => {
          void successBuzz()
          setPhase('opening')
          open.value = withTiming(1, { duration: openDuration, easing: Easing.inOut(Easing.cubic) })
          timers.current = [
            setTimeout(() => void mediumTap(), openDuration * 0.12),
            setTimeout(() => void lightTap(), openDuration * 0.5),
            setTimeout(() => setPhase('card'), openDuration + 150),
          ]
        },
      },
    )
  }

  const bg = theme.background?.val
  const envelopeWidth = Math.min(width * 0.68, 280)
  const choosing = !grant.drawn && grant.choice.length > 1
  const name = saint?.name ?? t('saints.redeem.unnamed')
  const date = envelopeDate(grant)
  const won = howWon(grant, t)
  const deadline = openBy(grant, today, t)
  const pageTop = insets.top + 56
  // The risen card rides from its place above the envelope onto the spot where
  // the full SaintCard appears, so the swap to it is invisible.
  const riseTop = height * 0.42
  const cardTop = insets.top + 24
  const inner = envelopeCard(envelopeWidth)
  const finalWidth = saintCardWidth(width)
  const exit = {
    dy: cardTop + finalWidth * 0.75 - (riseTop + inner.top - inner.rise + inner.height / 2),
    scale: finalWidth / inner.width,
  }
  const footer = next
    ? { label: t('saints.redeem.next'), a11y: t('a11y.nextEnvelope'), onPress: onNext }
    : { label: t('saints.redeem.done'), a11y: t('a11y.doneRedeeming'), onPress: onDone }

  return (
    <View style={[styles.fill, { backgroundColor: bg }]}>
      {phase !== 'card' && (
        <Animated.ScrollView
          horizontal
          pagingEnabled
          // The prayer is the chosen saint's: no swiping on until one is chosen.
          scrollEnabled={!!saint && phase === 'reading'}
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          style={styles.fill}
        >
          <Page width={width}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                styles.page,
                { paddingTop: choosing ? pageTop : insets.top + height * 0.14 },
              ]}
            >
              <YStack alignItems="center" gap="$xl">
                <Envelope
                  width={envelopeWidth}
                  name={name}
                  date={date}
                  tiltable
                  shimmer={phase === 'reading'}
                />
                <YStack gap="$sm" alignItems="center">
                  <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
                    {t('saints.redeem.waiting', { count: 1 })}
                  </Typography>
                  <Typography variant="whisper" textAlign="center">
                    {won}
                  </Typography>
                  {deadline && (
                    <Typography variant="annotation" textAlign="center">
                      {deadline}
                    </Typography>
                  )}
                </YStack>
                {choosing && (
                  <Chooser
                    title={t(
                      grant.door === 'starter'
                        ? 'saints.redeem.chooseStarter'
                        : 'saints.redeem.choose',
                    )}
                    options={grant.choice.flatMap((id) => (byId[id] ? [byId[id]] : []))}
                    chosen={card}
                    onChoose={(id) => {
                      void selectionTick()
                      setCard(id)
                    }}
                  />
                )}
                {saint && (
                  <Typography variant="annotation" textAlign="center">
                    {t('saints.redeem.swipeToPray')}
                  </Typography>
                )}
              </YStack>
            </ScrollView>
          </Page>

          {saint && (
            <Page width={width}>
              <Prayer
                saint={saint}
                top={pageTop}
                onAmen={amen}
                disabled={phase !== 'reading' || redeem.isPending}
                error={redeem.error?.message}
              />
            </Page>
          )}
        </Animated.ScrollView>
      )}

      {phase === 'reading' && saint && <Dots progress={progress} />}

      {phase !== 'reading' && saint?.cardImage && (
        <Animated.View
          entering={FadeIn.duration(250)}
          style={[styles.rising, { backgroundColor: bg, paddingTop: riseTop }]}
        >
          <Envelope
            width={envelopeWidth}
            name={name}
            date={date}
            image={saint.cardImage}
            open={open}
            exit={exit}
          />
        </Animated.View>
      )}

      {phase === 'card' && saint && (
        <Animated.View
          entering={FadeIn.duration(400)}
          style={[styles.final, { backgroundColor: bg, paddingTop: cardTop }]}
        >
          <SaintCard saint={saint} />
          <Typography variant="whisper" textAlign="center" paddingTop="$lg">
            {won}
          </Typography>
          {saint.lifeChapter && (
            <TextButton
              label={t('saints.redeem.readLife')}
              a11y={t('a11y.readLife', { name: saint.name })}
              onPress={() => {
                void lightTap()
                setLifeRequested(true)
                lifeShown.value = withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) })
              }}
            />
          )}
          <View style={[styles.footer, { bottom: insets.bottom + 24 }]}>
            <TextButton {...footer} />
          </View>
        </Animated.View>
      )}

      {lifeRequested && saint?.lifeChapter && (
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: bg }, lifeStyle]}>
          <Life
            chapter={saint.lifeChapter}
            top={pageTop}
            bottom={insets.bottom}
            onBack={() => {
              lifeShown.value = withTiming(0, { duration: 380, easing: Easing.in(Easing.cubic) })
            }}
          />
        </Animated.View>
      )}
    </View>
  )
}

function Page({ width, children }: { width: number; children: ReactNode }) {
  return <View style={{ width, paddingHorizontal: 28 }}>{children}</View>
}

// The saints an envelope offers, as a column of names: the chosen one in the
// accent, marked by a small ✠. Rank (for Mass) already orders the list.
function Chooser({
  title,
  options,
  chosen,
  onChoose,
}: {
  title: string
  options: SaintEntry[]
  chosen: string | undefined
  onChoose: (id: string) => void
}) {
  const { t } = useTranslation()
  return (
    <YStack alignSelf="stretch" gap="$xs" paddingTop="$sm">
      <Typography variant="label" textTransform="uppercase" letterSpacing={1.5} textAlign="center">
        {title}
      </Typography>
      {options.map((s) => {
        const selected = s.id === chosen
        return (
          <Pressable
            key={s.id}
            accessibilityRole="radio"
            accessibilityLabel={t('a11y.chooseSaint', { name: s.name })}
            accessibilityState={{ selected }}
            aria-selected={selected}
            onPress={() => onChoose(s.id)}
            style={styles.option}
          >
            <Typography
              variant="interface"
              fontSize="$4"
              textAlign="center"
              color={selected ? '$accent' : '$color'}
            >
              {selected ? `✠ ${s.name}` : s.name}
            </Typography>
          </Pressable>
        )
      })}
    </YStack>
  )
}

function Prayer({
  saint,
  top,
  onAmen,
  disabled,
  error,
}: {
  saint: SaintEntry
  top: number
  onAmen: () => void
  disabled: boolean
  error: string | undefined
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const collect = useSaintCollect(saint.proper)
  const lines = collect?.lines ?? (saint.prayerExcerpt ? [saint.prayerExcerpt] : [])
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.page, { paddingTop: top }]}
    >
      <SaintEncounterHeader saint={saint} align="left" />
      {saint.intro && (
        <Typography variant="interface" fontSize="$4" lineHeight={28}>
          {saint.intro}
        </Typography>
      )}
      <Typography
        variant="label"
        textTransform="uppercase"
        letterSpacing={1.5}
        paddingTop="$lg"
        paddingBottom="$sm"
      >
        {t('saints.redeem.letUsPray')}
      </Typography>
      {lines.map((line) => (
        <Typography key={line} variant="interface" fontSize="$4" lineHeight={28}>
          {line}
        </Typography>
      ))}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('a11y.amenOpen')}
        onPress={onAmen}
        disabled={disabled}
        style={[styles.amen, { borderColor: theme.accent?.val }]}
      >
        <Typography variant="sacred-title" fontSize={22} color="$accent">
          {t('saints.redeem.amen')}
        </Typography>
      </Pressable>
      {error && (
        <Typography variant="annotation" textAlign="center" paddingTop="$md">
          {error}
        </Typography>
      )}
    </ScrollView>
  )
}

// The saint's full chapter of the Pictorial Lives, its illustration and closing
// reflection included, in the content language (English where the book has no
// such translation, e.g. Latin).
function Life({
  chapter,
  top,
  bottom,
  onBack,
}: {
  chapter: string
  top: number
  bottom: number
  onBack: () => void
}) {
  const { t } = useTranslation()
  const lang = usePreferencesStore((s) => s.contentLanguage)
  const life = useQuery({
    queryKey: ['saint-life', chapter, lang],
    queryFn: async () =>
      (await loadBookChapterText(livesBook, chapter, lang)) ??
      (await loadBookChapterText(livesBook, chapter, 'en-US')) ??
      null,
    staleTime: Number.POSITIVE_INFINITY,
  })
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.lifePage, { paddingTop: top, paddingBottom: bottom + 80 }]}
    >
      <View style={styles.back}>
        <TextButton
          label={t('saints.redeem.backToCard')}
          a11y={t('a11y.backToCard')}
          onPress={onBack}
        />
      </View>
      {life.isError && <InlineRetry onRetry={() => void life.refetch()} />}
      {life.data && <ProseBlock text={{ primary: life.data }} />}
    </ScrollView>
  )
}

function TextButton({
  label,
  a11y,
  onPress,
}: {
  label: string
  a11y: string
  onPress: () => void
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={a11y} hitSlop={12} onPress={onPress}>
      <Typography
        variant="label"
        textTransform="uppercase"
        letterSpacing={1.5}
        paddingTop="$lg"
        color="$accent"
        textAlign="center"
      >
        {label}
      </Typography>
    </Pressable>
  )
}

function Dots({ progress }: { progress: SharedValue<number> }) {
  return (
    <View
      style={styles.dots}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Dot i={0} progress={progress} />
      <Dot i={1} progress={progress} />
    </View>
  )
}

function Dot({ i, progress }: { i: number; progress: SharedValue<number> }) {
  const theme = useTheme()
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(Math.abs(progress.value - i), [0, 1], [1, 0.25], Extrapolation.CLAMP),
  }))
  return <Animated.View style={[styles.dot, { backgroundColor: theme.color?.val }, style]} />
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  page: { paddingBottom: 160 },
  rising: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center' },
  final: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center' },
  lifePage: { paddingHorizontal: 28 },
  back: { alignItems: 'flex-start', paddingBottom: 16 },
  option: { minHeight: 44, justifyContent: 'center' },
  amen: {
    alignSelf: 'center',
    marginTop: 32,
    paddingHorizontal: 36,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 999,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  footer: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
})
