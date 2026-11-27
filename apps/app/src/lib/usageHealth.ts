import { format } from 'date-fns'
import { File, Paths } from 'expo-file-system'
import * as Notifications from 'expo-notifications'

import { useEventStore } from '@/db/events'
import { getPreference, setPreference } from '@/db/repositories/preferences'
import { parseNotifyConfig } from '@/features/plan-of-life/notify'
import { build, type Counts, isUsageShared, track, usageRoute } from '@/lib/usage'

// How the app is holding up, for the usage desk's health tab: the errors it
// meets, never their messages (a message can quote what a person wrote, or a
// path), and once a day the shape of the plan a person keeps.
//
// A crash ends the app before a count can be sent, so the fatal handler writes
// the crash to a file at once — `File.write` is synchronous — and the next
// launch counts it.

// Enough to see a pattern; past it, one broken screen re-rendering would
// drown the rest of a session's counts.
const errorsPerLaunch = 30
let errors = 0

type Where = Counts['error']['where']

function described(where: Where, error: unknown, source?: string): Counts['error'] {
  const e = error as { name?: unknown; status?: unknown } | undefined
  const kind = typeof e?.name === 'string' && e.name ? e.name.slice(0, 40) : typeof error
  const status = typeof e?.status === 'number' ? String(e.status) : undefined
  const at = usageRoute()
  return {
    where,
    kind,
    ...(source ? { source: source.slice(0, 40) } : {}),
    ...(at ? { route: at } : {}),
    ...(status ? { status } : {}),
  }
}

/** Counts an error by where it was caught and what failed, never by its message. */
export function countError(where: Where, error: unknown, source?: string): void {
  if (errors >= errorsPerLaunch) return
  errors++
  track('error', described(where, error, source))
}

const crashFile = () => new File(Paths.document, 'usage-crash.json')

function countLastCrash(): void {
  const file = crashFile()
  if (!file.exists) return
  void file.text().then((text) => {
    file.delete()
    track('error', JSON.parse(text) as Counts['error'])
  })
}

type GlobalHandler = (error: unknown, isFatal?: boolean) => void
type ErrorUtilsShape = {
  getGlobalHandler(): GlobalHandler
  setGlobalHandler(h: GlobalHandler): void
}

let started = false

export function startHealth(): void {
  if (started) return
  started = true
  countLastCrash()
  const errorUtils = (globalThis as { ErrorUtils?: ErrorUtilsShape }).ErrorUtils
  if (errorUtils) {
    const previous = errorUtils.getGlobalHandler()
    errorUtils.setGlobalHandler((error, isFatal) => {
      if (isFatal) {
        const crash = { ...described('fatal', error), build: build() ?? 'unknown' }
        crashFile().write(JSON.stringify(crash))
      } else {
        countError('uncaught', error)
      }
      previous(error, isFatal)
    })
  }
  void countPlanOncePerDay()
}

const planDayKey = 'usage.planDay'

async function countPlanOncePerDay(): Promise<void> {
  // Not counted, the day is not marked: switched back on, it is counted the same day.
  if (!(await isUsageShared())) return
  const today = format(new Date(), 'yyyy-MM-dd')
  if ((await getPreference(planDayKey)) === today) return
  const { practices, slots } = useEventStore.getState()
  const kept = [...practices.values()].filter((p) => !p.archived)
  const enabled = [...slots.values()].filter((s) => s.enabled)
  const reminders = enabled.filter((s) => s.time && parseNotifyConfig(s.notify)?.enabled).length
  const { status } = await Notifications.getPermissionsAsync()
  track('plan', {
    practices: String(kept.length),
    slots: String(enabled.length),
    reminders: String(reminders),
    notifications: status,
  })
  await setPreference(planDayKey, today)
}
