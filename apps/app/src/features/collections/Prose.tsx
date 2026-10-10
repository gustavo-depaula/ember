import { YStack } from 'tamagui'

import { ProseBlock as PrayerProseBlock } from '@/components/prayer'
import { columnWidth } from '@/lib/layout'

/**
 * The prologue: markdown-rendered prose. Shared by the collection frontispiece
 * (its prologue) and the practice frontispiece (the "about" description), so
 * prose reads identically across both doorways.
 */
export function PrologueProse({ text }: { text: string }) {
  if (!text.trim()) return null
  return (
    // Prose keeps the reading column on a page that is itself wide.
    <YStack maxWidth={columnWidth}>
      <PrayerProseBlock text={{ primary: text }} />
    </YStack>
  )
}
