import { useRouter } from 'expo-router'

import { IntroSlides } from '@/features/onboarding'

/** The features overview, revisitable from Settings — Done returns to where you were. */
export default function TourScreen() {
  const router = useRouter()
  return <IntroSlides revisit onDone={() => router.back()} />
}
