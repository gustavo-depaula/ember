import { useCallback, useEffect, useState } from 'react'
import { usePractice } from './usePractice'

// Owns the user's mid-flow selection toggles. Resets when the practice
// changes, the program day flips, or the flow blob (re)loads.
//
// State has to live in one place that's shared by both the content query
// (which feeds selectOverrides into resolveFlowAsync) and the renderer
// (which calls the override handler). Hence the orchestrator-level call;
// see PracticeFlow/index.tsx.
export function useSelectOverrides(practiceId: string, programDayProp?: number) {
  const { flow, programDay } = usePractice(practiceId, programDayProp)
  const resetKey = `${practiceId}:${programDay ?? 'default'}:${flow ? 'loaded' : 'missing'}`

  const [selectOverrides, setSelectOverrides] = useState<Record<string, string>>({})

  // biome-ignore lint/correctness/useExhaustiveDependencies: resetKey IS the trigger
  useEffect(() => {
    setSelectOverrides({})
  }, [resetKey])

  const handleSelectOverride = useCallback((overrideKey: string, nextId: string) => {
    setSelectOverrides((current) =>
      current[overrideKey] === nextId ? current : { ...current, [overrideKey]: nextId },
    )
  }, [])

  return { selectOverrides, handleSelectOverride }
}
