import { useRouter } from 'expo-router'
import { ChevronLeft, Plus } from 'lucide-react-native'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Pressable } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { ScreenLayout } from '@/components'
import { getManifest } from '@/content/practices'
import type { Tier, UserPractice } from '@/db/schema'
import { getPracticeIcon } from '@/db/seed'
import {
  getPracticeIconKey,
  getPracticeName,
  useAllPractices,
  useCreatePractice,
  useDeletePractice,
  useUpdatePractice,
} from '@/features/plan-of-life'
import type { PracticeFormData } from '@/features/plan-of-life/components/PracticeEditSheet'
import { PracticeEditSheet } from '@/features/plan-of-life/components/PracticeEditSheet'
import { TierBadge } from '@/features/plan-of-life/components/TierBadge'
import { parseSchedule } from '@/features/plan-of-life/schedule'

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function ScheduleLabel({ practice }: { practice: UserPractice }) {
  const { t } = useTranslation()
  const schedule = parseSchedule(practice.schedule)

  if (schedule.type === 'daily') return null

  if (schedule.type === 'days-of-week') {
    const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
    const label = schedule.days.map((d) => t(`day.${dayKeys[d]}`)).join(', ')
    return (
      <Text fontFamily="$body" fontSize={11} color="$colorSecondary">
        {label}
      </Text>
    )
  }

  if (schedule.type === 'times-per') {
    return (
      <Text fontFamily="$body" fontSize={11} color="$colorSecondary">
        {schedule.count}x/{schedule.period}
      </Text>
    )
  }

  return null
}

export default function PlanSettingsScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const { data: practices = [] } = useAllPractices()
  const updatePractice = useUpdatePractice()
  const createPractice = useCreatePractice()
  const deletePractice = useDeletePractice()

  const [editingPractice, setEditingPractice] = useState<UserPractice | undefined>()
  const [showEditor, setShowEditor] = useState(false)

  const grouped = useMemo(() => {
    const groups: Record<Tier, UserPractice[]> = { essential: [], ideal: [], extra: [] }
    for (const p of practices) {
      if (p.tier in groups) groups[p.tier].push(p)
    }
    return groups
  }, [practices])

  const tierSections: Tier[] = ['essential', 'ideal', 'extra']

  function handleEdit(practice: UserPractice) {
    setEditingPractice(practice)
    setShowEditor(true)
  }

  function handleAdd() {
    setEditingPractice(undefined)
    setShowEditor(true)
  }

  function handleSave(data: PracticeFormData) {
    if (editingPractice) {
      const isBuiltin = !!getManifest(editingPractice.practice_id)
      updatePractice.mutate({
        id: editingPractice.practice_id,
        data: {
          tier: data.tier,
          timeBlock: data.timeBlock,
          schedule: JSON.stringify(data.schedule),
          enabled: data.enabled ? 1 : 0,
          ...(isBuiltin
            ? {}
            : {
                customName: data.name,
                customIcon: data.icon,
                customDesc: data.description,
              }),
        },
      })
    } else {
      createPractice.mutate({
        id: slugify(data.name),
        customName: data.name,
        customIcon: data.icon,
        tier: data.tier,
        timeBlock: data.timeBlock,
        schedule: JSON.stringify(data.schedule),
        customDesc: data.description,
      })
    }
    setShowEditor(false)
  }

  function handleDelete() {
    if (editingPractice) {
      deletePractice.mutate(editingPractice.practice_id)
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
            {t('plan.customize')}
          </Text>
          <Pressable onPress={handleAdd} hitSlop={8}>
            <Plus size={24} color={theme.accent.val} />
          </Pressable>
        </XStack>

        {tierSections.map((tier) => (
          <YStack key={tier} gap="$sm">
            <XStack alignItems="center" gap="$sm" paddingHorizontal="$xs">
              <TierBadge tier={tier} />
              <Text fontFamily="$heading" fontSize="$3" color="$color">
                {t(`tier.${tier}`)}
              </Text>
              <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                ({grouped[tier].length})
              </Text>
            </XStack>

            {grouped[tier].map((practice) => (
              <Pressable key={practice.practice_id} onPress={() => handleEdit(practice)}>
                <XStack
                  backgroundColor="$backgroundSurface"
                  borderRadius="$lg"
                  padding="$md"
                  alignItems="center"
                  gap="$md"
                  opacity={practice.enabled ? 1 : 0.5}
                >
                  <Text fontSize={20}>{getPracticeIcon(getPracticeIconKey(practice))}</Text>
                  <YStack flex={1} gap={2}>
                    <Text fontFamily="$body" fontSize="$3" color="$color">
                      {getPracticeName(practice, t)}
                    </Text>
                    <ScheduleLabel practice={practice} />
                  </YStack>
                  {!practice.enabled && (
                    <Text fontFamily="$body" fontSize={11} color="$colorSecondary">
                      {t('plan.disabled')}
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
                {t('plan.noPractices', { tier: t(`tier.${tier}`).toLowerCase() })}
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
              {t('plan.addCustom')}
            </Text>
          </XStack>
        </Pressable>

        <Pressable onPress={() => router.push('/practices' as any)}>
          <XStack
            backgroundColor="$backgroundSurface"
            borderRadius="$lg"
            padding="$md"
            alignItems="center"
            justifyContent="center"
            gap="$sm"
          >
            <Text fontFamily="$body" fontSize="$3" color="$accent">
              {t('catalog.browseCatalog')}
            </Text>
            <Text fontFamily="$body" fontSize="$2" color="$accent">
              ›
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
              editingPractice && !getManifest(editingPractice.practice_id)
                ? handleDelete
                : undefined
            }
            onClose={() => setShowEditor(false)}
          />
        </YStack>
      </Modal>
    </ScreenLayout>
  )
}
