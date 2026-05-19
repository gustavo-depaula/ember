import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { TamaguiProvider, Theme } from 'tamagui'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { config } from '@/config/tamagui.config'
import type { ResolvedSection } from '@/content/resolvedTypes'
import { registerProducer, unregisterProducer } from '@/producers'
import type { FlowProducer, ReaderProducer } from '@/producers/types'
import { IncludeBlock } from './IncludeBlock'

const reader: ReaderProducer = {
  id: 'producer/test-include-reader',
  kind: 'reader',
  version: '1',
  cacheKey: () => '',
  produce: async () => ({ html: '' }),
}

const flow: FlowProducer = {
  id: 'producer/test-include-flow',
  kind: 'flow',
  version: '1',
  cacheKey: () => '',
  produce: async () => ({ sections: [] }),
}

beforeEach(() => {
  registerProducer(reader)
  registerProducer(flow)
})

afterEach(() => {
  unregisterProducer(reader.id)
  unregisterProducer(flow.id)
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
    wrap(<IncludeBlock ref="producer/missing" data={{ html: '' }} />)
    expect(screen.getByText(/Unknown producer: producer\/missing/)).toBeInTheDocument()
  })

  it('renders ProducerHtmlBlock output for reader-kind data', () => {
    wrap(<IncludeBlock ref={reader.id} data={{ html: '<p>hello <b>world</b></p>' }} />)
    expect(screen.getByText(/hello/)).toBeInTheDocument()
    expect(screen.getByText('world')).toBeInTheDocument()
  })

  it('dispatches flow-kind producers through the renderSection callback', () => {
    const renderSection = vi.fn((s: ResolvedSection, i: number) => (
      <span key={i} data-testid={`flow-section-${i}`}>
        {s.type}
      </span>
    ))
    const resolvedSections: ResolvedSection[] = [
      { type: 'divider' },
      { type: 'heading', text: { primary: 'h' } },
    ]
    wrap(
      <IncludeBlock
        ref={flow.id}
        data={{ sections: [] }}
        resolvedSections={resolvedSections}
        renderSection={renderSection}
      />,
    )
    expect(renderSection).toHaveBeenCalledTimes(2)
    expect(screen.getByTestId('flow-section-0')).toBeInTheDocument()
    expect(screen.getByTestId('flow-section-1')).toBeInTheDocument()
  })

  it('flow-kind renders nothing without renderSection or resolvedSections', () => {
    const { container } = wrap(<IncludeBlock ref={flow.id} data={{ sections: [] }} />)
    expect(container.textContent?.trim()).toBe('')
  })
})
