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

export const useOnboardingState = create<OnboardingState>((set) => ({
  prayerStage: undefined,
  formationStage: undefined,
  time: undefined,
  setAnswers: (patch) => set(patch),
  reset: () => set({ prayerStage: undefined, formationStage: undefined, time: undefined }),
}))
