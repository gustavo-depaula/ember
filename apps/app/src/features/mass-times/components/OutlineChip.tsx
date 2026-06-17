import { styled, XStack } from 'tamagui'

// The shared outlined-pill surface used for kind chips and contact buttons. Callers set their own
// padding and content; the border treatment lives here so it stays consistent.
export const OutlineChip = styled(XStack, {
  alignItems: 'center',
  borderRadius: '$sm',
  borderWidth: 1,
  borderColor: '$borderColor',
})
