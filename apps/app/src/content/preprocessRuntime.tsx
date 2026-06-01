import { createContext, type ReactNode, useContext } from 'react'
import type { PreprocessContext } from './preprocessFlow'

// Carries the runtime pieces preprocessFlow needs (query client, prefs, date,
// program day) down to the one place that preprocesses lazily: a `select`
// branch the user switches to. Provided once at the practice root so the
// branch loader doesn't have to be prop-drilled through the whole renderer.
const Ctx = createContext<PreprocessContext | undefined>(undefined)

export function PreprocessProvider({
  value,
  children,
}: {
  value: PreprocessContext
  children: ReactNode
}) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function usePreprocessContext(): PreprocessContext {
  const value = useContext(Ctx)
  if (!value) {
    throw new Error('usePreprocessContext must be used within a PreprocessProvider')
  }
  return value
}
