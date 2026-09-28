// biome-ignore-all lint/suspicious/noArrayIndexKey: static option sections never reorder
import { type ReactNode, useEffect, useState } from 'react'
import { YStack } from 'tamagui'
import { preprocessFlow } from '@/content/preprocessFlow'
import { usePreprocessContext } from '@/content/preprocessRuntime'
import type { ContainerOption, Primitive } from '@/content/primitives'
import type { PickerStyle } from '@/content/types'
import { Typography } from '../typography'
import { InkPicker } from './InkPicker'
import { SelectBranch, selectBranchKey } from './SelectBranch'

export function SelectBlock({
  label,
  overrideKey,
  selectedId,
  pickerStyle = 'chips',
  options,
  practiceId,
  onSelect,
  renderSection,
}: {
  label: string
  overrideKey: string
  // The engine's auto/default pick — the branch preprocessed eagerly and the
  // initial active tab. Empty string means no default: nothing is highlighted
  // and no branch renders until the user picks one (used by the votive picker).
  selectedId: string
  pickerStyle?: PickerStyle
  options: ContainerOption[]
  practiceId: string
  onSelect: (optionId: string) => void
  renderSection: (section: Primitive, index: number) => ReactNode
}) {
  const ctx = usePreprocessContext()
  const [activeId, setActiveId] = useState(selectedId)
  // With a default, fall back to the first option if the active id ever misses;
  // without one, an unmatched id means "nothing selected yet".
  const active =
    options.find((option) => option.id === activeId) ?? (selectedId ? options[0] : undefined)

  // Warm every non-default branch in the background right after mount so a tab
  // tap resolves from cache instantly. The default branch is already in hand.
  useEffect(() => {
    for (const option of options) {
      if (option.id === selectedId) continue
      if (!option.rawSections?.length) continue
      ctx.queryClient.prefetchQuery({
        queryKey: selectBranchKey(practiceId, overrideKey, option.id, ctx),
        queryFn: () => preprocessFlow(option.rawSections ?? [], ctx),
        staleTime: Number.POSITIVE_INFINITY,
      })
    }
  }, [ctx, options, practiceId, overrideKey, selectedId])

  const handleSelect = (optionId: string) => {
    setActiveId(optionId)
    // Inform the override store so completion advances the chosen branch's
    // reading cursor (the main flow query is intentionally not re-run).
    onSelect(optionId)
  }

  return (
    // Air under the picker: a branch often opens with the next picker (Mass:
    // Form → Celebration → View), and without it the labels stack into a block.
    <YStack gap="$lg" paddingTop="$sm">
      <YStack gap={10}>
        <Typography
          variant="label"
          fontSize={14}
          color="$colorBurgundy"
          textTransform="uppercase"
          letterSpacing={0.5}
        >
          {label}
        </Typography>

        <InkPicker
          options={options.map((option) => ({
            id: option.id,
            label: option.label.primary,
            excerpt: option.excerpt?.primary,
            testID: `select-option-${option.id}`,
          }))}
          selectedId={active?.id}
          onSelect={handleSelect}
          pickerStyle={pickerStyle}
        />
      </YStack>

      {active && (
        <SelectBranch
          practiceId={practiceId}
          overrideKey={overrideKey}
          option={active}
          isDefault={active.id === selectedId}
          renderSection={renderSection}
        />
      )}
    </YStack>
  )
}
