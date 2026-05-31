import { Heart } from 'lucide-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, SectionDivider, Typography } from '@/components'
import type { Movement, MovementKind } from '@/db/events'
import { lightTap } from '@/lib/haptics'
import { getDateLocale } from '@/lib/i18n/dateLocale'

import { groupBySubject } from '../groupBySubject'
import { useActiveIntentions, useActiveThanksgivings, useClosedIntentions } from '../hooks'

import { MovementActionMenu } from './MovementActionMenu'
import { MovementCard } from './MovementCard'

export function MovementList({
  kind,
  onAdd,
  hideHeading,
}: {
  kind: MovementKind
  onAdd?: () => void
  hideHeading?: boolean
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const locale = getDateLocale()

  const intentions = useActiveIntentions()
  const thanksgivings = useActiveThanksgivings()
  const closedIntentions = useClosedIntentions()

  const active = kind === 'intention' ? intentions : thanksgivings
  const closed = kind === 'intention' ? closedIntentions : []

  const [showClosed, setShowClosed] = useState(false)
  const [menuFor, setMenuFor] = useState<Movement | undefined>(undefined)

  const empty = active.length === 0 && closed.length === 0

  if (empty) {
    const ctaKey = kind === 'intention' ? 'movements.capture.raise' : 'movements.capture.offer'
    return (
      <YStack paddingVertical="$xl" alignItems="center" gap="$md">
        <Heart size={32} color={theme.colorSecondary?.val} />
        <Text
          fontFamily="$body"
          fontSize="$2"
          color="$colorSecondary"
          textAlign="center"
          fontStyle="italic"
          paddingHorizontal="$lg"
        >
          {t(`movements.empty.${kind}`)}
        </Text>
        {onAdd ? (
          <AnimatedPressable
            onPress={() => {
              lightTap()
              onAdd()
            }}
            accessibilityRole="button"
            accessibilityLabel={t(ctaKey)}
          >
            <Typography variant="label" color="$accent">
              {t(ctaKey)}
            </Typography>
          </AnimatedPressable>
        ) : undefined}
      </YStack>
    )
  }

  const grouped = groupBySubject(active)

  return (
    <YStack gap="$md">
      <YStack gap="$xs">
        {hideHeading ? undefined : (
          <Text fontFamily="$heading" fontSize="$2" color="$accent" letterSpacing={1}>
            {t(`movements.heading.${kind}.active`, { count: active.length }).toUpperCase()}
          </Text>
        )}
        {grouped.map(([subject, items]) => (
          <YStack key={subject ?? '__none'} gap="$xs">
            {subject ? (
              <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" fontStyle="italic">
                {subject}
              </Text>
            ) : undefined}
            {items.map((m) => (
              <Animated.View
                key={m.id}
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(150)}
                layout={LinearTransition.duration(200)}
              >
                <MovementCard
                  movement={m}
                  locale={locale}
                  onPress={() => setMenuFor(m)}
                  onPrimary={() => setMenuFor(m)}
                />
              </Animated.View>
            ))}
          </YStack>
        ))}
      </YStack>

      {closed.length > 0 ? (
        <>
          <SectionDivider />
          <Pressable
            onPress={() => setShowClosed((v) => !v)}
            accessibilityRole="button"
            accessibilityState={{ expanded: showClosed }}
          >
            <XStack alignItems="center" gap="$sm">
              <Text fontFamily="$heading" fontSize="$2" color="$accent" letterSpacing={1}>
                {t('movements.heading.intention.closed', { count: closed.length }).toUpperCase()}
              </Text>
              <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                {showClosed ? t('common.hide') : t('common.show')}
              </Text>
            </XStack>
          </Pressable>
          {showClosed
            ? closed.map((m) => (
                <Animated.View
                  key={m.id}
                  entering={FadeIn.duration(200)}
                  exiting={FadeOut.duration(150)}
                  layout={LinearTransition.duration(200)}
                >
                  <MovementCard movement={m} locale={locale} />
                </Animated.View>
              ))
            : undefined}
        </>
      ) : undefined}

      <MovementActionMenu
        movement={menuFor}
        visible={menuFor !== undefined}
        onClose={() => setMenuFor(undefined)}
      />
    </YStack>
  )
}
