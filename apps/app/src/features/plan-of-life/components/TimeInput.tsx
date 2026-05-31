import DateTimePicker from '@react-native-community/datetimepicker'
import { Clock } from 'lucide-react-native'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import { Text, useTheme, XStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { lightTap } from '@/lib/haptics'

import { deriveTimeBlock } from '../timeBlocks'

export function TimeInput({
  value,
  onChange,
}: {
  value: string | null
  onChange: (time: string | null) => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const [showPicker, setShowPicker] = useState(false)

  const date = useMemo(() => {
    if (!value) return new Date(2000, 0, 1, 8, 0)
    const [h, m] = value.split(':').map(Number)
    return new Date(2000, 0, 1, h || 0, m || 0)
  }, [value])

  const blockLabel = value ? deriveTimeBlock(value) : 'flexible'

  if (!value) {
    return (
      <AnimatedPressable
        onPress={() => {
          lightTap()
          onChange('08:00')
          if (Platform.OS !== 'ios') setShowPicker(true)
        }}
        accessibilityRole="button"
        accessibilityLabel={t('editor.setTime')}
      >
        <XStack
          alignItems="center"
          gap="$sm"
          paddingVertical="$sm"
          paddingHorizontal="$md"
          borderRadius="$md"
          borderWidth={1}
          borderColor="$borderColor"
          borderStyle="dashed"
        >
          <Clock size={18} color={theme.accent.val} />
          <Text fontFamily="$body" fontSize="$3" color="$accent">
            {t('editor.setTime')}
          </Text>
        </XStack>
      </AnimatedPressable>
    )
  }

  return (
    <XStack alignItems="center" gap="$md">
      {Platform.OS === 'ios' ? (
        <DateTimePicker
          value={date}
          mode="time"
          display="compact"
          onChange={(_, selected) => {
            if (selected) {
              const hh = String(selected.getHours()).padStart(2, '0')
              const mm = String(selected.getMinutes()).padStart(2, '0')
              onChange(`${hh}:${mm}`)
            }
          }}
        />
      ) : (
        <>
          <AnimatedPressable
            onPress={() => {
              lightTap()
              setShowPicker(true)
            }}
            accessibilityRole="button"
            accessibilityLabel={t('editor.timeOfDay')}
            accessibilityValue={{ text: value }}
          >
            <XStack
              alignItems="center"
              gap="$sm"
              paddingVertical="$sm"
              paddingHorizontal="$md"
              borderRadius="$md"
              borderWidth={1}
              borderColor="$accent"
            >
              <Clock size={18} color={theme.accent.val} />
              <Text fontFamily="$body" fontSize="$3" color="$accent">
                {value}
              </Text>
            </XStack>
          </AnimatedPressable>
          {showPicker && (
            <DateTimePicker
              value={date}
              mode="time"
              display="default"
              onChange={(_, selected) => {
                setShowPicker(false)
                if (selected) {
                  const hh = String(selected.getHours()).padStart(2, '0')
                  const mm = String(selected.getMinutes()).padStart(2, '0')
                  onChange(`${hh}:${mm}`)
                }
              }}
            />
          )}
        </>
      )}
      <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
        {t(`timeBlock.${blockLabel}`)}
      </Text>
      <AnimatedPressable
        onPress={() => {
          lightTap()
          onChange(null)
        }}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={t('common.clear')}
      >
        <Text fontFamily="$body" fontSize="$3" color="$colorSecondary">
          {t('common.clear')}
        </Text>
      </AnimatedPressable>
    </XStack>
  )
}
