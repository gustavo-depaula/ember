import { afterEach, describe, expect, it } from 'vitest'
import { getSource, registerSource, unregisterSource } from './registry'
import type { ContentSource } from './types'

const testSource: ContentSource = {
  id: 'test-registry-source',
  version: '1',
  prefsDeps: [],
  fetch: async () => ({ type: 'divider' }),
}

describe('source registry', () => {
  afterEach(() => unregisterSource(testSource.id))

  it('registers and retrieves a source by id', () => {
    registerSource(testSource)
    expect(getSource(testSource.id)).toBe(testSource)
  })

  it('returns undefined for unknown ids', () => {
    expect(getSource('does-not-exist')).toBeUndefined()
  })

  it('unregister removes the source', () => {
    registerSource(testSource)
    unregisterSource(testSource.id)
    expect(getSource(testSource.id)).toBeUndefined()
  })

  it('built-in sources are pre-registered', () => {
    for (const id of [
      'producer/ccc-compendium',
      'producer/ccc-chapter',
      'producer/bible-chapter',
      'producer/psalmody',
    ]) {
      const s = getSource(id)
      expect(s, `expected source ${id} to be registered`).toBeDefined()
      expect(s?.version).toBeTruthy()
    }
  })
})
