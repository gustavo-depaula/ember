import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Text, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'

import type { SeasonKey } from './sectionLayout'

export function SeasonCard({
  season,
  active = false,
  width = 132,
}: {
  season: SeasonKey
  active?: boolean
  width?: number
}) {
  const router = useRouter()
  const { t } = useTranslation()

  return (
    <AnimatedPressable
      onPress={() =>
        router.push({
          pathname: '/browse/[collectionId]',
          params: { collectionId: 'liturgical-year' },
        })
      }
      accessibilityRole="link"
      accessibilityLabel={t(`pray.season.${season}`)}
    >
      <YStack
        width={width}
        backgroundColor={active ? '$accentSubtle' : '$backgroundSurface'}
        borderRadius="$lg"
        borderWidth={1}
        borderColor={active ? '$accent' : '$borderColor'}
        paddingHorizontal="$md"
        paddingVertical="$md"
        gap={4}
        opacity={active ? 1 : 0.7}
      >
        <Text
          fontFamily="$heading"
          fontSize="$3"
          color={active ? '$accent' : '$color'}
          numberOfLines={2}
        >
          {t(`pray.season.${season}`)}
        </Text>
        {active && (
          <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" fontStyle="italic">
            {t('pray.season.active')}
          </Text>
        )}
      </YStack>
    </AnimatedPressable>
  )
}
