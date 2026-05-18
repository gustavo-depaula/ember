import { createContext, type ReactNode, useContext, useMemo } from 'react'

// Practice-scoped state that producers need access to but the consuming
// block components don't naturally hold (e.g. programDay for program
// practices). PracticeFlow provides; useProducer reads.
type PracticeProducerCtx = {
  programDay?: number
}

const Context = createContext<PracticeProducerCtx>({})

export function PracticeProducerProvider({
  programDay,
  children,
}: {
  programDay?: number
  children: ReactNode
}) {
  const value = useMemo(() => ({ programDay }), [programDay])
  return <Context.Provider value={value}>{children}</Context.Provider>
}

export function usePracticeProducerCtx(): PracticeProducerCtx {
  return useContext(Context)
}
