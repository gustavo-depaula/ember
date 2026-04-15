import { useRouter } from 'expo-router'
import {
  Flame,
  HandHeart,
  Heart,
  type LucideIcon,
  Shield,
  Smile,
  Sparkles,
  Sun,
  Waves,
} from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { getAllManifests } from '@/content/registry'
import type { PracticeManifest } from '@/content/types'
import { localizeContent } from '@/lib/i18n'

const themeIcons: Record<string, LucideIcon> = {
  'scripture-anxiety': Waves,
  'scripture-gratitude': Sun,
  'scripture-suffering': Flame,
  'scripture-joy': Sparkles,
  'scripture-forgiveness': HandHeart,
  'scripture-courage': Shield,
  'scripture-trust': Heart,
  'scripture-love': Smile,
}

function resolveIcon(id: string): LucideIcon {
  for (const [key, icon] of Object.entries(themeIcons)) {
    if (id.endsWith(key)) return icon
  }
  return Sparkles
}

function ScriptureTile({ manifest, onPress }: { manifest: PracticeManifest; onPress: () => void }) {
  const theme = useTheme()
  const Icon = resolveIcon(manifest.id)

  return (
    <AnimatedPressable onPress={onPress} style={{ width: '48%' }}>
      <YStack
        backgroundColor="$backgroundSurface"
        borderRadius="$lg"
        padding="$md"
        gap="$sm"
        borderWidth={1}
        borderColor="$borderColor"
        aspectRatio={1}
        justifyContent="center"
        alignItems="center"
      >
        <Icon size={28} color={theme.accent.val} />
        <Text fontFamily="$heading" fontSize="$3" color="$color" textAlign="center">
          {localizeContent(manifest.name)}
        </Text>
      </YStack>
    </AnimatedPressable>
  )
}

export function ThemedReadings() {
  const { t } = useTranslation()
  const router = useRouter()

  const scripturePractices = getAllManifests().filter(
    (m) =>
      m.categories.includes('scripture') &&
      m.id !== 'gospel-of-the-day' &&
      !m.id.endsWith(':gospel-of-the-day'),
  )

  if (scripturePractices.length === 0) return null

  return (
    <YStack gap="$sm">
      <Text
        fontFamily="$heading"
        fontSize="$2"
        color="$colorSecondary"
        textTransform="uppercase"
        letterSpacing={1}
      >
        {t('bible.discovery.themedReadings')}
      </Text>
      <XStack flexWrap="wrap" gap="$sm" justifyContent="space-between">
        {scripturePractices.map((manifest) => (
          <ScriptureTile
            key={manifest.id}
            manifest={manifest}
            onPress={() =>
              router.push({
                pathname: '/practices/[manifestId]',
                params: { manifestId: manifest.id },
              })
            }
          />
        ))}
      </XStack>
    </YStack>
  )
}
