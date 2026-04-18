import { format } from 'date-fns'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { useEventStore } from '@/db/events'
import { useCurrentAngelusSlot } from '@/features/angelus'
import { useLiturgicalTheme } from '@/hooks/useLiturgicalTheme'
import { WhisperLine } from './WhisperLine'

export function AngelusLine({ date }: { date: Date }) {
  const { t } = useTranslation()
  const router = useRouter()
  const { season } = useLiturgicalTheme()
  const slot = useCurrentAngelusSlot()
  const dateKey = format(date, 'yyyy-MM-dd')
  const prayed = useEventStore((s) => (slot ? s.angelusPrayed.has(`${dateKey}:${slot}`) : false))

  if (!slot) return null
  if (prayed) return null

  const label = season === 'easter' ? t('angelus.reginaCaeliBell') : t('angelus.bell')

  return (
    <WhisperLine
      onPress={() => router.push('/angelus')}
      label={label}
      accessibilityLabel={t('angelus.title')}
    />
  )
}
