import { BottomSheet } from '@expo/ui/community/bottom-sheet'
import { Plus, Star, X } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { ScrollView, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, Typography } from '@/components'
import type { Movement } from '@/db/events'
import { lightTap } from '@/lib/haptics'

// Fixed detent, as in PinPracticeSheet — a RN ScrollView only scrolls inside a
// native sheet when its frame is height-bounded.
const sheetFraction = 0.7

/**
 * What this prayer carries, and what else could.
 *
 * One surface for both entry points: the offering block's "Carry more today",
 * and the ambient "Offered for" line under a practice header. Carried entries
 * can be made standing (star) or dropped for this sitting; everything else on
 * the Altar can be added.
 */
export function OfferingPickerSheet({
  visible,
  onClose,
  carried = [],
  candidates,
  standingIds,
  onCarry,
  onDrop,
  onToggleStanding,
}: {
  visible: boolean
  onClose: () => void
  carried?: Movement[]
  candidates: Movement[]
  standingIds?: ReadonlySet<string>
  onCarry: (movementId: string) => void
  onDrop?: (movementId: string) => void
  onToggleStanding?: (movement: Movement) => void
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
            {carried.map((m) => {
              const isStanding = standingIds?.has(m.id) ?? false
              return (
                <XStack key={m.id} alignItems="center" gap="$sm" paddingVertical="$sm">
                  <Typography color="$accent">⟢</Typography>
                  <Typography flex={1} flexWrap="wrap">
                    {m.text}
                  </Typography>
                  {onToggleStanding ? (
                    <AnimatedPressable
                      onPress={() => {
                        lightTap()
                        onToggleStanding(m)
                      }}
                      hitSlop={10}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isStanding }}
                      accessibilityLabel={t(
                        isStanding ? 'a11y.unmakeStanding' : 'a11y.makeStanding',
                        { text: m.text },
                      )}
                    >
                      <Star
                        size={14}
                        color={isStanding ? theme.accent?.val : theme.colorSecondary?.val}
                        fill={isStanding ? theme.accent?.val : 'none'}
                      />
                    </AnimatedPressable>
                  ) : undefined}
                  {onDrop && !isStanding ? (
                    <AnimatedPressable
                      onPress={() => {
                        lightTap()
                        onDrop(m.id)
                      }}
                      hitSlop={10}
                      accessibilityRole="button"
                      accessibilityLabel={t('a11y.dropFromToday', { text: m.text })}
                    >
                      <X size={14} color={theme.colorSecondary?.val} />
                    </AnimatedPressable>
                  ) : undefined}
                </XStack>
              )
            })}

            {candidates.length === 0 && carried.length > 0 ? (
              <Typography variant="caption" paddingTop="$sm">
                {t('movements.picker.allCarried')}
              </Typography>
            ) : undefined}

            {candidates.map((m) => (
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
            ))}
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
