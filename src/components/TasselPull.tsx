import { usePathname, useRouter } from 'expo-router'
import { memo, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, useColorScheme } from 'react-native'
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Path, Text as SvgText } from 'react-native-svg'
import { Text, useTheme, View, XStack } from 'tamagui'
import { mediumTap } from '@/lib/haptics'

const sectionsDef = [
  { path: '/', labelKey: 'nav.home', light: '#C9A84C', dark: '#D4A63A' },
  { path: '/office', labelKey: 'nav.divineOffice', light: '#6B1D2A', dark: '#C75B6B' },
  { path: '/mass', labelKey: 'nav.holyMass', light: '#8B6914', dark: '#D4A63A' },
  { path: '/plan', labelKey: 'nav.planOfLife', light: '#2D6A4F', dark: '#52A878' },
  { path: '/bible', labelKey: 'nav.sacredScripture', light: '#1B3A5C', dark: '#7A9EC8' },
  { path: '/catechism', labelKey: 'nav.catechism', light: '#7B2D3B', dark: '#C75B6B' },
  { path: '/saints', labelKey: 'nav.saints', light: '#C9A84C', dark: '#D4A63A' },
  { path: '/settings', labelKey: 'nav.settings', light: '#6B5D4F', dark: '#918880' },
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
        {['M', 'E', 'N', 'U'].map((letter, i) => (
          <SvgText
            key={letter}
            x={w / 2}
            y={height - notchTail - 38 + i * 10}
            textAnchor="middle"
            fill="#fff"
            fontSize={9}
            fontFamily="Cinzel_400Regular"
            letterSpacing={1}
          >
            {letter}
          </SvgText>
        ))}
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
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const sections = useMemo(
    () => sectionsDef.map((s) => ({ ...s, color: isDark ? s.dark : s.light })),
    [isDark],
  )
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
