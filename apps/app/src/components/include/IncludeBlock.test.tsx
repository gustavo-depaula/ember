import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { TamaguiProvider, Theme } from 'tamagui'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Skip the SQLite persistent cache — these are unit tests for the include
// renderer, not the producer cache layer.
vi.mock('@/db/repositories/externalContent', () => ({
  getExternalContent: async () => undefined,
  putExternalContent: async () => {},
}))

import { config } from '@/config/tamagui.config'
import type { RenderedSection } from '@/content/types'
import { registerProducer, unregisterProducer } from '@/producers'
import type { FlowProducer, ReaderProducer } from '@/producers/types'
import { IncludeBlock } from './IncludeBlock'

const readerOk: ReaderProducer = {
  id: 'producer/test-include-reader-ok',
  kind: 'reader',
  version: '1',
  cacheKey: () => '',
  produce: async () => ({ html: '<p>hello <b>world</b></p>' }),
}

const readerFails: ReaderProducer = {
  id: 'producer/test-include-reader-fails',
  kind: 'reader',
  version: '1',
  cacheKey: () => '',
  produce: async () => {
    throw new Error('boom')
  },
}

const flowOk: FlowProducer = {
  id: 'producer/test-include-flow',
  kind: 'flow',
  version: '1',
  cacheKey: () => '',
  produce: async () => ({
    sections: [
      { type: 'divider' },
      { type: 'heading', text: { primary: 'h' } },
    ],
  }),
}

beforeEach(() => {
  registerProducer(readerOk)
  registerProducer(readerFails)
  registerProducer(flowOk)
})

afterEach(() => {
  unregisterProducer(readerOk.id)
  unregisterProducer(readerFails.id)
  unregisterProducer(flowOk.id)
})

function wrap(node: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: Number.POSITIVE_INFINITY } },
  })
  return render(
    <QueryClientProvider client={client}>
      <TamaguiProvider config={config} defaultTheme="light">
        <Theme name="light">{node}</Theme>
      </TamaguiProvider>
    </QueryClientProvider>,
  )
}

describe('IncludeBlock', () => {
  it('shows an error banner for an unknown producer ref', () => {
    wrap(<IncludeBlock ref="producer/missing" />)
    expect(screen.getByText(/Unknown producer: producer\/missing/)).toBeInTheDocument()
  })

  it('renders ProducerHtmlBlock output when reader-kind data arrives', async () => {
    wrap(<IncludeBlock ref={readerOk.id} />)
    await waitFor(() => {
      expect(screen.getByText(/hello/)).toBeInTheDocument()
    })
    expect(screen.getByText('world')).toBeInTheDocument()
  })

  it('shows InlineRetry when the producer call errors', async () => {
    const { container } = wrap(<IncludeBlock ref={readerFails.id} />)
    await waitFor(() => {
      expect(container.querySelector('[role="button"]')).not.toBeNull()
    })
  })

  it('dispatches flow-kind producers through the renderSection callback', async () => {
    const renderSection = vi.fn((s: RenderedSection, i: number) => (
      <span key={i} data-testid={`flow-section-${i}`}>
        {s.type}
      </span>
    ))
    wrap(<IncludeBlock ref={flowOk.id} renderSection={renderSection} />)
    await waitFor(() => {
      expect(screen.getByTestId('flow-section-0')).toBeInTheDocument()
    })
    expect(screen.getByTestId('flow-section-1')).toBeInTheDocument()
    expect(renderSection).toHaveBeenCalledTimes(2)
  })

  it('flow-kind renders nothing if no renderSection callback is provided', async () => {
    const { container } = wrap(<IncludeBlock ref={flowOk.id} />)
    // Even after the fetch settles, no callback means nothing renders.
    await waitFor(() => {
      // (give the query a chance to resolve)
      expect(container).toBeTruthy()
    })
    expect(container.textContent?.trim()).toBe('')
  })
})
