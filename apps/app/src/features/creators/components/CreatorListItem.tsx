/**
 * List-row representation of a creator (for the dedicated /creators directory).
 * Bigger, scannable, native-iOS shape: circular avatar, display name, byline,
 * chevron. Distinct from CreatorCard (used in horizontal scrollers).
 */

import { useQuery } from '@tanstack/react-query'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { ChevronRight, Mic2 } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, Typography } from '@/components'
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

const AVATAR_SIZE = 64

export function CreatorListItem({ creatorId }: { creatorId: string }) {
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
      <XStack
        gap="$md"
        paddingVertical="$md"
        paddingHorizontal="$lg"
        alignItems="center"
        backgroundColor="$background"
      >
        <YStack
          width={AVATAR_SIZE}
          height={AVATAR_SIZE}
          borderRadius={AVATAR_SIZE / 2}
          backgroundColor="$accentSubtle"
          alignItems="center"
          justifyContent="center"
          overflow="hidden"
        >
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
              accessibilityLabel={name}
            />
          ) : (
            <Mic2 size={26} color={theme.accent.val} />
          )}
        </YStack>
        <YStack flex={1} gap={2}>
          <Typography
            variant="sacred-title"
            fontSize="$3"
            color="$color"
            numberOfLines={1}
            textAlign="left"
          >
            {name}
          </Typography>
          {roleLabel && (
            <Text
              fontFamily="$heading"
              fontSize="$1"
              color="$accent"
              letterSpacing={1.5}
              textTransform="uppercase"
            >
              {roleLabel}
            </Text>
          )}
        </YStack>
        <ChevronRight size={18} color={theme.colorSecondary.val} />
      </XStack>
    </AnimatedPressable>
  )
}
