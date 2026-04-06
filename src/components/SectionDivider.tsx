import { Text, View, XStack } from 'tamagui'

import type { LiturgicalSeason } from '@/lib/liturgical'

const seasonSymbol: Record<LiturgicalSeason | 'rose', string> = {
  advent: '\u2726',
  christmas: '\u2726',
  epiphany: '\u2726',
  septuagesima: '\u271E',
  lent: '\u271E',
  easter: '\u2726',
  ordinary: '\u271E',
  'post-pentecost': '\u271E',
  rose: '\u2726',
}

export function getSeasonalSymbol(season?: LiturgicalSeason | 'rose'): string {
  if (!season) return '\u2726'
  return seasonSymbol[season] ?? '\u2726'
}

export function SectionDivider({ symbol = '\u2726' }: { symbol?: string }) {
  return (
    <XStack
      alignItems="center"
      gap="$md"
      paddingVertical="$lg"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      <View flex={1} borderBottomWidth={1} borderColor="$borderColor" />
      <Text fontFamily="$heading" fontSize="$3" color="$accent">
        {symbol}
      </Text>
      <View flex={1} borderBottomWidth={1} borderColor="$borderColor" />
    </XStack>
  )
}
