import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { TFunction } from 'i18next'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { FlowDefinition } from '@/content/types'
import { createEventsTable, useEventStore } from '@/db/events'
import { setDb } from '@/db/instance'
import { createPracticeWithSlot, createPracticeWithSlots, updateSlot } from '@/db/repositories'
import { openDatabaseAsync, resetAllTestDbs } from '@/test/sqlite-better'

import { enrichSlot } from '../getPracticeName'

const breviary = JSON.parse(
  readFileSync(
    resolve(__dirname, '../../../../../../content/practices/breviary/flow.json'),
    'utf8',
  ),
) as FlowDefinition

vi.mock('@/content/resolver', async (original) => ({
  ...(await original<typeof import('@/content/resolver')>()),
  getLoadedFlow: (id: string) => (id === 'practice/breviary' ? breviary : undefined),
}))

const t = ((key: string) => key) as unknown as TFunction

function slot(key: string) {
  const s = useEventStore.getState().slots.get(key)
  if (!s) throw new Error(`no slot ${key}`)
  return s
}

beforeEach(async () => {
  resetAllTestDbs()
  const db = await openDatabaseAsync('pinned-slots.db')
  setDb(db as never)
  await createEventsTable(db as never)
  useEventStore.getState().reset()
})

describe('pinning a slot', () => {
  it('stores the pin and clears it again', async () => {
    const key = await createPracticeWithSlot({ id: 'practice/breviary' }, {})
    await updateSlot(key, { pins: { hour: 'Prima' } })
    expect(slot(key).pins).toEqual({ hour: 'Prima' })

    await updateSlot(key, { pins: {} })
    expect(slot(key).pins).toEqual({})
  })

  it('names a pinned row by its hour, with the practice beneath', async () => {
    const key = await createPracticeWithSlot({ id: 'practice/breviary' }, {})
    await updateSlot(key, { pins: { hour: 'Prima' } })

    const row = enrichSlot(slot(key), t)
    expect(row).toMatchObject({ name: 'Prime', pinned: true })
    expect(row.subtitle).toBeTruthy()
  })

  it('adds an office with one pinned slot per hour, all distinct', async () => {
    const keys = await createPracticeWithSlots({ id: 'practice/breviary' }, [
      { pins: { hour: 'Prima' }, time: '09:00' },
      { pins: { hour: 'Completorium' }, time: '20:00' },
    ])
    expect(new Set(keys).size).toBe(2)
    expect(keys.map((k) => slot(k).pins?.hour)).toEqual(['Prima', 'Completorium'])
    expect(keys.map((k) => enrichSlot(slot(k), t).name)).toEqual(['Prime', 'Compline'])
  })

  it('keeps the practice name while unpinned', async () => {
    const key = await createPracticeWithSlot({ id: 'practice/breviary' }, {})
    expect(enrichSlot(slot(key), t).pinned).toBeUndefined()
  })
})
