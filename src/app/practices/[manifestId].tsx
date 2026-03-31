import { useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Pressable } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import {
  AnimatedPressable,
  FlowButtons,
  PrayButton,
  ScreenLayout,
  SectionDivider,
} from '@/components'
import { getManifest, getManifestIconKey } from '@/content/practices'
import { getPracticeIcon } from '@/db/seed'
import {
  useCreatePractice,
  useEnableSlotsForPractice,
  useSlotsForPractice,
  useUpdateSlot,
} from '@/features/plan-of-life'
import {
  PracticeEditSheet,
  type PracticeFormData,
} from '@/features/plan-of-life/components/PracticeEditSheet'
import { PracticeTeachingContent, VariantSelector } from '@/features/practices/components'
import { localizeContent } from '@/lib/i18n'

export default function CatalogDetailScreen() {
  const { t } = useTranslation()
  const { manifestId } = useLocalSearchParams<{ manifestId: string }>()
  const router = useRouter()
  const theme = useTheme()

  const manifest = manifestId ? getManifest(manifestId) : undefined
  const { data: slotsForManifest = [] } = useSlotsForPractice(manifestId)
  const firstSlot = slotsForManifest[0]
  const isInPlan = slotsForManifest.some((s) => s.enabled === 1)

  const createPractice = useCreatePractice()
  const updateSlot = useUpdateSlot()
  const enableSlots = useEnableSlotsForPractice()
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
    if (firstSlot && !firstSlot.enabled) {
      enableSlots.mutate(manifestId!)
    } else {
      setShowEditor(true)
    }
  }

  function handleSave(data: PracticeFormData) {
    if (firstSlot) {
      updateSlot.mutate({
        id: firstSlot.id,
        data: {
          tier: data.tier,
          schedule: JSON.stringify(data.schedule),
          enabled: 1,
        },
      })
    } else if (manifest) {
      createPractice.mutate({
        id: manifest.id,
        slot: {
          tier: data.tier,
          schedule: JSON.stringify(data.schedule),
        },
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

        {manifest.flows.length === 1 && <PrayButton practiceId={manifest.id} />}

        {manifest.flows.length > 1 && (
          <YStack gap="$sm">
            <FlowButtons practiceId={manifest.id} flows={manifest.flows} />
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
              selectedVariantId={firstSlot?.variant ?? undefined}
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
            manifest={manifest}
            onSave={handleSave}
            onClose={() => setShowEditor(false)}
          />
        </YStack>
      </Modal>
    </ScreenLayout>
  )
}
