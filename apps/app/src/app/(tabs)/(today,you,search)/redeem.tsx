import type { Grant } from '@ember/holy-cards'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { RedeemFlow, usePendingHolyCards } from '@/features/saints'

// Opened from the envelope heading Today's carousel.
export default function RedeemScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { grant: id } = useLocalSearchParams<{ grant: string }>()
  const pending = usePendingHolyCards()
  // Held once found: redeeming takes the grant off the pending list, and the
  // screen must keep showing the card it just opened.
  const held = useRef<Grant | undefined>(undefined)
  if (!held.current) held.current = pending?.find((g) => g.id === id)
  const grant = held.current
  const next = pending?.find((g) => g.id !== id)

  return (
    <>
      <Stack.Screen options={{ title: t('saints.redeem.title') }} />
      {grant && (
        <RedeemFlow
          key={grant.id}
          grant={grant}
          next={next}
          onNext={() => next && router.replace({ pathname: '/redeem', params: { grant: next.id } })}
          onDone={() => router.back()}
        />
      )}
    </>
  )
}
