import {
  Bell,
  BookOpen,
  Clock,
  Flame,
  HeartHandshake,
  type LucideIcon,
  Moon,
  ScrollText,
  Sparkles,
  Sunrise,
} from 'lucide-react-native'
import { useTheme } from 'tamagui'

import { type IconName, WatercolorIcon } from './ornaments/WatercolorIcon'

// Gold-tinted lucide glyphs replace the old system-emoji fallback so the rule
// tree and the Today checklist stay inside the illuminated idiom. Sparkles is
// the fleuron-ish final fallback.
const lucideIcons: Record<string, LucideIcon> = {
  sunrise: Sunrise,
  prayer: HeartHandshake,
  bell: Bell,
  candle: Flame,
  moon: Moon,
  angel: Sparkles,
  scroll: ScrollText,
  clock: Clock,
  reading: BookOpen,
  book: BookOpen,
}

const watercolorIcons = new Set<string>([
  'sacred-heart',
  'eucharist',
  'monstrance',
  'mary',
  'mercy',
  'confession',
  'mass',
  'rosary',
  'cross',
])

export function PracticeIcon({ name, size = 20 }: { name: string; size?: number }) {
  const theme = useTheme()

  if (watercolorIcons.has(name)) {
    return <WatercolorIcon name={name as IconName} size={size} />
  }

  const Icon = lucideIcons[name] ?? Sparkles
  return <Icon size={size} color={theme.accent.val} />
}
