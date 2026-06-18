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

// Resolved once: web has no OS notifications, so that step drops out of the flow.
const activeSteps = onboardingSteps.filter((s) => !(Platform.OS === 'web' && s === 'notifications'))
// The dot-indicator steps — everything between the intro and the closing screen.
const contentSteps: OnboardingStep[] = activeSteps.filter((s) => s !== 'index' && s !== 'done')

/** The route to advance to after `current` (skips notifications on web). */
export function nextRoute(current: OnboardingStep): string {
  const next = activeSteps[activeSteps.indexOf(current) + 1] ?? 'done'
  return next === 'index' ? '/onboarding' : `/onboarding/${next}`
}

/**
 * Progress for the dot indicator. Shown on the input steps; the intro and done
 * screens have no dots (returns undefined).
 */
export function stepProgress(
  current: OnboardingStep,
): { index: number; total: number } | undefined {
  const i = contentSteps.indexOf(current)
  if (i === -1) return undefined
  return { index: i + 1, total: contentSteps.length }
}

/** Marks onboarding complete; the Stack.Protected guard then reveals the tabs. */
export function completeOnboarding() {
  useOnboardingState.getState().reset()
  usePreferencesStore.getState().setHasOnboarded(true)
}
