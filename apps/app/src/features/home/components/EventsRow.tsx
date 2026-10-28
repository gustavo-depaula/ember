import { Image, type ImageSource } from 'expo-image'
import { type ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import { Text, useTheme, View, YStack } from 'tamagui'

import { AnimatedPressable, Typography } from '@/components'
import { toneForKey } from '@/features/explore/bgColor'
import {
  cardFrame,
  cardInk,
  EnvelopeStack,
  type TodayCard,
  useCardsToday,
  useHeldCards,
  useSaintsCatalog,
} from '@/features/saints'
import { localizeContent } from '@/lib/i18n'

import type { ProgramEvent } from '../programEvents'
import { useProgramEvents } from '../useProgramEvents'
import { EventPanel, ProgramPanel, TodayPanel } from './EventPanels'
import { cardFace, useProgramCard } from './eventCard'

const medallion = 78
// ScreenLayout's page padding, which the strip bleeds through.
const pagePadding = 24

/**
 * Today's events, under the Daily Meditations: a strip of medallions — first
 * the holy cards today can give, then the novenas under way and those about
 * to begin — with the one chosen opened beneath it, in place. Today's is open
 * when the page loads; a tap on the open one closes it.
 */
export function EventsRow() {
  const { t } = useTranslation()
  const cards = useCardsToday()
  const programs = useProgramEvents()
  const [chosen, setChosen] = useState<string | undefined>('today')
  // Where each medallion sits in the strip, and how far the strip is scrolled:
  // together, where the open panel's nib points.
  const [places, setPlaces] = useState<Record<string, number>>({})
  const [scrolled, setScrolled] = useState(0)

  const hasCards = !!cards && cards.length > 0
  if (!hasCards && programs.length === 0) return null

  const program = programs.find((p) => p.manifest.id === chosen)
  const open = chosen === 'today' ? (hasCards ? 'today' : undefined) : program?.manifest.id
  const toggle = (key: string) => setChosen((now) => (now === key ? undefined : key))
  const place = (key: string) => (x: number) =>
    setPlaces((now) => (now[key] === x ? now : { ...now, [key]: x }))
  const nib = open === undefined ? 0 : (places[open] ?? pagePadding) + medallion / 2 - scrolled

  return (
    <YStack gap="$sm">
      <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
        {t('home.events.title')}
      </Typography>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -pagePadding }}
        contentContainerStyle={{ paddingHorizontal: pagePadding, paddingTop: 6, gap: 16 }}
        scrollEventThrottle={16}
        onScroll={(e) => setScrolled(e.nativeEvent.contentOffset.x)}
      >
        {hasCards && (
          <TodayMedallion
            cards={cards}
            selected={open === 'today'}
            onPress={() => toggle('today')}
            onPlace={place('today')}
          />
        )}
        {programs.map((event) => (
          <ProgramMedallion
            key={event.manifest.id}
            event={event}
            selected={open === event.manifest.id}
            onPress={() => toggle(event.manifest.id)}
            onPlace={place(event.manifest.id)}
          />
        ))}
      </ScrollView>
      <EventPanel open={open} nib={nib - pagePadding}>
        {open === 'today' && cards ? <TodayPanel cards={cards} /> : null}
        {program && open === program.manifest.id ? <ProgramPanel event={program} /> : null}
      </EventPanel>
    </YStack>
  )
}

