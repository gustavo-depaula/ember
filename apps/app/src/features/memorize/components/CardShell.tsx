import type { ReactNode } from 'react'
import { Text, YStack } from 'tamagui'

// Shared layout for all three card modes: title, optional portion label, body slot.
// Uses Cinzel for the title to match prayer detail surfaces.
export function CardShell({
  title,
  portionLabel,
  children,
}: {
  title: string
  portionLabel?: string
  children: ReactNode
}) {
  return (
    <YStack gap="$lg" paddingHorizontal="$lg" paddingVertical="$xl">
      <YStack gap="$xs" alignItems="center">
        <Text
          fontFamily="$heading"
          fontSize="$5"
          color="$color"
          textAlign="center"
          maxFontSizeMultiplier={1.4}
        >
          {title}
        </Text>
        {portionLabel ? (
          <Text fontFamily="$body" fontSize="$2" color="$colorSubtle" textAlign="center">
            {portionLabel}
          </Text>
        ) : null}
      </YStack>
      {children}
    </YStack>
  )
}
