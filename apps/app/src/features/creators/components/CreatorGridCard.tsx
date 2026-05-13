/**
 * Apple-Podcasts-style grid/carousel card for the Creators directory:
 * big square artwork + name + role caption. Tap → routes to the creator
 * profile. The artwork uses the same channel-image priority chain as the
 * profile hero, falling back to a Mic2 icon when nothing's stored yet.
 */

import { useQuery } from '@tanstack/react-query'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { Mic2 } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Text, useTheme, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { bareId, getEntry } from '@/content/contentIndex'
import type { CatalogEntry, CreatorRole } from '@/content/manifestTypes'
import { getCreatorImage } from '@/db/repositories/creatorMeta'
import { getCreatorAvatarUrl } from '@/db/repositories/feedItems'
import { localizeContent } from '@/lib/i18n'

const ROLE_LABEL: Record<CreatorRole, string> = {
  priest: 'creators.role.priest',
  bishop: 'creators.role.bishop',
  deacon: 'creators.role.deacon',
  religious: 'creators.role.religious',
  'lay-theologian': 'creators.role.layTheologian',
}

export function CreatorGridCard({ creatorId, size = 150 }: { creatorId: string; size?: number }) {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const entry = getEntry(creatorId) as CatalogEntry | undefined
  const { data: avatarUrl } = useQuery({
    queryKey: ['creator-avatar', creatorId],
    queryFn: async () => {
      const channelImage = await getCreatorImage(creatorId)
      if (channelImage) return channelImage
      return await getCreatorAvatarUrl(creatorId)
    },
    enabled: !!entry,
    staleTime: 5 * 60 * 1000,
  })
  if (!entry || entry.kind !== 'creator') return null

  const name = localizeContent(entry.name ?? {})
  const roleKey = entry.creatorRole ? ROLE_LABEL[entry.creatorRole] : undefined
  const roleLabel = roleKey ? t(roleKey) : undefined

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
      <YStack width={size} gap="$sm">
        <YStack
          width={size}
          height={size}
          borderRadius={14}
          overflow="hidden"
          backgroundColor="$accentSubtle"
          alignItems="center"
          justifyContent="center"
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 6 }}
          shadowOpacity={0.18}
          shadowRadius={12}
        >
          {avatarUrl ? (
            <Image
              source={avatarUrl}
              style={{ width: size, height: size }}
              contentFit="cover"
              transition={200}
              accessibilityLabel={name}
            />
          ) : (
            <Mic2 size={42} color={theme.accent.val} />
          )}
        </YStack>
        <YStack gap={2}>
          <Text fontFamily="$heading" fontSize="$2" color="$color" numberOfLines={2}>
            {name}
          </Text>
          {roleLabel && (
            <Text
              fontFamily="$body"
              fontSize="$1"
              color="$colorSecondary"
              letterSpacing={1}
              textTransform="uppercase"
              numberOfLines={1}
            >
              {roleLabel}
            </Text>
          )}
        </YStack>
      </YStack>
    </AnimatedPressable>
  )
}
