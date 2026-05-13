/**
 * Minimal `expo-router` stub for tests. Tracks the current path + params in a
 * Zustand store; `useRouter` mutations swap the rendered screen.
 *
 * Wired via `vi.mock('expo-router', ...)` from `src/test/setup.ts`. Screens
 * are registered up-front by the test or by `renderApp` so the harness can
 * mount the right component when navigation happens.
 */

import { Fragment, type ReactNode, useSyncExternalStore } from 'react'
import { create } from 'zustand'

type RouterState = {
  path: string
  params: Record<string, string>
  history: string[]
  setRoute: (path: string, params?: Record<string, string>) => void
  back: () => void
}

const useRouterStore = create<RouterState>((set, get) => ({
  path: '/',
  params: {},
  history: ['/'],
  setRoute(path, params = {}) {
    set({ path, params, history: [...get().history, path] })
  },
  back() {
    const h = get().history
    if (h.length < 2) return
    const next = [...h]
    next.pop()
    const prev = next[next.length - 1]
    set({ path: prev, history: next })
  },
}))

type ScreenComponent = (props?: Record<string, unknown>) => ReactNode

type RouteEntry = {
  pattern: string
  component: ScreenComponent
  paramKeys: string[]
  regex: RegExp
}

const routes: RouteEntry[] = []

function compilePattern(pattern: string): RouteEntry['regex'] & { paramKeys: string[] } {
  const paramKeys: string[] = []
  const parts = pattern.split('/').filter(Boolean)
  const lastIdx = parts.length - 1
  const re = parts
    .map((part, i) => {
      const rest = part.match(/^\[\.\.\.(.+)\]$/)
      if (rest) {
        paramKeys.push(rest[1])
        return '(.+)'
      }
      const m = part.match(/^\[(.+)\]$/)
      if (m) {
        paramKeys.push(m[1])
        // Expo Router passes practiceIds containing slashes through `[id]` —
        // the final segment greedily consumes the rest of the path.
        return i === lastIdx ? '(.+)' : '([^/]+)'
      }
      return part.replace(/[.+*?^$()|]/g, '\\$&')
    })
    .join('/')
  const regex = new RegExp(`^/${re}/?$`) as RegExp & { paramKeys: string[] }
  regex.paramKeys = paramKeys
  return regex
}

export function registerRoute(pattern: string, component: ScreenComponent): void {
  const regex = compilePattern(pattern)
  routes.push({ pattern, component, paramKeys: regex.paramKeys, regex })
}

export function clearRoutes(): void {
  routes.length = 0
}

function matchRoute(
  path: string,
): { entry: RouteEntry; params: Record<string, string> } | undefined {
  for (const entry of routes) {
    const m = entry.regex.exec(path)
    if (!m) continue
    const params: Record<string, string> = {}
    entry.paramKeys.forEach((key, i) => {
      params[key] = decodeURIComponent(m[i + 1] ?? '')
    })
    return { entry, params }
  }
  return undefined
}

// --- Public hooks/components that mirror expo-router's shape ---

type Router = {
  push: (href: string) => void
  replace: (href: string) => void
  navigate: (href: string) => void
  back: () => void
}

function parseHref(href: string): { path: string; query: Record<string, string> } {
  const [path, queryStr] = href.split('?')
  const query: Record<string, string> = {}
  if (queryStr) {
    for (const pair of queryStr.split('&')) {
      const [k, v = ''] = pair.split('=')
      query[decodeURIComponent(k)] = decodeURIComponent(v)
    }
  }
  return { path, query }
}

export function useRouter(): Router {
  const setRoute = useRouterStore((s) => s.setRoute)
  const back = useRouterStore((s) => s.back)
  return {
    push(href) {
      const { path, query } = parseHref(href)
      const match = matchRoute(path)
      setRoute(path, { ...query, ...(match?.params ?? {}) })
    },
    replace(href) {
      const { path, query } = parseHref(href)
      const match = matchRoute(path)
      setRoute(path, { ...query, ...(match?.params ?? {}) })
    },
    navigate(href) {
      const { path, query } = parseHref(href)
      const match = matchRoute(path)
      setRoute(path, { ...query, ...(match?.params ?? {}) })
    },
    back,
  }
}

export function useLocalSearchParams<T = Record<string, string>>(): T {
  return useRouterStore((s) => s.params) as T
}

export function Redirect({ href }: { href: string }) {
  const router = useRouter()
  router.replace(href)
  return undefined
}

// Stack — pass-through; tests don't exercise nav animations. Tags any
// Stack.Screen children as inert.
type StackProps = { children?: ReactNode } & Record<string, unknown>
function StackComponent({ children }: StackProps) {
  return <Fragment>{children}</Fragment>
}
function StackScreen(_props: Record<string, unknown>) {
  return undefined
}
StackComponent.Screen = StackScreen
export const Stack = StackComponent

// The harness — renders whatever screen the current path resolves to.
export function RouterOutlet() {
  const path = useSyncExternalStore(
    useRouterStore.subscribe,
    () => useRouterStore.getState().path,
    () => useRouterStore.getState().path,
  )
  const match = matchRoute(path)
  if (!match) return <Fragment>{`[router-fake] no route registered for ${path}`}</Fragment>
  const Component = match.entry.component as ScreenComponent
  return <Fragment>{Component()}</Fragment>
}

export function resetRouter(initial = '/'): void {
  const { path, query } = parseHref(initial)
  const match = matchRoute(path)
  useRouterStore.setState({
    path,
    params: { ...query, ...(match?.params ?? {}) },
    history: [path],
  })
}

export function navigate(href: string): void {
  const { path, query } = parseHref(href)
  const match = matchRoute(path)
  useRouterStore.getState().setRoute(path, { ...query, ...(match?.params ?? {}) })
}
