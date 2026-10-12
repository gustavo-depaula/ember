import { type DayCalendar, getCelebrationsForDate } from '@ember/liturgical'
import { buildOfYearCalendar } from '@ember/missal'
import { Platform } from 'react-native'
import { getEntry } from '@/content/contentIndex'
import { getManifest } from '@/content/resolver'
import type { SlotState } from '@/db/events'
import { getEnabledSlots, getPractice } from '@/db/repositories'
import type { UserPractice } from '@/db/schema'
import {
  computeTriggerTime,
  datedReminderTimes,
  describeLeadTime,
  hashSeed,
  localizeMessages,
  parseNotifyConfig,
  pickMessage,
  reminderRecurrence,
  resolveReminders,
  shiftWeekday,
} from '@/features/plan-of-life/notify'
import {
  isApplicableOn,
  parseSchedule,
  type Schedule,
  type ScheduleContext,
} from '@/features/plan-of-life/schedule'
import { isHiddenByProgram } from '@/features/plan-of-life/utils'
import i18n, { localizeContent } from '@/lib/i18n'
import { getLiturgicalSeason } from '@/lib/liturgical'
import {
  loadMissalCalendar,
  regionsForJurisdiction,
  transfersForJurisdiction,
} from '@/lib/missal/loaders'
import { parseSlotKey } from '@/lib/slotKey'
import { usePreferencesStore } from '@/stores/preferencesStore'

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

function formatTitle(practiceName: string, offset: number): string {
  const lead = describeLeadTime(offset)
  if (lead.kind === 'at') return practiceName
  const key = lead.kind === 'hours' ? 'notifications.titleInHours' : 'notifications.titleInMinutes'
  return i18n.t(key, { name: practiceName, count: lead.count })
}

// The reschedule can run before a manifest has warmed (a practice whose content
// changed since the last launch, read offline); the catalog entry still names it.
function reminderName(slot: SlotState, practice: UserPractice | undefined): string {
  if (practice?.custom_name) return practice.custom_name
  const name = getManifest(slot.practice_id)?.name ?? getEntry(slot.practice_id)?.name
  return name ? localizeContent(name) : i18n.t('notifications.fallbackTitle')
}

type ReminderContent = { title: string; body: string; data: Record<string, unknown> }
type RepeatingReminder = { content: ReminderContent; trigger: Record<string, unknown> }
type DatedReminder = { content: ReminderContent; at: Date }

// A year reaches every rule the plan knows (the Ember weeks, a yearly novena);
// the OS budget, not this horizon, is what bounds how many are registered.
const datedHorizonDays = 366

// iOS keeps the 64 soonest pending notifications and silently drops the rest.
const pendingLimit = 64

function remindersForSlot(
  slot: SlotState,
  practice: UserPractice | undefined,
  now: Date,
  contextFor: (date: Date) => ScheduleContext,
): { repeating: RepeatingReminder[]; dated: DatedReminder[] } {
  const repeating: RepeatingReminder[] = []
  const dated: DatedReminder[] = []
  const time = slot.time
  if (!time) return { repeating, dated }

  const manifest = getManifest(slot.practice_id)
  const reminders = resolveReminders(parseNotifyConfig(slot.notify), manifest?.notifications)
  const schedule = parseSchedule(slot.schedule)
  const recurrence = reminderRecurrence(schedule)
  const practiceName = reminderName(slot, practice)
  const manifestPool = localizeMessages(manifest?.notifications?.messages, i18n.language)
  const fallbackPool = i18n.t('notifications.bodyPool', { returnObjects: true }) as string[]
  const bodyPool = manifestPool.length > 0 ? manifestPool : fallbackPool
  const androidChannel = Platform.OS === 'android' ? { channelId: 'practice-reminders' } : {}
  const dataBase = { practiceId: slot.practice_id, slotId: parseSlotKey(slot.id).slotId }

  for (const reminder of reminders) {
    const trigger = computeTriggerTime(time, reminder.offset)
    if (!trigger) continue
    const content = {
      title: formatTitle(practiceName, reminder.offset),
      body: pickMessage(bodyPool, hashSeed([slot.id, reminder.offset])) ?? bodyPool[0],
      data: { ...dataBase, offset: reminder.offset },
    }
    const clock = { hour: trigger.hour, minute: trigger.minute, ...androidChannel }

    if (recurrence.kind === 'daily') {
      repeating.push({
        content,
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, ...clock },
      })
      continue
    }
    if (recurrence.kind === 'weekly') {
      for (const day of recurrence.days) {
        repeating.push({
          content,
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            // expo counts weekdays from Sunday = 1
            weekday: shiftWeekday(day, trigger.weekdayShift) + 1,
            ...clock,
          },
        })
      }
      continue
    }
    const times = datedReminderTimes({
      slotTime: time,
      offset: reminder.offset,
      from: now,
      days: datedHorizonDays,
      isDue: (date) =>
        isApplicableOn(schedule, date, contextFor(date)) && !isHiddenByProgram(slot, date, now),
    })
    for (const at of times) dated.push({ content, at })
  }
  return { repeating, dated }
}

