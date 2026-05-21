import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { Text, XStack, YStack } from 'tamagui'

import { useFallsSinceLastConfession } from '../hooks'

export function FallsLog() {
  const { t } = useTranslation()
  const { data: falls, isPending } = useFallsSinceLastConfession()

  if (isPending) return null
  if (!falls || falls.length === 0) {
    return (
      <YStack
        padding="$md"
        borderRadius="$md"
        borderWidth={1}
        borderColor="$borderColor"
        borderStyle="dashed"
      >
        <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" textAlign="center">
          {t('custody.falls.empty', { defaultValue: 'No falls since your last confession.' })}
        </Text>
      </YStack>
    )
  }

  // Group by commitment
  const grouped = new Map<string, typeof falls>()
  for (const fall of falls) {
    const list = grouped.get(fall.commitment_id) ?? []
    list.push(fall)
    grouped.set(fall.commitment_id, list)
  }

  return (
    <YStack gap="$sm">
      <Text fontFamily="$heading" fontSize="$3" color="$color">
        {t('custody.falls.heading', {
          defaultValue: 'Falls since last confession',
          count: falls.length,
        })}
      </Text>
      {[...grouped.entries()].map(([commitmentId, items]) => {
        const first = items[0]
        return (
          <YStack
            key={commitmentId}
            gap="$xs"
            padding="$md"
            borderRadius="$md"
            backgroundColor="$backgroundSurface"
          >
            <Text fontFamily="$heading" fontSize="$2" color="$color">
              {first.commitment.name}
            </Text>
            <YStack gap={2}>
              {items.map((fall) => (
                <XStack key={fall.id} gap="$xs">
                  <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                    {format(new Date(fall.occurred_at), 'MMM d, HH:mm')}
                  </Text>
                  {fall.note && (
                    <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                      — {fall.note}
                    </Text>
                  )}
                </XStack>
              ))}
            </YStack>
          </YStack>
        )
      })}
    </YStack>
  )
}
