import { YStack } from 'tamagui'

import { Typography } from './typography'

/**
 * Screen title, left-aligned. Two registers, so functional screens stop
 * borrowing the sacred voice:
 * - `variant="utility"` (default) — Settings, Library, Plan, Explore… render in
 *   the quiet `screen-title` voice.
 * - `variant="sacred"` — content/sacred screens (Saints, Scripture…) render in
 *   the medievalist `sacred-title` (rung 6).
 */
export function PageHeader({
  title,
  variant = 'utility',
}: {
  title: string
  variant?: 'utility' | 'sacred'
}) {
  return (
    // Negative margins tighten the title against the screen's standard
    // `paddingVertical="$lg"` (above) and `gap="$lg"` (below) so the header sits
    // close to the top and close to its content.
    <YStack marginTop="$-md" marginBottom="$-sm">
      {variant === 'sacred' ? (
        <Typography variant="sacred-title" textAlign="left">
          {title}
        </Typography>
      ) : (
        <Typography variant="screen-title">{title}</Typography>
      )}
    </YStack>
  )
}
