import { usePathname } from 'expo-router'
import { type ReactNode, useEffect } from 'react'

import { setTabAccessoryHeight } from '@/components/tabAccessory'

import { NOW_PLAYING_BAR_HEIGHT, useCreatorsStore } from '../store'
import { NowPlayingBar } from './NowPlayingBar'

// The pill floats with a 12pt margin above the safe area; we add a small
// extra cushion so the last item in a scroll list doesn't visually touch it.
const nowPlayingBarGap = 16

/**
 * The now-playing pill for the tab bar's bottom accessory, or undefined when
 * there's nothing to show. Hidden on the playing item's own page — the full
 * player IS the surface there, and an empty accessory renders a blank pill.
 * Reports its height so scroll surfaces reserve room for it.
 */
export function useNowPlayingAccessory(): ReactNode | undefined {
  const pathname = usePathname()
  const nowPlaying = useCreatorsStore((s) => s.nowPlaying)
  const visible = !!nowPlaying && !pathname?.endsWith(`/episode/${nowPlaying.itemId}`)

  useEffect(() => {
    setTabAccessoryHeight(visible ? NOW_PLAYING_BAR_HEIGHT + nowPlayingBarGap : 0)
  }, [visible])

  return visible ? <NowPlayingBar /> : undefined
}
