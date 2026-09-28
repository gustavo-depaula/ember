import { describe, expect, it } from 'vitest'
import { getSource } from './registry'

describe('source registry', () => {
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
