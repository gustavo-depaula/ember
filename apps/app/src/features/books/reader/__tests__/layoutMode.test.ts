import { Platform } from 'react-native'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { resolveLayout } from '../layoutMode'

describe('resolveLayout', () => {
  const original = Platform.OS

  afterEach(() => {
    // Restore Platform.OS — other tests may rely on the default.
    Object.defineProperty(Platform, 'OS', { value: original, configurable: true })
    vi.restoreAllMocks()
  })

  test('explicit pref wins over device default', () => {
    Object.defineProperty(Platform, 'OS', { value: 'web', configurable: true })
    expect(resolveLayout('paginated')).toBe('paginated')
    Object.defineProperty(Platform, 'OS', { value: 'ios', configurable: true })
    expect(resolveLayout('scroll')).toBe('scroll')
  })

  test('web defaults to scroll', () => {
    Object.defineProperty(Platform, 'OS', { value: 'web', configurable: true })
    expect(resolveLayout(undefined)).toBe('scroll')
  })

  test('ios defaults to paginated', () => {
    Object.defineProperty(Platform, 'OS', { value: 'ios', configurable: true })
    expect(resolveLayout(undefined)).toBe('paginated')
  })

  test('android defaults to paginated', () => {
    Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true })
    expect(resolveLayout(undefined)).toBe('paginated')
  })
})
