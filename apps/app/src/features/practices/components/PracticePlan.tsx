import { format } from 'date-fns'
import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

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
import { WhenSheet } from '@/features/plan-of-life/components/RuleSheets'
import { selectEnrollmentSchedule } from '@/features/plan-of-life/program'
import { normalizeSchedule, parseSchedule, type Schedule } from '@/features/plan-of-life/schedule'

/**
 * A practice's place in the plan of life: whether it (or a sibling variant) is
 * already there, and how to add it. Every time in the rule has an hour: one
 * the practice suggests is taken as is, otherwise `<PracticePlanEditor>` asks
 * for it. Adding a program enrolls it and opens its day list — unless that
 * page is where it was added from (`openOnBegin: false`).
 */
export function usePracticePlan(
  manifest: PracticeManifest | undefined,
  { openOnBegin = true }: { openOnBegin?: boolean } = {},
) {
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
  const [asking, setAsking] = useState<Asking>()

  const slotDefaults = manifest?.defaults?.slots?.[0]
  const suggestedTime = slotDefaults?.time
  const defaultTier = (slotDefaults?.tier as Tier | undefined) ?? 'ideal'

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

  // With the practice's own hour, or after asking for one.
  function withTime(schedule: Schedule, fields: Asking['fields'], add: (a: When) => void) {
    if (suggestedTime) return add({ schedule, time: suggestedTime })
    setAsking({ schedule, fields, add })
  }

  function beginProgram(program: NonNullable<PracticeManifest['program']>) {
    const onSuccess = async () => {
      await createProgramCursor(planId)
      if (openOnBegin) openProgram()
    }
    const schedule = selectEnrollmentSchedule(
      program.progressPolicy,
      normalizeSchedule(slotDefaults?.schedule ?? { type: 'daily' }),
      program.totalDays,
      format(new Date(), 'yyyy-MM-dd'),
    )
    // Every practice is seeded with a switched-off slot, so this is the usual
    // path: the slot takes the program's calendar as it's switched on. Left on
    // its daily rule, a novena's days would only advance by prayers, and a day
    // missed would never show.
    if (firstSlot) {
      updateSlot.mutate(
        { id: firstSlot.id, data: { schedule: JSON.stringify(schedule) } },
        { onSuccess: () => enableSlots.mutate(planId, { onSuccess }) },
      )
      return
    }
    withTime(schedule, 'time', ({ time }) =>
      createPractice.mutate(
        { id: planId, slot: { tier: defaultTier, time, schedule: JSON.stringify(schedule) } },
        { onSuccess },
      ),
    )
  }

  function addToPlan() {
    if (!planId || !manifest) return
    if (manifest.program) return beginProgram(manifest.program)
    const practice = getPractice(planId)
    if (practice?.archived) return unarchivePractice.mutate(planId)

    // An office's hours set up before come back as they were.
    if (firstSlot && (slots.length > 1 || firstSlot.pins)) return enableSlots.mutate(planId)
    const schedule = firstSlot
      ? parseSchedule(firstSlot.schedule)
      : normalizeSchedule(slotDefaults?.schedule ?? { type: 'daily' })
    const base = { tier: firstSlot?.tier ?? defaultTier, schedule: JSON.stringify(schedule) }
    void addHours(planId, base).then((added) => {
      if (added) return
      // The seeded slot already carries the hour the practice suggests.
      if (firstSlot?.time) return enableSlots.mutate(planId)
      withTime(schedule, 'both', (when) => {
        const data = { schedule: JSON.stringify(when.schedule), time: when.time }
        if (firstSlot) return updateSlot.mutate({ id: firstSlot.id, data: { ...data, enabled: 1 } })
        createPractice.mutate({
          id: planId,
          activeVariant: planId,
          slot: { tier: base.tier, ...data },
        })
      })
    })
  }

  return {
    isProgram: !!manifest?.program,
    openProgram,
    isInPlan: isDirectlyInPlan || !!groupMemberInPlan,
    /** The id the plan knows this practice by — a sibling variant's when that one was added. */
    planPracticeId: groupMemberInPlan ?? planId,
    addToPlan,
    asking,
    closeAsking: () => setAsking(undefined),
  }
}

type When = { schedule: Schedule; time: string }
type Asking = { schedule: Schedule; fields: 'both' | 'time'; add: (when: When) => void }

/** Asks for the days and hour a practice joins the rule with. */
export function PracticePlanEditor({ plan }: { plan: ReturnType<typeof usePracticePlan> }) {
  const { t } = useTranslation()
  const { asking } = plan
  return (
    <WhenSheet
      open={!!asking}
      onClose={plan.closeAsking}
      title={t('rule.addToRule')}
      schedule={asking?.schedule ?? { type: 'daily' }}
      time="08:00"
      fields={asking?.fields}
      confirmLabel={t('rule.add')}
      onConfirm={(when) => {
        asking?.add(when)
        plan.closeAsking()
      }}
    />
  )
}
