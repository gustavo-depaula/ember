// biome-ignore-all lint/correctness/useHookAtTopLevel: dev-only screen; the __DEV__ guard is compiled out of production
// Dev-only deep link used by Maestro flows. Wipes the DB, reseeds, and applies
// fixtures (time-travel date, enabled slots) before navigating home so each
// flow starts from a known state. Returns a redirect in production builds so
// the route is never exposed to end users.
//
// Usage:
//   ember://dev/reset?date=2026-01-14&enableSlots=grace-meals::1

import { useQueryClient } from '@tanstack/react-query'
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Text, YStack } from 'tamagui'

import { resetForTests } from '@/db/test-fixtures'

export default function ResetForTests() {
  if (!__DEV__) return <Redirect href="/" />

  const router = useRouter()
  const queryClient = useQueryClient()
  const params = useLocalSearchParams<{ date?: string; enableSlots?: string }>()
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        await resetForTests({
          now: params.date,
          enableSlotKeys: params.enableSlots ? params.enableSlots.split(',') : undefined,
        })
        queryClient.clear()
        if (!cancelled) router.replace('/')
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err))
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [params.date, params.enableSlots, queryClient, router])

  return (
    <YStack flex={1} alignItems="center" justifyContent="center" padding="$lg" gap="$sm">
      <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
        {error ? `Reset failed: ${error}` : 'Resetting test fixtures…'}
      </Text>
    </YStack>
  )
}
