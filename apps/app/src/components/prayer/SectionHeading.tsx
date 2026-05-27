import type { ComponentProps } from 'react'

import { Typography } from '../typography'

/**
 * Canonical liturgical-section header (rung 5). One source of truth for the
 * "named action of the rite" label — Saudação, Evangelho, Homilia, Oração do
 * dia, Primeira Leitura, etc. Used by the `subheading` and `heading` flow nodes
 * plus the labels at the top of OptionsBlock and ChoiceRichTextBlock so every
 * section in a practice reads at the same visual tier.
 *
 * A thin wrapper over `<Typography variant="label">` that adds the section's top
 * padding. Distinct from `SectionMarker` (major division — uppercase + rules)
 * and the `sacred-title` variant (rung 6 — the unique name of a feast/hour).
 */
export function SectionHeading(props: ComponentProps<typeof Typography>) {
  return <Typography variant="label" paddingTop="$sm" {...props} />
}
