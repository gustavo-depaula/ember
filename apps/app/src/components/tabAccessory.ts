import { create } from 'zustand'

// Native iOS 26 glass tab bar content height + breathing room. Every screen is
// hosted under the tab bar, so always reserve clearance for it.
const nativeTabBarClearance = 56

/**
 * Height of whatever floats in the tab bar's bottom accessory (e.g. a
 * now-playing pill). The tabs layout doesn't know what owns the slot — the
 * owning feature reports its height here while it's visible, and every
 * scrolling surface reads the total through `useBottomClearance`.
 */
const useTabAccessoryStore = create<{ height: number }>(() => ({ height: 0 }))

export function setTabAccessoryHeight(height: number): void {
  useTabAccessoryStore.setState({ height })
}

/** Space (excluding the safe-area inset) scroll content must reserve at the bottom. */
export function useBottomClearance(): number {
  return nativeTabBarClearance + useTabAccessoryStore((s) => s.height)
}
