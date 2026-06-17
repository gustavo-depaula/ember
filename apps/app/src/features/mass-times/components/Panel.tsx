import { styled, YStack } from 'tamagui'

// A quiet warm-surface panel — the feature's container for grouped content (schedule sections, parish
// text, the check-in log). Solid `$backgroundSurface`, rounded $lg, no border (the app's language is
// a surface that recedes, not a bordered box).
export const Panel = styled(YStack, {
  backgroundColor: '$backgroundSurface',
  borderRadius: '$lg',
  padding: '$md',
})
