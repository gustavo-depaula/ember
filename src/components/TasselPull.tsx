import { usePathname, useRouter } from 'expo-router'
import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet } from 'react-native'
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Path } from 'react-native-svg'
import { Text, useTheme, View, XStack } from 'tamagui'
import { mediumTap } from '@/lib/haptics'

const sections = [
  { path: '/', labelKey: 'nav.home', color: '#C9A84C' },
  { path: '/office', labelKey: 'nav.divineOffice', color: '#6B1D2A' },
  { path: '/mass', labelKey: 'nav.holyMass', color: '#8B6914' },
  { path: '/plan', labelKey: 'nav.planOfLife', color: '#2D6A4F' },
  { path: '/bible', labelKey: 'nav.sacredScripture', color: '#1B3A5C' },
  { path: '/catechism', labelKey: 'nav.catechism', color: '#7B2D3B' },
  { path: '/saints', labelKey: 'nav.saints', color: '#C9A84C' },
  { path: '/settings', labelKey: 'nav.settings', color: '#6B5D4F' },
]

const springConfig = { damping: 24, stiffness: 200, mass: 0.8 }
const tasselWidth = 34
const notchTail = 12
const ribbonHeight = 52

function TasselTab({
  color,
  height,
  onPress,
}: {
  color: string
  height: number
  onPress: () => void
}) {
  const svgHeight = height + notchTail
  const w = tasselWidth
  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ left: 30, top: 0, bottom: 20, right: 10 }}
      style={styles.tasselPressable}
    >
      <Svg width={w} height={svgHeight} viewBox={`0 0 ${w} ${svgHeight}`}>
        <Path
          d={`M0 0 L${w} 0 L${w} ${height} L${w / 2} ${height - notchTail} L0 ${height} Z`}
          fill={color}
        />
      </Svg>
    </Pressable>
  )
}

function RibbonItem({
  color,
  label,
  active,
  isLast,
  onPress,
  bg,
  textColor,
}: {
  color: string
  label: string
  active: boolean
  isLast: boolean
  onPress: () => void
  bg: string
  textColor: string
}) {
  return (
    <Pressable onPress={onPress} disabled={active}>
      <XStack
        height={ribbonHeight}
        backgroundColor={bg}
        alignItems="center"
        paddingHorizontal="$lg"
        gap="$md"
        borderBottomLeftRadius={isLast ? 10 : 0}
        borderBottomRightRadius={isLast ? 10 : 0}
      >
        <View
          width={4}
          height={28}
          backgroundColor={color}
          borderRadius={2}
          opacity={active ? 1 : 0.35}
        />
        <Text
          fontFamily="$heading"
          fontSize="$4"
          color={active ? color : textColor}
          opacity={active ? 1 : 0.7}
        >
          {label}
        </Text>
      </XStack>
    </Pressable>
  )
}

export const TasselPull = memo(function TasselPull() {
  const { t } = useTranslation()
  const pathname = usePathname()
  const router = useRouter()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const topInset = Math.max(insets.top, 0)
  const panelHeight = topInset + sections.length * ribbonHeight
  const [panelOpen, setPanelOpen] = useState(false)
  const panelY = useSharedValue(-panelHeight)

  const bg = theme.background.val
  const textColor = theme.color.val

  function isActive(sectionPath: string) {
    if (sectionPath === '/') return pathname === '/'
    return pathname.startsWith(sectionPath)
  }

  const currentColor = sections.find((s) => isActive(s.path))?.color ?? sections[0].color

  const open = useCallback(() => {
    mediumTap()
    panelY.value = withSpring(0, springConfig)
    setPanelOpen(true)
  }, [panelY])

  const close = useCallback(() => {
    panelY.value = withSpring(-panelHeight, springConfig)
    setPanelOpen(false)
  }, [panelY, panelHeight])

  const handleRibbonPress = useCallback(
    (path: string) => {
      router.replace(path as never)
      close()
    },
    [router, close],
  )

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: panelY.value }],
  }))

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(panelY.value, [-panelHeight, 0], [0, 0.5]),
  }))

  return (
    <View
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={5000}
      pointerEvents="box-none"
    >
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={close}
        pointerEvents={panelOpen ? 'auto' : 'none'}
      >
        <Animated.View style={[styles.backdrop, backdropStyle]} />
      </Pressable>

      <Animated.View style={[styles.panel, panelStyle]}>
        <View height={topInset} backgroundColor={bg} />
        {sections.map((section, i) => (
          <RibbonItem
            key={section.path}
            color={section.color}
            label={t(section.labelKey)}
            active={isActive(section.path)}
            isLast={i === sections.length - 1}
            onPress={() => handleRibbonPress(section.path)}
            bg={bg}
            textColor={textColor}
          />
        ))}
      </Animated.View>

      <TasselTab color={currentColor} height={topInset + 10} onPress={panelOpen ? close : open} />
    </View>
  )
})

const styles = StyleSheet.create({
  tasselPressable: {
    position: 'absolute',
    top: 0,
    right: 56,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  panel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
})
