import { Stack } from 'expo-router'

import { darkTheme } from '@/config/themes'

/**
 * Onboarding is a vigil: forced Tenebrae regardless of the user's theme
 * preference, so it continues the dark boot splash without a seam. The stack's
 * own background is painted too — otherwise a light-theme user sees parchment
 * flash between step transitions.
 */
export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        contentStyle: { backgroundColor: darkTheme.background },
      }}
    />
  )
}
