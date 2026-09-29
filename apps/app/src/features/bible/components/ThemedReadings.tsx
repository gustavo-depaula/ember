import { Link } from 'expo-router'
import {
  Anchor,
  BookOpen,
  Flame,
  HandHeart,
  Heart,
  type LucideIcon,
  Shield,
  Sparkles,
  Sun,
  Waves,
} from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { StyleSheet, useWindowDimensions } from 'react-native'
import Svg, { Defs, Rect } from 'react-native-svg'
import { XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { Typography } from '@/components/typography'
import { getAllManifests } from '@/content/resolver'
import { ToneGradient } from '@/features/covers/parts'
import { type BlockTone, blockInk, blockLabelInk, toneForKey } from '@/features/explore/bgColor'
import { localizeContent } from '@/lib/i18n'

// Per-theme icon, matched on the practice id suffix, so a glance tells you what
// each tile is (Waves = anxiety, Shield = courage…).
const themeIcons: Record<string, LucideIcon> = {
  'scripture-anxiety': Waves,
  'scripture-gratitude': Sun,
  'scripture-suffering': Flame,
  'scripture-joy': Sparkles,
  'scripture-forgiveness': HandHeart,
  'scripture-courage': Shield,
  // Anchor of the soul (Heb. 6:19) — trust as a steady anchor, freeing Heart
  // for love (its more universal symbol).
  'scripture-trust': Anchor,
  'scripture-love': Heart,
}

function resolveIcon(id: string): LucideIcon {
  for (const [key, icon] of Object.entries(themeIcons)) {
    if (id.endsWith(key)) return icon
  }
  return BookOpen
}

const columns = 2
const gutter = 14

function useCardSize(): number {
  const { width } = useWindowDimensions()
  const content = Math.min(width, 640) - 24 * 2
  return Math.floor((content - gutter * (columns - 1)) / columns)
}

export function ThemedReadings() {
  const { t } = useTranslation()
  const size = useCardSize()

  // Drop Gospel of the Day — it already has its own hero card above this grid.
  // `endsWith` covers bare ids and any future namespace prefix (`practice/…`).
  const scripturePractices = getAllManifests().filter(
    (m) => m.categories?.includes('scripture') && !m.id.endsWith('gospel-of-the-day'),
  )

  if (scripturePractices.length === 0) return null

  return (
    <YStack gap="$md">
      <Typography
        variant="marker"
        textAlign="left"
        color="$colorSecondary"
        fontSize="$1"
        letterSpacing={1.5}
      >
        {t('bible.discovery.themedReadings')}
      </Typography>
      <XStack flexWrap="wrap" gap={gutter}>
        {scripturePractices.map((manifest) => (
          <ThemeTile
            key={manifest.id}
            id={manifest.id}
            title={localizeContent(manifest.name)}
            tone={toneForKey(manifest.id)}
            size={size}
          />
        ))}
      </XStack>
    </YStack>
  )
}

function ThemeTile({
  id,
  title,
  tone,
  size,
}: {
  id: string
  title: string
  tone: BlockTone
  size: number
}) {
  const Icon = resolveIcon(id)
  const height = Math.round(size * 0.9)
  const gradientId = `theme-${id}`

  return (
    <Link
      href={{ pathname: '/pray/[practiceId]', params: { practiceId: id } }}
      asChild
      accessibilityLabel={title}
    >
      <AnimatedPressable accessibilityRole="link" accessibilityLabel={title}>
        <YStack
          width={size}
          height={height}
          borderRadius={14}
          overflow="hidden"
          backgroundColor={tone.from}
          padding="$md"
          justifyContent="space-between"
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 8 }}
          shadowOpacity={0.4}
          shadowRadius={18}
        >
          <Svg width={size} height={height} style={StyleSheet.absoluteFill}>
            <Defs>
              <ToneGradient id={gradientId} tone={tone} />
            </Defs>
            <Rect width={size} height={height} fill={`url(#${gradientId})`} />
          </Svg>
          {/* The theme's icon again, oversized and faint, bleeding off the corner. */}
          <YStack position="absolute" right={-14} bottom={-18} opacity={0.13}>
            <Icon size={Math.round(size * 0.66)} color={blockInk} strokeWidth={1.2} />
          </YStack>
          <YStack
            position="absolute"
            top={7}
            left={7}
            right={7}
            bottom={7}
            borderRadius={9}
            borderWidth={1}
            borderColor="rgba(232,201,122,0.28)"
          />
          <Icon size={24} color={blockLabelInk} strokeWidth={1.3} />
          <Typography
            variant="sacred-title"
            textAlign="left"
            color={blockInk}
            fontSize={21}
            lineHeight={23}
            numberOfLines={2}
          >
            {title}
          </Typography>
        </YStack>
      </AnimatedPressable>
    </Link>
  )
}
