import { View, XStack } from 'tamagui'

/**
 * A row of dots. `fill` (default) lights every dot up to the active one — a
 * progress bar; with `fill={false}` only the active dot lights — a carousel
 * position indicator. The active dot is always widened.
 */
export function Dots({
  count,
  activeIndex,
  fill = true,
}: {
  count: number
  activeIndex: number
  fill?: boolean
}) {
  return (
    <XStack gap="$xs" justifyContent="center" alignItems="center" accessibilityRole="progressbar">
      {Array.from({ length: count }, (_, i) => {
        const active = i === activeIndex
        const on = fill ? i <= activeIndex : active
        return (
          <View
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length static dots
            key={i}
            width={active ? 18 : 6}
            height={6}
            borderRadius={3}
            backgroundColor={on ? '$accent' : '$accentSubtle'}
          />
        )
      })}
    </XStack>
  )
}

/** Step progress for the onboarding scaffold (1-based step of total). */
export function OnboardingProgress({ index, total }: { index: number; total: number }) {
  return <Dots count={total} activeIndex={index - 1} />
}
