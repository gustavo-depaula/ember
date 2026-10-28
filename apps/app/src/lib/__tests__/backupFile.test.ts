import { unzipSync } from 'fflate'
import { describe, expect, it } from 'vitest'

import { pack, unpack } from '../backupFile'

describe('a .pray file', () => {
  it('is a zip that gives the log back whole', () => {
    const log = JSON.stringify({
      format: 'ember-log',
      version: 1,
      events: [{ note: 'São José — ✠' }],
    })
    const file = pack(log)
    expect(Object.keys(unzipSync(file))).toEqual(['ember.json'])
    expect(unpack(file)).toBe(log)
  })

  it('is told from a file that is not one', () => {
    expect(() => unpack(new TextEncoder().encode('{"format":"ember-log"}'))).toThrow()
  })
})
