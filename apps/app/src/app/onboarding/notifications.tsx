import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'

import { Card } from '@/components/Card'
import { Typography } from '@/components/typography'
import { nextRoute, OnboardingScaffold, stepProgress } from '@/features/onboarding'
import { useSlots, useUpdateSlot } from '@/features/plan-of-life'
import { requestNotificationPermission } from '@/lib/notifications'

const notifyOn = JSON.stringify({ enabled: true, reminders: [{ offset: 0 }] })

export default function OnboardingNotificationsScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const slots = useSlots()
  const updateSlot = useUpdateSlot()
  const [busy, setBusy] = useState(false)

  // useSlots() already returns enabled, non-archived slots; keep those with a time.
  const timed = useMemo(() => slots.filter((s) => s.time), [slots])
  const times = useMemo(
    () => [...new Set(timed.map((s) => s.time).filter(Boolean))].sort(),
    [timed],
  ) as string[]

  const advance = () => router.push(nextRoute('notifications'))

  async function enable() {
    if (busy) return
    setBusy(true)
    try {
      const granted = await requestNotificationPermission()
      if (granted) {
        // Writing notify config triggers resyncReminders (useUpdateSlot.onSuccess).
        for (const slot of timed) {
          await updateSlot.mutateAsync({ id: slot.id, data: { notify: notifyOn } })
        }
      }
    } finally {
      setBusy(false)
      advance()
    }
  }

  return (
    <OnboardingScaffold
      title={t('onboarding.notifications.title')}
      subtitle={t('onboarding.notifications.subtitle')}
      progress={stepProgress('notifications')}
      continueLabel={t('onboarding.notifications.enable')}
      onContinue={enable}
      continueDisabled={busy}
      onSkip={advance}
      skipLabel={t('common.notNow')}
    >
      <YStack gap="$md">
        {times.length > 0 ? (
          <Card>
            <YStack gap="$xs">
              <Typography variant="reference" tone="muted">
                {t('onboarding.notifications.timesLabel')}
              </Typography>
              <Typography variant="interface" fontSize="$3">
                {times.join('  ·  ')}
              </Typography>
            </YStack>
          </Card>
        ) : (
          <Typography variant="whisper">{t('onboarding.notifications.noTimes')}</Typography>
        )}
      </YStack>
    </OnboardingScaffold>
  )
}
