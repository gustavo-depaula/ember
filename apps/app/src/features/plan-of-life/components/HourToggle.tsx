import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Svg, { Circle, Path } from 'react-native-svg'
import { useTheme, useThemeName, XStack, YStack } from 'tamagui'

import { AnimatedPressable, Typography } from '@/components'
import { lightTap } from '@/lib/haptics'
import { formatSlotTime, hourHue } from '../ruleString'
import { beadRowHeight, beadX, railWidth, threadPath } from './BeadRow'

/**
 * An hour of the Office as a bead on the string it will make: in the hue of its
 * time when kept, the open bead when not. `index` and `count` place it on a
 * string of `count` hours; `hint` is a line under the name.
 */
export function HourToggle({
  testID,
  index,
  count,
  label,
  time,
  hint,
  on,
  onToggle,
}: {
  testID: string
  index: number
  count: number
  label: string
  time?: string
  hint?: string
  on: boolean
  onToggle: () => void
}) {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const dark = useThemeName().startsWith('dark')
  const hue = hourHue(time ?? null, dark)
  // A hint can wrap, so the stretch of thread is drawn to the row's own height.
  const [height, setHeight] = useState(beadRowHeight)
  const x = beadX(index)
  const y = height / 2
  return (
    <AnimatedPressable
      testID={testID}
      onPress={() => {
        lightTap()
        onToggle()
      }}
      accessibilityRole="checkbox"
      accessibilityLabel={t('a11y.onboardingHour', {
        hour: label,
        state: t(on ? 'a11y.onboardingHourOn' : 'a11y.onboardingHourOff'),
      })}
      accessibilityState={{ checked: on }}
    >
      <XStack
        alignItems="center"
        gap="$sm"
        minHeight={beadRowHeight}
        onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
      >
        <Svg width={railWidth} height={height} style={{ alignSelf: 'stretch' }}>
          <Path
            d={threadPath(index, count, height)}
            stroke={on ? hue : theme.accent.val}
            strokeOpacity={on ? 0.55 : 0.4}
            strokeWidth={1.3}
            fill="none"
          />
          {on ? (
            <Circle cx={x} cy={y} r={9} fill={hue} />
          ) : (
            <>
              <Circle
                cx={x}
                cy={y}
                r={11}
                fill={theme.background.val}
                stroke={theme.accent.val}
                strokeWidth={1.2}
                strokeDasharray="3 3"
              />
              <Path
                d={`M${x - 4},${y}h8M${x},${y - 4}v8`}
                stroke={theme.accent.val}
                strokeWidth={1.4}
                strokeLinecap="round"
              />
            </>
          )}
        </Svg>
        <YStack flex={1} paddingVertical="$xs">
          <Typography fontSize={19} lineHeight={24} tone={on ? undefined : 'muted'}>
            {label}
          </Typography>
          {hint ? <Typography variant="caption">{hint}</Typography> : null}
        </YStack>
        <Typography tone="muted" fontSize={15}>
          {time ? formatSlotTime(time, i18n.language) : ''}
        </Typography>
      </XStack>
    </AnimatedPressable>
  )
}
