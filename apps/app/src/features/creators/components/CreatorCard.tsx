import { useQuery } from '@tanstack/react-query'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { Mic2 } from 'lucide-react-native'
import { Text, useTheme, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { bareId, getEntry } from '@/content/contentIndex'
import type { CatalogEntry } from '@/content/manifestTypes'
import { getCreatorImage } from '@/db/repositories/creatorMeta'
import { getCreatorAvatarUrl } from '@/db/repositories/feedItems'
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
  const { data: avatarUrl } = useQuery({
    queryKey: ['creator-avatar', creatorId],
    queryFn: async () => {
      // Prefer the channel-level image captured at feed-refresh time
      // (podcast <itunes:image>, RSS <image>, Atom <icon|logo>). Fall back
      // to the per-item heuristic only when no channel meta is stored yet
      // (e.g. before the first refresh completes after install).
      const channelImage = await getCreatorImage(creatorId)
      if (channelImage) return channelImage
      return await getCreatorAvatarUrl(creatorId)
    },
    enabled: !!entry,
    staleTime: 5 * 60 * 1000,
  })
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
          width={64}
          height={64}
          alignItems="center"
          justifyContent="center"
          backgroundColor="$accentSubtle"
          borderRadius={32}
          overflow="hidden"
        >
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={{ width: 64, height: 64 }}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
              accessibilityLabel={name}
            />
          ) : (
            <Mic2 size={28} color={theme.accent.val} />
          )}
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
