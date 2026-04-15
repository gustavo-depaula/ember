import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { ScrollView } from 'react-native'
import { Text, YStack } from 'tamagui'

import { AnimatedPressable, WatercolorIcon } from '@/components'
import type { IconName } from '@/components/ornaments/WatercolorIcon'
import { lightTap } from '@/lib/haptics'

const shortcuts = [
  {
    icon: 'mass' as IconName,
    labelKey: 'home.holyMass',
    route: { pathname: '/pray/[practiceId]', params: { practiceId: 'mass' } },
  },
  {
    icon: 'rosary' as IconName,
    labelKey: 'catalog.title',
    route: '/practices',
  },
  {
    icon: 'book' as IconName,
    labelKey: 'home.sacredScripture',
    route: '/bible',
  },
  {
    icon: 'quill' as IconName,
    labelKey: 'home.planOfLife',
    route: '/plan',
  },
  {
    icon: 'clock' as IconName,
    labelKey: 'settings.title',
    route: '/settings',
  },
] as const

export function AppShortcuts() {
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{
        marginHorizontal: -24,
      }}
      contentContainerStyle={{ gap: 10, paddingLeft: 24, paddingRight: 24 }}
    >
      {shortcuts.map((s) => (
        <AnimatedPressable
          key={s.labelKey}
          onPress={() => {
            lightTap()
            router.push(s.route)
          }}
        >
          <YStack
            width={120}
            height={120}
            backgroundColor="$backgroundSurface"
            borderRadius="$lg"
            padding="$md"
            justifyContent="space-between"
          >
            <WatercolorIcon name={s.icon} size={28} />
            <Text fontFamily="$heading" fontSize="$2" color="$color" numberOfLines={2}>
              {t(s.labelKey)}
            </Text>
          </YStack>
        </AnimatedPressable>
      ))}
    </ScrollView>
  )
}
