import { useRouter } from 'expo-router'
import { BookOpen, Flame } from 'lucide-react-native'
import type { ComponentProps } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, Text, useTheme, XStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { useGratitudesCount } from '@/features/gratias'
import { useOpenIntentionsCount } from '@/features/intentions'
import { useMemoriaEntriesCount } from '@/features/memoria'

import { IntentionHeart } from './IntentionHeart'

export function QuickCaptureChips() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const openIntentions = useOpenIntentionsCount()
  const gratitudes = useGratitudesCount()
  const memoriaCount = useMemoriaEntriesCount()

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      marginHorizontal="$-lg"
      contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
    >
      <Chip
        leading={<IntentionHeart active={openIntentions > 0} />}
        label={t('intentions.title')}
        count={openIntentions}
        onPress={() => router.push('/intentions')}
      />
      <Chip
        leading={<Flame size={16} color={theme.accent?.val} />}
        label={t('gratias.title')}
        count={gratitudes}
        onPress={() => router.push('/gratias')}
      />
      {memoriaCount > 0 && (
        <Chip
          leading={<BookOpen size={16} color={theme.accent?.val} />}
          label={t('memoria.title')}
          onPress={() => router.push('/memoria')}
        />
      )}
    </ScrollView>
  )
}

function Chip({
  leading,
  label,
  count,
  onPress,
}: {
  leading: ComponentProps<typeof XStack>['children']
  label: string
  count?: number
  onPress: () => void
}) {
  return (
    <AnimatedPressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      <XStack
        alignItems="center"
        gap="$sm"
        paddingVertical="$xs"
        paddingHorizontal="$md"
        borderRadius={999}
        borderWidth={1}
        borderColor="$borderColor"
        backgroundColor="$backgroundSurface"
      >
        {leading}
        <Text fontFamily="$heading" fontSize="$2" color="$color" letterSpacing={0.5}>
          {label}
        </Text>
        {count !== undefined && count > 0 && (
          <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
            {count}
          </Text>
        )}
      </XStack>
    </AnimatedPressable>
  )
}
