import { ChevronDown, ChevronRight } from 'lucide-react-native'
import { type ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { useTheme, XStack, YStack } from 'tamagui'

import { SectionDivider } from '@/components'
import { Typography } from '@/components/typography'
import type { PracticeManifest } from '@/content/types'
import { PrologueProse } from '@/features/collections'
import { localizeContent } from '@/lib/i18n'

/** A collapsible teaching section, introduced by an illuminated fleuron marker. */
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
  const Chevron = expanded ? ChevronDown : ChevronRight

  return (
    <YStack gap="$sm">
      <Pressable
        onPress={() => setExpanded(!expanded)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ expanded }}
      >
        <XStack alignItems="center" gap="$sm">
          <Typography fontSize="$1">✦</Typography>
          <Typography variant="screen-title" fontSize="$4" textAlign="left">
            {title}
          </Typography>
          <YStack flex={1} height={1} backgroundColor="$accentSubtle" />
          <Chevron size={18} color={theme.accent.val} />
        </XStack>
      </Pressable>
      {expanded && <PrologueProse text={content} />}
    </YStack>
  )
}

export function PracticeTeachingContent({
  manifest,
  defaultExpanded = false,
  afterDescription,
}: {
  manifest: PracticeManifest
  defaultExpanded?: boolean
  /** Optional slot rendered between the short description and the collapsible
   * History / How To Pray sections — used to drop the variant picker into the
   * page flow without bypassing the teaching component. */
  afterDescription?: ReactNode
}) {
  const { t } = useTranslation()

  const description = manifest.description ? localizeContent(manifest.description) : undefined
  const history = manifest.history ? localizeContent(manifest.history) : undefined
  const howToPray = manifest.howToPray ? localizeContent(manifest.howToPray) : undefined

  if (!description && !history && !howToPray && !afterDescription) return null

  const beforeHistory = description || afterDescription

  return (
    <YStack gap="$lg">
      {description && <PrologueProse text={description} />}

      {afterDescription}

      {history && (
        <>
          {beforeHistory && <SectionDivider />}
          <CollapsibleSection
            title={t('catalog.history')}
            content={history}
            defaultExpanded={defaultExpanded}
          />
        </>
      )}

      {howToPray && (
        <>
          {(beforeHistory || history) && <SectionDivider />}
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
