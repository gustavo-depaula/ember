import { useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Pressable } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, ScreenLayout, SectionDivider } from '@/components'
import { getManifest, getManifestIconKey } from '@/content/practices'
import type { Frequency, Tier, TimeBlock } from '@/db/schema'
import { getPracticeIcon } from '@/db/seed'
import { useAllPractices, useCreatePractice, useUpdatePractice } from '@/features/plan-of-life'
import { PracticeEditSheet } from '@/features/plan-of-life/components/PracticeEditSheet'
import { PracticeTeachingContent, VariantSelector } from '@/features/practices/components'
import { localizeContent } from '@/lib/i18n'

export default function CatalogDetailScreen() {
  const { t } = useTranslation()
  const { manifestId } = useLocalSearchParams<{ manifestId: string }>()
  const router = useRouter()
  const theme = useTheme()

  const manifest = manifestId ? getManifest(manifestId) : undefined
  const { data: allPractices = [] } = useAllPractices()
  const practiceInDb = allPractices.find((p) => p.manifest_id === manifestId)
  const isInPlan = practiceInDb ? practiceInDb.enabled === 1 : false

  const createPractice = useCreatePractice()
  const updatePractice = useUpdatePractice()
  const [showEditor, setShowEditor] = useState(false)

  if (!manifest) {
    return (
      <ScreenLayout>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Text fontFamily="$body" fontSize="$3" color="$colorSecondary">
            {t('plan.practiceNotFound')}
          </Text>
        </YStack>
      </ScreenLayout>
    )
  }

  const iconKey = getManifestIconKey(manifest.id)

  function handleAddToPlan() {
    if (practiceInDb && !practiceInDb.enabled) {
      updatePractice.mutate({
        id: practiceInDb.id,
        data: { enabled: 1 },
      })
    } else {
      setShowEditor(true)
    }
  }

  function handleSave(data: {
    name: string
    icon: string
    tier: Tier
    timeBlock: TimeBlock
    frequency: Frequency
    frequencyDays: number[]
    notifyEnabled: boolean
    notifyTime: string
    description: string
    enabled: boolean
  }) {
    if (practiceInDb) {
      updatePractice.mutate({
        id: practiceInDb.id,
        data: {
          icon: data.icon,
          tier: data.tier,
          timeBlock: data.timeBlock,
          frequency: data.frequency,
          frequencyDays: data.frequencyDays,
          notifyEnabled: data.notifyEnabled ? 1 : 0,
          notifyTime: data.notifyEnabled ? data.notifyTime : null,
          enabled: 1,
        },
      })
    } else if (manifest) {
      createPractice.mutate({
        id: manifest.id,
        name: localizeContent(manifest.name),
        icon: data.icon,
        frequency: data.frequency,
        tier: data.tier,
        timeBlock: data.timeBlock,
        frequencyDays: data.frequencyDays,
        description: data.description,
      })
    }
    setShowEditor(false)
  }

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <XStack alignItems="center" gap="$md">
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ChevronLeft size={24} color={theme.color.val} />
          </Pressable>
          <Text fontSize={28}>{getPracticeIcon(iconKey)}</Text>
          <YStack flex={1} gap={2}>
            <Text fontFamily="$heading" fontSize="$5" color="$color">
              {localizeContent(manifest.name)}
            </Text>
            <XStack gap="$sm">
              {manifest.estimatedMinutes && (
                <Text fontFamily="$body" fontSize={11} color="$colorSecondary">
                  {t('catalog.estimatedTime', { minutes: manifest.estimatedMinutes })}
                </Text>
              )}
              {manifest.categories.map((cat) => (
                <Text key={cat} fontFamily="$body" fontSize={11} color="$colorSecondary">
                  {t(`category.${cat}`, { defaultValue: cat })}
                </Text>
              ))}
            </XStack>
          </YStack>
        </XStack>

        {manifest.flow && (
          <AnimatedPressable onPress={() => router.push(`/pray/${manifest.id}` as any)}>
            <YStack
              backgroundColor="$accent"
              borderRadius="$md"
              borderWidth={1}
              borderColor="$accentSubtle"
              paddingVertical="$sm"
              alignItems="center"
            >
              <Text fontFamily="$heading" fontSize="$3" color="$background">
                {t('practice.pray')}
              </Text>
            </YStack>
          </AnimatedPressable>
        )}

        {manifest.hours && manifest.hours.length > 0 && (
          <YStack gap="$sm">
            <Text fontFamily="$heading" fontSize="$3" color="$color">
              {t('catalog.hours')}
            </Text>
            {manifest.hours.map((hour) => (
              <AnimatedPressable
                key={hour.id}
                onPress={() => router.push(`/pray/${manifest.id}?hour=${hour.id}` as any)}
              >
                <XStack
                  backgroundColor="$accent"
                  borderRadius="$md"
                  borderWidth={1}
                  borderColor="$accentSubtle"
                  paddingVertical="$sm"
                  paddingHorizontal="$md"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Text fontFamily="$heading" fontSize="$2" color="$background">
                    {localizeContent(hour.name)}
                  </Text>
                  <Text fontFamily="$body" fontSize="$1" color="$background" opacity={0.8}>
                    {t(`timeBlock.${hour.timeBlock}`)}
                  </Text>
                </XStack>
              </AnimatedPressable>
            ))}
          </YStack>
        )}

        {isInPlan ? (
          <Pressable onPress={() => router.push(`/plan/${manifest.id}`)}>
            <XStack
              backgroundColor="$backgroundSurface"
              borderRadius="$md"
              borderWidth={1}
              borderColor="$accent"
              paddingVertical="$sm"
              justifyContent="center"
              alignItems="center"
              gap="$sm"
            >
              <Text fontFamily="$heading" fontSize="$3" color="$accent">
                {t('catalog.alreadyInPlan')}
              </Text>
              <Text fontFamily="$body" fontSize="$2" color="$accent">
                ›
              </Text>
            </XStack>
          </Pressable>
        ) : (
          <AnimatedPressable onPress={handleAddToPlan}>
            <YStack
              backgroundColor="$backgroundSurface"
              borderRadius="$md"
              borderWidth={1}
              borderColor="$accent"
              paddingVertical="$sm"
              alignItems="center"
            >
              <Text fontFamily="$heading" fontSize="$3" color="$accent">
                {t('catalog.addToPlan')}
              </Text>
            </YStack>
          </AnimatedPressable>
        )}

        <SectionDivider />

        <PracticeTeachingContent manifest={manifest} defaultExpanded />

        {manifest.variants && manifest.variants.length > 0 && (
          <>
            <SectionDivider />
            <VariantSelector
              manifest={manifest}
              selectedVariantId={practiceInDb?.selected_variant ?? null}
            />
          </>
        )}
      </YStack>

      <Modal
        visible={showEditor}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEditor(false)}
      >
        <YStack flex={1} justifyContent="flex-end">
          <Pressable
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
            }}
            onPress={() => setShowEditor(false)}
          />
          <PracticeEditSheet
            practice={practiceInDb ?? undefined}
            manifest={manifest}
            mode="add"
            onSave={handleSave}
            onClose={() => setShowEditor(false)}
          />
        </YStack>
      </Modal>
    </ScreenLayout>
  )
}
