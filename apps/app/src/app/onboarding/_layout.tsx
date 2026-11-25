import { Stack } from 'expo-router'
import { useTranslation } from 'react-i18next'

// The first-run steps, full screen over the app. No swipe back past the first
// question: leaving goes through its own choices (a reason, or skip).
export default function OnboardingLayout() {
  const { t } = useTranslation()
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="index"
        options={{ title: t('onboarding.reason.title'), gestureEnabled: false }}
      />
      <Stack.Screen name="begin" options={{ title: t('onboarding.reason.begin') }} />
      <Stack.Screen name="grow" options={{ title: t('onboarding.reason.grow') }} />
      <Stack.Screen name="obra" options={{ title: t('onboarding.reason.obra') }} />
      <Stack.Screen name="office" options={{ title: t('onboarding.office.ask') }} />
      <Stack.Screen name="office-hours" options={{ title: t('onboarding.office.hours') }} />
      <Stack.Screen name="office-first" options={{ title: t('onboarding.office.introTitle') }} />
      <Stack.Screen name="reminders" options={{ title: t('onboarding.reminders.title') }} />
      <Stack.Screen
        name="pray"
        options={{ title: t('onboarding.pray.kicker'), gestureEnabled: false }}
      />
    </Stack>
  )
}
