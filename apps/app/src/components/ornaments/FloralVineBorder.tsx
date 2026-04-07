// biome-ignore-all lint/suspicious/noArrayIndexKey: static decorative SVG elements never reorder
import { memo } from 'react'
import Svg, { Circle, G, Path } from 'react-native-svg'
import { useTheme } from 'tamagui'

import { flowerPaths, leafPath } from './svgHelpers'

const segmentWidth = 60

export const FloralVineBorder = memo(function FloralVineBorder({
  length,
  orientation = 'horizontal',
}: {
  length: number
  orientation?: 'horizontal' | 'vertical'
}) {
  const theme = useTheme()
  const gold = theme.accent.val
  const goldSubtle = theme.accentSubtle.val
  const red = theme.floralRed.val
  const blue = theme.floralBlue.val
  const orange = theme.floralOrange.val
  const green = theme.vineGreen.val
  const greenDark = theme.vineGreenDark.val

  const segmentCount = Math.max(1, Math.ceil(length / segmentWidth))
  const totalLength = segmentCount * segmentWidth
  const flowerColors = [red, blue, orange]

  const isVertical = orientation === 'vertical'
  const svgWidth = isVertical ? 20 : totalLength
  const svgHeight = isVertical ? totalLength : 20
  const viewBox = `0 0 ${svgWidth} ${svgHeight}`

  return (
    <Svg
      width={isVertical ? 20 : length}
      height={isVertical ? length : 20}
      viewBox={viewBox}
      accessible={false}
    >
      {isVertical ? (
        <>
          {/* Vertical sinusoidal stem */}
          <Path
            d={Array.from({ length: segmentCount }, (_, i) => {
              const y = i * segmentWidth
              const dir = i % 2 === 0 ? 1 : -1
              return `${i === 0 ? 'M' : 'S'}${10 + dir * 4} ${y + 30} 10 ${y + segmentWidth}`
            }).join(' ')}
            stroke={gold}
            strokeWidth={1.2}
            fill="none"
          />
          {Array.from({ length: segmentCount }, (_, i) => {
            const y = i * segmentWidth
            const dir = i % 2 === 0 ? 1 : -1
            return (
              <G key={i}>
                {/* Leaves */}
                <Path
                  d={leafPath(10, y + 15, 7, dir > 0 ? 0 : 180)}
                  fill={green}
                  stroke={greenDark}
                  strokeWidth={0.4}
                />
                <Path
                  d={leafPath(10, y + 40, 6, dir > 0 ? 180 : 0)}
                  fill={green}
                  stroke={greenDark}
                  strokeWidth={0.4}
                />
                {/* Flower bud every other segment */}
                {i % 2 === 0 && (
                  <>
                    {flowerPaths(10 + dir * 5, y + 28, 4, 5).map((d, j) => (
                      <Path key={`f${j}`} d={d} fill={flowerColors[i % 3]} opacity={0.8} />
                    ))}
                    <Circle cx={10 + dir * 5} cy={y + 28} r={1.5} fill={goldSubtle} />
                  </>
                )}
              </G>
            )
          })}
        </>
      ) : (
        <>
          {/* Horizontal sinusoidal stem */}
          <Path
            d={Array.from({ length: segmentCount }, (_, i) => {
              const x = i * segmentWidth
              const dir = i % 2 === 0 ? 1 : -1
              return `${i === 0 ? 'M' : 'S'}${x + 30} ${10 + dir * 4} ${x + segmentWidth} 10`
            }).join(' ')}
            stroke={gold}
            strokeWidth={1.2}
            fill="none"
          />
          {Array.from({ length: segmentCount }, (_, i) => {
            const x = i * segmentWidth
            const dir = i % 2 === 0 ? 1 : -1
            return (
              <G key={i}>
                {/* Leaves */}
                <Path
                  d={leafPath(x + 15, 10, 7, dir > 0 ? -90 : 90)}
                  fill={green}
                  stroke={greenDark}
                  strokeWidth={0.4}
                />
                <Path
                  d={leafPath(x + 40, 10, 6, dir > 0 ? 90 : -90)}
                  fill={green}
                  stroke={greenDark}
                  strokeWidth={0.4}
                />
                {/* Flower bud every other segment */}
                {i % 2 === 0 && (
                  <>
                    {flowerPaths(x + 28, 10 + dir * 5, 4, 5).map((d, j) => (
                      <Path key={`f${j}`} d={d} fill={flowerColors[i % 3]} opacity={0.8} />
                    ))}
                    <Circle cx={x + 28} cy={10 + dir * 5} r={1.5} fill={goldSubtle} />
                  </>
                )}
              </G>
            )
          })}
        </>
      )}
    </Svg>
  )
})
