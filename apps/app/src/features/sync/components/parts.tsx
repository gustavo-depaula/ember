import qrcode from 'qrcode-generator'
import type { ReactNode } from 'react'
import { ActivityIndicator } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { Text, useTheme, YStack } from 'tamagui'

import { AnimatedPressable, Typography } from '@/components'

export function GoldButton({
  label,
  onPress,
  busy,
}: {
  label: string
  onPress: () => void
  busy?: boolean
}) {
  const theme = useTheme()
  return (
    <AnimatedPressable
      onPress={busy ? undefined : onPress}
      disabled={busy}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{ alignSelf: 'stretch' }}
    >
      <YStack
        height={50}
        borderRadius={25}
        backgroundColor="$accent"
        alignItems="center"
        justifyContent="center"
        opacity={busy ? 0.7 : 1}
      >
        {busy ? (
          <ActivityIndicator color={theme.background?.val} />
        ) : (
          <Typography variant="label" letterSpacing={1.5} color="$background">
            {label}
          </Typography>
        )}
      </YStack>
    </AnimatedPressable>
  )
}

export function TextAction({
  label,
  onPress,
  color = '$accent',
}: {
  label: string
  onPress: () => void
  color?: string
}) {
  return (
    <AnimatedPressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{ alignSelf: 'center' }}
    >
      <Typography variant="label" letterSpacing={1.5} color={color}>
        {label}
      </Typography>
    </AnimatedPressable>
  )
}

export function Lead({ children }: { children: ReactNode }) {
  return (
    <Text fontFamily="$body" fontSize="$3" lineHeight={27} color="$color">
      {children}
    </Text>
  )
}

export function Quiet({ children, center }: { children: ReactNode; center?: boolean }) {
  return (
    <Text
      fontFamily="$body"
      fontSize="$2"
      lineHeight={23}
      color="$colorSecondary"
      textAlign={center ? 'center' : 'left'}
    >
      {children}
    </Text>
  )
}

/** Digits set to be read across a room and compared: lining, evenly spaced. */
export function BigDigits({ children }: { children: string }) {
  return (
    <Text
      fontFamily="$body"
      fontSize={44}
      lineHeight={56}
      letterSpacing={6}
      color="$color"
      textAlign="center"
      fontVariant={['lining-nums', 'tabular-nums']}
      accessibilityLabel={children.split('').join(' ')}
    >
      {children}
    </Text>
  )
}

/** A QR code of `value`, dark on a white tile in either theme so a camera reads it. */
export function QrCode({ value, size }: { value: string; size: number }) {
  const code = qrcode(0, 'M')
  code.addData(value)
  code.make()
  const count = code.getModuleCount()
  let path = ''
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (code.isDark(row, col)) path += `M${col} ${row}h1v1h-1z`
    }
  }
  return (
    <YStack backgroundColor="#FFFFFF" padding={16} borderRadius="$lg" alignSelf="center">
      <Svg width={size} height={size} viewBox={`0 0 ${count} ${count}`}>
        <Path d={path} fill="#1A1612" />
      </Svg>
    </YStack>
  )
}
