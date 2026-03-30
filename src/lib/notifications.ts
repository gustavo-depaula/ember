import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

import { getEnabledPractices } from '@/db/repositories'
import type { UserPractice } from '@/db/schema'
import { parseSchedule, type Schedule } from '@/features/plan-of-life/schedule'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync()
  if (existing === 'granted') return true

  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}

export async function setupNotifications() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('practice-reminders', {
      name: 'Practice Reminders',
      importance: Notifications.AndroidImportance.HIGH,
    })
  }
}

function getScheduledDays(schedule: Schedule): number[] | undefined {
  if (schedule.type === 'daily') return undefined // all days
  if (schedule.type === 'days-of-week') return schedule.days
  if (schedule.type === 'times-per') return undefined // any day
  return undefined
}

async function scheduleRemindersForPractice(practice: UserPractice): Promise<string[]> {
  const schedule = parseSchedule(practice.schedule)
  if (!schedule.notify?.length) return []

  const scheduledDays = getScheduledDays(schedule)
  const ids: string[] = []

  for (const notification of schedule.notify) {
    const [hours, minutes] = notification.at.split(':').map(Number)
    if (Number.isNaN(hours) || Number.isNaN(minutes)) continue

    // Determine which days this notification fires on
    const notifyDays = notification.days ?? scheduledDays

    if (notifyDays) {
      // Schedule per-day triggers (weekday-based)
      for (const day of notifyDays) {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Practice Reminder',
            body: practice.custom_name ?? practice.practice_id,
            data: { practiceId: practice.practice_id },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: day === 0 ? 1 : day + 1, // expo uses 1=Sun..7=Sat
            hour: hours,
            minute: minutes,
            ...(Platform.OS === 'android' && { channelId: 'practice-reminders' }),
          },
        })
        ids.push(id)
      }
    } else {
      // Daily trigger
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Practice Reminder',
          body: practice.custom_name ?? practice.practice_id,
          data: { practiceId: practice.practice_id },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hours,
          minute: minutes,
          ...(Platform.OS === 'android' && { channelId: 'practice-reminders' }),
        },
      })
      ids.push(id)
    }
  }

  return ids
}

export async function cancelPracticeReminder(practiceId: string): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync()
  for (const notification of scheduled) {
    if (notification.content.data?.practiceId === practiceId) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier)
    }
  }
}

export async function rescheduleAllReminders(): Promise<void> {
  const practices = await getEnabledPractices()
  const notifiable = practices.filter((p) => {
    const schedule = parseSchedule(p.schedule)
    return schedule.notify && schedule.notify.length > 0
  })

  if (notifiable.length === 0) return

  const hasPermission = await requestNotificationPermission()
  if (!hasPermission) return

  await Notifications.cancelAllScheduledNotificationsAsync()
  await Promise.all(notifiable.map(scheduleRemindersForPractice))
}
