import type { ReactNode } from 'react'
import { XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '../AnimatedPressable'
import { Typography } from '../typography'

/**
 * The manuscript idiom for the interactive blocks inside a prayer — offering,
 * capture, resolution.
 *
 * These blocks used to render as bordered, surface-filled cards, which made
 * them the only boxed thing on a page of rubrics and line-set prayer: a form
 * widget dropped into a Book of Hours. Nothing here draws a box. A block is a
 * section heading in the same italic as every other section of the rite, then
 * lines carrying the gold fleuron that `MovementCard` already uses for a
 * petition, then quiet gold actions. Chrome recedes; the prayer stays the page.
 */

/** One carried line — gold fleuron, the text, optional trailing controls. */
export function FlowLine({
  text,
  muted,
  children,
}: {
  text: string
  muted?: boolean
  children?: ReactNode
}) {
  return (
    <XStack alignItems="baseline" gap="$sm" paddingVertical="$xs">
      <Typography color="$accent">⟢</Typography>
      <Typography flex={1} flexWrap="wrap" fontSize="$4" tone={muted ? 'muted' : 'default'}>
        {text}
      </Typography>
      {children ? (
        <XStack alignItems="center" gap="$md" flexShrink={0}>
          {children}
        </XStack>
      ) : undefined}
    </XStack>
  )
}

/**
 * A quiet gold action. Mixed-case body serif rather than tracked caps — the
 * same register as the home screen's "Add practices →", so an invitation inside
 * a prayer reads as an invitation and not as a liturgical label.
 */
export function FlowAction({
  label,
  onPress,
  disabled,
}: {
  label: string
  onPress: () => void
  disabled?: boolean
}) {
  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <Typography color="$accent" fontSize="$3">
        {label}
      </Typography>
    </AnimatedPressable>
  )
}

/** Row of actions under a block, separated by a middot. */
export function FlowActions({ children }: { children: ReactNode }) {
  return (
    <XStack alignItems="center" gap="$sm" flexWrap="wrap" paddingTop="$xs">
      {children}
    </XStack>
  )
}

export function FlowActionSeparator() {
  return (
    <Typography tone="muted" aria-hidden>
      ·
    </Typography>
  )
}

/** Vertical rhythm for a whole interactive block. */
export function FlowInteraction({ children }: { children: ReactNode }) {
  return <YStack gap="$xs">{children}</YStack>
}
