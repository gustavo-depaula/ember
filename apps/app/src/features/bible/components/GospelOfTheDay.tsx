import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { StyleSheet } from 'react-native'
import { YStack } from 'tamagui'

import { AnimatedPressable, InlineRetry } from '@/components'
import { Typography } from '@/components/typography'
import { blockInk, blockLabelInk, toneForKey } from '@/features/explore/bgColor'
import { evangelistArtFor } from '@/features/explore/evangelistArt'
import { useToday } from '@/hooks/useToday'
import { useGospelOfTheDay as useGospelOfTheDayQuery } from '@/lib/mass-of/use-gospel-of-the-day'

const dayMs = 86_400_000

export function GospelOfTheDay() {
  const { t } = useTranslation()
  const router = useRouter()
  const today = useToday()
  const { data: gospel, isLoading, isError, refetch } = useGospelOfTheDayQuery()

  if (isError) {
    return <InlineRetry onRetry={refetch} />
  }

  if (isLoading || !gospel) return null

  const dayIndex = Math.floor(today.getTime() / dayMs)
  const image = evangelistArtFor(gospel.citation, dayIndex)
  const tone = toneForKey('gospel-of-the-day')
  const preview = gospel.text.length > 180 ? `${gospel.text.slice(0, 180).trimEnd()}…` : gospel.text
  const title = gospel.citation ?? t('bible.discovery.gospelOfTheDay')

  return (
    <AnimatedPressable
      onPress={() =>
        router.push({
          pathname: '/pray/[practiceId]',
          params: { practiceId: 'gospel-of-the-day' },
        })
      }
      accessibilityRole="link"
      accessibilityLabel={t('bible.discovery.gospelOfTheDay')}
    >
      <YStack
        height={340}
        borderRadius={18}
        overflow="hidden"
        backgroundColor={tone.from}
        justifyContent="flex-end"
      >
        {image && (
          <Image
            source={image}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={250}
            cachePolicy="memory-disk"
          />
        )}
        <YStack
          padding="$lg"
          gap="$xs"
          backgroundColor={image ? 'rgba(0,0,0,0.42)' : 'transparent'}
        >
          <Typography
            variant="marker"
            textAlign="left"
            color={blockLabelInk}
            fontSize="$1"
            letterSpacing={2}
          >
            {t('bible.discovery.gospelOfTheDay')}
          </Typography>
          <Typography
            variant="sacred-title"
            textAlign="left"
            color={blockInk}
            fontSize={30}
            lineHeight={34}
            numberOfLines={2}
          >
            {title}
          </Typography>
          <Typography variant="whisper" color="rgba(245,239,226,0.82)" numberOfLines={3}>
            {preview}
          </Typography>
        </YStack>
      </YStack>
    </AnimatedPressable>
  )
}
