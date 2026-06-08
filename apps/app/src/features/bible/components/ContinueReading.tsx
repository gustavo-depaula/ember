import { useRouter } from 'expo-router'
import { BookMarked } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { Typography } from '@/components/typography'
import { blockInk, toneForKey } from '@/features/explore/bgColor'
import { useBibleStore } from '@/stores/bibleStore'

export function ContinueReading() {
  const { t } = useTranslation()
  const router = useRouter()
  const { bookId, chapter, hydrated } = useBibleStore()

  if (!hydrated || (bookId === 'genesis' && chapter === 1)) return null

  const bookName = t(`bookName.${bookId}`, { defaultValue: bookId })
  const tone = toneForKey(`bible-continue-${bookId}`)

  return (
    <AnimatedPressable
      onPress={() => router.push('/bible/reader')}
      accessibilityRole="link"
      accessibilityLabel={`${t('bible.discovery.continueReading')}: ${bookName} ${chapter}`}
    >
      <XStack backgroundColor="$backgroundSurface" borderRadius="$md" overflow="hidden">
        <YStack
          width={96}
          alignSelf="stretch"
          backgroundColor={tone.from}
          alignItems="center"
          justifyContent="center"
        >
          <BookMarked size={28} color={blockInk} strokeWidth={1.4} />
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
            {t('bible.discovery.continueReading')}
          </Typography>
          <Typography variant="sacred-title" textAlign="left" fontSize="$3" color="$color">
            {bookName} {chapter}
          </Typography>
        </YStack>
      </XStack>
    </AnimatedPressable>
  )
}
