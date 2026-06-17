import { Platform } from 'react-native'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { useOnboardingState } from './useOnboardingState'

// The linear step order. `index` is the intro; `done` closes the flow. The
// notifications step is native-only (web has no OS notifications).
export const onboardingSteps = [
  'index',
  'language',
  'profiler',
  'plan',
  'formation',
  'notifications',
  'done',
] as const

export type OnboardingStep = (typeof onboardingSteps)[number]

const isWeb = Platform.OS === 'web'

function activeSteps(): OnboardingStep[] {
  return onboardingSteps.filter((s) => !(isWeb && s === 'notifications'))
}

function routeFor(step: OnboardingStep): string {
  return step === 'index' ? '/onboarding' : `/onboarding/${step}`
}

/** The route to advance to after `current` (skips notifications on web). */
export function nextRoute(current: OnboardingStep): string {
  const steps = activeSteps()
  const i = steps.indexOf(current)
  const next = steps[i + 1] ?? 'done'
  return routeFor(next)
}

/**
 * Progress for the dot indicator. Shown on the input steps (language → the last
 * step before done); the intro and done screens return undefined (no dots).
 */
export function stepProgress(
  current: OnboardingStep,
): { index: number; total: number } | undefined {
  const content: OnboardingStep[] = activeSteps().filter((s) => s !== 'index' && s !== 'done')
  const i = content.indexOf(current)
  if (i === -1) return undefined
  return { index: i + 1, total: content.length }
}

/** Marks onboarding complete; the Stack.Protected guard then reveals the tabs. */
export function completeOnboarding() {
  useOnboardingState.getState().reset()
  usePreferencesStore.getState().setHasOnboarded(true)
}
