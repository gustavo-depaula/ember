import type { BilingualRichText } from '@ember/content-engine'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { TamaguiProvider } from 'tamagui'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { config } from '@/config/tamagui.config'
import { ChoiceRichTextBlock } from './ChoiceRichTextBlock'

afterEach(cleanup)

const body = (text: string): BilingualRichText => ({ primary: [[{ type: 'text', text }]] })

function renderChoice(onSelect: (id: string) => void, selectedId = 'tmp') {
  return render(
    <TamaguiProvider config={config} defaultTheme="light">
      <ChoiceRichTextBlock
        label={{ primary: 'Collect' }}
        selectedId={selectedId}
        onSelect={onSelect}
        options={[
          { id: 'tmp', label: { primary: 'Tmp' }, body: body('Tempora collect') },
          { id: 'snt', label: { primary: 'Snt' }, body: body('Sancti collect') },
        ]}
      />
    </TamaguiProvider>,
  )
}

describe('ChoiceRichTextBlock', () => {
  it('switches the rendered body locally on tap (no selectedId change needed)', () => {
    const onSelect = vi.fn()
    renderChoice(onSelect)

    expect(screen.getByText('Tempora collect')).toBeTruthy()
    expect(screen.queryByText('Sancti collect')).toBeNull()

    fireEvent.click(screen.getByText('Snt'))

    expect(screen.getByText('Sancti collect')).toBeTruthy()
    expect(screen.queryByText('Tempora collect')).toBeNull()
    expect(onSelect).toHaveBeenCalledWith('snt')
  })
})
