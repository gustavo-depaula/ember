import { useEffect, useRef } from 'react'
import { Pressable, ScrollView } from 'react-native'
import { View, XStack } from 'tamagui'

import { Typography } from '@/components'

export type TabSpec<Id extends string> = {
  id: Id
  label: string
  /** How many things the tab holds, set small after its label. */
  count?: number
  /** Defaults to `label`. */
  a11yLabel?: string
}

/** A typographic tab: a tracked-caps label, underlined in burgundy when chosen. */
export function TabItem({
  label,
  count,
  a11yLabel,
  selected,
  onPress,
  onLayout,
}: {
  label: string
  count?: number
  a11yLabel?: string
  selected: boolean
  onPress: () => void
  onLayout?: (x: number) => void
}) {
  return (
    <Pressable
      onLayout={onLayout ? (e) => onLayout(e.nativeEvent.layout.x) : undefined}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityLabel={a11yLabel ?? label}
      accessibilityState={{ selected }}
      aria-selected={selected}
    >
      <XStack
        minHeight={40}
        alignItems="center"
        gap={6}
        borderBottomWidth={2}
        borderBottomColor={selected ? '$colorBurgundy' : 'transparent'}
      >
        <Typography
          variant="label"
          fontSize="$1"
          letterSpacing={1.5}
          color={selected ? '$colorBurgundy' : '$color'}
        >
          {label.toUpperCase()}
        </Typography>
        {count ? (
          <Typography
            variant="annotation"
            fontSize="$1"
            marginLeft={4}
            color={selected ? '$colorBurgundy' : '$colorSecondary'}
          >
            {count}
          </Typography>
        ) : undefined}
      </XStack>
    </Pressable>
  )
}

/**
 * A line of tabs that scrolls sideways. The tab in hand is brought onto the
 * line's visible stretch: it may be the last of eight, chosen elsewhere.
 * `inset` pads the line's ends; `bleed` pulls it out by as much, to run edge
 * to edge inside a padded column; `ruled` sets a rule under it.
 */
export function TabLine<Id extends string>({
  tabs,
  selected,
  onSelect,
  inset = 24,
  bleed = false,
  ruled = false,
}: {
  tabs: TabSpec<Id>[]
  selected: Id
  onSelect: (id: Id) => void
  inset?: number
  bleed?: boolean
  ruled?: boolean
}) {
  const lineRef = useRef<ScrollView>(null)
  const lefts = useRef(new Map<string, number>())
  function showOnLine(id: string) {
    const left = lefts.current.get(id)
    if (left !== undefined) lineRef.current?.scrollTo({ x: Math.max(0, left - 72) })
  }
  // biome-ignore lint/correctness/useExhaustiveDependencies: the tab in hand is the trigger
  useEffect(() => {
    showOnLine(selected)
  }, [selected])

  return (
    <View
      marginHorizontal={bleed ? -inset : 0}
      borderBottomWidth={ruled ? 1 : 0}
      borderBottomColor="$borderColor"
    >
      <ScrollView
        ref={lineRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: inset, gap: 20 }}
        accessibilityRole="tablist"
      >
        {tabs.map((tab) => (
          <TabItem
            key={tab.id}
            label={tab.label}
            count={tab.count}
            a11yLabel={tab.a11yLabel}
            selected={tab.id === selected}
            onPress={() => onSelect(tab.id)}
            onLayout={(x) => {
              lefts.current.set(tab.id, x)
              if (tab.id === selected) showOnLine(tab.id)
            }}
          />
        ))}
      </ScrollView>
    </View>
  )
}
