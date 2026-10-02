import { BlurTargetView } from 'expo-blur'
import {
  createContext,
  type ReactNode,
  type RefObject,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Platform, type StyleProp, View, type ViewStyle } from 'react-native'

// Android blurs a named view, not "whatever is behind": the glass must be told
// what it floats over, and must sit beside that view, never inside it. A screen
// is a scope; the content it scrolls is the backdrop; a floating control drawn
// beside that content finds the backdrop through the scope.
type Scope = { ref: RefObject<View | null>; attached: boolean; setAttached: (a: boolean) => void }

const ScopeContext = createContext<Scope | undefined>(undefined)

/** One screen's worth of glass: holds the backdrop for the controls floating over it. */
export function GlassBackdropScope({ children }: { children: ReactNode }) {
  const ref = useRef<View>(null)
  const [attached, setAttached] = useState(false)
  const scope = useMemo(() => ({ ref, attached, setAttached }), [attached])
  return <ScopeContext.Provider value={scope}>{children}</ScopeContext.Provider>
}

/** The content floating glass blurs. Glass inside it has nothing to blur and falls back. */
export function GlassBackdrop({
  children,
  style,
}: {
  children: ReactNode
  style?: StyleProp<ViewStyle>
}) {
  const scope = useContext(ScopeContext)
  const setAttached = scope?.setAttached
  useEffect(() => {
    setAttached?.(true)
    return () => setAttached?.(false)
  }, [setAttached])

  if (Platform.OS !== 'android' || !scope) return <View style={style}>{children}</View>
  return (
    <BlurTargetView ref={scope.ref} style={style}>
      <ScopeContext.Provider value={undefined}>{children}</ScopeContext.Provider>
    </BlurTargetView>
  )
}

/** The backdrop a floating control should blur, if its screen has one. */
export function useGlassBackdrop(): RefObject<View | null> | undefined {
  const scope = useContext(ScopeContext)
  return scope?.attached ? scope.ref : undefined
}
