import { Platform } from 'react-native'

import i18n from '@/lib/i18n'

import { parseHHmm } from './time'
import type { Commitment } from './types'

// biome-ignore lint: conditional require for platform compat
const Notifications: any = Platform.OS !== 'web' ? require('expo-notifications') : undefined

const CUSTODY_CHANNEL = 'custody'

export async function setupCustodyNotifications(): Promise<void> {
  if (!Notifications) return
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CUSTODY_CHANNEL, {
      name: 'Custody',
      importance: Notifications.AndroidImportance.LOW,
    })
  }
}

async function cancelForCommitment(commitmentId: string): Promise<void> {
  if (!Notifications) return
  const scheduled = await Notifications.getAllScheduledNotificationsAsync()
  for (const n of scheduled) {
    if (n.content?.data?.custodyCommitmentId === commitmentId) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier)
    }
  }
}

export async function scheduleNudgesForCommitment(commitment: Commitment): Promise<void> {
  if (!Notifications) return
  // Clear stale schedules first so edits don't double-fire.
  await cancelForCommitment(commitment.id)

  const channelOpts = Platform.OS === 'android' ? { channelId: CUSTODY_CHANNEL } : {}
  const data = { custodyCommitmentId: commitment.id }

  if (commitment.kind === 'time-fence' && commitment.fence_start && commitment.fence_end) {
    const start = parseHHmm(commitment.fence_start)
    const end = parseHHmm(commitment.fence_end)
    if (start) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: i18n.t('custody.notifications.fenceStartTitle', { defaultValue: commitment.name }),
          body: i18n.t('custody.notifications.fenceStartBody', {
            defaultValue: 'Your fence begins now. Pray for the grace to keep it.',
          }),
          data,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: start.hours,
          minute: start.minutes,
          ...channelOpts,
        },
      })
    }
    if (end) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: commitment.name,
          body: i18n.t('custody.notifications.fenceEndBody', {
            defaultValue: 'Fence ended. Thanks be to God for the grace.',
          }),
          data,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: end.hours,
          minute: end.minutes,
          ...channelOpts,
        },
      })
    }
  }
}

const DAILY_EXAMEN_ID_KEY = 'custodyExamenReminder'

export async function scheduleDailyExamenReminder(hour = 21, minute = 0): Promise<void> {
  if (!Notifications) return
  const scheduled = await Notifications.getAllScheduledNotificationsAsync()
  for (const n of scheduled) {
    if (n.content?.data?.kind === DAILY_EXAMEN_ID_KEY) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier)
    }
  }

  const channelOpts = Platform.OS === 'android' ? { channelId: CUSTODY_CHANNEL } : {}
  await Notifications.scheduleNotificationAsync({
    content: {
      title: i18n.t('custody.notifications.examenTitle', { defaultValue: 'Examen' }),
      body: i18n.t('custody.notifications.examenBody', {
        defaultValue: 'Time for examen — take five minutes to look back on today.',
      }),
      data: { kind: DAILY_EXAMEN_ID_KEY },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      ...channelOpts,
    },
  })
}

export async function cancelAllCustodyNotifications(): Promise<void> {
  if (!Notifications) return
  const scheduled = await Notifications.getAllScheduledNotificationsAsync()
  for (const n of scheduled) {
    const data = n.content?.data
    if (data?.custodyCommitmentId || data?.kind === DAILY_EXAMEN_ID_KEY) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier)
    }
  }
}
