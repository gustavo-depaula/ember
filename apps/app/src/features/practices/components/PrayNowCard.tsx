import { useRouter } from 'expo-router'
import { Clock, Sparkles } from 'lucide-react-native'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { PracticeIcon } from '@/components/PracticeIcon'
import { getManifest, getManifestIconKey } from '@/content/resolver'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { useAllSlots } from '@/features/plan-of-life'
import { localizeContent } from '@/lib/i18n'

type SubtitleKey = 'morning' | 'midday' | 'afternoon' | 'evening' | 'night' | 'mass'

type Candidate = { id: string; subtitleKey: SubtitleKey }

function pickCandidates(hour: number, dayOfWeek: number): Candidate[] {
  const candidates: Candidate[] = []
  const isSunday = dayOfWeek === 0

  if (isSunday && hour >= 6 && hour < 12) {
    candidates.push({ id: 'mass', subtitleKey: 'mass' })
  }

  if (hour >= 5 && hour < 10) {
    candidates.push({ id: 'morning-offering', subtitleKey: 'morning' })
    candidates.push({ id: 'gospel-of-the-day', subtitleKey: 'morning' })
  } else if (hour >= 10 && hour < 13) {
    candidates.push({ id: 'angelus', subtitleKey: 'midday' })
    candidates.push({ id: 'regina-caeli', subtitleKey: 'midday' })
  } else if (hour >= 13 && hour < 16) {
    candidates.push({ id: 'chaplet-of-divine-mercy', subtitleKey: 'afternoon' })
    candidates.push({ id: 'three-oclock-prayer', subtitleKey: 'afternoon' })
  } else if (hour >= 16 && hour < 18) {
    candidates.push({ id: 'holy-hour', subtitleKey: 'afternoon' })
    candidates.push({ id: 'rosary', subtitleKey: 'afternoon' })
  } else if (hour >= 18 && hour < 21) {
    candidates.push({ id: 'examination-of-conscience', subtitleKey: 'evening' })
    candidates.push({ id: 'rosary', subtitleKey: 'evening' })
  } else {
    candidates.push({ id: 'night-prayer', subtitleKey: 'night' })
    candidates.push({ id: 'examination-of-conscience', subtitleKey: 'night' })
  }

  candidates.push({ id: 'sign-of-cross', subtitleKey: 'morning' })
  return candidates
}

function resolveCandidate(
  candidates: Candidate[],
  planIds: string[],
): { practiceId: string; subtitleKey: SubtitleKey; manifestName: string } | undefined {
  for (const c of candidates) {
    const m = getManifest(c.id)
    if (m) {
      return { practiceId: m.id, subtitleKey: c.subtitleKey, manifestName: localizeContent(m.name) }
    }
  }
  for (const id of planIds) {
    const m = getManifest(id)
    if (m)
      return { practiceId: m.id, subtitleKey: 'morning', manifestName: localizeContent(m.name) }
  }
  return undefined
}

export function PrayNowCard({ hour }: { hour: number }) {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const allSlots = useAllSlots()
  const catalogVersion = useCatalogVersion()

  const enabledPracticeIds = useMemo(
    () => allSlots.filter((s) => s.enabled).map((s) => s.practice_id),
    [allSlots],
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: catalogVersion drives re-resolution as deferred manifests warm.
  const suggestion = useMemo(() => {
    const dayOfWeek = new Date().getDay()
    return resolveCandidate(pickCandidates(hour, dayOfWeek), enabledPracticeIds)
  }, [hour, enabledPracticeIds, catalogVersion])

  if (!suggestion) return undefined

  const iconKey = getManifestIconKey(suggestion.practiceId)
  const subtitleMap: Record<SubtitleKey, string> = {
    morning: 'pray.suggestionMorning',
    midday: 'pray.suggestionMidday',
    afternoon: 'pray.suggestionAfternoon',
    evening: 'pray.suggestionEvening',
    night: 'pray.suggestionNight',
    mass: 'pray.suggestionMass',
  }

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: '/pray/[practiceId]',
          params: { practiceId: suggestion.practiceId },
        })
      }
      accessibilityRole="link"
      accessibilityLabel={t('pray.now')}
    >
      <YStack
        backgroundColor="$backgroundSurface"
        borderRadius="$lg"
        padding="$md"
        gap="$xs"
        borderLeftWidth={3}
        borderLeftColor="$accent"
        borderWidth={1}
        borderColor="$borderColor"
      >
        <XStack alignItems="center" gap="$xs">
          <Sparkles size={14} color={theme.accent?.val} />
          <Text
            fontFamily="$body"
            fontSize="$1"
            color="$accent"
            letterSpacing={1}
            textTransform="uppercase"
          >
            {t('pray.now')}
          </Text>
        </XStack>
        <XStack alignItems="center" gap="$md">
          <PracticeIcon name={iconKey} size={32} />
          <YStack flex={1} gap={2}>
            <Text fontFamily="$heading" fontSize="$4" color="$color" numberOfLines={1}>
              {suggestion.manifestName}
            </Text>
            <XStack alignItems="center" gap="$xs">
              <Clock size={11} color={theme.color?.val} />
              <Text
                fontFamily="$body"
                fontSize="$1"
                color="$color"
                fontStyle="italic"
                numberOfLines={1}
              >
                {t(subtitleMap[suggestion.subtitleKey])}
              </Text>
            </XStack>
          </YStack>
          <Text fontFamily="$body" fontSize="$3" color="$accent">
            ›
          </Text>
        </XStack>
      </YStack>
    </Pressable>
  )
}
