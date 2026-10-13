import { useRouter } from 'expo-router'
import { ChevronRight } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, useTheme, View, XStack, YStack } from 'tamagui'

import { PracticeIcon } from '@/components'
import { getEntry } from '@/content/contentIndex'
import { getPinLabels } from '@/content/pins'
import { getLoadedFlow } from '@/content/resolver'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { getPractice } from '@/db/repositories/practices'
import { useFlows, usePrayedBeyond } from '@/features/plan-of-life'
import { localizeContent } from '@/lib/i18n'
import type { TodayPlan } from '../useTodayPlan'

/**
 * What was prayed that day beyond its plan, at the foot of the plan's sheet:
 * a record, so the rows carry a mark rather than a checkbox. Nothing is drawn
 * on a day that kept to the plan.
 */
export function AlsoPrayed({
  plan: { selectedDate, todaySlots },
  onLeave,
}: {
  plan: TodayPlan
  /** Called before a row navigates away. */
  onLeave: () => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const router = useRouter()
  // Names and icons arrive as deferred manifests warm in.
  useCatalogVersion()
  const prayed = usePrayedBeyond(selectedDate, todaySlots)
  // An hour prayed beyond the plan reads "Matins", as a pinned row does.
  useFlows(prayed.filter((p) => p.pins).map((p) => `practice/${p.id}`))
  if (prayed.length === 0) return null

  return (
    <YStack gap="$sm" marginTop="$lg">
      <YStack
        paddingHorizontal="$xs"
        paddingBottom="$xs"
        borderBottomWidth={0.5}
        borderBottomColor="$accentSubtle"
      >
        <Text
          fontFamily="$heading"
          fontSize="$2"
          color="$colorSecondary"
          letterSpacing={3}
          textTransform="uppercase"
        >
          {t('home.beyondPlan')}
        </Text>
      </YStack>
      {prayed.map(({ id, pins }) => {
        const entry = getEntry(`practice/${id}`)
        const practiceName = entry?.name
          ? localizeContent(entry.name)
          : (getPractice(id)?.custom_name ?? id)
        const pinLabel = getPinLabels(getLoadedFlow(`practice/${id}`), pins)
          .map(localizeContent)
          .join(' · ')
        const name = pinLabel || practiceName
        return (
          <Pressable
            key={JSON.stringify([id, pins])}
            onPress={() => {
              onLeave()
              // A practice of the user's own has no flow to pray, only its page.
              router.push({
                pathname: entry ? '/pray/[practiceId]' : '/plan/[practiceId]',
                params: { practiceId: id },
              })
            }}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.viewPractice', { name })}
          >
            <XStack paddingVertical="$md" paddingHorizontal="$xs" alignItems="center" gap="$md">
              <View width={24} height={24} alignItems="center" justifyContent="center">
                <Text fontFamily="$body" fontSize="$3" color="$accent" opacity={0.5}>
                  ✓
                </Text>
              </View>
              <PracticeIcon
                name={getPractice(id)?.custom_icon ?? entry?.icon ?? 'prayer'}
                size={20}
              />
              <YStack flex={1}>
                <Text fontFamily="$body" fontSize="$4" color="$colorSecondary">
                  {name}
                </Text>
                {pinLabel !== '' && (
                  <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                    {practiceName}
                  </Text>
                )}
              </YStack>
              <ChevronRight size={16} color={theme.accentSubtle?.val} />
            </XStack>
          </Pressable>
        )
      })}
    </YStack>
  )
}
