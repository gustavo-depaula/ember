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
 * The liturgical-vestment color of the surrounding day, if a
 * LiturgicalColorProvider is in scope. Used as a fallback by primitives
 * that want to thread the color through their accents (section-marker
 * rules, option-card selected borders) without each one needing a
 * colorFrom prop in flow.json.
 */
export function useLiturgicalColor(): LiturgicalColor | undefined {
  return useContext(Ctx)
}
