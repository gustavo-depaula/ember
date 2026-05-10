import { FileText, Headphones, Play } from 'lucide-react-native'
import { useTheme } from 'tamagui'

import type { FeedItemRow } from '@/db/repositories/feedItems'

export function KindIcon({ kind, size = 16 }: { kind: FeedItemRow['channelKind']; size?: number }) {
  const theme = useTheme()
  if (kind === 'youtube') return <Play size={size} color={theme.accent.val} />
  if (kind === 'rss') return <FileText size={size} color={theme.accent.val} />
  return <Headphones size={size} color={theme.accent.val} />
}
