import type { ReactNode } from 'react'
import { XStack, YStack } from 'tamagui'

import { Typography } from './typography'

/**
 * Screen title, left-aligned. Two registers, so functional screens stop
 * borrowing the sacred voice:
 * - `variant="utility"` (default) — Settings, Library, Plan, Explore… render in
 *   the quiet `screen-title` voice.
 * - `variant="sacred"` — content/sacred screens (Saints, Scripture…) render in
 *   the medievalist `sacred-title` (rung 6).
 *
 * An optional `action` renders to the right of the title (e.g. a settings gear
 * on the You tab); when present the header lays out as a row.
 */
export function PageHeader({
  title,
  variant = 'utility',
  action,
}: {
  title: string
  variant?: 'utility' | 'sacred'
  action?: ReactNode
}) {
  const titleNode =
    variant === 'sacred' ? (
      <Typography variant="sacred-title" textAlign="left">
        {title}
      </Typography>
    ) : (
      <Typography variant="screen-title">{title}</Typography>
    )

  // Negative margins tighten the title against the screen's standard
  // `paddingVertical="$lg"` (above) and `gap="$lg"` (below) so the header sits
  // close to the top and close to its content.
  if (action) {
    return (
      <XStack
        marginTop="$-md"
        marginBottom="$-sm"
        alignItems="center"
        justifyContent="space-between"
        gap="$md"
      >
        {titleNode}
        {action}
      </XStack>
    )
  }

  return (
    <YStack marginTop="$-md" marginBottom="$-sm">
      {titleNode}
    </YStack>
  )
}
