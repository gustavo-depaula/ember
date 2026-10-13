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

  return (
    <>
      <Stack.Screen options={{ title: t('saints.redeem.title') }} />
      {grant && (
        <RedeemFlow
          key={grant.id}
          grant={grant}
          onDone={() => router.back()}
          // The tab bar stays away through the redeeming (this is a full-screen
          // route) and comes back with the card's own screen, swapped in
          // without a transition under the identical page.
          onOpened={(card) =>
            router.replace({ pathname: '/saints/[index]', params: { index: card, arrived: '1' } })
          }
        />
      )}
    </>
  )
}
