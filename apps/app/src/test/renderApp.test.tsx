/**
 * Harness smoke test. Verifies the integration-test scaffolding boots:
 * real SQLite (better-sqlite3), real Hearth corpus (local disk), a fixture
 * plan, provider tree mounts in jsdom.
 *
 * If this fails, no `*.test.tsx` integration test can work — start here.
 */

import { Text } from 'tamagui'
import { describe, expect, it } from 'vitest'
import { getAllManifests } from '@/content/resolver'
import { useEventStore } from '@/db/events'

import { renderApp } from './renderApp'

function SmokeScreen() {
  return <Text testID="smoke-ok">smoke ok</Text>
}

describe('renderApp harness', () => {
  it('boots, loads the catalog, mounts a screen', async () => {
    const { screen } = await renderApp({
      route: '/smoke',
      fixtures: { enableSlotKeys: ['practice/grace-meals::1'] },
      routes: [{ pattern: '/smoke', loader: async () => ({ default: SmokeScreen }) }],
    })

    expect(await screen.findByTestId('smoke-ok')).toBeInTheDocument()

    const manifests = getAllManifests()
    expect(manifests.length).toBeGreaterThan(0)
    expect(manifests.find((m) => m.id.endsWith('grace-meals'))).toBeDefined()

    const { practices, slots } = useEventStore.getState()
    expect([...practices.keys()]).toEqual(['practice/grace-meals'])
    expect(slots.get('practice/grace-meals::1')?.enabled).toBe(1)
  }, 30_000)
})
