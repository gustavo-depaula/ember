import { addDays, parseISO } from 'date-fns'
import { Image, type ImageSource } from 'expo-image'
import { useRouter } from 'expo-router'
import { type ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Animated, { FadeIn, useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { Text, View, XStack, YStack } from 'tamagui'

import { AnimatedPressable, Typography } from '@/components'
import { useSlotsForPractice, useUpdateSlot } from '@/features/plan-of-life/hooks'
import { PracticePlanEditor, usePracticePlan } from '@/features/practices/components/PracticePlan'
import { practiceHref } from '@/features/practices/practiceHref'
import {
  Beads,
  cardFrame,
  cardInk,
  GlyphIcon,
  type TodayCard,
  useHeldCards,
  useSaintsCatalog,
} from '@/features/saints'
import { useToday } from '@/hooks/useToday'
import { localizeContent } from '@/lib/i18n'
import { formatLocalized } from '@/lib/i18n/dateLocale'

import type { ProgramEvent } from '../programEvents'
import { cardFace, useProgramCard } from './eventCard'

// Room around the panel for its shadow and its nib, inside the clip that
// opens and closes it.
const room = { top: 10, side: 8, bottom: 16 }

/**
 * The panel under the events strip: it opens to its content's height and
 * closes to nothing, in the page, pointing at the medallion it belongs to.
 */
export function EventPanel({
  open,
  nib,
  children,
}: {
  /** What is open, so a change of it fades the new content in. */
  open: string | undefined
  /** Where the nib points, from the panel's left edge. */
  nib: number
  children: ReactNode
}) {
  const [height, setHeight] = useState(0)
  const [width, setWidth] = useState(0)
  const target = open === undefined ? 0 : height
  // Read from the render's own value rather than a shared one: under
  // NativeTabs a reattached screen resets shared values to where they began,
  // which would leave the panel shut.
  const clip = useAnimatedStyle(() => ({ height: withTiming(target, { duration: 260 }) }), [target])
  const nibLeft = Math.max(14, Math.min(nib - 7, width - 28))

  return (
    <Animated.View style={[{ overflow: 'hidden', marginHorizontal: -room.side }, clip]}>
      <View
        position="absolute"
        top={0}
        left={0}
        right={0}
        paddingTop={room.top}
        paddingHorizontal={room.side}
        paddingBottom={room.bottom}
        onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
      >
        <View
          backgroundColor="$backgroundSurface"
          borderRadius={16}
          padding="$md"
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 4 }}
          shadowOpacity={0.1}
          shadowRadius={10}
          onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        >
          <View
            position="absolute"
            top={-6}
            left={nibLeft}
            width={14}
            height={14}
            backgroundColor="$backgroundSurface"
            transform={[{ rotate: '45deg' }]}
          />
          {open !== undefined && (
            <Animated.View key={open} entering={FadeIn.duration(200)}>
              {children}
            </Animated.View>
          )}
        </View>
      </View>
    </Animated.View>
  )
}

const actGlyph = { mass: 'chalice', office: 'book', prayedDay: 'day' } as const

/**
 * Today's holy cards as a ledger: a line per card, what to do on the left and
 * the card it gives on the right. A card won opens its envelope; one still to
 * win opens its page, which says more of the ways to it.
 */
