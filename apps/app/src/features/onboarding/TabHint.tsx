import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'

import { Typography } from '@/components'
import { usePreferencesStore } from '@/stores/preferencesStore'

import { TextLink } from './parts'

/**
 * What a tab holds, said once, the first time it is opened after onboarding.
 * Quiet and in the page, gone with a tap; Today has none, it speaks for itself.
 */
export function TabHint({ tab }: { tab: 'you' | 'search' }) {
  const { t } = useTranslation()
  const seen = usePreferencesStore((s) => s.seenHints.includes(tab))
  const markHintSeen = usePreferencesStore((s) => s.markHintSeen)
  if (seen) return null

  return (
    <YStack
      testID={`tab-hint-${tab}`}
      backgroundColor="$backgroundSurface"
      borderRadius={16}
      paddingHorizontal="$md"
      paddingTop="$md"
      gap={2}
    >
      <Typography variant="screen-title" fontSize={21} lineHeight={26}>
        {t(`onboarding.hints.${tab}Title`)}
      </Typography>
      <Typography variant="caption" fontStyle="normal">
        {t(`onboarding.hints.${tab}Body`)}
      </Typography>
      <TextLink
        testID={`tab-hint-${tab}-dismiss`}
        label={t('onboarding.hints.dismiss')}
        align="flex-end"
        tone="accent"
        onPress={() => markHintSeen(tab)}
      />
    </YStack>
  )
}
