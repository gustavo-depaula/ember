import type { ComponentProps } from 'react'
import { Text } from 'tamagui'

/**
 * Canonical liturgical-section header. One source of truth for the
 * "named action of the rite" label style — Saudação, Evangelho, Homilia,
 * Oração do dia, Primeira Leitura, etc. Used by the `subheading` and
 * `heading` flow nodes plus the labels at the top of OptionsBlock and
 * ChoiceRichTextBlock so every section in a practice reads at the same
 * visual tier.
 *
 * Distinct from `SectionMarker` (major division — uppercase + rules)
 * and `CelebrationBanner` (day hero).
 */
export function SectionHeading(props: ComponentProps<typeof Text>) {
  return (
    <Text
      fontFamily="$heading"
      fontSize="$3"
      color="$colorBurgundy"
      letterSpacing={0.5}
      paddingTop="$sm"
      {...props}
    />
  )
}
