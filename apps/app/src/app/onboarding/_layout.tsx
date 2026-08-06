import { Stack } from 'expo-router'
import { Theme } from 'tamagui'

import { darkTheme } from '@/config/themes'

/**
 * Onboarding is a vigil: forced Tenebrae regardless of the user's theme
 * preference, so it continues the dark boot splash without a seam.
 *
 * Both mechanisms are needed and both belong here. `Theme` retunes the Tamagui
 * tokens every screen below reads; `contentStyle` paints the native stack
 * container, which sits outside their React tree — without it a light-theme user
 * sees parchment flash between step transitions.
 */
export default function OnboardingLayout() {
  return (
    <Theme name="dark">
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
          contentStyle: { backgroundColor: darkTheme.background },
        }}
      />
    </Theme>
  )
}
