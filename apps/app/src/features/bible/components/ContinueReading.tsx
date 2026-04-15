import { useRouter } from 'expo-router'
import { BookMarked } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { useBibleStore } from '@/stores/bibleStore'

export function ContinueReading() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const { bookId, chapter, hydrated } = useBibleStore()

  if (!hydrated || (bookId === 'genesis' && chapter === 1)) return null

  const bookName = t(`bookName.${bookId}`, { defaultValue: bookId })

  return (
    <AnimatedPressable onPress={() => router.push('/bible/reader')}>
      <XStack
        backgroundColor="$backgroundSurface"
        borderRadius="$lg"
        padding="$md"
        gap="$md"
        alignItems="center"
        borderWidth={1}
        borderColor="$borderColor"
      >
        <YStack
          width={36}
          height={36}
          alignItems="center"
          justifyContent="center"
          backgroundColor="$accentSubtle"
          borderRadius="$md"
        >
          <BookMarked size={20} color={theme.accent.val} />
        </YStack>
        <YStack flex={1} gap={2}>
          <Text fontFamily="$heading" fontSize="$3" color="$color">
            {t('bible.discovery.continueReading')}
          </Text>
          <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
            {bookName} {chapter}
          </Text>
        </YStack>
        <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
          ›
        </Text>
      </XStack>
    </AnimatedPressable>
  )
}
