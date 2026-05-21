import { useTranslation } from 'react-i18next'
import { Platform, Pressable } from 'react-native'
import { Text, YStack } from 'tamagui'

import { flags } from '@/config/flags'

import type { Severity } from '../types'

const SEVERITIES: Severity[] = ['light', 'firm', 'bound']

export function SeverityPicker({
  value,
  onChange,
}: {
  value: Severity
  onChange: (s: Severity) => void
}) {
  const { t } = useTranslation()

  return (
    <YStack gap="$sm">
      {SEVERITIES.map((sev) => {
        const selected = sev === value
        return (
          <Pressable
            key={sev}
            onPress={() => onChange(sev)}
            accessibilityRole="radio"
            accessibilityLabel={t(`custody.severity.${sev}.label`)}
            accessibilityState={{ selected }}
          >
            <YStack
              gap="$xs"
              padding="$md"
              borderRadius="$md"
              borderWidth={1}
              borderColor={selected ? '$accent' : '$borderColor'}
              backgroundColor={selected ? '$accentSubtle' : 'transparent'}
            >
              <Text fontFamily="$heading" fontSize="$3" color="$color">
                {t(`custody.severity.${sev}.label`)}
              </Text>
              <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                {t(`custody.severity.${sev}.help`)}
              </Text>
              {sev === 'bound' && Platform.OS === 'ios' && !flags.custodyBoundIOS && (
                <Text fontFamily="$body" fontSize="$1" color="$accent" fontStyle="italic">
                  {t('custody.severity.bound.coming-ios')}
                </Text>
              )}
              {sev === 'bound' && Platform.OS === 'android' && !flags.custodyBoundAndroid && (
                <Text fontFamily="$body" fontSize="$1" color="$accent" fontStyle="italic">
                  {t('custody.severity.bound.coming-android')}
                </Text>
              )}
            </YStack>
          </Pressable>
        )
      })}
    </YStack>
  )
}
