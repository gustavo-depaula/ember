import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, YStack } from 'tamagui'

import { SectionDivider } from '@/components/SectionDivider'
import { Typography } from '@/components/typography'
import { PrologueProse } from '@/features/collections'
import { artFor } from '@/features/explore/artMap'
import { toneByIndex, toneIndexForId } from '@/features/explore/bgColor'
import {
  AdoptSheet,
  ProposedPractices,
  TemplateHero,
  useTemplateManifest,
} from '@/features/templates'
import { localizeContent } from '@/lib/i18n'
import { useNowPlayingClearance } from '@/stores/creatorsStore'

const nativeTabBarClearance = 56

export default function TemplateDetailScreen() {
  const { templateId } = useLocalSearchParams<{ templateId: string }>()
  const { t } = useTranslation()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const nowPlaying = useNowPlayingClearance()
  const [adopting, setAdopting] = useState(false)

  const scrollY = useSharedValue(0)
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y
  })

  const { data: manifest, entryExists, catalogReady } = useTemplateManifest(templateId)
  const background = theme.background?.val ?? '#000000'

  if (!manifest) {
    // Unknown id once the catalog has loaded; otherwise still warming.
    if (catalogReady && !entryExists) {
      return (
        <YStack flex={1} backgroundColor="$background" paddingTop={insets.top + 48} padding="$lg">
          <Typography variant="interface" tone="muted">
            {t('templates.notFound')}
          </Typography>
        </YStack>
      )
    }
    return <YStack flex={1} backgroundColor="$background" />
  }

  const id = `plan-of-life-template/${templateId}`
  const name = localizeContent(manifest.name)
  const attribution = manifest.attribution ? localizeContent(manifest.attribution) : undefined
  const manifesto = localizeContent(manifest.manifesto)

  return (
    <>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={{ flex: 1, backgroundColor: background }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + nativeTabBarClearance + nowPlaying,
        }}
        contentInsetAdjustmentBehavior="never"
      >
        <TemplateHero
          name={name}
          attribution={attribution}
          tone={toneByIndex(toneIndexForId(id))}
          image={artFor(id)}
          scrollY={scrollY}
        />

        <YStack
          width="100%"
          maxWidth={640}
          alignSelf="center"
          paddingHorizontal="$lg"
          paddingTop="$lg"
          gap="$lg"
          backgroundColor="$background"
        >
          <PrologueProse text={manifesto} />

          <SectionDivider />

          <ProposedPractices template={manifest} />

          <Pressable
            onPress={() => setAdopting(true)}
            accessibilityRole="button"
            accessibilityLabel={t('templates.adopt')}
          >
            <YStack backgroundColor="$accent" borderRadius="$md" padding="$md" alignItems="center">
              <Typography variant="label" fontSize="$3" color="$background">
                {t('templates.adopt')}
              </Typography>
            </YStack>
          </Pressable>
        </YStack>
      </Animated.ScrollView>

      <AdoptSheet
        template={manifest}
        open={adopting}
        onClose={() => setAdopting(false)}
        onAdopted={() => router.push('/you')}
      />
    </>
  )
}
