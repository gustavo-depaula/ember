// biome-ignore-all lint/suspicious/noArrayIndexKey: static prayer sections never reorder
import { format } from 'date-fns'
import { useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import {
  AnimatedPressable,
  CanticleBlock,
  HeaderFlourish,
  HymnBlock,
  ManuscriptFrame,
  OrnamentalRule,
  PrayerTextBlock,
  ResponseBlock,
  RubricLabel,
  ScreenLayout,
} from '@/components'
import { type FlowContext, resolveFlow } from '@/content/engine'
import { getManifest, loadFlow } from '@/content/practices'
import type { RenderedSection } from '@/content/types'
import { useTogglePractice } from '@/features/plan-of-life'
import { useReadingMargin } from '@/hooks/useReadingStyle'
import { successBuzz } from '@/lib/haptics'
import { formatLocalized } from '@/lib/i18n/dateLocale'

export function PracticeFlow({ practiceId }: { practiceId: string }) {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const readingMargin = useReadingMargin()
  const togglePractice = useTogglePractice()

  const manifest = getManifest(practiceId)
  const flow = manifest ? loadFlow(practiceId) : undefined

  const now = useMemo(() => new Date(), [])

  const sections = useMemo(() => {
    if (!flow) return []
    const context: FlowContext = { date: now }
    return resolveFlow(flow, context)
  }, [flow, now])

  const practiceName = t(`practice.${practiceId}`, { defaultValue: manifest?.name.en ?? practiceId })
  const formattedDate = formatLocalized(now, 'EEEE, MMMM d, yyyy')

  if (!manifest || !flow) {
    return (
      <ScreenLayout>
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$md" padding="$lg">
          <Text fontFamily="$body" fontSize="$3" color="$colorSecondary" textAlign="center">
            {t('practice.noContent')}
          </Text>
          <Pressable onPress={() => router.back()}>
            <Text fontFamily="$body" fontSize="$2" color="$accent">
              {t('common.back')}
            </Text>
          </Pressable>
        </YStack>
      </ScreenLayout>
    )
  }

  function handleComplete() {
    const today = format(new Date(), 'yyyy-MM-dd')
    togglePractice.mutate(
      { practiceId, date: today, completed: true },
      {
        onSuccess: () => {
          successBuzz()
          router.back()
        },
      },
    )
  }

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$md">
        <Pressable onPress={() => router.back()}>
          <XStack alignItems="center" gap="$sm">
            <ChevronLeft size={20} color={theme.accent.val} />
            <Text fontFamily="$body" fontSize="$2" color="$accent">
              {t('common.back')}
            </Text>
          </XStack>
        </Pressable>

        <ManuscriptFrame>
          <YStack
            alignItems="center"
            gap="$xs"
            paddingVertical="$md"
            paddingHorizontal={readingMargin}
          >
            <HeaderFlourish />
            <Text fontFamily="$display" fontSize={36} lineHeight={42} color="$colorBurgundy">
              {practiceName}
            </Text>
            <Text fontFamily="$script" fontSize="$3" color="$colorSecondary">
              {formattedDate}
            </Text>
          </YStack>

          {sections.map((section, index) => (
            <PracticeSectionBlock key={`${section.type}-${index}`} section={section} />
          ))}

          <YStack paddingVertical="$lg" paddingHorizontal={readingMargin}>
            <AnimatedPressable onPress={handleComplete} disabled={togglePractice.isPending}>
              <YStack
                backgroundColor="$accent"
                borderRadius="$md"
                borderWidth={1}
                borderColor="$accentSubtle"
                paddingVertical="$md"
                alignItems="center"
                opacity={togglePractice.isPending ? 0.6 : 1}
              >
                <Text fontFamily="$heading" fontSize="$3" color="$background">
                  {togglePractice.isPending
                    ? t('office.completing', { defaultValue: 'Completing...' })
                    : t('office.markComplete', { defaultValue: 'Mark Complete' })}
                </Text>
              </YStack>
            </AnimatedPressable>
          </YStack>
        </ManuscriptFrame>
      </YStack>
    </ScreenLayout>
  )
}

function PracticeSectionBlock({ section }: { section: RenderedSection }) {
  switch (section.type) {
    case 'rubric':
      return <RubricLabel>{section.label}</RubricLabel>

    case 'prayer':
      return <PrayerTextBlock text={section.text} />

    case 'hymn':
      return <HymnBlock title={section.title} english={section.english} latin={section.latin} />

    case 'canticle':
      return (
        <CanticleBlock
          title={section.title}
          subtitle={section.subtitle}
          source={section.source}
          text={section.text}
        />
      )

    case 'response':
      return <ResponseBlock verses={section.verses} />

    case 'heading':
      return (
        <Text fontFamily="$heading" fontSize="$4" color="$colorBurgundy" letterSpacing={0.5}>
          {section.text}
        </Text>
      )

    case 'meditation':
      return (
        <Text
          fontFamily="$body"
          fontSize="$2"
          fontStyle="italic"
          color="$colorSecondary"
          lineHeight={28}
        >
          {section.text}
        </Text>
      )

    case 'divider':
      return <OrnamentalRule />

    case 'image':
      return null

    default:
      return null
  }
}
