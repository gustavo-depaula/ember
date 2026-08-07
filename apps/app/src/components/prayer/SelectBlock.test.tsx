import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen } from '@testing-library/react'
import { TamaguiProvider } from 'tamagui'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { config } from '@/config/tamagui.config'
import type { PreprocessContext } from '@/content/preprocessFlow'
import { PreprocessProvider } from '@/content/preprocessRuntime'
import type { ContainerOption, Primitive } from '@/content/primitives'
import { SelectBlock } from './SelectBlock'

afterEach(cleanup)

const ctx = {
  queryClient: new QueryClient(),
  prefs: { lang: 'en-US', translation: 'DRB' },
  date: new Date('2026-08-07T12:00:00Z'),
} as unknown as PreprocessContext

// Pre-built children with no rawSections, so SelectBranch renders them
// directly and the test needs no preprocessing.
function option(id: string, label: string, text: string): ContainerOption {
  return {
    id,
    label: { primary: label },
    children: [{ kind: 'text', text: { primary: text } } as unknown as Primitive],
  } as unknown as ContainerOption
}

function renderSection(section: Primitive, index: number) {
  const text = (section as unknown as { text: { primary: string } }).text.primary
  return <span key={`${index}-${text}`}>{text}</span>
}

function Harness({
  overrideKey,
  selectedId,
  options,
}: {
  overrideKey: string
  selectedId: string
  options: ContainerOption[]
}) {
  return (
    <TamaguiProvider config={config} defaultTheme="light">
      <QueryClientProvider client={ctx.queryClient}>
        <PreprocessProvider value={ctx}>
          <SelectBlock
            label="Prayer"
            overrideKey={overrideKey}
            selectedId={selectedId}
            options={options}
            practiceId="mass"
            onSelect={vi.fn()}
            renderSection={renderSection}
          />
        </PreprocessProvider>
      </QueryClientProvider>
    </TamaguiProvider>
  )
}

const prep = [
  option('ambrose', 'St. Ambrose', 'Ad mensam'),
  option('aquinas', 'St. Thomas', 'Ecce accedo'),
]
const thanks = [
  option('rite', 'Full Rite', 'Gratiarum Actio'),
  option('aquinas', 'St. Thomas', 'Gratias tibi ago'),
]

describe('SelectBlock', () => {
  it('renders the engine-selected branch', () => {
    render(<Harness overrideKey="prep" selectedId="aquinas" options={prep} />)
    expect(screen.getByText('Ecce accedo')).toBeTruthy()
  })

  // Regression: a surrounding branch switch (Mass ▸ Preparation → ▸ Thanksgiving)
  // reuses this component instance. `activeId` used to survive into the new
  // select — invisible unless both option sets share an id, in which case the
  // wrong prayer rendered under the right chip.
  it('resets to the new default when the select identity changes', () => {
    const { rerender } = render(<Harness overrideKey="prep" selectedId="aquinas" options={prep} />)
    expect(screen.getByText('Ecce accedo')).toBeTruthy()

    rerender(<Harness overrideKey="thanks" selectedId="rite" options={thanks} />)

    expect(screen.getByText('Gratiarum Actio')).toBeTruthy()
    expect(screen.queryByText('Gratias tibi ago')).toBeNull()
  })
})
