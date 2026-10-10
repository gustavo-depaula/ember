/**
 * Two devices used apart, then each given the other's log, must end up the
 * same: nothing either did is lost, the later of two settings wins on both,
 * and merging the same file again adds nothing.
 */
import { beforeEach, describe, expect, it } from 'vitest'

import { setDb } from '@/db/instance'
import {
  createPracticeWithSlot,
  logCompletion,
  removeSlotCompletion,
  updateSlot,
} from '@/db/repositories'
import { setPreference } from '@/db/repositories/preferences'
import { saveItem, unsaveItem } from '@/db/repositories/savedItems'
import { addItemToCollection, createUserCollection } from '@/db/repositories/userCollections'
import { openDatabaseAsync, resetAllTestDbs } from '@/test/sqlite-better'

import { useEventStore } from '../state'
import { createEventsTable, replayAll } from '../store'
import { exportLog, mergeLog } from '../transfer'

type Db = Awaited<ReturnType<typeof openDatabaseAsync>>

async function device(name: string): Promise<Db> {
  const db = await openDatabaseAsync(name)
  await createEventsTable(db as never)
  return db
}

async function use(db: Db) {
  setDb(db as never)
  await replayAll()
}

function snapshot() {
  const s = useEventStore.getState()
  return {
    practices: [...s.practices.keys()].sort(),
    slots: [...s.slots.values()].map((slot) => `${slot.id} ${slot.time} ${slot.enabled}`).sort(),
    completions: [...s.completions.values()].map((c) => `${c.practice_id} ${c.date}`).sort(),
    shelf: [...s.savedItems.keys()].sort(),
    collections: [...s.collections.values()].map((c) => `${c.name}: ${c.refs.map((r) => r.ref)}`),
    preferences: Object.fromEntries(s.preferences),
  }
}

beforeEach(() => {
  resetAllTestDbs()
  useEventStore.getState().reset()
})

describe('two devices exchanging their logs', () => {
  it('hold the same state afterwards, whichever merged first', async () => {
    const phone = await device('phone.db')
    const web = await device('web.db')

    await use(phone)
    const rosary = await createPracticeWithSlot({ id: 'practice/rosary' }, { time: '07:00' })
    await logCompletion('practice/rosary', '2026-05-10', '1', 'rosary', 'amen')
    await logCompletion('practice/rosary', '2026-05-11', '1', 'rosary', 'amen')
    await saveItem('book/imitation', 'book')
    await saveItem('book/confessions', 'book')
    const lent = await createUserCollection({ name: 'Lent' })
    await addItemToCollection(lent, 'practice/stations')
    await setPreference('translation', 'DRB')

    await use(web)
    await createPracticeWithSlot({ id: 'practice/angelus' }, { time: '12:00' })
    await logCompletion('practice/angelus', '2026-05-10', '1', 'angelus', 'amen')
    await saveItem('book/confessions', 'book')
    await setPreference('translation', 'NABRE')
    const fromWeb = await exportLog()

    // The phone goes on after the web's file was made.
    await use(phone)
    await updateSlot(rosary, { time: '06:30' })
    await removeSlotCompletion('practice/rosary', '2026-05-11', '1')
    await unsaveItem('book/imitation')
    const fromPhone = await exportLog()

    expect(await mergeLog(fromWeb)).toBe(5)
    const onPhone = snapshot()

    await use(web)
    await mergeLog(fromPhone)
    expect(snapshot()).toEqual(onPhone)
    expect(onPhone).toEqual({
      practices: ['practice/angelus', 'practice/rosary'],
      slots: ['practice/angelus::1 12:00 1', 'practice/rosary::1 06:30 1'],
      completions: ['practice/angelus 2026-05-10', 'practice/rosary 2026-05-10'],
      shelf: ['book/confessions'],
      collections: ['Lent: practice/stations'],
      preferences: { translation: 'NABRE' },
    })

    expect(await mergeLog(fromPhone)).toBe(0)
    await replayAll()
    expect(snapshot()).toEqual(onPhone)
  })

  it('refuses a file that is not a log', async () => {
    await use(await device('phone.db'))
    await expect(mergeLog('{"events":[]}')).rejects.toThrow('Not an Ember log file')
  })
})
