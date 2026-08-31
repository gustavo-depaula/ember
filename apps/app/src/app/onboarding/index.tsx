import { useRouter } from 'expo-router'

import { completeOnboarding, IntroSlides, nextRoute } from '@/features/onboarding'

export default function OnboardingIntroScreen() {
  const router = useRouter()
  return <IntroSlides onDone={() => router.push(nextRoute('index'))} onSkip={completeOnboarding} />
}
