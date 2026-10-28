import { format } from 'date-fns'
import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { confirm } from '@/components'
import { getPinnableSelects } from '@/content/pins'
import type { RenderedSection } from '@/content/types'
import { useAdvanceCursor } from '@/features/divine-office'
import { checkIn } from '@/features/mass-times'
import {
  useCompletePractice,
  useHandleProgramCompletion,
  useRestartProgram,
} from '@/features/plan-of-life'
import { getToday } from '@/hooks/useToday'
import { successBuzz } from '@/lib/haptics'
import { findTrackIds } from '../findTrackIds'
import { usePractice } from './usePractice'
import { usePracticeTracks } from './usePracticeTracks'

// Owns the write side: log a completion, advance reading cursors, finalize the
// program if this is the final day. Sibling hooks (usePractice,
// usePracticeTracks) are pulled in directly — no prop-drilling required.
export function usePracticeCompletion(
  practiceId: string,
  programDayProp: number | undefined,
  renderedSections: RenderedSection[],
  selectOverrides: Record<string, string>,
  // The plan slot this prayer was opened from, when there is one. Without it
  // the completion module picks the slot; cursors and program progress key on
  // the prayed `practiceId` either way.
  slotKey?: string,
  // The date of a missed program day prayed late. The completion counts for
  // that day; its completedAt still records when it was actually prayed.
  dayDate?: string,
) {
  const { t } = useTranslation()
  const router = useRouter()
  const { manifest, flow, programProgress } = usePractice(practiceId, programDayProp)
  const { trackDefs } = usePracticeTracks(practiceId)
  const completePractice = useCompletePractice()
  const advanceCursor = useAdvanceCursor()
  const handleProgramCompletion = useHandleProgramCompletion()
  const restartProgramMutation = useRestartProgram()
  const [showCompleteModal, setShowCompleteModal] = useState(false)

  // `checkInAt`: the church this Mass was prayed at, from "Amém and check in". The check-in only
  // says where; the completion logged here is the Mass's one count.
  const handleComplete = useCallback(
    (checkInAt?: { id: string; name: string }) => {
      const date = dayDate ?? format(getToday(), 'yyyy-MM-dd')

      // What the flow's pinnable selects stood at: the tab switched to, else the
      // engine's pick. It says which of an office's hours this was.
      const pinnable = new Set(getPinnableSelects(flow).map((s) => s.key))
      const prayed = renderedSections
        .filter((s) => s.type === 'select')
        .filter((s) => pinnable.has(s.overrideKey))
        .map((s) => [s.overrideKey, selectOverrides[s.overrideKey] || s.selectedId])
        .filter(([, id]) => id)
      const pins = prayed.length > 0 ? Object.fromEntries(prayed) : undefined

      completePractice.mutate(
        { prayedId: practiceId, date, slotKey, pins },
        {
          onSuccess: async () => {
            successBuzz()
            try {
              if (checkInAt) await checkIn(checkInAt, { kind: 'mass' }, { massMarked: true })
              if (trackDefs) {
                const trackIds = findTrackIds(renderedSections, selectOverrides)
                await Promise.all(
                  trackIds.map((id) =>
                    advanceCursor.mutateAsync({
                      cursorId: `${practiceId}/${id}`,
                      entryCount: trackDefs[id].entries.length,
                    }),
                  ),
                )
              }
              if (manifest?.program) {
                const isFinalDay =
                  programProgress &&
                  programProgress.completionCount + 1 >= manifest.program.totalDays
                if (isFinalDay) {
                  await handleProgramCompletion.mutateAsync({
                    practiceId,
                    completionBehavior: manifest.program.completionBehavior,
                  })
                  setShowCompleteModal(true)
                  return
                }
              }
              router.back()
            } catch (err) {
              console.error('[practice] post-completion sync failed', err)
              confirm({
                title: t('practice.completionSyncFailed'),
                description: t('practice.completionSyncFailedDesc'),
                singleAction: true,
              })
            }
          },
        },
      )
    },
    [
      practiceId,
      flow,
      slotKey,
      dayDate,
      completePractice,
      trackDefs,
      renderedSections,
      selectOverrides,
      advanceCursor,
      manifest,
      programProgress,
      handleProgramCompletion,
      router,
      t,
    ],
  )

  const onRestart = useCallback(() => {
    restartProgramMutation.mutate({ practiceId }, { onSuccess: () => router.back() })
  }, [restartProgramMutation, practiceId, router])

  const dismissCompleteModal = useCallback(() => {
    router.back()
  }, [router])

  return {
    handleComplete,
    isCompleting: completePractice.isPending,
    showCompleteModal,
    dismissCompleteModal,
    onRestart,
  }
}
