import * as Notifications from 'expo-notifications'
import { Redirect } from 'expo-router'
import { Text } from 'tamagui'
import { describe, expect, it, vi } from 'vitest'

import OnboardingReason from '@/app/onboarding'
import OnboardingBegin from '@/app/onboarding/begin'
import OnboardingGrow from '@/app/onboarding/grow'
import OnboardingObra from '@/app/onboarding/obra'
import OnboardingOffice from '@/app/onboarding/office'
import OnboardingOfficeFirst from '@/app/onboarding/office-first'
import OnboardingOfficeHours from '@/app/onboarding/office-hours'
import OnboardingPray from '@/app/onboarding/pray'
import OnboardingReminders from '@/app/onboarding/reminders'
import { useEventStore } from '@/db/events'
import { planSlots } from '@/features/plan-of-life/due'
import { parseNotifyConfig } from '@/features/plan-of-life/notify'
import { parseSchedule } from '@/features/plan-of-life/schedule'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { renderApp } from '@/test/renderApp'
import { currentPath } from '@/test/router-fake'

import { gateOf, useNeedsOnboarding } from '../gate'
import { TabHint } from '../TabHint'

const screens = {
  '/onboarding': OnboardingReason,
  '/onboarding/begin': OnboardingBegin,
  '/onboarding/grow': OnboardingGrow,
  '/onboarding/obra': OnboardingObra,
  '/onboarding/office': OnboardingOffice,
  '/onboarding/office-hours': OnboardingOfficeHours,
  '/onboarding/office-first': OnboardingOfficeFirst,
  '/onboarding/reminders': OnboardingReminders,
  '/onboarding/pray': OnboardingPray,
}

// Today, reduced to its gate: the real redirect, and a mark once past it.
function Today() {
  if (useNeedsOnboarding()) return <Redirect href="/onboarding" />
  return <Text testID="today">today</Text>
}

function boot({
  route = '/onboarding',
  language = 'en-US',
  onboarding = true,
  seed,
}: {
  route?: string
  language?: string
  onboarding?: boolean
  seed?: () => Promise<void>
} = {}) {
  return renderApp({
    route,
    fixtures: { onboarding, language },
    seed,
    routes: [
      { pattern: '/', loader: async () => ({ default: Today }) },
      ...Object.entries(screens).map(([pattern, screen]) => ({
        pattern,
        loader: async () => ({ default: screen }),
      })),
    ],
  })
}

const plan = () => planSlots(useEventStore.getState())
const slotOf = (practiceId: string) => plan().find((s) => s.practice_id === practiceId)
const scheduled = () =>
  vi.mocked(Notifications.scheduleNotificationAsync).mock.calls.map(([request]) => request)
const triggersOfType = (type: string) =>
  scheduled().filter((r) => (r.trigger as { type?: string } | null)?.type === type)
// A practice may ring more than once (the Mass: an hour before, and at its hour),
// so what is counted is the slots that ring.
const slotsRinging = (type: string) =>
  new Set(triggersOfType(type).map((r) => (r.content.data as { slotId: string }).slotId)).size
const practicesRinging = (type: string) =>
  new Set(triggersOfType(type).map((r) => (r.content.data as { practiceId: string }).practiceId))

describe('the gate', () => {
  it.each([
    ['done', false, 'stay'],
    ['done', true, 'stay'],
    ['started', true, 'onboard'],
    ['started', false, 'onboard'],
    ['new', false, 'onboard'],
    ['new', true, 'settle'],
  ] as const)('%s with a plan=%s → %s', (stage, hasPlan, gate) => {
    expect(gateOf(stage, hasPlan)).toBe(gate)
  })

  it('sends a first install from Today to onboarding', async () => {
    await boot({ route: '/' })
    await expect.poll(currentPath).toBe('/onboarding')
  }, 30_000)

  it('leaves someone who already keeps a rule on Today, and never asks again', async () => {
    const { screen } = await boot({
      route: '/',
      seed: async () => {
        const { createPracticeWithSlot } = await import('@/db/repositories')
        await createPracticeWithSlot({ id: 'practice/rosary' }, { time: '20:00' })
      },
    })
    expect(await screen.findByTestId('today')).toBeInTheDocument()
    await expect.poll(() => usePreferencesStore.getState().onboarding).toBe('done')
    expect(usePreferencesStore.getState().seenHints).toEqual(['you', 'search'])
  }, 30_000)

  it('leaves Today alone once onboarding is done', async () => {
    const { screen } = await boot({ route: '/', onboarding: false })
    expect(await screen.findByTestId('today')).toBeInTheDocument()
  }, 30_000)
})

