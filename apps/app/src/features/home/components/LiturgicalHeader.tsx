import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useThemeName, View, YStack } from 'tamagui'

import { Typography } from '@/components'
import { formatLocalized } from '@/lib/i18n/dateLocale'
import type { LiturgicalSeason } from '@/lib/liturgical'

import { DateScrubber } from './DateScrubber'

const frameCornerDark = require('../../../../assets/textures/frame_corner_dark.png')
const frameCornerLight = require('../../../../assets/textures/frame_corner_light.png')
// Matches ScreenLayout's content column maxWidth; clamping avoids the flourish
// blowing up to full browser width on the web while the column stays centered.
const cornerMaxWidth = 640

/**
 * Today's header: the corner ornament hanging from the right, and tucked into
 * it the weekday and season over the date, which swipes through the days.
 */
export function LiturgicalHeader({
  date,
  season,
  today,
  onSelectDate,
}: {
  date: Date
  season: LiturgicalSeason
  today: string
  onSelectDate: (date: string) => void
}) {
  const { t } = useTranslation()
  const router = useRouter()
  const isDark = useThemeName().startsWith('dark')
  const { width: windowWidth } = useWindowDimensions()
  const cornerWidth = Math.min(windowWidth, cornerMaxWidth)
  const cornerHeight = cornerWidth / (isDark ? 1023 / 456 : 1584 / 672)
  // On notched platforms (iOS) the safe-area inset gives the ornament room. On
  // web/Android-no-notch the inset is 0, which would clip its top edge above
  // the viewport — add a virtual notch.
  const noNotchTopPad = useSafeAreaInsets().top === 0 ? 32 : 0
  // "Segunda-feira" → "Segunda": every weekday stays clear of the ornament.
  const weekday = formatLocalized(date, 'EEEE').replace(/-feira$/, '')

  return (
    <>
      <View
        position="absolute"
        top={noNotchTopPad - (isDark ? 78 : 73)}
        right={-16}
        zIndex={1}
        style={{ pointerEvents: 'none', transform: [{ scaleX: -1 }] }}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Image
          source={isDark ? frameCornerDark : frameCornerLight}
          style={{ width: cornerWidth, height: cornerHeight }}
          contentFit="contain"
        />
      </View>

      <YStack gap={2} paddingTop={20 + noNotchTopPad}>
        <Pressable
          onPress={() => router.push('/calendar')}
          accessibilityRole="link"
          accessibilityLabel={t('a11y.viewCalendar')}
          hitSlop={8}
        >
          <Typography variant="label" textTransform="uppercase" letterSpacing={1.5} fontSize="$2">
            {weekday} · {t(`home.seasonName.${season}`)}
          </Typography>
        </Pressable>
        <DateScrubber today={today} onSelectDate={onSelectDate} />
      </YStack>
    </>
  )
}
