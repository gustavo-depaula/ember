import { useTranslation } from 'react-i18next'
import { TextInput } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'

import { useRecentSubjects } from '../hooks'

export function SubjectInput({
  value,
  onChange,
}: {
  value: string
  onChange: (subject: string) => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const recents = useRecentSubjects(8)

  return (
    <YStack gap="$xs">
      <Text fontFamily="$heading" fontSize="$1" color="$colorSecondary" letterSpacing={1}>
        {t('movements.subject.label').toUpperCase()}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={t('movements.subject.placeholder')}
        placeholderTextColor={theme.colorSecondary?.val}
        style={{
          fontFamily: 'EBGaramond_400Regular',
          fontSize: 14,
          color: theme.color?.val,
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: theme.borderColor?.val,
          backgroundColor: theme.backgroundSurface?.val,
        }}
      />
      {recents.length > 0 ? (
        <XStack flexWrap="wrap" gap="$xs">
          {recents.map((s) => (
            <AnimatedPressable
              key={s}
              onPress={() => onChange(s)}
              accessibilityRole="button"
              accessibilityLabel={t('movements.subject.useRecent', { subject: s })}
            >
              <XStack
                paddingVertical="$xs"
                paddingHorizontal="$sm"
                borderRadius={999}
                borderWidth={1}
                borderColor={value === s ? '$accent' : '$borderColor'}
                backgroundColor={value === s ? '$accent' : 'transparent'}
              >
                <Text
                  fontFamily="$body"
                  fontSize="$1"
                  color={value === s ? 'white' : '$colorSecondary'}
                >
                  {s}
                </Text>
              </XStack>
            </AnimatedPressable>
          ))}
        </XStack>
      ) : undefined}
    </YStack>
  )
}
