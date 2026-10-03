import { Link } from 'expo-router'
import { memo } from 'react'
import { Pressable } from 'react-native'
import type { SaintEntry } from '../data/catalog'
import { SaintCardTile } from './SaintCardTile'

// Memoized: each step re-renders the wall, and the rows already drawn shouldn't.
export const SaintTile = memo(function SaintTile({
  saint,
  width,
  label,
}: {
  saint: SaintEntry
  width: number
  label: string
}) {
  return (
    // The `[index]` route param carries the saint's id (the viewer locates it in
    // the wall's published order), not a positional index. A plain Link (not the
    // AppleZoom morph) gives a reliable modal present/dismiss.
    <Link href={{ pathname: '/saints/[index]', params: { index: saint.id } }} push asChild>
      <Pressable accessibilityRole="link" accessibilityLabel={label}>
        <SaintCardTile saint={saint} width={width} showLabel />
      </Pressable>
    </Link>
  )
})
