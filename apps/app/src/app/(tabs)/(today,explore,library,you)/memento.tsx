import { useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { ScreenLayout } from '@/components'
import { type MementoPillar, mementoPillars, useTodayReflection } from '@/features/memento'

export default function MementoScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const today = useTodayReflection()

  return (
    <ScreenLayout>
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack gap="$lg" paddingVertical="$lg">
          <XStack alignItems="center" gap="$md">
            <Pressable
              onPress={() => router.back()}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('a11y.goBack')}
            >
              <ChevronLeft size={24} color={theme.color?.val} />
            </Pressable>
            <YStack flex={1}>
              <Text fontFamily="$heading" fontSize="$5" color="$color">
                {t('memento.title')}
              </Text>
              <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" fontStyle="italic">
                {t('memento.subtitle')}
              </Text>
            </YStack>
          </XStack>

          <YStack
            gap="$sm"
            padding="$md"
            borderRadius="$md"
            borderLeftWidth={3}
            borderLeftColor="$accent"
            backgroundColor="$backgroundSurface"
          >
            <Text
              fontFamily="$heading"
              fontSize="$1"
              color="$accent"
              letterSpacing={1.5}
              textTransform="uppercase"
            >
              {t(`memento.pillar.${today.pillar}`)}
            </Text>
            <Text fontFamily="$body" fontSize="$3" color="$color" lineHeight={28}>
              {t(`memento.reflection.${today.index + 1}`)}
            </Text>
          </YStack>

          <YStack gap="$md" paddingHorizontal="$xs">
            {mementoPillars.map((pillar) => (
              <PillarRow key={pillar} pillar={pillar} active={pillar === today.pillar} />
            ))}
          </YStack>
        </YStack>
      </ScrollView>
    </ScreenLayout>
  )
}

function PillarRow({ pillar, active }: { pillar: MementoPillar; active: boolean }) {
  const { t } = useTranslation()
  return (
    <XStack gap="$sm" alignItems="baseline">
      <Text fontFamily="$body" fontSize="$3" color={active ? '$accent' : '$colorSecondary'}>
        ·
      </Text>
      <YStack flex={1} gap={2}>
        <Text
          fontFamily="$heading"
          fontSize="$2"
          color={active ? '$accent' : '$color'}
          letterSpacing={1}
        >
          {t(`memento.pillar.${pillar}`)}
        </Text>
        <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
          {t(`memento.description.${pillar}`)}
        </Text>
      </YStack>
    </XStack>
  )
}
