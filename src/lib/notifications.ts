import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

import { getEnabledPractices } from '@/db/repositories'
import type { Practice } from '@/db/schema'

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
      importance: Notifications.AndroidImportance.DEFAULT,
    })
  }
}

async function scheduleReminder(practice: Practice): Promise<string | undefined> {
  if (!practice.notify_time) return undefined

  const [hours, minutes] = practice.notify_time.split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return undefined

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Practice Reminder',
      body: practice.name,
      data: { practiceId: practice.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: hours,
      minute: minutes,
    },
  })
}

export async function schedulePracticeReminder(practice: Practice): Promise<string | undefined> {
  if (!practice.notify_enabled || !practice.notify_time) return undefined

  const hasPermission = await requestNotificationPermission()
  if (!hasPermission) return undefined

  await cancelPracticeReminder(practice.id)
  return scheduleReminder(practice)
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
  const notifiable = practices.filter((p) => p.notify_enabled && p.notify_time)

  if (notifiable.length === 0) return

  const hasPermission = await requestNotificationPermission()
  if (!hasPermission) return

  await Notifications.cancelAllScheduledNotificationsAsync()
  await Promise.all(notifiable.map(scheduleReminder))
}
