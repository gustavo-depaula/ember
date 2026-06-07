import { format } from 'date-fns'
import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { confirm } from '@/components'
import type { RenderedSection } from '@/content/types'
import { useAdvanceCursor } from '@/features/divine-office'
import {
  useHandleProgramCompletion,
  useLogCompletion,
  useRestartProgram,
} from '@/features/plan-of-life'
import { getToday } from '@/hooks/useToday'
import { successBuzz } from '@/lib/haptics'
import { parseSlotKey } from '@/lib/slotKey'
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
  slotId?: string,
) {
  const { t } = useTranslation()
  const router = useRouter()
  const { manifest, programProgress, currentSlot } = usePractice(practiceId, programDayProp)
  const { trackDefs } = usePracticeTracks(practiceId)
  const logCompletionMutation = useLogCompletion()
  const advanceCursor = useAdvanceCursor()
  const handleProgramCompletion = useHandleProgramCompletion()
  const restartProgramMutation = useRestartProgram()
  const [showCompleteModal, setShowCompleteModal] = useState(false)

  const handleComplete = useCallback(() => {
    const today = format(getToday(), 'yyyy-MM-dd')
    const subId = slotId ?? parseSlotKey(currentSlot?.id ?? `${practiceId}::default`).slotId

    logCompletionMutation.mutate(
      { practiceId, date: today, subId },
      {
        onSuccess: async () => {
          successBuzz()
          try {
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
                programProgress && programProgress.completionCount + 1 >= manifest.program.totalDays
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
  }, [
    practiceId,
    slotId,
    currentSlot?.id,
    logCompletionMutation,
    trackDefs,
    renderedSections,
    selectOverrides,
    advanceCursor,
    manifest,
    programProgress,
    handleProgramCompletion,
    router,
    t,
  ])

  const onRestart = useCallback(() => {
    restartProgramMutation.mutate({ practiceId }, { onSuccess: () => router.back() })
  }, [restartProgramMutation, practiceId, router])

  const dismissCompleteModal = useCallback(() => {
    router.back()
  }, [router])

  return {
    handleComplete,
    isCompleting: logCompletionMutation.isPending,
    showCompleteModal,
    dismissCompleteModal,
    onRestart,
  }
}
