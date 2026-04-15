import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import type { SlotState } from '@/db/events'
import { getEnabledSlots, getPractice } from '@/db/repositories'
import type { NotifyConfig, UserPractice } from '@/db/schema'
import { parseSchedule, type Schedule } from '@/features/plan-of-life/schedule'
import { parseSlotKey } from '@/lib/slotKey'

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

function parseNotifyConfig(json: string | null): NotifyConfig | undefined {
  if (!json) return undefined
  try {
    return JSON.parse(json) as NotifyConfig
  } catch {
    return undefined
  }
}

function getScheduledDays(schedule: Schedule): number[] | undefined {
  if (schedule.type === 'daily') return undefined
  if (schedule.type === 'days-of-week') return schedule.days
  if (schedule.type === 'times-per') return undefined
  return undefined
}

function scheduleRemindersForSlot(
  slot: SlotState,
  practice: UserPractice | undefined,
): Promise<string[]> {
  if (!slot.time) return Promise.resolve([])

  const [hours, minutes] = slot.time.split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return Promise.resolve([])

  const schedule = parseSchedule(slot.schedule)
  const scheduledDays = getScheduledDays(schedule)
  const body = practice?.custom_name ?? slot.practice_id

  const content = {
    title: 'Practice Reminder',
    body,
    data: { practiceId: slot.practice_id, slotId: parseSlotKey(slot.id).slotId },
  }
  const androidChannel = Platform.OS === 'android' ? { channelId: 'practice-reminders' } : {}

  if (scheduledDays) {
    return Promise.all(
      scheduledDays.map((day) =>
        Notifications.scheduleNotificationAsync({
          content,
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: day === 0 ? 1 : day + 1,
            hour: hours,
            minute: minutes,
            ...androidChannel,
          },
        }),
      ),
    )
  }

  return Notifications.scheduleNotificationAsync({
    content,
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: hours,
      minute: minutes,
      ...androidChannel,
    },
  }).then((id) => [id])
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
  const slots = await getEnabledSlots()
  const notifiable = slots.filter((s) => parseNotifyConfig(s.notify)?.enabled && s.time)

  if (notifiable.length === 0) return

  const hasPermission = await requestNotificationPermission()
  if (!hasPermission) return

  // Batch-load practices to avoid N+1
  const practiceIds = [...new Set(notifiable.map((s) => s.practice_id))]
  const practices = new Map<string, UserPractice>()
  await Promise.all(
    practiceIds.map(async (id) => {
      const p = await getPractice(id)
      if (p) practices.set(id, p)
    }),
  )

  await Notifications.cancelAllScheduledNotificationsAsync()
  await Promise.all(
    notifiable.map((slot) => scheduleRemindersForSlot(slot, practices.get(slot.practice_id))),
  )
}
