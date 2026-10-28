import type { ReactNode } from 'react'
import { YStack } from 'tamagui'
import { AnimatedPressable, Typography } from '@/components'
import { useGlassTile } from './glass'

// One tile of the church's action bar (the Maps place-card row): icon over label, sharing the row
// equally with its siblings. `detail` sets a small line under the label; `tone` colours label and
// detail together (the icon is the caller's).
export function ActionTile({
  label,
  icon,
  detail,
  tone = '$color',
  onPress,
}: {
  label: string
  icon: ReactNode
  detail?: string
  tone?: '$color' | '$colorGreen'
  onPress: () => void
}) {
  const tile = useGlassTile(true)
  return (
    <AnimatedPressable
      style={{ flex: 1 }}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={detail ? `${label}, ${detail}` : label}
    >
      <YStack
        backgroundColor={tile}
        borderRadius={12}
        height={64}
        justifyContent="center"
        alignItems="center"
        gap={4}
        paddingHorizontal={4}
      >
        {icon}
        <Typography
          variant="interface"
          fontSize="$1"
          lineHeight={16}
          numberOfLines={1}
          color={tone}
        >
          {label}
        </Typography>
        {detail ? (
          <Typography
            variant="annotation"
            fontSize={11}
            lineHeight={13}
            numberOfLines={1}
            color={tone === '$color' ? '$colorSecondary' : tone}
          >
            {detail}
          </Typography>
        ) : null}
      </YStack>
    </AnimatedPressable>
  )
}
