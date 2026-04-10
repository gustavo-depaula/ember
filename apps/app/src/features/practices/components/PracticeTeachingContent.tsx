import { ChevronDown, ChevronRight } from 'lucide-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { SectionDivider } from '@/components'
import type { PracticeManifest } from '@/content/types'
import { localizeContent } from '@/lib/i18n'

function CollapsibleSection({
  title,
  content,
  defaultExpanded = false,
}: {
  title: string
  content: string
  defaultExpanded?: boolean
}) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const theme = useTheme()
  const Icon = expanded ? ChevronDown : ChevronRight

  return (
    <YStack gap="$sm">
      <Pressable onPress={() => setExpanded(!expanded)} hitSlop={8}>
        <XStack alignItems="center" gap="$sm">
          <Icon size={16} color={theme.accent.val} />
          <Text fontFamily="$heading" fontSize="$3" color="$accent">
            {title}
          </Text>
        </XStack>
      </Pressable>
      {expanded && (
        <Text fontFamily="$body" fontSize="$3" color="$color" paddingLeft="$lg">
          {content}
        </Text>
      )}
    </YStack>
  )
}

export function PracticeTeachingContent({
  manifest,
  defaultExpanded = false,
}: {
  manifest: PracticeManifest
  defaultExpanded?: boolean
}) {
  const { t } = useTranslation()

  const description = manifest.description ? localizeContent(manifest.description) : undefined
  const history = manifest.history ? localizeContent(manifest.history) : undefined
  const howToPray = manifest.howToPray ? localizeContent(manifest.howToPray) : undefined

  if (!description && !history && !howToPray) return null

  return (
    <YStack gap="$lg">
      {description && (
        <YStack gap="$sm">
          <Text fontFamily="$heading" fontSize="$3" color="$accent">
            {t('catalog.about')}
          </Text>
          <Text fontFamily="$body" fontSize="$3" color="$color">
            {description}
          </Text>
        </YStack>
      )}

      {history && (
        <>
          <SectionDivider />
          <CollapsibleSection
            title={t('catalog.history')}
            content={history}
            defaultExpanded={defaultExpanded}
          />
        </>
      )}

      {howToPray && (
        <>
          <SectionDivider />
          <CollapsibleSection
            title={t('catalog.howToPray')}
            content={howToPray}
            defaultExpanded={defaultExpanded}
          />
        </>
      )}
    </YStack>
  )
}
