import { Text } from 'tamagui'

import { type IconName, WatercolorIcon } from './ornaments/WatercolorIcon'

const emojiIcons: Record<string, string> = {
  sunrise: '\u{1F305}',
  prayer: '\u{1F64F}',
  bell: '\u{1F514}',
  candle: '\u{1F56F}',
  moon: '\u{1F319}',
  angel: '\u{1F47C}',
  scroll: '\u{1F4DC}',
  clock: '\u{1F552}',
  reading: '\u{1F4D6}',
  book: '\u{1F4D6}',
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
  if (watercolorIcons.has(name)) {
    return <WatercolorIcon name={name as IconName} size={size} />
  }

  const emoji = emojiIcons[name] ?? '\u2728'
  return <Text fontSize={size}>{emoji}</Text>
}
