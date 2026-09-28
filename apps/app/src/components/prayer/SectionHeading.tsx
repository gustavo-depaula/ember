import type { ComponentProps } from 'react'

import { Typography } from '../typography'

/**
 * Liturgical-section header (rung 5) — the named action of the rite: Saudação,
 * Evangelho, Oração do dia. Distinct from `SectionMarker` (major division) and
 * the `sacred-title` variant (rung 6 — the unique name of a feast/hour).
 */
export function SectionHeading(props: ComponentProps<typeof Typography>) {
  return <Typography variant="section-title" paddingTop="$sm" {...props} />
}
