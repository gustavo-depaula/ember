import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { TamaguiProvider, Theme } from 'tamagui'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { config } from '@/config/tamagui.config'
import type { RenderedSection } from '@/content/types'
import { registerProducer, unregisterProducer } from '@/producers'
import type { FlowProducer, ReaderProducer } from '@/producers/types'
import { IncludeBlock } from './IncludeBlock'

const testReader: ReaderProducer = {
  id: 'producer/test-include-reader',
  kind: 'reader',
  produce: async () => ({ html: '' }),
}

const testFlow: FlowProducer = {
  id: 'producer/test-include-flow',
  kind: 'flow',
  produce: async () => ({ sections: [] }),
}

beforeAll(() => {
  registerProducer(testReader)
  registerProducer(testFlow)
})

afterAll(() => {
  unregisterProducer(testReader.id)
  unregisterProducer(testFlow.id)
})

function wrap(node: ReactNode) {
  return render(
    <TamaguiProvider config={config} defaultTheme="light">
      <Theme name="light">{node}</Theme>
    </TamaguiProvider>,
  )
}

describe('IncludeBlock', () => {
  it('shows an error banner for an unknown producer ref', () => {
    wrap(<IncludeBlock ref="producer/missing" data={undefined} />)
    expect(screen.getByText(/Unknown producer: producer\/missing/)).toBeInTheDocument()
  })

  it('renders ProducerHtmlBlock output when reader-kind data arrives', () => {
    wrap(<IncludeBlock ref={testReader.id} data={{ html: '<p>hello <b>world</b></p>' }} />)
    expect(screen.getByText(/hello/)).toBeInTheDocument()
    expect(screen.getByText('world')).toBeInTheDocument()
  })

  it('shows InlineRetry when there is no data and a retry callback', () => {
    const retry = vi.fn()
    const { container } = wrap(<IncludeBlock ref={testReader.id} data={undefined} retry={retry} />)
    // InlineRetry renders an XStack with a retry button — assert by role.
    expect(container.querySelector('[role="button"]')).not.toBeNull()
  })

  it('renders nothing while loading (no data, no retry)', () => {
    const { container } = wrap(<IncludeBlock ref={testReader.id} data={undefined} />)
    expect(container.textContent?.trim()).toBe('')
  })

  it('dispatches flow-kind producers through the renderSection callback', () => {
    const renderSection = vi.fn((s: RenderedSection, i: number) => (
      <span key={i} data-testid={`flow-section-${i}`}>
        {s.type}
      </span>
    ))
    const sections: RenderedSection[] = [
      { type: 'divider' },
      { type: 'heading', text: { primary: 'h' } },
    ]
    wrap(<IncludeBlock ref={testFlow.id} data={{ sections }} renderSection={renderSection} />)
    expect(renderSection).toHaveBeenCalledTimes(2)
    expect(screen.getByTestId('flow-section-0')).toBeInTheDocument()
    expect(screen.getByTestId('flow-section-1')).toBeInTheDocument()
  })

  it('flow-kind renders nothing if no renderSection callback is provided', () => {
    const { container } = wrap(
      <IncludeBlock ref={testFlow.id} data={{ sections: [{ type: 'divider' }] }} />,
    )
    expect(container.textContent?.trim()).toBe('')
  })
})