export function TodayPanel({ cards }: { cards: TodayCard[] }) {
  const { t } = useTranslation()
  const router = useRouter()
  const today = useToday()
  const { byId } = useSaintsCatalog()
  const held = useHeldCards()

  return (
    <YStack>
      <XStack alignItems="baseline" justifyContent="space-between" paddingBottom={4}>
        <Typography
          variant="label"
          fontSize={11}
          letterSpacing={2}
          textTransform="uppercase"
          color="$colorBurgundy"
        >
          {t('home.events.cardsToday')}
        </Typography>
        <Typography variant="annotation" fontStyle="italic">
          {formatLocalized(today, t('program.dayDateFormat'))}
        </Typography>
      </XStack>
      {cards.map((card) => {
        const { grant, acts, state } = card
        const saints = grant.drawn ? [] : grant.choice.map((id) => byId[id]).filter(Boolean)
        const names = saints.map((s) => s.name)
        const title = grant.drawn
          ? t('home.events.drawn')
          : names.length > 0
            ? names.reduce((a, b) => t('home.events.or', { a, b }))
            : t('saints.redeem.unnamed')
        const note = (() => {
          if (state === 'won') return `✦ ${t('home.events.won')}`
          if (state === 'redeemed') return `✦ ${t('home.events.redeemed')}`
          if (grant.drawn) return t('home.events.drawnNote', { count: grant.choice.length })
          if (acts.includes('office') && acts.includes('prayedDay'))
            return t('saints.receive.prayedDay')
          if (acts[0] === 'prayedDay') return t('home.events.prayedDayNote')
          return undefined
        })()
        const first = saints[0]
        const done = state !== 'open'
        return (
          <AnimatedPressable
            key={grant.id}
            accessibilityRole="link"
            accessibilityLabel={`${t(`home.events.act.${acts[0]}`)}, ${title}`}
            onPress={() => {
              if (state === 'won')
                return router.push({ pathname: '/redeem', params: { grant: grant.id } })
              if (first)
                return router.push({ pathname: '/saints/[index]', params: { index: first.id } })
              router.push('/saints')
            }}
          >
            <XStack
              gap="$md"
              alignItems="center"
              paddingVertical={10}
              borderTopWidth={1}
              borderTopColor="$borderColor"
            >
              <GlyphIcon glyph={actGlyph[acts[0]]} />
              <YStack flex={1}>
                <Typography
                  variant="label"
                  fontSize={10}
                  letterSpacing={1.5}
                  textTransform="uppercase"
                  tone="muted"
                >
                  {t(`home.events.act.${acts[0]}`)}
                </Typography>
                <Typography
                  variant="sacred-title"
                  textAlign="left"
                  fontSize={18}
                  lineHeight={22}
                  tone={done ? 'muted' : 'default'}
                >
                  {title}
                </Typography>
                {note && (
                  <Typography
                    variant="annotation"
                    fontStyle={done ? 'normal' : 'italic'}
                    color={done ? '$accentHover' : undefined}
                  >
                    {note}
                  </Typography>
                )}
              </YStack>
              <CardThumb
                face={first && cardFace(first, held.has(first.id))}
                width={42}
                faded={state === 'redeemed'}
              />
            </XStack>
          </AnimatedPressable>
        )
      })}
    </YStack>
  )
}

// A holy card at thumbnail size: a face, or the illuminated back for one not yet known.
function CardThumb({
  face,
  width,
  faded = false,
}: {
  face: ImageSource | undefined
  width: number
  faded?: boolean
}) {
  return (
    <View
      width={width}
      height={width * 1.5}
      borderRadius={Math.max(4, width / 13)}
      overflow="hidden"
      alignItems="center"
      justifyContent="center"
      opacity={faded ? 0.55 : 1}
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 3 }}
      shadowOpacity={0.25}
      shadowRadius={6}
    >
      <Image
        source={face ?? cardFrame}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
        contentFit="cover"
      />
      {!face && (
        <Text fontFamily="$heading" fontSize={width * 0.34} color={cardInk.name}>
          ✠
        </Text>
      )}
    </View>
  )
}

function Pill({ label, solid, onPress }: { label: string; solid?: boolean; onPress: () => void }) {
  return (
    <AnimatedPressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      <View
        alignSelf="flex-start"
        borderWidth={1}
        borderColor={solid ? '$colorBurgundy' : '$accent'}
        backgroundColor={solid ? '$colorBurgundy' : 'transparent'}
        borderRadius={16}
        paddingHorizontal={14}
        paddingVertical={6}
      >
        <Typography
          variant="label"
          fontSize={10}
          letterSpacing={1.5}
          textTransform="uppercase"
          color={solid ? '$background' : '$accentHover'}
        >
          {label}
        </Typography>
      </View>
    </AnimatedPressable>
  )
}

function Seal({ children }: { children: string }) {
  return (
    <Typography
      variant="label"
      fontSize={11}
      letterSpacing={1.5}
      textTransform="uppercase"
      color="$accentHover"
    >
      {`✦ ${children}`}
    </Typography>
  )
}

/** A program's days as its language writes a span: "13–21 de outubro". */
function useDays(event: ProgramEvent): string | undefined {
  const { t } = useTranslation()
  if (!event.start) return undefined
  const from = parseISO(event.start)
  const to = addDays(from, event.total - 1)
  const key = `home.events.range.${from.getMonth() === to.getMonth() ? 'sameMonth' : 'across'}`
  return t(`${key}.join`, {
    from: formatLocalized(from, t(`${key}.from`)),
    to: formatLocalized(to, t(`${key}.to`)),
  })
}

