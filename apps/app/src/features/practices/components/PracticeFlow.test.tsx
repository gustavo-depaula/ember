/**
 * Worked example for the RNTL+Vitest integration harness. Mirrors the Maestro
 * `practice-with-choices.yaml` flow but runs in jsdom, no simulator. Exercises
 * the same render path: real catalog, real flow engine, real Tamagui tree.
 *
 * If this passes, the harness covers the multi-screen pattern other tests can
 * follow (mount → navigate → assert → interact → re-assert).
 */

import { describe, expect, it } from 'vitest'

import { renderApp } from '@/test/renderApp'

describe('PracticeFlow — grace-meals (select DSL)', () => {
  it('toggles Before/After variants from the practice screen', async () => {
    const { screen, user } = await renderApp({
      route: '/pray/practice/grace-meals',
      fixtures: {
        now: '2026-01-14',
        enableSlotKeys: ['practice/grace-meals::1'],
      },
      routes: [
        {
          pattern: '/pray/[practiceId]',
          loader: () => import('@/app/pray/[practiceId]'),
        },
      ],
    })

    expect(await screen.findByTestId('select-option-before')).toBeInTheDocument()
    expect(screen.getByTestId('select-option-after')).toBeInTheDocument()

    await user.click(screen.getByTestId('select-option-before'))
    expect(await screen.findByText(/Grace Before Meals/i)).toBeInTheDocument()

    await user.click(screen.getByTestId('select-option-after'))
    expect(await screen.findByText(/Grace After Meals/i)).toBeInTheDocument()
  }, 20_000)
})
