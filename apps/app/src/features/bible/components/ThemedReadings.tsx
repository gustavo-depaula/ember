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
import { useWindowDimensions } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { Typography } from '@/components/typography'
import { getAllManifests } from '@/content/resolver'
import { type BlockTone, blockInk, toneForKey } from '@/features/explore/bgColor'
import { localizeContent } from '@/lib/i18n'

// Per-theme icon, matched on the practice id suffix. Keeps the semantic of the
// pre-facelift grid (Waves = anxiety, Shield = courage…) so a glance still tells
// you what each tile is — abstract versal letters were too quiet here.
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
  const iconSize = Math.round(size * 0.28)

  return (
    <Link
      href={{ pathname: '/pray/[practiceId]', params: { practiceId: id } }}
      asChild
      accessibilityLabel={title}
    >
      <AnimatedPressable accessibilityRole="link" accessibilityLabel={title}>
        <YStack
          width={size}
          height={size}
          borderRadius={14}
          overflow="hidden"
          backgroundColor={tone.from}
          alignItems="center"
          justifyContent="center"
          padding="$md"
          gap="$sm"
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 6 }}
          shadowOpacity={0.18}
          shadowRadius={12}
        >
          <Icon size={iconSize} color={blockInk} strokeWidth={1.2} />
          <Text
            fontFamily="$heading"
            fontSize="$3"
            color={blockInk}
            textAlign="center"
            numberOfLines={2}
          >
            {title}
          </Text>
        </YStack>
      </AnimatedPressable>
    </Link>
  )
}
