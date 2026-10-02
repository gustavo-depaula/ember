import DateTimePicker, { type DateTimePickerProps } from '@expo/ui/community/datetime-picker'
import { useTranslation } from 'react-i18next'
import { useTheme, useThemeName } from 'tamagui'

/**
 * Android stand-in for `@react-native-community/datetimepicker`; Metro swaps it
 * in for `platform === 'android'` (see `metro.config.js`).
 *
 * The community picker opens the old AppCompat dialogs. `@expo/ui`'s drop-in
 * takes the same props and draws Material 3's pickers in Compose — left to
 * itself in the device's wallpaper colours and a 24-hour clock, so it is given
 * the app's gold and the clock of the app's language.
 */
export default function AndroidDateTimePicker(props: DateTimePickerProps) {
  const theme = useTheme()
  const isDark = useThemeName().startsWith('dark')
  const { i18n } = useTranslation()
  const hour12 = new Intl.DateTimeFormat(i18n.language, { hour: 'numeric' }).resolvedOptions()
    .hour12
  return (
    <DateTimePicker
      accentColor={theme.accent.val}
      themeVariant={isDark ? 'dark' : 'light'}
      is24Hour={!hour12}
      {...props}
    />
  )
}