describe('beginning', () => {
  it('adopts the Beginner’s Minimum, turns on every reminder and ends on Today', async () => {
    const { screen, user } = await boot()

    await user.click(await screen.findByTestId('onboarding-reason-begin'))
    await user.click(await screen.findByRole('button', { name: 'Adopt this plan' }))
    await expect.poll(currentPath).toBe('/onboarding/reminders')
    expect(plan()).toHaveLength(8)

    await user.click(await screen.findByTestId('onboarding-reminders-confirm'))
    await expect.poll(currentPath).toBe('/onboarding/pray')
    expect(plan().every((s) => parseNotifyConfig(s.notify)?.enabled)).toBe(true)
    // Six daily prayers, Sunday Mass weekly, confession on its dated Saturdays.
    expect(slotsRinging('daily')).toBe(6)
    expect(practicesRinging('weekly')).toEqual(new Set(['practice/mass']))
    expect(practicesRinging('date')).toEqual(new Set(['practice/confession']))

    await user.click(await screen.findByTestId('onboarding-amen'))
    await expect.poll(currentPath).toBe('/')
    expect(usePreferencesStore.getState().onboarding).toBe('done')
    expect(await screen.findByTestId('today')).toBeInTheDocument()
  }, 60_000)

  it('can go without reminders', async () => {
    const { screen, user } = await boot()
    await user.click(await screen.findByTestId('onboarding-reason-begin'))
    await user.click(await screen.findByRole('button', { name: 'Adopt this plan' }))
    await user.click(await screen.findByTestId('onboarding-reminders-none'))

    await expect.poll(currentPath).toBe('/onboarding/pray')
    expect(plan().some((s) => parseNotifyConfig(s.notify)?.enabled)).toBe(false)
    expect(scheduled()).toHaveLength(0)
  }, 60_000)
})

describe('the plan of the Work', () => {
  it('moves confession to Friday, silences one norm, and schedules the rest', async () => {
    const { screen, user } = await boot({ language: 'pt-BR' })
    await user.click(await screen.findByTestId('onboarding-reason-obra'))
    await user.click(await screen.findByRole('button', { name: 'Adotar este plano' }))
    await expect.poll(currentPath).toBe('/onboarding/reminders')
    expect(plan()).toHaveLength(14)

    await user.click(await screen.findByTestId('reminder-day-practice/confession'))
    await user.click(await screen.findByTestId('reminder-weekday-5'))
    await expect
      .poll(() => parseSchedule(slotOf('practice/confession')?.schedule ?? '{}'))
      .toMatchObject({ type: 'days-of-week', days: [5] })

    await user.click(await screen.findByTestId('reminder-bell-practice/preces-opus-dei'))
    await user.click(await screen.findByTestId('onboarding-reminders-confirm'))
    await expect.poll(currentPath).toBe('/onboarding/pray')

    expect(parseNotifyConfig(slotOf('practice/preces-opus-dei')?.notify)).toBeUndefined()
    // Twelve daily norms ring, the muted one does not; confession rings on Friday.
    expect(slotsRinging('daily')).toBe(12)
    const [confession] = triggersOfType('weekly')
    expect(triggersOfType('weekly')).toHaveLength(1)
    expect(confession.trigger).toMatchObject({ weekday: 6, hour: 10, minute: 0 })
    expect(scheduled().some((r) => r.content.title?.match(/Preces/))).toBe(false)
  }, 60_000)
})

describe('growing', () => {
  it('adds from the real rule page and carries confession and the Stations to reminders', async () => {
    const { screen, user } = await boot()
    await user.click(await screen.findByTestId('onboarding-reason-grow'))
    await user.click(await screen.findByRole('button', { name: /Add Confession to your rule/ }))
    await user.click(await screen.findByRole('button', { name: /Add .*Stations.* to your rule/ }))
    await user.click(
      await screen.findByRole('button', { name: /Add .*Examination.* to your rule/ }),
    )
    await user.click(await screen.findByTestId('rule-guide-continue'))
    await expect.poll(currentPath).toBe('/onboarding/reminders')

    expect(await screen.findByTestId('reminder-row-practice/confession')).toBeInTheDocument()
    expect(await screen.findByTestId('reminder-row-practice/stations-cross')).toBeInTheDocument()

    await user.click(await screen.findByTestId('reminder-day-practice/stations-cross'))
    await user.click(await screen.findByTestId('reminder-weekday-3'))
    await expect
      .poll(() => parseSchedule(slotOf('practice/stations-cross')?.schedule ?? '{}'))
      .toMatchObject({ days: [3] })
  }, 60_000)
})

