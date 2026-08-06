import { useRouter } from 'expo-router'
import { Theme } from 'tamagui'

import { IntroSlides } from '@/features/onboarding'

/**
 * The features overview, revisitable from Settings — Done returns to where you
 * were. Kept in Tenebrae like the first-run tour: the slides are cream ink over
 * darkened paintings, which needs the dark ground whatever theme the tabs are in.
 */
export default function TourScreen() {
  const router = useRouter()
  return (
    <Theme name="dark">
      <IntroSlides revisit onDone={() => router.back()} />
    </Theme>
  )
}
