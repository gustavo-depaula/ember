import { create } from 'zustand'

import type { FormationStage, PrayerStage, TimeAvailable } from './recommendations'

// In-flow state carried across the onboarding step screens (each step is its own
// route). Ephemeral by design — only the resulting plan, language, and formation
// choices are persisted, via the preferences store and plan-of-life mutations.
type OnboardingState = {
  prayerStage?: PrayerStage
  formationStage?: FormationStage
  time?: TimeAvailable
  setAnswers: (
    patch: Partial<Pick<OnboardingState, 'prayerStage' | 'formationStage' | 'time'>>,
  ) => void
  reset: () => void
}

const initialAnswers = {
  prayerStage: undefined,
  formationStage: undefined,
  time: undefined,
} satisfies Partial<OnboardingState>

export const useOnboardingState = create<OnboardingState>((set) => ({
  ...initialAnswers,
  setAnswers: (patch) => set(patch),
  reset: () => set(initialAnswers),
}))
