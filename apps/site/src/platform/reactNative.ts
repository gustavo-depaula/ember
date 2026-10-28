export const Platform = {
  OS: 'web',
  select: <T>(options: { web?: T; default?: T }) => options.web ?? options.default,
}

type AppStateStatus = 'active' | 'background'

/** A page in view is the app in the foreground. */
export const AppState = {
  get currentState(): AppStateStatus {
    return typeof document !== 'undefined' && document.visibilityState === 'hidden'
      ? 'background'
      : 'active'
  },
  addEventListener(_event: 'change', listener: (state: AppStateStatus) => void) {
    if (typeof document === 'undefined') return { remove: () => {} }
    const onChange = () => listener(AppState.currentState)
    document.addEventListener('visibilitychange', onChange)
    return { remove: () => document.removeEventListener('visibilitychange', onChange) }
  },
}
