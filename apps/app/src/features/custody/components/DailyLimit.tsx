import { useTranslation } from 'react-i18next'
import { TextInput } from 'react-native'
import { Text, useTheme, XStack } from 'tamagui'

export function DailyLimit({
  minutes,
  onChange,
}: {
  minutes: string
  onChange: (minutes: string) => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  return (
    <XStack alignItems="center" gap="$sm" justifyContent="center">
      <TextInput
        value={minutes}
        onChangeText={onChange}
        keyboardType="number-pad"
        style={{
          fontFamily: 'EBGaramond_500Medium',
          fontSize: 22,
          color: theme.color.val,
          textAlign: 'center',
          minWidth: 80,
          paddingVertical: 10,
          backgroundColor: 'rgba(255,255,255,0.04)',
          borderColor: 'rgba(255,255,255,0.08)',
          borderWidth: 1,
          borderRadius: 14,
        }}
      />
      <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
        {t('custody.editor.limit.suffix')}
      </Text>
    </XStack>
  )
}
