import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { XStack } from 'tamagui'

import { Typography } from '@/components'
import { useToday } from '@/hooks/useToday'
import { lightTap } from '@/lib/haptics'
import { aspirationFor } from '../aspirations'

export function Aspiratio({ date }: { date?: Date }) {
  const { t } = useTranslation()
  const today = useToday()
  const d = date ?? today
  const [offset, setOffset] = useState(0)
  const aspiration = useMemo(() => aspirationFor(d, offset), [d, offset])

  return (
    <Pressable
      onPress={() => {
        lightTap()
        setOffset((o) => o + 1)
      }}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={aspiration}
      accessibilityHint={t('a11y.nextAspiration')}
    >
      <XStack justifyContent="center" paddingVertical="$sm" paddingHorizontal="$lg">
        <Typography variant="whisper" fontSize="$2" textAlign="center" opacity={0.75}>
          {aspiration}
        </Typography>
      </XStack>
    </Pressable>
  )
}
