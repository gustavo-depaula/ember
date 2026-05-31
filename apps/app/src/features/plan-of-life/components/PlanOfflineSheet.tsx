import { BottomSheet } from '@expo/ui/community/bottom-sheet'
import { Check, CloudDownload, Loader } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, Typography } from '@/components'
import { usePinPractices } from '@/features/pinning/hooks'
import { lightTap } from '@/lib/haptics'

// A short, fixed detent — the sheet holds a line of intent and one action.
const sheetFraction = 0.4

/**
 * Make the whole plan of life available offline. The header's cloud button opens
 * this; pinning every corpus practice in the rule is one deliberate act here
 * (with progress) rather than a stray button in the page body.
 */
export function PlanOfflineSheet({
  practiceIds,
  open,
  onClose,
}: {
  practiceIds: string[]
  open: boolean
  onClose: () => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { height } = useWindowDimensions()
  const { allPinned, eligibleCount, isWorking, progress, pinAll, unpinAll } =
    usePinPractices(practiceIds)

  const done = allPinned
  const progressLabel = t('plan.pinAllInProgress', {
    done: progress?.done ?? 0,
    total: progress?.total ?? eligibleCount,
  })

  return (
    <BottomSheet
      index={open ? 0 : -1}
      snapPoints={[`${sheetFraction * 100}%`]}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={{ backgroundColor: theme.background?.val }}
    >
      <YStack
        height={height * sheetFraction}
        paddingHorizontal="$lg"
        paddingTop="$lg"
        paddingBottom={insets.bottom + 16}
        gap="$lg"
      >
        <YStack gap="$xs">
          <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
            {t('plan.offlineTitle')}
          </Typography>
          <Typography variant="whisper">{t('plan.offlineHint')}</Typography>
        </YStack>

        {eligibleCount === 0 ? (
          <Typography tone="muted" fontSize="$2" fontStyle="italic">
            {t('plan.offlineNone')}
          </Typography>
        ) : done ? (
          // Settled: a status, not a button — with a real way to undo it.
          <YStack gap="$sm">
            <XStack alignItems="center" justifyContent="center" gap="$sm" paddingVertical="$sm">
              <Check size={20} color={theme.accent?.val} />
              <Typography variant="label" fontSize="$3" color="$accent">
                {t('plan.planOffline')}
              </Typography>
            </XStack>
            <AnimatedPressable
              onPress={() => {
                if (isWorking) return
                lightTap()
                unpinAll()
              }}
              accessibilityRole="button"
              accessibilityLabel={t('plan.offlineRemove')}
            >
              <Typography tone="muted" fontSize="$2" textAlign="center">
                {t('plan.offlineRemove')}
              </Typography>
            </AnimatedPressable>
          </YStack>
        ) : (
          <AnimatedPressable
            onPress={() => {
              if (isWorking) return
              lightTap()
              pinAll()
            }}
            accessibilityRole="button"
            accessibilityState={{ busy: isWorking }}
            accessibilityLabel={isWorking ? progressLabel : t('plan.pinAll')}
          >
            <XStack
              alignItems="center"
              justifyContent="center"
              gap="$sm"
              paddingVertical="$md"
              borderRadius="$lg"
              backgroundColor="$accent"
              opacity={isWorking ? 0.85 : 1}
            >
              {isWorking ? (
                <Loader size={20} color={theme.background?.val} />
              ) : (
                <CloudDownload size={20} color={theme.background?.val} />
              )}
              <Typography variant="label" fontSize="$3" color="$background">
                {isWorking ? progressLabel : t('plan.pinAll')}
              </Typography>
            </XStack>
          </AnimatedPressable>
        )}
      </YStack>
    </BottomSheet>
  )
}
