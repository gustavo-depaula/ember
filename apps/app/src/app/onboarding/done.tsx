import { useTranslation } from 'react-i18next'
import { useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { YStack } from 'tamagui'

import { textShadow } from '@/components/ornaments'
import { Typography } from '@/components/typography'
import { blockInk, blockLabelInk } from '@/features/explore/bgColor'
import { ArtFace, completeOnboarding, PrimaryButton } from '@/features/onboarding'

/**
 * The closing screen — El Greco's Pentecost, the Church sent out to begin. It
 * wears the same full-bleed treatment as the opening slide, and is by the same
 * hand, so the vigil closes where it opened before day breaks over the tabs.
 * This is the one place the CTA fills: gold spent on the single moment that
 * matters. `Begin` flips `hasOnboarded`, and the root guard reveals the tabs.
 */
export default function OnboardingDoneScreen() {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const { width, height } = useWindowDimensions()

  return (
    <YStack flex={1} backgroundColor="$background">
      <ArtFace
        artId="collection/holy-spirit"
        label={t('onboarding.done.title')}
        width={width}
        height={height}
      >
        <YStack paddingHorizontal="$lg" paddingBottom={insets.bottom + 24} gap="$md">
          <YStack gap="$xs">
            <Typography
              variant="label"
              textTransform="uppercase"
              letterSpacing={2}
              fontSize="$1"
              color={blockLabelInk}
              style={textShadow}
            >
              {t('onboarding.done.marker')}
            </Typography>
            <Typography
              variant="screen-title"
              textAlign="left"
              fontSize={40}
              lineHeight={48}
              color={blockInk}
              style={textShadow}
            >
              {t('onboarding.done.title')}
            </Typography>
            <Typography fontSize="$3" color={blockInk} opacity={0.86} maxWidth={420}>
              {t('onboarding.done.body')}
            </Typography>
          </YStack>

          <PrimaryButton
            label={t('onboarding.done.begin')}
            onPress={completeOnboarding}
            haptic="success"
            filled
          />
        </YStack>
      </ArtFace>
    </YStack>
  )
}