// Schedules that follow the liturgical year need the calendar of each day asked
// about; the year calendars are only built when a holy-day rule calls for them.
async function loadContextFor(
  schedules: Schedule[],
  now: Date,
): Promise<(date: Date) => ScheduleContext> {
  const { jurisdiction } = usePreferencesStore.getState()
  const transfers = transfersForJurisdiction(jurisdiction)
  const years = new Map<number, Map<string, DayCalendar>>()
  const needsCalendar = schedules.some(
    (s) =>
      s.type === 'holy-days-of-obligation' ||
      (s.type === 'periodic-series' && s.rule.type === 'holy-days-of-obligation'),
  )
  const calendar = needsCalendar ? await loadMissalCalendar() : undefined
  if (calendar) {
    const regions = regionsForJurisdiction(jurisdiction)
    for (const year of [now.getFullYear(), now.getFullYear() + 1]) {
      years.set(year, buildOfYearCalendar({ year, calendar, regions }))
    }
  }
  return (date) => {
    const year = years.get(date.getFullYear())
    return {
      season: getLiturgicalSeason(date, 'of', transfers),
      dayCalendar: year ? getCelebrationsForDate(year, date) : undefined,
    }
  }
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

// Only the practice reminders — custody notifications share the OS schedule and must survive the
// practice reschedule that runs on every launch.
async function cancelAllPracticeReminders(): Promise<void> {
  if (!Notifications) return
  const scheduled = await Notifications.getAllScheduledNotificationsAsync()
  for (const notification of scheduled) {
    if (notification.content.data?.practiceId) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier)
    }
  }
}

// Mass Times once scheduled weekly reminders before every Mass at a church; the feature is gone, but
// the OS keeps repeating whatever a phone registered until something cancels it.
export async function cancelRetiredMassReminders(): Promise<void> {
  if (!Notifications) return
  const scheduled = await Notifications.getAllScheduledNotificationsAsync()
  for (const notification of scheduled) {
    if (notification.content.data?.massReminderChurchId) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier)
    }
  }
}

export async function rescheduleAllReminders(): Promise<void> {
  if (!Notifications) return
  const slots = await getEnabledSlots()
  const notifiable = slots.filter((s) => parseNotifyConfig(s.notify)?.enabled && s.time)

  if (notifiable.length === 0) {
    await cancelAllPracticeReminders()
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

  const now = new Date()
  const contextFor = await loadContextFor(
    notifiable.map((slot) => parseSchedule(slot.schedule)),
    now,
  )
  const planned = notifiable.map((slot) =>
    remindersForSlot(slot, practices.get(slot.practice_id), now, contextFor),
  )
  const repeating = planned.flatMap((p) => p.repeating)
  const dated = planned.flatMap((p) => p.dated).sort((a, b) => a.at.getTime() - b.at.getTime())

  await cancelAllPracticeReminders()
  // What is left pending belongs to other features and counts against the same limit.
  const others = (await Notifications.getAllScheduledNotificationsAsync()).length
  const room = Math.max(pendingLimit - others - repeating.length, 0)
  const androidChannel = Platform.OS === 'android' ? { channelId: 'practice-reminders' } : {}
  await Promise.all([
    ...repeating.map((r) => Notifications.scheduleNotificationAsync(r)),
    ...dated.slice(0, room).map(({ content, at }) =>
      Notifications.scheduleNotificationAsync({
        content,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: at,
          ...androidChannel,
        },
      }),
    ),
  ])
}
