import { useRouter } from 'expo-router'
import { BookOpen } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { Typography } from '@/components/typography'
import { blockInk, toneForKey } from '@/features/explore/bgColor'

export function OpenBibleCard() {
  const { t } = useTranslation()
  const router = useRouter()
  const tone = toneForKey('bible-reader')

  return (
    <AnimatedPressable
      onPress={() => router.push('/bible/reader')}
      accessibilityRole="link"
      accessibilityLabel={t('bible.discovery.openBible')}
    >
      <XStack backgroundColor="$backgroundSurface" borderRadius="$md" overflow="hidden">
        <YStack
          width={96}
          alignSelf="stretch"
          backgroundColor={tone.from}
          alignItems="center"
          justifyContent="center"
        >
          <BookOpen size={28} color={blockInk} strokeWidth={1.4} />
        </YStack>
        <YStack
          flex={1}
          gap={4}
          paddingVertical="$md"
          paddingHorizontal="$md"
          justifyContent="center"
        >
          <Typography
            variant="marker"
            textAlign="left"
            color="$accent"
            fontSize="$1"
            letterSpacing={1.5}
          >
            {t('bible.discovery.openBibleLabel')}
          </Typography>
          <Typography variant="sacred-title" textAlign="left" fontSize="$3" color="$color">
            {t('bible.discovery.openBible')}
          </Typography>
          <Typography variant="whisper" fontSize="$1" color="$colorSecondary" numberOfLines={1}>
            {t('bible.discovery.openBibleHint')}
          </Typography>
        </YStack>
      </XStack>
    </AnimatedPressable>
  )
}
