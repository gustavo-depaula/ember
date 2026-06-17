import type { Service } from '@ember/api'
import { Bell, BellRing } from 'lucide-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme, YStack } from 'tamagui'
import { AnimatedPressable, Typography } from '@/components'
import { selectionTick, successBuzz } from '@/lib/haptics'
import { useMassReminderOn, useRemindersStore } from '../reminders'
import { OutlineChip } from './OutlineChip'

// Opt-in toggle for recurring reminders before this church's Masses. Hidden when the church has no
// structured Mass services to remind about.
export function MassReminderToggle({
  church,
  services,
}: {
  church: { id: string; name: string }
  services: Service[]
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const on = useMassReminderOn(church.id)
  const enable = useRemindersStore((s) => s.enable)
  const disable = useRemindersStore((s) => s.disable)
  const [busy, setBusy] = useState(false)
  const [denied, setDenied] = useState(false)

  if (!services.some((s) => s.kind === 'mass')) return null

  const toggle = async () => {
    if (busy) return
    setBusy(true)
    setDenied(false)
    try {
      if (on) {
        void selectionTick()
        await disable(church.id)
      } else {
        const ok = await enable(church, services)
        if (ok) void successBuzz()
        else setDenied(true)
      }
    } finally {
      setBusy(false)
    }
  }

  const Icon = on ? BellRing : Bell
  return (
    <YStack gap="$xs" alignItems="flex-start">
      <AnimatedPressable
        onPress={toggle}
        disabled={busy}
        accessibilityRole="button"
        accessibilityState={{ selected: on }}
      >
        <OutlineChip
          gap="$xs"
          paddingHorizontal="$md"
          paddingVertical="$sm"
          backgroundColor={on ? '$accent' : 'transparent'}
        >
          <Icon size={16} color={on ? theme.background?.val : theme.accent?.val} />
          <Typography variant="interface" fontSize="$3" color={on ? '$background' : '$color'}>
            {t(on ? 'massTimes.reminderOn' : 'massTimes.remindBeforeMass')}
          </Typography>
        </OutlineChip>
      </AnimatedPressable>
      {denied ? (
        <Typography variant="annotation">{t('massTimes.reminderDenied')}</Typography>
      ) : null}
    </YStack>
  )
}
