import { ProseBlock as PrayerProseBlock } from '@/components/prayer'

/**
 * The prologue: markdown-rendered prose. Shared by the collection frontispiece
 * (its prologue) and the practice frontispiece (the "about" description), so
 * prose reads identically across both doorways.
 */
export function PrologueProse({ text }: { text: string }) {
  if (!text.trim()) return null
  return <PrayerProseBlock text={{ primary: text }} />
}
