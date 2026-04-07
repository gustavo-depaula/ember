// biome-ignore-all lint/suspicious/noArrayIndexKey: static decorative SVG elements never reorder
import { memo } from 'react'
import Svg, { Circle, G, Line, Path } from 'react-native-svg'
import { useTheme } from 'tamagui'

import type { LiturgicalSeason } from '@/lib/liturgical'

type SeasonIconKey = LiturgicalSeason | 'rose'

const seasonToIcon: Record<SeasonIconKey, string> = {
  advent: 'wreath',
  christmas: 'star',
  epiphany: 'star',
  septuagesima: 'cross-thorns',
  lent: 'cross-thorns',
  easter: 'lily',
  ordinary: 'cross',
  'post-pentecost': 'cross',
  rose: 'wreath',
}

function WreathIcon({
  ringColor,
  fillColor,
  dotColor,
  ringOpacity = 0.25,
}: {
  ringColor: string
  fillColor: string
  dotColor: string
  ringOpacity?: number
}) {
  return (
    <G>
      <Circle
        cx="20"
        cy="20"
        r="14"
        stroke={fillColor}
        strokeWidth={1.5}
        fill="none"
        opacity={0.6}
      />
      <Circle
        cx="20"
        cy="20"
        r="11"
        stroke={ringColor}
        strokeWidth={3}
        fill="none"
        opacity={ringOpacity}
      />
      {[0, 90, 180, 270].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const cx = 20 + 14 * Math.cos(rad)
        const cy = 20 - 14 * Math.sin(rad)
        return <Circle key={i} cx={cx} cy={cy} r={2.2} fill={dotColor} opacity={0.8} />
      })}
    </G>
  )
}

export const SeasonalIcon = memo(function SeasonalIcon({
  season,
  size = 32,
}: {
  season: SeasonIconKey
  size?: number
}) {
  const theme = useTheme()
  const accent = theme.accent.val
  const gold = theme.goldBright.val
  const green = theme.vineGreen.val
  const secondary = theme.colorSecondary.val

  const iconKey = seasonToIcon[season]
  const scale = size / 40

  function renderIcon() {
    switch (iconKey) {
      case 'wreath':
        return season === 'rose' ? (
          <WreathIcon ringColor={accent} fillColor={accent} dotColor={accent} ringOpacity={0.15} />
        ) : (
          <WreathIcon ringColor={green} fillColor={accent} dotColor={accent} />
        )

      case 'star':
        return (
          <G>
            {[0, 45, 90, 135].map((angle, i) => {
              const rad = (angle * Math.PI) / 180
              const x1 = 20 + 13 * Math.cos(rad)
              const y1 = 20 - 13 * Math.sin(rad)
              const x2 = 20 - 13 * Math.cos(rad)
              const y2 = 20 + 13 * Math.sin(rad)
              return (
                <Line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={gold}
                  strokeWidth={i % 2 === 0 ? 1.5 : 1}
                  opacity={0.7}
                />
              )
            })}
            <Circle cx="20" cy="20" r="3" fill={gold} opacity={0.5} />
            <Circle cx="20" cy="20" r="1.5" fill={gold} opacity={0.8} />
          </G>
        )

      case 'cross-thorns':
        return (
          <G>
            <Line x1="20" y1="6" x2="20" y2="34" stroke={accent} strokeWidth={2} opacity={0.7} />
            <Line x1="10" y1="14" x2="30" y2="14" stroke={accent} strokeWidth={2} opacity={0.7} />
            {['M17 10 L20 8 L23 10', 'M17 18 L20 16 L23 18', 'M17 26 L20 24 L23 26'].map((d) => (
              <Path key={d} d={d} stroke={accent} strokeWidth={0.8} fill="none" opacity={0.4} />
            ))}
          </G>
        )

      case 'lily':
        return (
          <G>
            <Line x1="20" y1="34" x2="20" y2="18" stroke={green} strokeWidth={1.2} opacity={0.5} />
            <Path d="M20 8 Q14 14 20 18 Q26 14 20 8Z" fill={gold} opacity={0.3} />
            <Path d="M12 14 Q16 18 20 18 Q16 12 12 14Z" fill={gold} opacity={0.25} />
            <Path d="M28 14 Q24 18 20 18 Q24 12 28 14Z" fill={gold} opacity={0.25} />
            <Circle cx="20" cy="16" r="1.5" fill={gold} opacity={0.6} />
          </G>
        )

      default:
        return (
          <G>
            <Line
              x1="20"
              y1="8"
              x2="20"
              y2="32"
              stroke={secondary}
              strokeWidth={1.5}
              opacity={0.4}
            />
            <Line
              x1="12"
              y1="16"
              x2="28"
              y2="16"
              stroke={secondary}
              strokeWidth={1.5}
              opacity={0.4}
            />
          </G>
        )
    }
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" accessible={false}>
      <G transform={scale !== 1 ? `scale(${scale})` : undefined}>{renderIcon()}</G>
    </Svg>
  )
})
