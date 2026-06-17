import { styled, XStack } from 'tamagui'

// The shared pill surface for kind chips, contact buttons, and filters. The app's language is a solid
// warm surface fill (like PillSelector), not an outline — selected states fill with accent instead.
export const OutlineChip = styled(XStack, {
  alignItems: 'center',
  borderRadius: '$lg',
  backgroundColor: '$backgroundSurface',
})
