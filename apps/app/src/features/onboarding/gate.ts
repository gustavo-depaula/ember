import { useEffect } from 'react'

import { useEventStore } from '@/db/events'
import { planSlots } from '@/features/plan-of-life/due'
import { type OnboardingStage, usePreferencesStore } from '@/stores/preferencesStore'

/**
 * Where a launch goes: into onboarding, or on as before.
 *   - done: finished or skipped — never again
 *   - started: left half-way; a relaunch resumes it
 *   - new with a plan: someone who kept a rule before onboarding existed, and
 *     never needs it — marked done
 *   - new with an empty plan: a first install
 */
export function gateOf(stage: OnboardingStage, hasPlan: boolean): 'onboard' | 'settle' | 'stay' {
  if (stage === 'done') return 'stay'
  if (stage === 'started') return 'onboard'
  return hasPlan ? 'settle' : 'onboard'
}

/** Whether the app should open on onboarding (the root guards on it); settles a kept rule as done. */
export function useNeedsOnboarding(): boolean {
  const stage = usePreferencesStore((s) => s.onboarding)
  const setOnboarding = usePreferencesStore((s) => s.setOnboarding)
  // Past onboarding the plan is never asked about, so Today's every change costs nothing here.
  const hasPlan = useEventStore((s) => stage !== 'done' && planSlots(s).length > 0)
  const gate = gateOf(stage, hasPlan)
  useEffect(() => {
    if (gate !== 'settle') return
    // One who kept a rule before doesn't need the steps.
    setOnboarding('done')
  }, [gate, setOnboarding])
  return gate === 'onboard'
}