describe('the Office', () => {
  it('keeps the hours chosen of the Liturgy of the Hours, pinned and timed', async () => {
    const { screen, user } = await boot()
    await user.click(await screen.findByTestId('onboarding-reason-office'))
    await user.click(await screen.findByTestId('onboarding-office-regular'))
    await user.click(await screen.findByTestId('onboarding-hour-vespers'))
    await user.click(await screen.findByTestId('onboarding-hour-sext'))
    await user.click(await screen.findByTestId('onboarding-adopt-hours'))
    await expect.poll(currentPath).toBe('/onboarding/reminders')

    const hours = plan()
      .filter((s) => s.practice_id === 'practice/liturgy-of-the-hours')
      .map((s) => [s.pins?.hour, s.time])
      .sort()
    expect(hours).toEqual([
      ['compline', '21:00'],
      ['lauds', '06:00'],
      ['sext', '12:00'],
    ])
  }, 60_000)

  it('begins a newcomer with one hour, Compline unless they choose another', async () => {
    const { screen, user } = await boot()
    await user.click(await screen.findByTestId('onboarding-reason-office'))
    await user.click(await screen.findByTestId('onboarding-office-new'))
    await user.click(await screen.findByTestId('onboarding-first-lauds'))
    await user.click(await screen.findByTestId('onboarding-adopt-first'))
    await expect.poll(currentPath).toBe('/onboarding/reminders')

    expect(plan().map((s) => s.pins?.hour)).toEqual(['lauds'])
  }, 60_000)
})

describe('changing course', () => {
  it('undoes the plan when coming back to the first question', async () => {
    const { screen, user } = await boot()
    await user.click(await screen.findByTestId('onboarding-reason-begin'))
    await user.click(await screen.findByRole('button', { name: 'Adopt this plan' }))
    await expect.poll(() => plan().length).toBe(8)

    const { navigate } = await import('@/test/router-fake')
    navigate('/onboarding')
    await expect.poll(() => plan().length).toBe(0)

    await user.click(await screen.findByTestId('onboarding-reason-office'))
    await user.click(await screen.findByTestId('onboarding-office-new'))
    await user.click(await screen.findByTestId('onboarding-adopt-first'))
    await expect.poll(() => plan().map((s) => s.pins?.hour)).toEqual(['compline'])
  }, 60_000)

  it('never undoes a slot the plan held before onboarding began', async () => {
    const { screen, user } = await boot({
      seed: async () => {
        const { createPracticeWithSlot } = await import('@/db/repositories')
        await createPracticeWithSlot({ id: 'practice/rosary' }, { time: '20:00' })
      },
    })
    await user.click(await screen.findByTestId('onboarding-reason-begin'))
    await user.click(await screen.findByRole('button', { name: 'Adopt this plan' }))
    await expect.poll(() => plan().length).toBeGreaterThan(1)

    const { navigate } = await import('@/test/router-fake')
    navigate('/onboarding')
    await expect
      .poll(() => plan().map((s) => [s.practice_id, s.time]))
      .toEqual([['practice/rosary', '20:00']])
  }, 60_000)

  it('skips straight to Today, with no plan', async () => {
    const { screen, user } = await boot()
    await user.click(await screen.findByTestId('onboarding-skip'))
    await expect.poll(currentPath).toBe('/')
    expect(usePreferencesStore.getState().onboarding).toBe('done')
    expect(plan()).toHaveLength(0)
    expect(await screen.findByTestId('today')).toBeInTheDocument()
  }, 30_000)

  it('says so when the device refuses reminders, schedules nothing, and lets them go on', async () => {
    const denied = { status: 'denied', granted: false } as never
    vi.mocked(Notifications.getPermissionsAsync).mockResolvedValue(denied)
    vi.mocked(Notifications.requestPermissionsAsync).mockResolvedValue(denied)
    try {
      const { screen, user } = await boot()
      await user.click(await screen.findByTestId('onboarding-reason-begin'))
      await user.click(await screen.findByRole('button', { name: 'Adopt this plan' }))
      await user.click(await screen.findByTestId('onboarding-reminders-confirm'))

      expect(await screen.findByTestId('onboarding-denied')).toBeInTheDocument()
      expect(scheduled()).toHaveLength(0)
      await user.click(screen.getByTestId('onboarding-reminders-confirm'))
      await expect.poll(currentPath).toBe('/onboarding/pray')
    } finally {
      const granted = { status: 'granted', granted: true } as never
      vi.mocked(Notifications.getPermissionsAsync).mockResolvedValue(granted)
      vi.mocked(Notifications.requestPermissionsAsync).mockResolvedValue(granted)
    }
  }, 60_000)
})

describe('tab hints', () => {
  it('shows once and stays gone', async () => {
    const { screen, user } = await renderApp({
      route: '/hint',
      routes: [
        { pattern: '/hint', loader: async () => ({ default: () => <TabHint tab="you" /> }) },
      ],
    })
    await user.click(await screen.findByTestId('tab-hint-you-dismiss'))

    expect(screen.queryByTestId('tab-hint-you')).toBeNull()
    expect(usePreferencesStore.getState().seenHints).toEqual(['you'])
  }, 30_000)
})
