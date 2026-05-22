/**
 * Integration test for the home-screen ResolutionLine.
 *
 * The component reads from the live event store, so we drive it through
 * the same `setResolution` repository call the in-flow capture uses.
 * Verifies the line renders only when an active daily resolution exists.
 */

import { describe, expect, it } from 'vitest'

import { setResolution } from '@/db/repositories/resolutions'
import { getToday } from '@/hooks/useToday'
import { renderApp } from '@/test/renderApp'

describe('ResolutionLine on /', () => {
  it('stays hidden when there is no active daily resolution', async () => {
    const { screen } = await renderApp({
      route: '/',
      routes: [{ pattern: '/', loader: () => import('@/app/index') }],
    })

    // Wait for the home header to mount before asserting absence — otherwise
    // the assertion races the initial render. Multiple matches are fine; we
    // just need the header to be rendered.
    expect((await screen.findAllByText(/Your Rule of Life/i)).length).toBeGreaterThan(0)
    expect(screen.queryByText(/today’s resolve/i)).toBeNull()
  }, 30_000)

  it('surfaces the active daily resolution after capture', async () => {
    const { screen } = await renderApp({
      route: '/',
      routes: [{ pattern: '/', loader: () => import('@/app/index') }],
    })

    const todayStart = getToday().getTime()
    await setResolution({
      level: 'daily',
      text: 'Pause before answering',
      starts_at: todayStart,
      ends_at: todayStart + 1000 * 60 * 60 * 24 - 1,
      source: 'examen',
    })

    // The epigraph body renders the resolution text directly.
    expect((await screen.findAllByText('Pause before answering'))[0]).toBeInTheDocument()
    // A script attribution sits beneath the epigraph.
    expect((await screen.findAllByText(/today’s resolve/i))[0]).toBeInTheDocument()
  }, 30_000)
})
