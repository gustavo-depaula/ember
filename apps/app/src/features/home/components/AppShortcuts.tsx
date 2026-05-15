import { Image } from 'expo-image'
import { Link } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { ScrollView } from 'react-native'
import { Text, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { lightTap } from '@/lib/haptics'

const tileImages = {
  mass: require('../../../../assets/textures/nav-tiles/mass.png'),
  practices: require('../../../../assets/textures/nav-tiles/practices.png'),
  bible: require('../../../../assets/textures/nav-tiles/bible.png'),
  reading: require('../../../../assets/textures/nav-tiles/reading.png'),
  plan: require('../../../../assets/textures/nav-tiles/plan.png'),
  settings: require('../../../../assets/textures/nav-tiles/settings.png'),
}

const shortcuts = [
  {
    image: tileImages.mass,
    labelKey: 'home.holyMass',
    route: { pathname: '/pray/[practiceId]', params: { practiceId: 'mass' } },
  },
  {
    image: tileImages.practices,
    labelKey: 'home.pray',
    route: '/practices',
  },
  {
    image: tileImages.bible,
    labelKey: 'home.bible',
    route: '/bible',
  },
  {
    image: tileImages.reading,
    labelKey: 'explore.title',
    route: '/explore',
  },
  {
    image: tileImages.plan,
    labelKey: 'home.planOfLife',
    route: '/plan',
  },
  {
    image: tileImages.settings,
    labelKey: 'settings.title',
    route: '/settings',
  },
] as const

const tileSize = 110

export function AppShortcuts() {
  const { t } = useTranslation()

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{
        marginHorizontal: -24,
      }}
      contentContainerStyle={{ gap: 12, paddingLeft: 24, paddingRight: 24 }}
    >
      {shortcuts.map((s) => {
        const label = t(s.labelKey)
        return (
          <Link key={s.labelKey} href={s.route} push asChild onPress={() => lightTap()}>
            <Link.AppleZoom>
              <AnimatedPressable
                accessibilityRole="link"
                accessibilityLabel={label}
                testID={`shortcut-${s.labelKey}`}
              >
                <YStack alignItems="center" gap="$xs" width={tileSize}>
                  <Image
                    source={s.image}
                    style={{ width: tileSize, height: tileSize, borderRadius: 6 }}
                    contentFit="cover"
                  />
                  <Text
                    fontFamily="$heading"
                    fontSize="$2"
                    color="$color"
                    numberOfLines={1}
                    textAlign="center"
                  >
                    {label}
                  </Text>
                </YStack>
              </AnimatedPressable>
            </Link.AppleZoom>
          </Link>
        )
      })}
    </ScrollView>
  )
}
