import { useRouter } from 'expo-router'
import { Mic2 } from 'lucide-react-native'
import { Text, useTheme, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { bareId, getEntry } from '@/content/contentIndex'
import type { CatalogEntry } from '@/content/manifestTypes'
import { localizeContent } from '@/lib/i18n'

export function CreatorCard({
  creatorId,
  width = 160,
}: {
  creatorId: string
  width?: number | string
}) {
  const router = useRouter()
  const theme = useTheme()
  const entry = getEntry(creatorId) as CatalogEntry | undefined
  if (!entry || entry.kind !== 'creator') return null

  const name = localizeContent(entry.name ?? {})
  const langs = entry.creatorLanguages?.join(' · ')

  return (
    <AnimatedPressable
      onPress={() =>
        router.push({
          pathname: '/creators/[creatorId]',
          params: { creatorId: bareId(creatorId) },
        })
      }
      accessibilityRole="link"
      accessibilityLabel={name}
    >
      <YStack
        width={width as number}
        backgroundColor="$backgroundSurface"
        borderRadius="$lg"
        borderWidth={1}
        borderColor="$borderColor"
        padding="$md"
        gap="$sm"
        alignItems="center"
      >
        <YStack
          width={56}
          height={56}
          alignItems="center"
          justifyContent="center"
          backgroundColor="$accentSubtle"
          borderRadius={28}
        >
          <Mic2 size={26} color={theme.accent.val} />
        </YStack>
        <Text
          fontFamily="$heading"
          fontSize="$3"
          color="$color"
          textAlign="center"
          numberOfLines={2}
        >
          {name}
        </Text>
        {langs && (
          <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" numberOfLines={1}>
            {langs}
          </Text>
        )}
      </YStack>
    </AnimatedPressable>
  )
}
