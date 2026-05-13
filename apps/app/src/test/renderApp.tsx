/**
 * Test harness for full multi-screen integration tests. Mirrors the production
 * provider tree (`_layout.tsx`) but skips the heavy boot sequence — fonts are
 * already mocked as loaded, the DB is in-memory, the Hearth fetch is local.
 *
 * Usage:
 *
 *   const { screen, user } = await renderApp({
 *     route: '/',
 *     fixtures: { now: '2026-01-14', enableSlotKeys: ['practice/grace-meals::1'] },
 *   })
 *   await user.click(await screen.findByTestId('slot-row-practice/grace-meals'))
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { TamaguiProvider, Theme } from 'tamagui'

import { config } from '@/config/tamagui.config'
import {
  loadCatalogFromHearth,
  warmCriticalManifests,
  warmDeferredManifests,
} from '@/content/resolver'
import { createEventsTable, replayAll } from '@/db/events'
import { setDb } from '@/db/instance'
import initialMigration from '@/db/migrations/0001_initial.sql'
import { seedCursors, seedPractices } from '@/db/seed'
import { resetForTests, type TestFixtures } from '@/db/test-fixtures'
import { registerDataSources } from '@/lib/data-sources/register'
import { useBibleStore } from '@/stores/bibleStore'
import { useCatechismStore } from '@/stores/catechismStore'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { clearRoutes, RouterOutlet, registerRoute, resetRouter } from './router-fake'
import { openDatabaseAsync, resetAllTestDbs } from './sqlite-better'

let bootCount = 0

async function bootOnce() {
  resetAllTestDbs()
  const db = await openDatabaseAsync('ember.db')
  setDb(db as never)
  await db.execAsync(initialMigration)
  await createEventsTable(db as never)
  await replayAll()

  // Hydrate stores from the (empty) DB so any code paths checking `hydrated`
  // see the expected state.
  await Promise.all([
    usePreferencesStore.getState().hydrate(),
    useBibleStore.getState().hydrate(),
    useCatechismStore.getState().hydrate(),
  ])

  registerDataSources()

  // Real Hearth corpus on disk (intercepted by hearth-local.ts).
  await loadCatalogFromHearth()
  await warmCriticalManifests()
  await warmDeferredManifests()

  await seedPractices()
  await seedCursors()
}

type RouteRegistration = {
  pattern: string
  loader: () => Promise<{ default: (props?: Record<string, unknown>) => ReactNode }>
}

// Routes are opt-in per test — each test pulls in only the screens it needs,
// keeping its import surface minimal. Tests that exercise navigation register
// both source and destination patterns.
async function loadRoutes(routes: RouteRegistration[]) {
  clearRoutes()
  for (const r of routes) {
    try {
      const mod = await r.loader()
      registerRoute(r.pattern, (props) => mod.default(props))
    } catch (err) {
      console.error(`[renderApp] failed loading ${r.pattern}:`, err)
      throw err
    }
  }
}

export type RenderOptions = {
  route?: string
  fixtures?: TestFixtures
  routes?: RouteRegistration[]
}

export async function renderApp({ route = '/', fixtures = {}, routes = [] }: RenderOptions = {}) {
  bootCount++
  await bootOnce()
  await loadRoutes(routes)
  await resetForTests(fixtures)
  resetRouter(route)

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  const utils = render(
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={config} defaultTheme="light">
        <Theme name="light">
          <RouterOutlet />
        </Theme>
      </TamaguiProvider>
    </QueryClientProvider>,
  )

  return {
    ...utils,
    screen,
    user: userEvent.setup(),
    queryClient,
    bootCount,
  }
}

export { screen }
