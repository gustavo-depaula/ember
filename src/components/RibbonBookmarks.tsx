import { usePathname, useRouter } from 'expo-router'
import { memo } from 'react'
import { Pressable, StyleSheet } from 'react-native'
import { View } from 'tamagui'

const ribbons = [
  { path: '/', label: 'Home', color: '#C9A84C' },
  { path: '/office', label: 'Office', color: '#6B1D2A' },
  { path: '/plan', label: 'Plan', color: '#2D6A4F' },
  { path: '/bible', label: 'Bible', color: '#1B3A5C' },
] as const

const ribbonWidth = 10
const ribbonActiveWidth = 16
const ribbonHeight = 48
const ribbonGap = 16
const startY = 100

function RibbonTab({
  color,
  active,
  y,
  onPress,
}: {
  color: string
  active: boolean
  y: number
  onPress: (() => void) | undefined
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      hitSlop={{ left: 30, top: 8, bottom: 8, right: 4 }}
      style={[styles.ribbonPressable, { top: y }]}
    >
      <View
        style={[
          styles.ribbonBody,
          { backgroundColor: color, width: active ? ribbonActiveWidth : ribbonWidth },
        ]}
      />
    </Pressable>
  )
}

export const RibbonBookmarks = memo(function RibbonBookmarks() {
  const pathname = usePathname()
  const router = useRouter()

  function isActive(ribbonPath: string) {
    if (ribbonPath === '/') return pathname === '/'
    return pathname.startsWith(ribbonPath)
  }

  return (
    <View position="absolute" top={0} right={0} bottom={0} zIndex={5000} pointerEvents="box-none">
      {ribbons.map((ribbon, i) => {
        const active = isActive(ribbon.path)
        return (
          <RibbonTab
            key={ribbon.path}
            color={ribbon.color}
            active={active}
            y={startY + i * (ribbonHeight + ribbonGap)}
            onPress={active ? undefined : () => router.replace(ribbon.path as never)}
          />
        )
      })}
    </View>
  )
})

const styles = StyleSheet.create({
  ribbonPressable: {
    position: 'absolute',
    right: 0,
    height: ribbonHeight,
    alignItems: 'flex-end',
  },
  ribbonBody: {
    height: ribbonHeight,
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
    shadowColor: '#000',
    shadowOffset: { width: -1, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
})
