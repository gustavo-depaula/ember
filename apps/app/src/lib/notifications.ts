import { Platform } from 'react-native'
import { getManifest } from '@/content/resolver'
import type { SlotState } from '@/db/events'
import { getEnabledSlots, getPractice } from '@/db/repositories'
import type { NotifyReminder, UserPractice } from '@/db/schema'
import {
  computeTriggerTime,
  describeLeadTime,
  hashSeed,
  localizeMessages,
  parseNotifyConfig,
  pickMessage,
  resolveReminders,
  shiftWeekday,
} from '@/features/plan-of-life/notify'
import { parseSchedule, type Schedule } from '@/features/plan-of-life/schedule'
import i18n, { localizeContent } from '@/lib/i18n'
import { parseSlotKey } from '@/lib/slotKey'

// expo-notifications is native-only
// biome-ignore lint: conditional require for platform compat
const Notifications: any = Platform.OS !== 'web' ? require('expo-notifications') : undefined

if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  })
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!Notifications) return false
  const { status: existing } = await Notifications.getPermissionsAsync()
  if (existing === 'granted') return true

  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}

export async function setupNotifications() {
  if (!Notifications) return
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('practice-reminders', {
      name: 'Practice Reminders',
      importance: Notifications.AndroidImportance.HIGH,
    })
  }
}

function getScheduledDays(schedule: Schedule): number[] | undefined {
  if (schedule.type === 'days-of-week') return schedule.days
  return undefined
}

function buildContent(
  practiceName: string,
  reminder: NotifyReminder,
  slot: SlotState,
  bodyPool: string[],
): { title: string; body: string; data: Record<string, unknown> } {
  const lead = describeLeadTime(reminder.offset)
  const t = i18n.t.bind(i18n)
  const title =
    lead.kind === 'at'
      ? practiceName
      : lead.kind === 'hours'
        ? t('notifications.titleInHours', { name: practiceName, count: lead.count })
        : t('notifications.titleInMinutes', { name: practiceName, count: lead.count })

  const seed = hashSeed([slot.id, reminder.offset])
  const fallbackPool = t('notifications.bodyPool', { returnObjects: true }) as unknown as
    | string[]
    | string
  const fallback = Array.isArray(fallbackPool) ? fallbackPool : [String(fallbackPool)]
  const pool = bodyPool.length > 0 ? bodyPool : fallback
  const body = pickMessage(pool, seed) ?? t('notifications.bodyDefault')

  return {
    title,
    body,
    data: {
      practiceId: slot.practice_id,
      slotId: parseSlotKey(slot.id).slotId,
      offset: reminder.offset,
    },
  }
}

function scheduleRemindersForSlot(
  slot: SlotState,
  practice: UserPractice | undefined,
): Promise<string[]> {
  if (!slot.time) return Promise.resolve([])

  const notify = parseNotifyConfig(slot.notify)
  if (!notify?.enabled) return Promise.resolve([])

  const manifest = getManifest(slot.practice_id)
  const reminders = resolveReminders(notify, manifest?.notifications)
  if (reminders.length === 0) return Promise.resolve([])

  const schedule = parseSchedule(slot.schedule)
  const scheduledDays = getScheduledDays(schedule)
  const practiceName =
    practice?.custom_name ?? (manifest ? localizeContent(manifest.name) : slot.practice_id)
  const bodyPool = localizeMessages(manifest?.notifications?.messages, i18n.language)
  const androidChannel = Platform.OS === 'android' ? { channelId: 'practice-reminders' } : {}

  const tasks: Promise<string>[] = []
  for (const reminder of reminders) {
    const trigger = computeTriggerTime(slot.time, reminder.offset)
    if (!trigger) continue
    const content = buildContent(practiceName, reminder, slot, bodyPool)

    if (scheduledDays) {
      for (const day of scheduledDays) {
        const shifted = shiftWeekday(day, trigger.weekdayShift)
        tasks.push(
          Notifications.scheduleNotificationAsync({
            content,
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
              weekday: shifted === 0 ? 1 : shifted + 1,
              hour: trigger.hour,
              minute: trigger.minute,
              ...androidChannel,
            },
          }),
        )
      }
    } else {
      tasks.push(
        Notifications.scheduleNotificationAsync({
          content,
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: trigger.hour,
            minute: trigger.minute,
            ...androidChannel,
          },
        }),
      )
    }
  }
  return Promise.all(tasks)
}

export async function cancelPracticeReminder(practiceId: string): Promise<void> {
  if (!Notifications) return
  const scheduled = await Notifications.getAllScheduledNotificationsAsync()
  for (const notification of scheduled) {
    if (notification.content.data?.practiceId === practiceId) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier)
    }
  }
}

export async function rescheduleAllReminders(): Promise<void> {
  if (!Notifications) return
  const slots = await getEnabledSlots()
  const notifiable = slots.filter((s) => parseNotifyConfig(s.notify)?.enabled && s.time)

  if (notifiable.length === 0) {
    await Notifications.cancelAllScheduledNotificationsAsync()
    return
  }

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
