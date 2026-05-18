import { afterEach, describe, expect, it } from 'vitest'
import { getProducer, registerProducer, unregisterProducer } from './registry'
import type { ReaderProducer } from './types'

const testReader: ReaderProducer = {
  id: 'producer/test-registry-reader',
  kind: 'reader',
  produce: async () => ({ html: '<p>ok</p>' }),
}

describe('producer registry', () => {
  afterEach(() => unregisterProducer(testReader.id))

  it('registers and retrieves a producer by id', () => {
    registerProducer(testReader)
    expect(getProducer(testReader.id)).toBe(testReader)
  })

  it('returns undefined for unknown ids', () => {
    expect(getProducer('producer/does-not-exist')).toBeUndefined()
  })

  it('unregister removes the producer', () => {
    registerProducer(testReader)
    unregisterProducer(testReader.id)
    expect(getProducer(testReader.id)).toBeUndefined()
  })

  it('built-in CCC Compendium program producer is pre-registered', () => {
    const p = getProducer('producer/ccc-compendium-program')
    expect(p).toBeDefined()
    expect(p?.kind).toBe('reader')
    expect(p?.version).toBeTruthy()
  })
})
