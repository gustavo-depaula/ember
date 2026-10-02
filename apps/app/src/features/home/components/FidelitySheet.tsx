import { useTranslation } from 'react-i18next'
import { ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { XStack, YStack } from 'tamagui'

import { FidelityMark, Typography, VotiveWall } from '@/components'
import { createSheet, NativeSheet } from '@/components/NativeSheet'
import { fidelity as mark } from '@/features/plan-of-life/record'
import type { usePlanFidelity } from '@/features/plan-of-life/useRuleRecord'

const sheet = createSheet()

export const openFidelity = sheet.open

const scale = 1.5
// The wall's cell and gap at `scale` (VotiveWall draws 18pt cells 2pt apart).
const cell = 18 * scale
const gap = 2 * scale
const weekdays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
const legend = ['kept', 'prayed', 'none', 'open'] as const

/** The fidelity wall drawn larger, with how to read it and what each mark means. */
export function FidelitySheet({
  fidelity,
  weeks,
}: {
  fidelity: ReturnType<typeof usePlanFidelity>
  weeks: number
}) {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()

  return (
    <NativeSheet sheet={sheet} fraction={0.94}>
      {({ scroll, height, bodyShown }) => (
        <YStack paddingTop="$xl" gap="$sm" height={height}>
          <Typography variant="screen-title" fontSize="$5" paddingHorizontal="$lg">
            {t('home.fidelity')}
          </Typography>
          <ScrollView showsVerticalScrollIndicator={false} {...scroll}>
            <YStack paddingHorizontal="$lg" paddingBottom={insets.bottom + 48} gap="$md">
              <Typography tone="muted" fontSize="$3">
                {t('home.fidelityIntro', { count: weeks })}
              </Typography>
              {bodyShown && (
                <>
                  <YStack alignItems="center" gap="$sm">
                    <XStack gap="$sm">
                      <YStack
                        gap={gap}
                        accessibilityElementsHidden
                        importantForAccessibility="no-hide-descendants"
                      >
                        {weekdays.map((d) => (
                          <YStack key={d} height={cell} justifyContent="center">
                            <Typography fontSize="$1" tone="muted">
                              {t(`day.${d}`)}
                            </Typography>
                          </YStack>
                        ))}
                      </YStack>
                      <VotiveWall
                        data={fidelity?.wall ?? []}
                        weeks={weeks}
                        fidelity
                        scale={scale}
                      />
                    </XStack>
                    {fidelity && fidelity.prayedDays > 0 && (
                      <YStack alignItems="center">
                        {fidelity.streak > 1 && (
                          <Typography fontSize="$3">
                            {t('home.streakDays', { count: fidelity.streak })}
                          </Typography>
                        )}
                        <Typography tone="muted" fontSize="$2">
                          {t('home.prayedDays', {
                            prayed: fidelity.prayedDays,
                            count: fidelity.countedDays,
                          })}
                        </Typography>
                      </YStack>
                    )}
                  </YStack>
                  <YStack gap="$sm">
                    {legend.map((key) => (
                      <XStack key={key} alignItems="center" gap="$md">
                        <YStack
                          accessibilityElementsHidden
                          importantForAccessibility="no-hide-descendants"
                        >
                          <FidelityMark value={mark[key]} scale={scale} />
                        </YStack>
                        <YStack flex={1}>
                          <Typography fontSize="$3">
                            {t(`home.fidelityLegend.${key}.title`)}
                          </Typography>
                          <Typography tone="muted" fontSize="$2">
                            {t(`home.fidelityLegend.${key}.body`)}
                          </Typography>
                        </YStack>
                      </XStack>
                    ))}
                  </YStack>
                  <Typography tone="muted" fontSize="$2" fontStyle="italic">
                    {t('home.fidelityStreakNote')}
                  </Typography>
                </>
              )}
            </YStack>
          </ScrollView>
        </YStack>
      )}
    </NativeSheet>
  )
}