/**
 * A program on the row, opened: its card, when it is, and the one thing to do
 * about it now — join it, wait for its first day, or pray today's. Joined from
 * here it is prayed once, from the day its feast sets; its page, which the
 * card opens, has the other ways to begin.
 */
export function ProgramPanel({ event }: { event: ProgramEvent }) {
  const { t } = useTranslation()
  const router = useRouter()
  const { manifest } = event
  const { saint, face } = useProgramCard(event)
  const plan = usePracticePlan(manifest, { openOnBegin: false })
  const slots = useSlotsForPractice(manifest.id)
  const updateSlot = useUpdateSlot()
  const days = useDays(event)
  const name = localizeContent(manifest.name)
  const begun = event.day !== undefined

  const label = (() => {
    if (begun) return t('program.dayOf', { day: event.day, total: event.total })
    if (event.away === 0) return t('home.events.beginsToday')
    if (event.away === 1) return t('home.events.beginsTomorrow')
    return t('home.events.beginsIn', { count: event.away })
  })()
  const openPage = () => router.push(practiceHref(manifest.id))
  // Switched off rather than deleted, as the plan's own page removes a time:
  // a slot deleted takes its record with it.
  const leave = () => {
    for (const slot of slots) {
      if (slot.enabled === 1) updateSlot.mutate({ id: slot.id, data: { enabled: 0 } })
    }
  }

  return (
    <XStack gap="$md" alignItems="flex-start">
      <AnimatedPressable onPress={openPage} accessibilityRole="link" accessibilityLabel={name}>
        <View transform={[{ rotate: '-2.5deg' }]} paddingTop={4}>
          <CardThumb face={face} width={100} />
        </View>
      </AnimatedPressable>
      <YStack flex={1} gap={4}>
        <Typography
          variant="label"
          fontSize={11}
          letterSpacing={2}
          textTransform="uppercase"
          color="$colorBurgundy"
        >
          {label}
        </Typography>
        <Typography variant="sacred-title" textAlign="left" fontSize={19} lineHeight={23}>
          {name}
        </Typography>
        {days && <Typography variant="annotation">{days}</Typography>}

        {!event.joined && (
          <YStack gap="$sm" paddingTop={4}>
            {saint && (
              <Typography variant="annotation" fontStyle="italic">
                {t('home.events.gives', { count: event.total, card: saint.name })}
              </Typography>
            )}
            <Pill
              label={t('program.join')}
              onPress={() => plan.addToPlan({ startDate: event.start })}
            />
          </YStack>
        )}

        {event.joined && !begun && (
          <YStack paddingTop="$sm" gap={2}>
            <Seal>{t('program.inPlan')}</Seal>
            <XStack alignItems="baseline" gap="$sm" flexWrap="wrap">
              {event.start && (
                <Typography variant="annotation">
                  {t('saints.receive.novenaBegins', {
                    date: formatLocalized(parseISO(event.start), t('program.dayDateFormat')),
                  })}
                </Typography>
              )}
              <AnimatedPressable
                onPress={leave}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={t('home.events.leave')}
              >
                <Typography variant="annotation" textDecorationLine="underline">
                  {t('home.events.leave')}
                </Typography>
              </AnimatedPressable>
            </XStack>
          </YStack>
        )}

        {begun && (
          <YStack gap="$sm" paddingTop={2}>
            <Beads total={event.total} done={event.kept} />
            {event.canPray ? (
              <Pill
                solid
                label={t('saints.receive.prayDay', { day: event.day })}
                onPress={() =>
                  router.push({
                    pathname: '/pray/[practiceId]',
                    params: { practiceId: manifest.id, programDay: String((event.day ?? 1) - 1) },
                  })
                }
              />
            ) : event.prayedToday ? (
              <Seal>{t('home.events.dayPrayed', { day: event.day })}</Seal>
            ) : (
              <Pill label={t('program.openProgram')} onPress={openPage} />
            )}
          </YStack>
        )}
      </YStack>
      <PracticePlanEditor plan={plan} />
    </XStack>
  )
}
