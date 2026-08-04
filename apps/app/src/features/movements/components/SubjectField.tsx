import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { XStack, YStack } from 'tamagui'

import { AnimatedPressable, Typography } from '@/components'
import { QuietInput } from '@/features/library/CreateCollectionSheet'
import { lightTap } from '@/lib/haptics'

import { useRecentSubjects } from '../hooks'

/**
 * Who or what this is for — the free-form tag that groups the Altar and the
 * offering list ("Family", "The parish", a name).
 *
 * Optional and folded away by default: most intentions never need one, and a
 * second always-open field on a capture sheet turns a single thought into
 * paperwork. Past subjects are offered as chips so the same tag stays spelled
 * the same way, which is the whole reason grouping works.
 */
export function SubjectField({
  value,
  onChange,
}: {
  value: string | undefined
  onChange: (subject: string | undefined) => void
}) {
  const { t } = useTranslation()
  const recent = useRecentSubjects()
  const [open, setOpen] = useState(Boolean(value))

  if (!open) {
    return (
      <AnimatedPressable
        onPress={() => {
          lightTap()
          setOpen(true)
        }}
        accessibilityRole="button"
        accessibilityLabel={t('movements.subject.addLabel')}
      >
        <Typography color="$accent" fontSize="$3">
          {t('movements.subject.addLabel')}
        </Typography>
      </AnimatedPressable>
    )
  }

  return (
    <YStack gap="$xs">
      <Typography variant="label" fontSize="$1" tone="muted">
        {t('movements.subject.label').toUpperCase()}
      </Typography>
      <QuietInput
        value={value ?? ''}
        onChangeText={(next: string) => onChange(next.trim() ? next : undefined)}
        placeholder={t('movements.subject.placeholder')}
        fontFamily="$body"
        fontSize="$3"
      />
      {recent.length > 0 ? (
        <XStack gap="$sm" flexWrap="wrap" paddingTop="$xs">
          {recent
            .filter((s) => s !== value)
            .map((s) => (
              <AnimatedPressable
                key={s}
                onPress={() => {
                  lightTap()
                  onChange(s)
                }}
                accessibilityRole="button"
                accessibilityLabel={t('movements.subject.useRecent', { subject: s })}
              >
                <XStack
                  paddingHorizontal="$sm"
                  paddingVertical={4}
                  borderRadius={999}
                  borderWidth={1}
                  borderColor="$borderColor"
                >
                  <Typography variant="caption" fontStyle="normal">
                    {s}
                  </Typography>
                </XStack>
              </AnimatedPressable>
            ))}
        </XStack>
      ) : undefined}
    </YStack>
  )
}
