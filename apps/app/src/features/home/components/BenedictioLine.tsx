import { format } from 'date-fns'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { useEventStore } from '@/db/events'
import { useCurrentMealSlot } from '@/features/benedictio'
import { useToday } from '@/hooks/useToday'
import { WhisperLine } from './WhisperLine'

export function BenedictioLine() {
  const { t } = useTranslation()
  const router = useRouter()
  const today = useToday()
  const slot = useCurrentMealSlot()
  const dateKey = format(today, 'yyyy-MM-dd')
  const blessed = useEventStore((s) => (slot ? s.mealsBlessed.has(`${dateKey}:${slot}`) : false))

  if (!slot) return null
  if (blessed) return null

  return (
    <WhisperLine
      onPress={() => router.push('/benedictio')}
      label={t(`benedictio.invite.${slot}`)}
      accessibilityLabel={t('benedictio.title')}
    />
  )
}
