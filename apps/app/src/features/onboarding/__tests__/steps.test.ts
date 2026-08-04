import { describe, expect, it, vi } from 'vitest'

const setHasOnboarded = vi.fn()
const resetAnswers = vi.fn()

// The step order resolves `Platform.OS` once at module load, so each platform
// needs its own isolated import of the module under test. The stores are stubbed
// so the route maths doesn't drag in the SQLite client (native-only `require`).
async function loadSteps(os: 'ios' | 'web') {
  vi.resetModules()
  setHasOnboarded.mockClear()
  resetAnswers.mockClear()
  vi.doMock('react-native', () => ({ Platform: { OS: os } }))
  vi.doMock('@/stores/preferencesStore', () => ({
    usePreferencesStore: { getState: () => ({ setHasOnboarded }) },
  }))
  vi.doMock('../useOnboardingState', () => ({
    useOnboardingState: { getState: () => ({ reset: resetAnswers }) },
  }))
  return await import('../steps')
}

describe('nextRoute', () => {
  it('walks the whole flow in order on native', async () => {
    const { nextRoute } = await loadSteps('ios')
    expect(nextRoute('index')).toBe('/onboarding/language')
    expect(nextRoute('language')).toBe('/onboarding/profiler')
    expect(nextRoute('profiler')).toBe('/onboarding/plan')
    expect(nextRoute('plan')).toBe('/onboarding/formation')
    expect(nextRoute('formation')).toBe('/onboarding/notifications')
    expect(nextRoute('notifications')).toBe('/onboarding/done')
  })

  it('skips notifications on web, where there are no OS reminders', async () => {
    const { nextRoute } = await loadSteps('web')
    expect(nextRoute('formation')).toBe('/onboarding/done')
  })

  it('lands on done from the last step rather than running off the end', async () => {
    const { nextRoute } = await loadSteps('ios')
    expect(nextRoute('done')).toBe('/onboarding/done')
  })
})

describe('stepProgress', () => {
  it('numbers only the input steps, 1-based', async () => {
    const { stepProgress } = await loadSteps('ios')
    expect(stepProgress('language')).toEqual({ index: 1, total: 5 })
    expect(stepProgress('notifications')).toEqual({ index: 5, total: 5 })
  })

  it('drops the notifications dot on web', async () => {
    const { stepProgress } = await loadSteps('web')
    expect(stepProgress('language')).toEqual({ index: 1, total: 4 })
    expect(stepProgress('formation')).toEqual({ index: 4, total: 4 })
    expect(stepProgress('notifications')).toBeUndefined()
  })

  it('gives the intro and closing screens no dots', async () => {
    const { stepProgress } = await loadSteps('ios')
    expect(stepProgress('index')).toBeUndefined()
    expect(stepProgress('done')).toBeUndefined()
  })
})

describe('completeOnboarding', () => {
  it('marks the gate and clears the in-flow answers', async () => {
    const { completeOnboarding } = await loadSteps('ios')
    completeOnboarding()
    expect(setHasOnboarded).toHaveBeenCalledWith(true)
    expect(resetAnswers).toHaveBeenCalledOnce()
  })
})
