import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { XStack, YStack } from 'tamagui'

import { Typography } from '@/components'
import { getPinnableSelects } from '@/content/pins'
import { loadFlow } from '@/content/resolver'
import type { SlotState } from '@/db/events'
import { getPractice } from '@/db/repositories'
import { lightTap } from '@/lib/haptics'
import { localizeContent } from '@/lib/i18n'

// Fixes a slot to one of the practice's pinnable choices — an hour of an
// office, a set of mysteries — or leaves it automatic. Renders nothing for a
// practice without any.
export function PinPicker({
  slot,
  onChange,
}: {
  slot: SlotState
  onChange: (pins: Record<string, string>) => void
}) {
  const { t } = useTranslation()
  const prayedId = getPractice(slot.practice_id)?.active_variant ?? slot.practice_id
  // Same key as usePractice, so the flow is fetched once for both.
  const { data: flow } = useQuery({
    queryKey: ['flow', prayedId, null],
    queryFn: async () => (await loadFlow(prayedId)) ?? null,
    staleTime: Number.POSITIVE_INFINITY,
  })
  const selects = getPinnableSelects(flow ?? undefined)
  if (selects.length === 0) return null

  const pins = slot.pins ?? {}

  function choose(key: string, id: string | undefined) {
    lightTap()
    const { [key]: _, ...rest } = pins
    onChange(id === undefined ? rest : { ...rest, [key]: id })
  }

  return (
    <YStack gap="$lg">
      {selects.map((select) => {
        const choices = [
          { id: undefined, label: t('editor.pinAutomatic') },
          ...select.options.map((o) => ({ id: o.id, label: localizeContent(o.label) })),
        ]
        return (
          <YStack key={select.key} gap="$sm">
            {select.label && (
              <Typography variant="label" tone="muted">
                {localizeContent(select.label)}
              </Typography>
            )}
            <XStack flexWrap="wrap" columnGap="$md" rowGap="$xs">
              {choices.map((choice) => {
                const selected = pins[select.key] === choice.id
                return (
                  <Pressable
                    key={choice.id ?? 'automatic'}
                    onPress={() => choose(select.key, choice.id)}
                    hitSlop={6}
                    accessibilityRole="radio"
                    accessibilityLabel={choice.label}
                    accessibilityState={{ selected }}
                    aria-checked={selected}
                  >
                    <Typography
                      fontSize="$3"
                      color={selected ? '$accent' : '$colorSecondary'}
                      fontWeight={selected ? '600' : '400'}
                    >
                      {choice.label}
                    </Typography>
                  </Pressable>
                )
              })}
            </XStack>
          </YStack>
        )
      })}
    </YStack>
  )
}
