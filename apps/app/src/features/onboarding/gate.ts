import { useEffect } from 'react'

import { type EventStoreState, useEventStore } from '@/db/events'
import { planSlots } from '@/features/plan-of-life/due'
import { type OnboardingStage, usePreferencesStore } from '@/stores/preferencesStore'

/**
 * Where a launch goes: into onboarding, or on as before.
 *   - done: finished or skipped — never again
 *   - started: left half-way; a relaunch resumes it
 *   - new and settled: someone who kept a rule before onboarding existed, and
 *     never needs it — marked done
 *   - new otherwise: a first install, or one who barely used the app before
 */
export function gateOf(stage: OnboardingStage, settled: boolean): 'onboard' | 'settle' | 'stay' {
  if (stage === 'done') return 'stay'
  if (stage === 'started') return 'onboard'
  return settled ? 'settle' : 'onboard'
}

/**
 * Whether the app was in real use before onboarding: a plan of two practices
 * or more, prayed on three days or more. One prayer in the plan, or a plan
 * barely prayed, still gets the first steps — what it holds stays, onboarding
 * only adds.
 */
export function isSettled(
  state: Pick<EventStoreState, 'slots' | 'practices' | 'completionsByDate'>,
) {
  const practices = new Set(planSlots(state).map((s) => s.practice_id))
  return practices.size >= 2 && state.completionsByDate.size >= 3
}

/** Whether the app should open on onboarding (the root guards on it); settles a kept rule as done. */
export function useNeedsOnboarding(): boolean {
  const stage = usePreferencesStore((s) => s.onboarding)
  const setOnboarding = usePreferencesStore((s) => s.setOnboarding)
  // Past onboarding the plan is never asked about, so Today's every change costs nothing here.
  const settled = useEventStore((s) => stage !== 'done' && isSettled(s))
  const gate = gateOf(stage, settled)
  useEffect(() => {
    if (gate !== 'settle') return
    // One who kept a rule before doesn't need the steps.
    setOnboarding('done')
  }, [gate, setOnboarding])
  return gate === 'onboard'
}
