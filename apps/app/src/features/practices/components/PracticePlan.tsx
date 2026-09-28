import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Pressable } from 'react-native'
import { YStack } from 'tamagui'

import { getHourSlots } from '@/content/pins'
import { findGroupMemberInSet, loadFlow } from '@/content/resolver'
import type { PracticeManifest } from '@/content/types'
import { useEventStore } from '@/db/events'
import { createProgramCursor, getPractice, getSlotsForPractice } from '@/db/repositories'
import type { Tier } from '@/db/schema'
import {
  useCreatePractice,
  useEnableSlotsForPractice,
  useSlotsForPractice,
  useUnarchivePractice,
  useUpdateSlot,
} from '@/features/plan-of-life'
import {
  PracticeEditSheet,
  type PracticeFormData,
} from '@/features/plan-of-life/components/PracticeEditSheet'
import { selectEnrollmentSchedule } from '@/features/plan-of-life/program'

/**
 * A practice's place in the plan of life: whether it (or a sibling variant) is
 * already there, and how to add it. Adding a program enrolls it and opens its
 * day list. `editorOpen` drives `<PracticePlanEditor>`, which asks for tier and
 * schedule when adding needs them.
 */
export function usePracticePlan(manifest: PracticeManifest | undefined) {
  const router = useRouter()
  // Routes carry the bare id ("rosary") while the plan keys practices by the
  // canonical one ("practice/rosary"); reading the plan by the bare id missed
  // the practice entirely and every "Add to plan" added it again.
  const planId = manifest?.id ?? ''
  const slots = useSlotsForPractice(planId)
  const firstSlot = slots[0]
  const isDirectlyInPlan = slots.some((s) => s.enabled === 1)

  const practices = useEventStore((s) => s.practices)
  const groupMemberInPlan = useMemo(() => {
    if (!planId || isDirectlyInPlan) return undefined
    const activeIds = new Set<string>()
    for (const [id, p] of practices) {
      if (!p.archived) activeIds.add(id)
    }
    return findGroupMemberInSet(planId, activeIds)
  }, [planId, isDirectlyInPlan, practices])

  const createPractice = useCreatePractice()
  const updateSlot = useUpdateSlot()
  const enableSlots = useEnableSlotsForPractice()
  const unarchivePractice = useUnarchivePractice()
  const [editorOpen, setEditorOpen] = useState(false)

  // An office arrives with every hour listed, each its own row to switch off.
  // Resolves false for any other practice, which the caller adds as one slot.
  async function addHours(id: string, base: { tier: Tier; schedule: string }) {
    const hours = getHourSlots(await loadFlow(id)).map((h) => ({ ...base, ...h }))
    if (hours.length === 0) return false
    // Startup seeding leaves a disabled, unpinned slot for every practice; it
    // becomes the first hour rather than a stray "whole office" row.
    const placeholder = getSlotsForPractice(id).find((s) => !s.pins && s.enabled === 0)
    const [first, ...rest] = hours
    if (placeholder) updateSlot.mutate({ id: placeholder.id, data: { ...first, enabled: 1 } })
    createPractice.mutate({ id, activeVariant: id, slots: placeholder ? rest : hours })
    return true
  }

  function openProgram() {
    router.push({ pathname: '/practices/[manifestId]/program', params: { manifestId: planId } })
  }

  function beginProgram(program: NonNullable<PracticeManifest['program']>) {
    const onSuccess = async () => {
      await createProgramCursor(planId)
      openProgram()
    }
    if (firstSlot) {
      enableSlots.mutate(planId, { onSuccess })
      return
    }
    const slotDefaults = manifest?.defaults?.slots?.[0]
    const schedule = selectEnrollmentSchedule(
      program.progressPolicy,
      slotDefaults?.schedule ?? { type: 'daily' as const },
      program.totalDays,
      new Date().toISOString().split('T')[0],
    )
    const tier = (slotDefaults?.tier as Tier | undefined) ?? 'extra'
    createPractice.mutate(
      { id: planId, slot: { tier, schedule: JSON.stringify(schedule) } },
      { onSuccess },
    )
  }

  function addToPlan() {
    if (!planId) return
    if (manifest?.program) return beginProgram(manifest.program)
    const practice = getPractice(planId)
    if (practice?.archived) {
      unarchivePractice.mutate(planId)
    } else if (firstSlot && !firstSlot.enabled) {
      // Only the seeded placeholder: an office still needs its hours.
      if (slots.length > 1 || firstSlot.pins) {
        enableSlots.mutate(planId)
        return
      }
      void addHours(planId, { tier: firstSlot.tier, schedule: firstSlot.schedule }).then(
        (added) => {
          if (!added) enableSlots.mutate(planId)
        },
      )
    } else {
      setEditorOpen(true)
    }
  }

  function saveFromEditor(data: PracticeFormData) {
    if (firstSlot) {
      updateSlot.mutate({
        id: firstSlot.id,
        data: { tier: data.tier, schedule: JSON.stringify(data.schedule), enabled: 1 },
      })
    } else if (manifest) {
      const base = { tier: data.tier, schedule: JSON.stringify(data.schedule) }
      const { id } = manifest
      void addHours(id, base).then((added) => {
        if (!added) createPractice.mutate({ id, activeVariant: id, slot: base })
      })
    }
    setEditorOpen(false)
  }

  return {
    isProgram: !!manifest?.program,
    openProgram,
    isInPlan: isDirectlyInPlan || !!groupMemberInPlan,
    /** The id the plan knows this practice by — a sibling variant's when that one was added. */
    planPracticeId: groupMemberInPlan ?? planId,
    addToPlan,
    editorOpen,
    closeEditor: () => setEditorOpen(false),
    saveFromEditor,
  }
}

export function PracticePlanEditor({
  manifest,
  plan,
}: {
  manifest: PracticeManifest
  plan: ReturnType<typeof usePracticePlan>
}) {
  const { t } = useTranslation()
  return (
    <Modal
      visible={plan.editorOpen}
      animationType="slide"
      transparent
      onRequestClose={plan.closeEditor}
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
          onPress={plan.closeEditor}
          accessibilityRole="button"
          accessibilityLabel={t('a11y.closeModal')}
        />
        <PracticeEditSheet
          manifest={manifest}
          onSave={plan.saveFromEditor}
          onClose={plan.closeEditor}
        />
      </YStack>
    </Modal>
  )
}
