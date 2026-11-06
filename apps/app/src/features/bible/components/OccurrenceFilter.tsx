import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { View, XStack, YStack } from 'tamagui'

import { Typography } from '@/components'

import type { Facet, Form } from '../occurrenceFilter'

/**
 * A word's occurrences narrowed by form, a row per feature the word varies in
 * ("STEM Qal 120 · Hiphil 34"). A value chosen again is let go. Typographic,
 * as the reader's other choices are: the chosen value in burgundy, underlined.
 */
export function OccurrenceFilter({
  facets,
  selection,
  label,
  onChange,
}: {
  facets: Facet[]
  selection: Form
  /** A value as the reader reads it: "aorist", "Hiphil". */
  label: (feature: string, value: string) => string
  onChange: (selection: Form) => void
}) {
  const { t } = useTranslation()
  if (!facets.length) return undefined
  return (
    <YStack gap="$xs">
      {facets.map(({ feature, values }) => (
        <XStack key={feature} flexWrap="wrap" alignItems="baseline" columnGap="$md" rowGap={2}>
          <Typography variant="label" fontSize="$1" letterSpacing={1.5} tone="muted" minWidth={64}>
            {t(`bible.study.features.${feature}`).toUpperCase()}
          </Typography>
          {values.map(({ value, count }) => {
            const chosen = selection[feature] === value
            const name = label(feature, value)
            return (
              <Pressable
                key={value}
                onPress={() => onChange({ ...selection, [feature]: chosen ? undefined : value })}
                hitSlop={8}
                accessibilityRole="checkbox"
                accessibilityLabel={t('a11y.filterOccurrences', { form: name, count })}
                accessibilityState={{ checked: chosen }}
              >
                <View
                  minHeight={32}
                  justifyContent="center"
                  borderBottomWidth={1}
                  borderBottomColor={chosen ? '$colorBurgundy' : 'transparent'}
                >
                  <Typography fontSize="$2" color={chosen ? '$colorBurgundy' : '$color'}>
                    {name}
                    <Typography fontSize="$1" color={chosen ? '$colorBurgundy' : '$colorSecondary'}>
                      {` ${count}`}
                    </Typography>
                  </Typography>
                </View>
              </Pressable>
            )
          })}
        </XStack>
      ))}
    </YStack>
  )
}
