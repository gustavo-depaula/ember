import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { ScrollView } from 'react-native'
import { Text, YStack } from 'tamagui'

import { AnimatedPressable, WatercolorIcon } from '@/components'

type IconName = 'sunrise' | 'book' | 'rosary' | 'moon' | 'quill' | 'cross'

const shortcuts = [
  { icon: 'book' as IconName, labelKey: 'home.divineOffice', route: '/office' },
  { icon: 'cross' as IconName, labelKey: 'home.holyMass', route: '/mass' },
  { icon: 'cross' as IconName, labelKey: 'home.sacredScripture', route: '/bible' },
  { icon: 'book' as IconName, labelKey: 'home.catechism', route: '/catechism' },
  { icon: 'quill' as IconName, labelKey: 'home.planOfLife', route: '/plan' },
]

export function AppShortcuts() {
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 12 }}
    >
      {shortcuts.map((s) => (
        <AnimatedPressable key={s.route} onPress={() => router.push(s.route as any)}>
          <YStack
            alignItems="center"
            gap="$xs"
            paddingHorizontal="$md"
            paddingVertical="$md"
            backgroundColor="$backgroundSurface"
            borderRadius="$lg"
            borderWidth={1}
            borderColor="$accentSubtle"
            minWidth={110}
          >
            <WatercolorIcon name={s.icon} size={32} />
            <Text
              fontFamily="$heading"
              fontSize="$1"
              color="$color"
              textAlign="center"
              numberOfLines={2}
            >
              {t(s.labelKey)}
            </Text>
          </YStack>
        </AnimatedPressable>
      ))}
    </ScrollView>
  )
}
