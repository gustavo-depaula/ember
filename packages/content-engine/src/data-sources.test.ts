import { afterEach, describe, expect, it } from 'vitest'
import {
  clearDataSources,
  type DataSource,
  getDataSource,
  registerDataSource,
  type SourceContext,
} from './data-sources'

afterEach(() => {
  clearDataSources()
})

describe('data-source registry', () => {
  it('returns undefined for unknown sources', () => {
    expect(getDataSource('nonexistent')).toBeUndefined()
  })

  it('registers and retrieves sources by name', () => {
    const source: DataSource = {
      async load() {
        return { ok: true }
      },
    }
    registerDataSource('test-source', source)
    expect(getDataSource('test-source')).toBe(source)
  })

  it('overwrites a previously-registered source under the same name', () => {
    const a: DataSource = {
      async load() {
        return 'a'
      },
    }
    const b: DataSource = {
      async load() {
        return 'b'
      },
    }
    registerDataSource('s', a)
    registerDataSource('s', b)
    expect(getDataSource('s')).toBe(b)
  })

  it('passes args and ctx through to load()', async () => {
    let capturedArgs: unknown
    let capturedCtx: SourceContext | undefined
    const source: DataSource = {
      async load(args, ctx) {
        capturedArgs = args
        capturedCtx = ctx
        return null
      },
    }
    registerDataSource('echo', source)

    const ctx: SourceContext = {
      fetchOwnAsset: async () => ({}),
      localize: () => ({ primary: '' }),
      t: (key) => key,
      now: () => new Date('2026-04-12'),
    }
    await getDataSource('echo')!.load({ a: 1, b: 'two' }, ctx)
    expect(capturedArgs).toEqual({ a: 1, b: 'two' })
    expect(capturedCtx).toBe(ctx)
  })

  it('clearDataSources removes all registrations', () => {
    registerDataSource('a', {
      async load() {
        return null
      },
    })
    registerDataSource('b', {
      async load() {
        return null
      },
    })
    clearDataSources()
    expect(getDataSource('a')).toBeUndefined()
    expect(getDataSource('b')).toBeUndefined()
  })
})
