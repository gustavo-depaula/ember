import { format } from 'date-fns'
import { useLocalSearchParams } from 'expo-router'
import { useMemo } from 'react'

import { PrayerFlow } from '@/features/divine-office/components'
import type { OfficeHour } from '@/features/divine-office/engine'

export default function OfficePrayerScreen() {
  const { hour } = useLocalSearchParams<{ hour: OfficeHour }>()
  const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), [])
  return <PrayerFlow hour={hour as OfficeHour} date={today} />
}
