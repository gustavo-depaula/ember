import { addDays, format, startOfWeek, subWeeks } from 'date-fns'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

export type WallEntry = { date: string; value: number }

function buildWeekGrid(data: WallEntry[], weeks: number): WallEntry[][] {
  const byDate = new Map(data.map((d) => [d.date, d.value]))
  const today = new Date()
  const start = startOfWeek(subWeeks(today, weeks - 1), { weekStartsOn: 1 })
  const columns: WallEntry[][] = []

  let current = start
  while (current <= today) {
    const week: WallEntry[] = []
    for (let day = 0; day < 7; day++) {
      const date = addDays(current, day)
      if (date > today) break
      const key = format(date, 'yyyy-MM-dd')
      week.push({ date: key, value: byDate.get(key) ?? 0 })
    }
    columns.push(week)
    current = addDays(current, 7)
  }

  return columns
}

// `size` is the fixed layout box (= the largest star); `minStar` is the glyph
// size for a missed day. Fuller days grow toward `size`, so the wall reads as
// small embers swelling into large lit stars.
const cellConfig = { size: 18, minStar: 8, gap: 2 }
const starGlyph = '✦' // the app's fleuron, here as a wall of lit stars

// Star size scales with intensity: a missed day is a small ember, a kept day a
// full star. `value` is a 0-based intensity index into the ramp.
function cellStarSize(value: number, max: number): number {
  if (max <= 1) return cellConfig.size
  const t = value / (max - 1)
  return Math.round(cellConfig.minStar + (cellConfig.size - cellConfig.minStar) * t)
}

// The brightest steps get a soft gold halo so kept days glow like lit stars.
function cellGlow(value: number, max: number, accent: string) {
  if (value < max - 1) return undefined
  return {
    textShadowColor: accent,
    textShadowRadius: value === max - 1 ? 3 : 6,
    textShadowOffset: { width: 0, height: 0 },
  }
}

// Each day is a ✦ star, inked by the ember ramp and sized by fidelity — faint
// and small for missed days, warm gold and large (glowing) for kept ones.
function Cell({
  glyph = starGlyph,
  color,
  date,
  size,
  glow,
  onPress,
}: {
  glyph?: string
  color: string
  date: string
  size: number
  glow?: ReturnType<typeof cellGlow>
  onPress?: () => void
}) {
  const { t } = useTranslation()
  const star = (
    <YStack
      width={cellConfig.size}
      height={cellConfig.size}
      alignItems="center"
      justifyContent="center"
    >
      <Text fontSize={size} lineHeight={size} color={color} style={glow}>
        {glyph}
      </Text>
    </YStack>
  )

  if (onPress) {
    return (
      <Pressable onPress={onPress} accessibilityLabel={t('a11y.wallDay', { date })}>
        {star}
      </Pressable>
    )
  }

  return star
}

function useWallColors() {
  const theme = useTheme()
  return [
    theme.wallEmpty.val,
    theme.wallLow.val,
    theme.wallMedium.val,
    theme.wallHigh.val,
    theme.wallFull.val,
  ]
}

// A plan day (see `planFidelity`): a lit star for a kept day, a small dim one
// for a day with prayer but an essential missed, a dot for none, and today in
// outline until it's kept.
function useFidelityCells() {
  const theme = useTheme()
  const accent = theme.accent.val
  return [
    { glyph: '●', size: 4, color: theme.wallEmpty.val },
    { glyph: starGlyph, size: 10, color: theme.wallMedium.val },
    {
      glyph: starGlyph,
      size: cellConfig.size,
      color: accent,
      glow: {
        textShadowColor: accent,
        textShadowRadius: 6,
        textShadowOffset: { width: 0, height: 0 },
      },
    },
    { glyph: '✧', size: 15, color: theme.colorSecondary.val },
  ]
}

export function VotiveWall({
  data,
  onDayPress,
  weeks = 20,
  fidelity = false,
}: {
  data: WallEntry[]
  onDayPress?: (date: string) => void
  weeks?: number
  fidelity?: boolean
}) {
  const grid = useMemo(() => buildWeekGrid(data, weeks), [data, weeks])
  const colors = useWallColors()
  const fidelityCells = useFidelityCells()
  const theme = useTheme()
  const accent = theme.accent.val

  return (
    <XStack gap={cellConfig.gap} justifyContent="flex-end">
      {grid.map((week, wi) => (
        <YStack key={week[0]?.date ?? wi} gap={cellConfig.gap}>
          {week.map((entry) => {
            const onPress = onDayPress ? () => onDayPress(entry.date) : undefined
            if (fidelity) {
              const cell = fidelityCells[entry.value] ?? fidelityCells[0]
              return (
                <Cell
                  key={entry.date}
                  glyph={cell.glyph}
                  color={cell.color}
                  size={cell.size}
                  glow={cell.glow}
                  date={entry.date}
                  onPress={onPress}
                />
              )
            }
            return (
              <Cell
                key={entry.date}
                color={colors[entry.value] ?? colors[0]}
                size={cellStarSize(entry.value, colors.length)}
                glow={cellGlow(entry.value, colors.length, accent)}
                date={entry.date}
                onPress={onPress}
              />
            )
          })}
        </YStack>
      ))}
    </XStack>
  )
}
