import type { BilingualText, RenderedSection } from '@ember/content-engine'
import { ChevronRight } from 'lucide-react-native'
import { useState } from 'react'
import { Pressable } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'
import { PrayerLines } from '../PrayerText'
import { BilingualBlock } from './BilingualBlock'

export function CollapsiblePrayer({
  title,
  text,
  count,
  sections,
  renderSection,
}: {
  title: BilingualText
  text: BilingualText
  count?: number
  sections?: RenderedSection[]
  renderSection?: (section: RenderedSection, index: number) => React.ReactNode
}) {
  const [expanded, setExpanded] = useState(false)
  const theme = useTheme()

  return (
    <YStack gap="$xs">
      <Pressable
        onPress={() => setExpanded(!expanded)}
        accessibilityRole="button"
        accessibilityLabel={title.primary}
        accessibilityState={{ expanded }}
      >
        <XStack alignItems="center" gap="$sm">
          <ChevronRight
            size={14}
            color={theme.colorSecondary.val}
            style={{ transform: [{ rotate: expanded ? '90deg' : '0deg' }] }}
          />
          <Text fontFamily="$heading" fontSize="$2" color="$color">
            {title.primary}
          </Text>
          {count !== undefined && count > 1 && (
            <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
              ×{count}
            </Text>
          )}
        </XStack>
      </Pressable>
      {expanded && (
        <YStack paddingLeft="$lg" gap="$sm">
          {sections && renderSection ? (
            sections.map((s, i) => renderSection(s, i))
          ) : (
            <BilingualBlock content={text} renderText={(t) => <PrayerLines text={t} />} />
          )}
        </YStack>
      )}
    </YStack>
  )
}
