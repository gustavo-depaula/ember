import { Pressable, Text, View } from 'react-native'

/**
 * Web stand-in for `@expo/ui/community/segmented-control`.
 *
 * Re-emits the native `nativeEvent.selectedSegmentIndex` shape so call sites
 * need no platform branch.
 */
export function SegmentedControl({
  values,
  selectedIndex,
  onChange,
}: {
  values: string[]
  selectedIndex?: number
  onChange?: (e: { nativeEvent: { selectedSegmentIndex: number } }) => void
}) {
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {values.map((value, index) => (
        <Pressable
          key={value}
          onPress={() => onChange?.({ nativeEvent: { selectedSegmentIndex: index } })}
          accessibilityRole="button"
          accessibilityState={{ selected: index === selectedIndex }}
          accessibilityLabel={value}
          style={{
            flex: 1,
            paddingVertical: 6,
            alignItems: 'center',
            borderRadius: 8,
            backgroundColor: index === selectedIndex ? 'rgba(201,168,76,0.25)' : 'transparent',
          }}
        >
          <Text>{value}</Text>
        </Pressable>
      ))}
    </View>
  )
}
