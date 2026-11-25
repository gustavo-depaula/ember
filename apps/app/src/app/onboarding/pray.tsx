import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'

import { ScreenLayout, Slab, Typography } from '@/components'
import { PrayerLines } from '@/components/PrayerText'
import { loadFlow } from '@/content/resolver'
import { PracticeHeader } from '@/features/practices/components/PracticeHeader'
import { localizeContent } from '@/lib/i18n'
import { track } from '@/lib/usage'
import { usePreferencesStore } from '@/stores/preferencesStore'

// The prayer's own closing line is the button here, so the text stops before it.
const withoutAmen = (text: string) => text.replace(/\n(Amen|Amém)\.?\s*$/i, '')

/**
 * Setup ends in prayer: the Our Father, whose Amen is the way into the app.
 * It is not recorded as a prayer kept; the first holy card waits on Today.
 */
export default function OnboardingPray() {
  const { t } = useTranslation()
  const router = useRouter()
  const setOnboarding = usePreferencesStore((s) => s.setOnboarding)

  const prayer = useQuery({
    queryKey: ['onboarding-our-father'],
    queryFn: async () => {
      const flow = await loadFlow('practice/our-father')
      const section = flow?.sections.find((s) => s.type === 'prayer' && 'inline' in s)
      return section && 'inline' in section && section.inline ? section.inline : null
    },
    staleTime: Number.POSITIVE_INFINITY,
  })

  return (
    <ScreenLayout modal>
      <YStack paddingVertical="$lg" gap="$lg">
        <PracticeHeader
          onBack={() => router.back()}
          name={t('onboarding.pray.title')}
          caption={t('onboarding.pray.kicker')}
        />
        {prayer.data ? <PrayerLines text={withoutAmen(localizeContent(prayer.data))} /> : null}
        <Typography variant="caption" textAlign="center" paddingTop="$md">
          {t('onboarding.pray.lede')}
        </Typography>
        <Slab
          testID="onboarding-amen"
          label={t('onboarding.pray.amen')}
          onPress={() => {
            setOnboarding('done')
            track('onboarding_done', {})
            router.replace('/')
          }}
        >
          <Typography variant="sacred-title" fontSize={26} lineHeight={34} color="$background">
            {t('onboarding.pray.amen')}
          </Typography>
        </Slab>
      </YStack>
    </ScreenLayout>
  )
}
