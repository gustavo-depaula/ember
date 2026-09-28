import { createContext, type ReactNode, useContext } from 'react'

type LiturgicalColor = 'white' | 'red' | 'green' | 'violet' | 'rose' | 'black' | 'gold'

const Ctx = createContext<LiturgicalColor | undefined>(undefined)

export function LiturgicalColorProvider({
  color,
  children,
}: {
  color: LiturgicalColor
  children: ReactNode
}) {
  return <Ctx.Provider value={color}>{children}</Ctx.Provider>
}

/**
 * Fallback for primitives that tint accents in the day's colour, so each
 * doesn't need a `colorFrom` prop in flow.json.
 */
export function useLiturgicalColor(): LiturgicalColor | undefined {
  return useContext(Ctx)
}
