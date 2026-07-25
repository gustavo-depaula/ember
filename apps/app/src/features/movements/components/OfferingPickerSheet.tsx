import { BottomSheet } from '@expo/ui/community/bottom-sheet'
import { Plus } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { ScrollView, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, Typography } from '@/components'
import type { Movement } from '@/db/events'
import { lightTap } from '@/lib/haptics'

// Fixed detent, as in PinPracticeSheet — a RN ScrollView only scrolls inside a
// native sheet when its frame is height-bounded.
const sheetFraction = 0.6

/**
 * Reach into the register for one more thing to carry in this sitting.
 *
 * The offering block shows what is standing; this is how anything else from the
 * Altar joins for today without becoming a permanent fixture of the prayer.
 */
export function OfferingPickerSheet({
  visible,
  onClose,
  candidates,
  onCarry,
}: {
  visible: boolean
  onClose: () => void
  candidates: Movement[]
  onCarry: (movementId: string) => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { height } = useWindowDimensions()

  return (
    <BottomSheet
      index={visible ? 0 : -1}
      snapPoints={[`${sheetFraction * 100}%`]}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={{ backgroundColor: theme.background?.val }}
    >
      <YStack
        height={height * sheetFraction}
        paddingHorizontal="$lg"
        paddingTop="$md"
        paddingBottom={insets.bottom + 16}
        gap="$md"
      >
        <Typography variant="sacred-title" textAlign="left">
          {t('movements.picker.title')}
        </Typography>
        <Typography variant="caption">{t('movements.picker.subtitle')}</Typography>

        <ScrollView style={{ flex: 1 }}>
          <YStack gap="$xs">
            {candidates.length === 0 ? (
              <Typography variant="caption">{t('movements.picker.allCarried')}</Typography>
            ) : (
              candidates.map((m) => (
                <AnimatedPressable
                  key={m.id}
                  onPress={() => {
                    lightTap()
                    onCarry(m.id)
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={t('a11y.carryToday', { text: m.text })}
                >
                  <XStack
                    alignItems="center"
                    gap="$sm"
                    paddingVertical="$md"
                    paddingHorizontal="$md"
                    borderRadius="$md"
                    borderWidth={1}
                    borderColor="$borderColor"
                    backgroundColor="$backgroundSurface"
                  >
                    <Plus size={14} color={theme.accent?.val} />
                    <Typography flex={1} flexWrap="wrap">
                      {m.text}
                    </Typography>
                  </XStack>
                </AnimatedPressable>
              ))
            )}
          </YStack>
        </ScrollView>

        <AnimatedPressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t('movements.picker.confirm')}
        >
          <XStack
            justifyContent="center"
            paddingVertical="$md"
            borderRadius="$md"
            backgroundColor="$accent"
          >
            <Typography variant="label" fontSize="$2" color="white" letterSpacing={1}>
              {t('movements.picker.confirm')}
            </Typography>
          </XStack>
        </AnimatedPressable>
      </YStack>
    </BottomSheet>
  )
}