function Medallion({
  label,
  name,
  selected,
  onPress,
  onPlace,
  children,
}: {
  label: string
  name: string
  selected: boolean
  onPress: () => void
  onPlace: (x: number) => void
  children: ReactNode
}) {
  return (
    <AnimatedPressable
      onPress={onPress}
      onLayout={(e) => onPlace(e.nativeEvent.layout.x)}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${name}`}
      accessibilityState={{ expanded: selected }}
    >
      <YStack width={medallion} alignItems="center">
        <View width={medallion} height={medallion} alignItems="center" justifyContent="center">
          {children}
        </View>
        <Typography
          variant="label"
          fontSize={10}
          letterSpacing={1.3}
          textTransform="uppercase"
          color="$colorBurgundy"
          paddingTop={8}
          numberOfLines={1}
        >
          {label}
        </Typography>
        {/* The one open is underlined, as a chosen option is across the app. */}
        <YStack borderBottomWidth={1} borderColor={selected ? '$accent' : 'transparent'}>
          <Typography variant="interface" fontSize="$1" textAlign="center" numberOfLines={2}>
            {name}
          </Typography>
        </YStack>
      </YStack>
    </AnimatedPressable>
  )
}

// A small card, as in a hand of them: the illuminated back, or a face.
function MiniCard({ face, turn, shift }: { face?: ImageSource; turn: number; shift: number }) {
  return (
    <View
      position="absolute"
      width={44}
      height={66}
      borderRadius={4}
      overflow="hidden"
      alignItems="center"
      justifyContent="center"
      transform={[{ translateX: shift }, { rotate: `${turn}deg` }]}
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 3 }}
      shadowOpacity={0.3}
      shadowRadius={5}
    >
      <Image
        source={face ?? cardFrame}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
        contentFit="cover"
      />
      {!face && (
        <Text fontFamily="$heading" fontSize={14} color={cardInk.name}>
          ✠
        </Text>
      )}
    </View>
  )
}

function TodayMedallion({
  cards,
  selected,
  onPress,
  onPlace,
}: {
  cards: TodayCard[]
  selected: boolean
  onPress: () => void
  onPlace: (x: number) => void
}) {
  const { t } = useTranslation()
  const { byId } = useSaintsCatalog()
  const held = useHeldCards()
  // The hand shows a card already opened, face up, before one still to win.
  const opened = cards.find((c) => c.card)?.card
  const named = opened ?? cards.find((c) => !c.grant.drawn)?.grant.choice[0]
  const face = named ? cardFace(byId[named], !!opened || held.has(named)) : undefined
  const waiting = cards.filter((c) => c.state === 'won').length
  const open = cards.filter((c) => c.state === 'open').length
  const name = (() => {
    if (open > 0) return t('home.events.cards', { count: open })
    return t(waiting > 0 ? 'home.events.cardsToOpen' : 'home.events.cardsDone')
  })()
  return (
    <Medallion
      label={t('home.events.today')}
      name={name}
      selected={selected}
      onPress={onPress}
      onPlace={onPlace}
    >
      {waiting > 0 ? (
        // A card won and not yet opened: its envelope, as it heads the page.
        <EnvelopeStack width={58} count={waiting} name="" date="" shimmer={false} />
      ) : (
        <>
          <MiniCard turn={-10} shift={face ? -9 : 0} />
          {face && <MiniCard face={face} turn={7} shift={9} />}
        </>
      )}
    </Medallion>
  )
}

function ProgramMedallion({
  event,
  selected,
  onPress,
  onPlace,
}: {
  event: ProgramEvent
  selected: boolean
  onPress: () => void
  onPlace: (x: number) => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  // A medallion is the saint's portrait, in colour; the card itself, in the
  // panel, stays veiled as the album veils it until it is held.
  const { saint } = useProgramCard(event)
  const face = saint?.cardThumb
  const name = saint?.name ?? localizeContent(event.manifest.name)
  const label = (() => {
    if (event.day !== undefined) return t('home.events.day', { day: event.day })
    if (event.away === 0) return t('home.events.today')
    if (event.away === 1) return t('home.events.tomorrow')
    return t('home.events.days', { count: event.away })
  })()
  // The ring is the days kept; one that begins today, not yet joined, is lit whole.
  const turn =
    event.day !== undefined ? event.kept / event.total : event.away === 0 && !event.joined ? 1 : 0
  const radius = medallion / 2 - 2
  const around = 2 * Math.PI * radius
  return (
    <Medallion label={label} name={name} selected={selected} onPress={onPress} onPlace={onPlace}>
      <Svg width={medallion} height={medallion} style={{ position: 'absolute' }}>
        <Circle
          cx={medallion / 2}
          cy={medallion / 2}
          r={radius}
          stroke={theme.borderColor.val}
          strokeWidth={4}
          fill="none"
        />
        {turn > 0 && (
          <Circle
            cx={medallion / 2}
            cy={medallion / 2}
            r={radius}
            stroke={theme.accentHover.val}
            strokeWidth={4}
            fill="none"
            strokeDasharray={`${around * turn} ${around}`}
            // From the top, as a clock fills.
            transform={`rotate(-90 ${medallion / 2} ${medallion / 2})`}
          />
        )}
      </Svg>
      <View
        width={medallion - 13}
        height={medallion - 13}
        borderRadius={medallion}
        overflow="hidden"
        alignItems="center"
        justifyContent="center"
        backgroundColor={toneForKey(event.manifest.id).from}
      >
        {face ? (
          <Image
            source={face}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            // The figure's head sits in the card's upper third.
            contentPosition={{ top: '12%', left: '50%' }}
          />
        ) : (
          <Text fontFamily="$heading" fontSize={26} color="#F5EFE2">
            {Array.from(name.trim())[0]}
          </Text>
        )}
      </View>
      {event.joined && (
        <View
          position="absolute"
          right={-2}
          bottom={-2}
          width={24}
          height={24}
          borderRadius={12}
          backgroundColor="$background"
          alignItems="center"
          justifyContent="center"
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 1 }}
          shadowOpacity={0.2}
          shadowRadius={3}
        >
          <Typography color="$accent" fontSize={13} lineHeight={16}>
            ✦
          </Typography>
        </View>
      )}
    </Medallion>
  )
}
