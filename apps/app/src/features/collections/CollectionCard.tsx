import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Text, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { PracticeIcon } from '@/components/PracticeIcon'
import { getCollectionItems, getEntry } from '@/content/contentIndex'
import type { CatalogEntry } from '@/content/manifestTypes'
import { localizeContent } from '@/lib/i18n'

function bareId(corpusId: string): string {
  const slash = corpusId.indexOf('/')
  return slash === -1 ? corpusId : corpusId.slice(slash + 1)
}

export function CollectionCard({
  collectionId,
  width = 200,
}: {
  collectionId: string
  width?: number | string
}) {
  const router = useRouter()
  const { t } = useTranslation()
  const entry = getEntry(collectionId) as CatalogEntry | undefined
  if (!entry || entry.kind !== 'collection') return null

  const items = getCollectionItems(collectionId)
  const itemCount = items.length
  const description = (entry as { description?: Record<string, string> }).description
  const icon = (entry as { icon?: string }).icon ?? 'prayer'

  return (
    <AnimatedPressable
      onPress={() =>
        router.push({
          pathname: '/browse/[collectionId]',
          params: { collectionId: bareId(collectionId) },
        })
      }
      accessibilityRole="link"
      accessibilityLabel={localizeContent(entry.name ?? {})}
    >
      <YStack
        width={width as number}
        backgroundColor="$backgroundSurface"
        borderRadius="$lg"
        borderWidth={1}
        borderColor="$borderColor"
        padding="$md"
        gap="$sm"
        height={172}
      >
        <YStack
          width={40}
          height={40}
          alignItems="center"
          justifyContent="center"
          backgroundColor="$accentSubtle"
          borderRadius="$md"
        >
          <PracticeIcon name={icon} size={22} />
        </YStack>
        <Text fontFamily="$heading" fontSize="$3" color="$color" numberOfLines={2}>
          {localizeContent(entry.name ?? {})}
        </Text>
        {description && (
          <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" numberOfLines={3} flex={1}>
            {localizeContent(description)}
          </Text>
        )}
        <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
          {t('catalog.practiceCount', { count: itemCount, defaultValue: `${itemCount} items` })}
        </Text>
      </YStack>
    </AnimatedPressable>
  )
}
