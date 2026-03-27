import { useRouter } from 'expo-router'
import { ChevronLeft, Plus } from 'lucide-react-native'
import { useMemo, useState } from 'react'
import { Modal, Pressable } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { ScreenLayout } from '@/components'
import { dayLabels } from '@/config/constants'
import type { Frequency, Practice, Tier, TimeBlock } from '@/db/schema'
import { getPracticeIcon } from '@/db/seed'
import {
  useAllPractices,
  useCreatePractice,
  useDeletePractice,
  useUpdatePractice,
} from '@/features/plan-of-life'
import { PracticeEditSheet } from '@/features/plan-of-life/components/PracticeEditSheet'
import { TierBadge } from '@/features/plan-of-life/components/TierBadge'
import { parseFrequencyDays } from '@/features/plan-of-life/utils'

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function FrequencyLabel({ practice }: { practice: Practice }) {
  if (practice.frequency === 'daily') return null

  const days = parseFrequencyDays(practice)
  const label = days.map((d) => dayLabels[d]).join(', ')

  return (
    <Text fontFamily="$body" fontSize={11} color="$colorSecondary">
      {label || practice.frequency}
    </Text>
  )
}

export default function PlanSettingsScreen() {
  const router = useRouter()
  const theme = useTheme()
  const { data: practices = [] } = useAllPractices()
  const updatePractice = useUpdatePractice()
  const createPractice = useCreatePractice()
  const deletePractice = useDeletePractice()

  const [editingPractice, setEditingPractice] = useState<Practice | undefined>()
  const [showEditor, setShowEditor] = useState(false)

  const grouped = useMemo(() => {
    const groups: Record<Tier, Practice[]> = { essential: [], ideal: [], extra: [] }
    for (const p of practices) {
      if (p.tier in groups) groups[p.tier].push(p)
    }
    return groups
  }, [practices])

  const tierSections: { tier: Tier; label: string }[] = [
    { tier: 'essential', label: 'Essential' },
    { tier: 'ideal', label: 'Ideal' },
    { tier: 'extra', label: 'Extra' },
  ]

  function handleEdit(practice: Practice) {
    setEditingPractice(practice)
    setShowEditor(true)
  }

  function handleAdd() {
    setEditingPractice(undefined)
    setShowEditor(true)
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
    if (editingPractice) {
      updatePractice.mutate({
        id: editingPractice.id,
        data: {
          name: editingPractice.is_builtin === 1 ? undefined : data.name,
          icon: data.icon,
          tier: data.tier,
          timeBlock: data.timeBlock,
          frequency: data.frequency,
          frequencyDays: data.frequencyDays,
          notifyEnabled: data.notifyEnabled ? 1 : 0,
          notifyTime: data.notifyEnabled ? data.notifyTime : null,
          description: data.description,
          enabled: data.enabled ? 1 : 0,
        },
      })
    } else {
      createPractice.mutate({
        id: slugify(data.name),
        name: data.name,
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

  function handleDelete() {
    if (editingPractice) {
      deletePractice.mutate(editingPractice.id)
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
          <Text flex={1} fontFamily="$heading" fontSize="$5" color="$color">
            Customize Practices
          </Text>
          <Pressable onPress={handleAdd} hitSlop={8}>
            <Plus size={24} color={theme.accent.val} />
          </Pressable>
        </XStack>

        {tierSections.map(({ tier, label }) => (
          <YStack key={tier} gap="$sm">
            <XStack alignItems="center" gap="$sm" paddingHorizontal="$xs">
              <TierBadge tier={tier} />
              <Text fontFamily="$heading" fontSize="$3" color="$color">
                {label}
              </Text>
              <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                ({grouped[tier].length})
              </Text>
            </XStack>

            {grouped[tier].map((practice) => (
              <Pressable key={practice.id} onPress={() => handleEdit(practice)}>
                <XStack
                  backgroundColor="$backgroundSurface"
                  borderRadius="$lg"
                  padding="$md"
                  alignItems="center"
                  gap="$md"
                  opacity={practice.enabled ? 1 : 0.5}
                >
                  <Text fontSize={20}>{getPracticeIcon(practice.icon)}</Text>
                  <YStack flex={1} gap={2}>
                    <Text fontFamily="$body" fontSize="$3" color="$color">
                      {practice.name}
                    </Text>
                    <FrequencyLabel practice={practice} />
                  </YStack>
                  {!practice.enabled && (
                    <Text fontFamily="$body" fontSize={11} color="$colorSecondary">
                      Disabled
                    </Text>
                  )}
                  <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
                    ›
                  </Text>
                </XStack>
              </Pressable>
            ))}

            {grouped[tier].length === 0 && (
              <Text
                fontFamily="$body"
                fontSize="$2"
                color="$colorSecondary"
                paddingHorizontal="$xs"
              >
                No {label.toLowerCase()} practices
              </Text>
            )}
          </YStack>
        ))}

        <Pressable onPress={handleAdd}>
          <XStack
            borderWidth={1}
            borderColor="$accent"
            borderRadius="$lg"
            borderStyle="dashed"
            padding="$md"
            alignItems="center"
            justifyContent="center"
            gap="$sm"
          >
            <Plus size={18} color={theme.accent.val} />
            <Text fontFamily="$body" fontSize="$3" color="$accent">
              Add Custom Practice
            </Text>
          </XStack>
        </Pressable>
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
            practice={editingPractice}
            onSave={handleSave}
            onDelete={
              editingPractice && editingPractice.is_builtin === 0 ? handleDelete : undefined
            }
            onClose={() => setShowEditor(false)}
          />
        </YStack>
      </Modal>
    </ScreenLayout>
  )
}
