import { useTranslation } from 'react-i18next'
import { Text, useTheme, YStack } from 'tamagui'

import { AnimatedPressable, ZoomLink } from '@/components'
import { PracticeIcon } from '@/components/PracticeIcon'
import { getEntry } from '@/content/contentIndex'
import type { CatalogEntry } from '@/content/manifestTypes'
import { localizeContent } from '@/lib/i18n'

function bareId(corpusId: string): string {
  const slash = corpusId.indexOf('/')
  return slash === -1 ? corpusId : corpusId.slice(slash + 1)
}

export function HeroCard({
  collectionId,
  taglineKey,
}: {
  collectionId: string
  taglineKey: string
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const entry = getEntry(collectionId) as CatalogEntry | undefined
  if (!entry || entry.kind !== 'collection') return null

  const icon = (entry as { icon?: string }).icon ?? 'prayer'

  return (
    <ZoomLink
      href={{
        pathname: '/browse/[collectionId]',
        params: { collectionId: bareId(collectionId) },
      }}
    >
      <AnimatedPressable
        accessibilityRole="link"
        accessibilityLabel={localizeContent(entry.name ?? {})}
      >
        <YStack
          backgroundColor="$accentSubtle"
          borderRadius="$lg"
          borderWidth={1}
          borderColor={theme.accent?.val}
          paddingHorizontal="$lg"
          paddingVertical="$lg"
          gap="$sm"
        >
          <Text
            fontFamily="$heading"
            fontSize="$1"
            color="$accent"
            letterSpacing={2}
            textTransform="uppercase"
          >
            {t('pray.todayInChurch')}
          </Text>
          <YStack flexDirection="row" alignItems="center" gap="$md">
            <YStack
              width={48}
              height={48}
              alignItems="center"
              justifyContent="center"
              backgroundColor="$background"
              borderRadius="$md"
            >
              <PracticeIcon name={icon} size={28} />
            </YStack>
            <YStack flex={1} gap={2}>
              <Text fontFamily="$heading" fontSize="$5" color="$color">
                {localizeContent(entry.name ?? {})}
              </Text>
              <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" fontStyle="italic">
                {t(taglineKey)}
              </Text>
            </YStack>
          </YStack>
        </YStack>
      </AnimatedPressable>
    </ZoomLink>
  )
}
