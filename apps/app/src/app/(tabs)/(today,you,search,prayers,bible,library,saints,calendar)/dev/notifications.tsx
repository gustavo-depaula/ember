// biome-ignore-all lint/correctness/useHookAtTopLevel: dev-only screen; the __DEV__ guard is compiled out of production
// Dev-only: what the device has scheduled, one row each, for checking reminders
// on a device (ember://dev/notifications). Redirects in production builds.
import { useQuery } from '@tanstack/react-query'
import * as Notifications from 'expo-notifications'
import { Redirect } from 'expo-router'
import { Text, YStack } from 'tamagui'

import { ScreenLayout } from '@/components'

const two = (n: unknown) => String(n ?? '').padStart(2, '0')

export default function ScheduledNotifications() {
  if (!__DEV__) return <Redirect href="/" />

  const scheduled = useQuery({
    queryKey: ['dev-scheduled-notifications'],
    queryFn: () => Notifications.getAllScheduledNotificationsAsync(),
    refetchInterval: 2000,
  })

  return (
    <ScreenLayout>
      <YStack gap="$xs" paddingVertical="$lg">
        <Text testID="dev-scheduled-count" fontFamily="$body">
          {`scheduled ${scheduled.data?.length ?? '…'}`}
        </Text>
        {(scheduled.data ?? []).map((n) => {
          const trigger = (n.trigger ?? {}) as Record<string, unknown>
          const data = (n.content.data ?? {}) as Record<string, unknown>
          const when =
            trigger.type === 'date'
              ? new Date(Number(trigger.value ?? trigger.date)).toISOString().slice(0, 16)
              : `${trigger.weekday ? `wd${trigger.weekday} ` : ''}${two(trigger.hour)}:${two(trigger.minute)}`
          return (
            <Text key={n.identifier} testID="dev-scheduled-row" fontFamily="$body" fontSize={13}>
              {`${trigger.type} ${when} ${data.practiceId} ${data.offset ?? 0}`}
            </Text>
          )
        })}
      </YStack>
    </ScreenLayout>
  )
}
