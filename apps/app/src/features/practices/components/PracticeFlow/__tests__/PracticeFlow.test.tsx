/**
 * Worked example for the RNTL+Vitest integration harness: real catalog, real
 * flow engine, real Tamagui tree, in jsdom. Other screen tests follow its
 * mount → assert → interact → re-assert pattern.
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
          loader: () => import('@/app/(tabs)/(today,you,search)/pray/[practiceId]'),
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
