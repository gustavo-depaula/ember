import { forwardRef } from 'react'
import { TextInput, type TextInputProps } from 'react-native'
import { useTheme } from 'tamagui'

type Size = 'sm' | 'md' | 'lg'

const SIZE_PROPS: Record<Size, { minHeight: number; maxHeight: number; paddingVertical: number }> =
  {
    sm: { minHeight: 48, maxHeight: 120, paddingVertical: 8 },
    md: { minHeight: 56, maxHeight: 140, paddingVertical: 10 },
    lg: { minHeight: 64, maxHeight: 160, paddingVertical: 12 },
  }

/**
 * Multiline TextInput styled for prayer-text capture (intentions, gratitudes,
 * resolutions, review notes). `surface` matches the inner background to the
 * sheet's `backgroundSurface` token; default is `background` for the inline
 * in-flow case where the input sits on a card.
 */
export const PrayerTextInput = forwardRef<
  TextInput,
  TextInputProps & { size?: Size; surface?: boolean; fontSize?: number }
>(({ size = 'md', surface = false, fontSize = 16, style, ...rest }, ref) => {
  const theme = useTheme()
  const dims = SIZE_PROPS[size]
  return (
    <TextInput
      ref={ref}
      multiline
      placeholderTextColor={theme.colorSecondary?.val}
      style={[
        {
          fontFamily: 'EBGaramond_400Regular',
          fontSize,
          color: theme.color?.val,
          textAlignVertical: 'top',
          paddingHorizontal: size === 'lg' ? 14 : 12,
          borderRadius: size === 'lg' ? 10 : 8,
          borderWidth: 1,
          borderColor: theme.borderColor?.val,
          backgroundColor: surface ? theme.backgroundSurface?.val : theme.background?.val,
          ...dims,
        },
        style,
      ]}
      {...rest}
    />
  )
})
