/**
 * Harness smoke test. Verifies the integration-test scaffolding boots:
 * real SQLite (better-sqlite3), real Hearth corpus (local disk), seeded
 * practice events, provider tree mounts in jsdom.
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
  it('boots, loads the catalog, seeds practices, mounts a screen', async () => {
    const { screen } = await renderApp({
      route: '/smoke',
      routes: [{ pattern: '/smoke', loader: async () => ({ default: SmokeScreen }) }],
    })

    // Provider tree mounted.
    expect(await screen.findByTestId('smoke-ok')).toBeInTheDocument()

    // Catalog warmed — practice manifests are resident.
    const manifests = getAllManifests()
    expect(manifests.length).toBeGreaterThan(0)
    expect(manifests.find((m) => m.id.endsWith('grace-meals'))).toBeDefined()

    // Seed events landed — practices store has entries.
    const eventState = useEventStore.getState()
    expect(eventState.practices.size).toBeGreaterThan(0)
    expect(eventState.slots.size).toBeGreaterThan(0)
  }, 30_000)
})
