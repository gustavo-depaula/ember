import { useRouter } from 'expo-router'
import { AlertTriangle } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { getManifest } from '@/content/registry'
import { localizeContent } from '@/lib/i18n'

export function RestartNeededList({ ids }: { ids: Set<string> }) {
  const { t } = useTranslation()
  const theme = useTheme()
  const router = useRouter()

  if (ids.size === 0) return null

  return (
    <YStack gap="$sm">
      {Array.from(ids).map((id) => {
        const m = getManifest(id)
        if (!m) return null
        return (
          <Animated.View
            key={id}
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            layout={LinearTransition.duration(200)}
          >
            <AnimatedPressable
              onPress={() =>
                router.push({
                  pathname: '/practices/[manifestId]/program',
                  params: { manifestId: id },
                })
              }
              accessibilityRole="button"
              accessibilityLabel={t('a11y.restartPractice', { name: localizeContent(m.name) })}
            >
              <XStack
                backgroundColor="$backgroundSurface"
                borderRadius="$lg"
                padding="$md"
                alignItems="center"
                gap="$md"
                borderLeftWidth={3}
                borderLeftColor="$accent"
              >
                <AlertTriangle size={18} color={theme.accent?.val} />
                <YStack flex={1}>
                  <Text fontFamily="$body" fontSize="$3" color="$color">
                    {localizeContent(m.name)}
                  </Text>
                  <Text fontFamily="$body" fontSize="$1" color="$accent">
                    {t('program.restartNeeded')}
                  </Text>
                </YStack>
              </XStack>
            </AnimatedPressable>
          </Animated.View>
        )
      })}
    </YStack>
  )
}
