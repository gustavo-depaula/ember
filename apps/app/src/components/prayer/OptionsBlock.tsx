// biome-ignore-all lint/suspicious/noArrayIndexKey: static option sections never reorder
import { useState } from 'react'
import { YStack } from 'tamagui'
import type { PickerStyle } from '@/content/types'
import { InkPicker } from './InkPicker'
import { SectionHeading } from './SectionHeading'

type Option<T> = {
  id: string
  label: string
  sections: T[]
  excerpt?: string
}

export function OptionsBlock<T>({
  label,
  options,
  renderSection,
  pickerStyle = 'chips',
}: {
  label: string
  options: Option<T>[]
  renderSection: (section: T, index: number) => React.ReactNode
  pickerStyle?: PickerStyle
}) {
  const [selected, setSelected] = useState(0)
  const current = options[selected]

  return (
    <YStack gap="$sm">
      <SectionHeading>{label}</SectionHeading>

      <InkPicker
        options={options.map((opt) => ({ id: opt.id, label: opt.label, excerpt: opt.excerpt }))}
        selectedId={current?.id}
        onSelect={(id) => setSelected(options.findIndex((opt) => opt.id === id))}
        pickerStyle={pickerStyle}
      />
      {current && <YStack gap="$sm">{current.sections.map((s, i) => renderSection(s, i))}</YStack>}
    </YStack>
  )
}
