import { ChevronLeft, ChevronRight, Hand } from 'lucide-react-native'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, View } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { Text } from 'tamagui'

const AUTO_DISMISS_MS = 5000

type Props = {
  color: string
  background: string
  onDismiss: () => void
}

/**
 * One-time onboarding overlay shown over the reader the first time a user
 * opens any book. Explains the tap-zone interaction model (left = back,
 * center = chrome, right = forward) without any persistent UI cost.
 *
 * Auto-dismisses after 5s; tap anywhere to dismiss sooner.
 */
export function ReaderTapHint({ color, background, onDismiss }: Props) {
  const { t } = useTranslation()
  useEffect(() => {
    const t = setTimeout(onDismiss, AUTO_DISMISS_MS)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <Animated.View
      entering={FadeIn.duration(220)}
      exiting={FadeOut.duration(180)}
      style={[StyleSheet.absoluteFill, { backgroundColor: hexToRgba(background, 0.78) }]}
    >
      <Pressable
        onPress={onDismiss}
        style={{ flex: 1 }}
        accessibilityRole="button"
        accessibilityLabel={t('books.dismissHint', { defaultValue: 'Dismiss hint' })}
      >
        <View style={styles.row}>
          <Zone color={color} label={t('books.hintPrev', { defaultValue: 'Previous page' })}>
            <ChevronLeft size={28} color={color} />
          </Zone>
          <Zone color={color} label={t('books.hintMenu', { defaultValue: 'Show menu' })}>
            <Hand size={26} color={color} />
          </Zone>
          <Zone color={color} label={t('books.hintNext', { defaultValue: 'Next page' })}>
            <ChevronRight size={28} color={color} />
          </Zone>
        </View>
        <Text
          fontFamily="$body"
          fontSize="$2"
          color={color}
          opacity={0.7}
          textAlign="center"
          style={styles.dismissHint}
        >
          {t('books.tapToDismiss', { defaultValue: 'Tap anywhere to dismiss' })}
        </Text>
      </Pressable>
    </Animated.View>
  )
}

function Zone({
  color,
  label,
  children,
}: {
  color: string
  label: string
  children: React.ReactNode
}) {
  return (
    <View style={[styles.zone, { borderColor: color }]}>
      {children}
      <Text
        fontFamily="$body"
        fontSize="$1"
        color={color}
        opacity={0.85}
        textAlign="center"
        style={styles.zoneLabel}
      >
        {label}
      </Text>
    </View>
  )
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  if (h.length !== 6) return `rgba(0,0,0,${alpha})`
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

const styles = StyleSheet.create({
  row: { flex: 1, flexDirection: 'row' },
  zone: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 6,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    gap: 12,
    opacity: 0.6,
  },
  zoneLabel: { paddingHorizontal: 12 },
  dismissHint: { paddingBottom: 32 },
})
