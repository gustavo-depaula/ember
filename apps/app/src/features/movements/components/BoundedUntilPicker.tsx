import DateTimePicker from '@react-native-community/datetimepicker'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import { YStack } from 'tamagui'

import { AnimatedPressable, Typography } from '@/components'

const defaultBoundedDays = 30

export function defaultBoundedUntil(): Date {
  const d = new Date()
  d.setDate(d.getDate() + defaultBoundedDays)
  return d
}

/**
 * The term of a bounded intention. Shared by the Altar create sheet and the
 * in-flow capture blocks — a `bounded` cadence without a date is rejected by
 * `raiseIntention`, so wherever the cadence can be chosen this must be
 * reachable too.
 *
 * iOS renders the compact picker inline; Android only has a modal dialog, so it
 * shows the current date as a button that opens it.
 */
export function BoundedUntilPicker({
  value,
  onChange,
}: {
  value: Date
  onChange: (date: Date) => void
}) {
  const { t } = useTranslation()
  const [androidPickerOpen, setAndroidPickerOpen] = useState(false)

  return (
    <YStack gap="$xs">
      <Typography variant="label" fontSize="$1" tone="muted">
        {t('movements.capture.boundedUntil').toUpperCase()}
      </Typography>
      {Platform.OS === 'ios' ? (
        <DateTimePicker
          value={value}
          mode="date"
          display="compact"
          onChange={(_, date) => date && onChange(date)}
        />
      ) : (
        <>
          <AnimatedPressable
            onPress={() => setAndroidPickerOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={t('movements.capture.boundedUntil')}
          >
            <Typography color="$accent">{value.toLocaleDateString()}</Typography>
          </AnimatedPressable>
          {androidPickerOpen ? (
            <DateTimePicker
              value={value}
              mode="date"
              display="default"
              onChange={(_, date) => {
                setAndroidPickerOpen(false)
                if (date) onChange(date)
              }}
            />
          ) : undefined}
        </>
      )}
    </YStack>
  )
}
