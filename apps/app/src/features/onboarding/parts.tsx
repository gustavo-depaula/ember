import { Image, type ImageSource } from 'expo-image'
import { ChevronRight } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, Typography } from '@/components'
import { lightTap } from '@/lib/haptics'

/** One answer to a question of onboarding: a painting, the answer, a line under it. */
export function ChoiceRow({
  testID,
  title,
  hint,
  image,
  first,
  onPress,
}: {
  testID: string
  title: string
  hint: string
  image?: ImageSource
  first?: boolean
  onPress: () => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  return (
    <AnimatedPressable
      testID={testID}
      onPress={() => {
        lightTap()
        onPress()
      }}
      accessibilityRole="button"
      accessibilityLabel={t('a11y.onboardingChoose', { name: title })}
    >
      <XStack
        alignItems="center"
        gap="$md"
        paddingVertical="$md"
        borderTopWidth={first ? 0 : 0.5}
        borderColor="$borderColor"
      >
        {image ? (
          <Image
            source={image}
            style={{ width: 64, height: 64, borderRadius: 8 }}
            contentFit="cover"
            accessibilityIgnoresInvertColors
          />
        ) : null}
        <YStack flex={1}>
          <Typography fontSize={21} lineHeight={25}>
            {title}
          </Typography>
          <Typography variant="caption">{hint}</Typography>
        </YStack>
        <ChevronRight size={22} color={theme.accent.val} strokeWidth={1.5} />
      </XStack>
    </AnimatedPressable>
  )
}

/**
 * A way on or out that is not the page's commitment. `quiet` (the default) is
 * the way out — skip, no reminders — small and muted, so it never competes with
 * the gold slab; `accent` is a plain way on, as dismissing a hint.
 */
export function TextLink({
  testID,
  label,
  onPress,
  align = 'center',
  tone = 'quiet',
}: {
  testID: string
  label: string
  onPress: () => void
  align?: 'center' | 'flex-end'
  tone?: 'quiet' | 'accent'
}) {
  return (
    <AnimatedPressable
      testID={testID}
      onPress={() => {
        lightTap()
        onPress()
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{ alignSelf: align }}
    >
      <YStack minHeight={44} justifyContent="center">
        {tone === 'quiet' ? (
          <Typography tone="muted" fontSize={15}>
            {label}
          </Typography>
        ) : (
          <Typography
            variant="label"
            color="$accentHover"
            textTransform="uppercase"
            letterSpacing={1.5}
          >
            {label}
          </Typography>
        )}
      </YStack>
    </AnimatedPressable>
  )
}
