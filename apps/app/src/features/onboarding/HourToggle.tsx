import { useTranslation } from 'react-i18next'
import Svg, { Circle } from 'react-native-svg'
import { useTheme, useThemeName, XStack, YStack } from 'tamagui'

import { AnimatedPressable, Typography } from '@/components'
import { OpenBead } from '@/features/plan-of-life/components/RuleGuide'
import { hourHue } from '@/features/plan-of-life/ruleString'
import { lightTap } from '@/lib/haptics'

/**
 * An hour of the Office on the plan's string: a bead in the hue of its time when
 * kept, the open bead when not. `hint` is a line under the name.
 */
export function HourToggle({
  testID,
  label,
  time,
  hint,
  on,
  onToggle,
}: {
  testID: string
  label: string
  time?: string
  hint?: string
  on: boolean
  onToggle: () => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const dark = useThemeName().startsWith('dark')
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
      <XStack alignItems="center" gap="$md" minHeight={52}>
        {on ? (
          <Svg width={40} height={40}>
            <Circle cx={20} cy={20} r={9} fill={hourHue(time ?? null, dark)} />
          </Svg>
        ) : (
          <OpenBead color={theme.accent.val} />
        )}
        <YStack flex={1}>
          <Typography fontSize={19} lineHeight={24} tone={on ? undefined : 'muted'}>
            {label}
          </Typography>
          {hint ? <Typography variant="caption">{hint}</Typography> : null}
        </YStack>
        <Typography tone="muted" fontSize={15}>
          {time}
        </Typography>
      </XStack>
    </AnimatedPressable>
  )
}
