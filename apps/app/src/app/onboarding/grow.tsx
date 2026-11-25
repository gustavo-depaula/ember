import { useRouter } from 'expo-router'

import { RuleGuide } from '@/features/plan-of-life/components/RuleGuide'

/** "Add to the rule", as it is in the app, leading on to reminders. */
export default function OnboardingGrow() {
  const router = useRouter()
  return <RuleGuide onContinue={() => router.push('/onboarding/reminders')} />
}
