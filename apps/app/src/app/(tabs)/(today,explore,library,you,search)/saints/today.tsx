import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useWindowDimensions } from 'react-native'
import { YStack } from 'tamagui'

import { AnimatedPressable, ScreenLayout } from '@/components'
import { Typography } from '@/components/typography'
import { useSaintOfDay } from '@/features/explore'
import { SaintCard, saints } from '@/features/saints'
import { localizeContent } from '@/lib/i18n'

// Saint-of-the-Day "story" — the destination of the Explore featured block.
// Shows the holy card (when art exists) + the celebration's name, rank, and
// liturgical description. The full biography is a STUB for now (see explore.md);
// real lives land in a later content pass.
export default function SaintOfDayScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { width } = useWindowDimensions()
  const saint = useSaintOfDay()

  const cardWidth = Math.min(width - 48, 340)

  const back = (
    <AnimatedPressable
      onPress={() => router.back()}
      accessibilityRole="link"
      accessibilityLabel={t('common.back', { defaultValue: 'Back' })}
    >
      <Typography variant="reference">‹ {t('common.back', { defaultValue: 'Back' })}</Typography>
    </AnimatedPressable>
  )

  if (!saint) {
    return (
      <ScreenLayout>
        <YStack gap="$lg" paddingVertical="$lg">
          {back}
          <Typography variant="sacred-title">{t('explore.saintOfDay')}</Typography>
        </YStack>
      </ScreenLayout>
    )
  }

  const entry = saint.celebration.entry
  const name = localizeContent(entry.name)
  const description = localizeContent(entry.description)
  const artSaint = saint.artId ? saints.find((s) => s.id === saint.artId) : undefined

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        {back}

        <YStack gap="$xs">
          <Typography
            variant="label"
            textAlign="center"
            textTransform="uppercase"
            letterSpacing={1.5}
          >
            {t('explore.saintOfDay')}
          </Typography>
          <Typography variant="sacred-title" fontSize={32} lineHeight={38}>
            {name}
          </Typography>
          <Typography variant="reference" textAlign="center" textTransform="uppercase">
            {t(`calendar.rank.${saint.celebration.rank}`)}
          </Typography>
        </YStack>

        {artSaint && (
          <YStack height={cardWidth * 1.5} alignItems="center" justifyContent="center">
            <SaintCard saint={artSaint} />
          </YStack>
        )}

        {description && (
          <Typography
            variant="whisper"
            textAlign="center"
            fontSize="$3"
            maxWidth={520}
            alignSelf="center"
          >
            {description}
          </Typography>
        )}

        <Typography variant="caption" textAlign="center">
          {t('explore.bioStub')}
        </Typography>
      </YStack>
    </ScreenLayout>
  )
}
