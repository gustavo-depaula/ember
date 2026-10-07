import { Platform } from 'react-native'
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

// A sheet set into a screen (the Bible's half page on Android) stands where
// the floating bar does: while one is up, the bar steps aside for it, as it
// does under a native sheet.
const useTabBarCoverStore = create<{ covered: boolean }>(() => ({ covered: false }))

export function setTabBarCovered(covered: boolean): void {
  useTabBarCoverStore.setState({ covered })
}

export function useTabBarCovered(): boolean {
  return useTabBarCoverStore((s) => s.covered)
}

// The floating Android bar: its height plus the gap beneath it.
const androidTabBarLift = 76

/**
 * How far a control docked to the screen's bottom edge must lift, beyond the
 * safe-area inset, to clear the tab bar. On iOS the inset already accounts for
 * the native bar; the Android bar floats over the screen and the inset knows
 * nothing of it.
 */
export const dockedTabBarLift = Platform.OS === 'android' ? androidTabBarLift : 0
