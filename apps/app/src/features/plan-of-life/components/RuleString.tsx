import { Plus } from 'lucide-react-native'
import { useId, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Svg, { Circle, Defs, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg'
import { useTheme, useThemeName, XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import type { SlotState } from '@/db/events'
import { lightTap } from '@/lib/haptics'

import { beadRadius, hourHue, slotDaysLabel } from '../ruleString'
import { getActiveBlocks, type TimeBlock } from '../timeBlocks'

const height = 112
const midline = 50
const wave = 11
const inset = 16

type Item =
  | { kind: 'medal'; block: TimeBlock; hue: string }
  | { kind: 'bead'; slot: SlotState; hue: string; days?: string }

/**
 * The rule at a glance: one bead per prayer time along a wavy string, in the
 * day's order, a ✠ opening each part of the day. Size is the tier; a hollow
 * bead falls only on some days, named above it. Not today's progress — the
 * shape of the rule.
 */
export function RuleString({
  slots,
  onPress,
  onAdd,
}: {
  slots: SlotState[]
  onPress: () => void
  onAdd: () => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const dark = useThemeName().startsWith('dark')
  const gradientId = useId()
  const [width, setWidth] = useState(0)

  const items = useMemo(
    () =>
      getActiveBlocks(slots).flatMap(({ block, def }): Item[] => {
        const beads = def.slots.map(
          (slot): Item => ({
            kind: 'bead',
            slot,
            hue: hourHue(slot.time, dark),
            days: slotDaysLabel(slot, t),
          }),
        )
        return [{ kind: 'medal', block, hue: beads[0]?.hue ?? theme.accent.val }, ...beads]
      }),
    [slots, dark, t, theme.accent.val],
  )

  const step = items.length > 1 ? (width - inset * 2) / (items.length - 1) : 0
  const x = (i: number) => inset + i * step
  const y = (i: number) =>
    midline + wave * Math.sin((i / Math.max(items.length - 1, 1)) * Math.PI * 2)
  const thread = items.map((_, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(i)}`).join(' ')
  // Neighbouring beads on the same days share one label, centred over the run.
  const sameDays = (i: number, j: number) => {
    const a = items[i]
    const b = items[j]
    return a?.kind === 'bead' && b?.kind === 'bead' && a.days !== undefined && a.days === b.days
  }
  const labelX = (i: number) => {
    if (sameDays(i, i - 1)) return undefined
    let end = i
    while (sameDays(end, end + 1)) end++
    return (x(i) + x(end)) / 2
  }

  return (
    <XStack alignItems="flex-start">
      <AnimatedPressable
        style={{ flex: 1 }}
        onPress={() => {
          lightTap()
          onPress()
        }}
        accessibilityRole="button"
        accessibilityLabel={t('plan.title')}
      >
        <YStack height={height} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
          {width > 0 && (
            <Svg width={width} height={height}>
              <Defs>
                <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
                  {items.map((item, i) => (
                    <Stop
                      key={item.kind === 'bead' ? item.slot.id : item.block}
                      offset={i / Math.max(items.length - 1, 1)}
                      stopColor={item.hue}
                      stopOpacity={0.6}
                    />
                  ))}
                </LinearGradient>
              </Defs>
              <Path d={thread} stroke={`url(#${gradientId})`} strokeWidth={1.2} fill="none" />
              {items.map((item, i) =>
                item.kind === 'medal' ? (
                  <Medal
                    key={item.block}
                    x={x(i)}
                    y={y(i)}
                    hue={item.hue}
                    label={t(`timeBlock.${item.block}`).toUpperCase()}
                    labelColor={theme.colorSecondary.val}
                  />
                ) : (
                  <Bead
                    key={item.slot.id}
                    x={x(i)}
                    y={y(i)}
                    r={Math.min(beadRadius[item.slot.tier], step * 0.42)}
                    hue={item.hue}
                    days={item.days}
                    labelX={labelX(i)}
                    background={theme.background.val}
                    labelColor={theme.colorSecondary.val}
                  />
                ),
              )}
            </Svg>
          )}
        </YStack>
      </AnimatedPressable>
      <AnimatedPressable
        onPress={() => {
          lightTap()
          onAdd()
        }}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={t('plan.addCustom')}
      >
        <YStack
          marginTop={midline - 13}
          width={26}
          height={26}
          borderRadius={13}
          borderWidth={1.2}
          borderStyle="dashed"
          borderColor="$accent"
          alignItems="center"
          justifyContent="center"
        >
          <Plus size={14} color={theme.accent.val} />
        </YStack>
      </AnimatedPressable>
    </XStack>
  )
}

function Medal({
  x,
  y,
  hue,
  label,
  labelColor,
}: {
  x: number
  y: number
  hue: string
  label: string
  labelColor: string
}) {
  return (
    <>
      <SvgText x={x} y={y + 6} textAnchor="middle" fontSize={17} fill={hue}>
        ✠
      </SvgText>
      <SvgText
        x={x - 6}
        y={y + 34}
        fontFamily="Cinzel_400Regular"
        fontSize={10}
        letterSpacing={1.4}
        fill={labelColor}
      >
        {label}
      </SvgText>
    </>
  )
}

function Bead({
  x,
  y,
  r,
  hue,
  days,
  labelX,
  background,
  labelColor,
}: {
  x: number
  y: number
  r: number
  hue: string
  days?: string
  labelX?: number
  background: string
  labelColor: string
}) {
  if (!days) return <Circle cx={x} cy={y} r={r} fill={hue} />
  return (
    <>
      <Circle cx={x} cy={y} r={r} fill={background} stroke={hue} strokeWidth={1.6} />
      {labelX !== undefined && (
        <SvgText
          x={labelX}
          y={y - r - 7}
          textAnchor="middle"
          fontFamily="EBGaramond_400Regular_Italic"
          fontSize={11.5}
          fill={labelColor}
        >
          {days}
        </SvgText>
      )}
    </>
  )
}
