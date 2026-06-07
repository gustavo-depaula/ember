import { Copy, NotebookPen, Trash2 } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { GlassSurface } from '@/components/GlassSurface'
import { HIGHLIGHT_COLOR_IDS, HIGHLIGHT_COLORS } from './highlightColors'
import type { HighlightColor } from './highlights'

const PILL_HEIGHT = 48
// 5 swatches (24pt each) + copy + optional trash + gaps + padding.
// Width is computed from the slot count so the pill stays snug in both modes.
const SLOT = 32
const HPAD = 14
const baseWidth = (extras: number) => HPAD * 2 + 5 * SLOT + extras * SLOT

type Props = {
  /** Selection rect in WebView-screen coords; undefined hides the toolbar. */
  rect: { x: number; y: number; width: number; height: number } | undefined
  /** 'create' = a fresh selection; 'edit' = user tapped an existing highlight. */
  mode: 'create' | 'edit'
  /** When `mode === 'edit'`, true if this highlight already carries a note. */
  hasNote?: boolean
  isDark: boolean
  onPickColor: (color: HighlightColor) => void
  onNote: () => void
  onCopy: () => void
  /** Required when `mode === 'edit'`; ignored otherwise. */
  onRemove?: () => void
}

/**
 * Floating glass toolbar above (or below) the active selection. Five color
 * swatches + copy; in edit mode (tap on existing highlight), also a trash.
 */
export function ReaderSelectionToolbar({
  rect,
  mode,
  hasNote,
  isDark,
  onPickColor,
  onNote,
  onCopy,
  onRemove,
}: Props) {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const { width: screenWidth, height: screenHeight } = useWindowDimensions()
  if (!rect) return null

  const tintColor = isDark ? 'rgba(28,26,24,0.78)' : 'rgba(244,240,234,0.85)'
  const iconColor = isDark ? '#EDE4D8' : '#1a1815'
  const showTrash = mode === 'edit' && !!onRemove
  // Always show Note + Copy; trash only in edit mode.
  const toolbarWidth = baseWidth(showTrash ? 3 : 2)

  // Prefer above the selection. If there's no room above the notch, place
  // below; if there's also no room below the home indicator, clamp inside
  // the safe area (the toolbar will overlap the selection — acceptable).
  const above = rect.y > insets.top + PILL_HEIGHT + 8
  const belowMax = screenHeight - insets.bottom - PILL_HEIGHT - 8
  const rawTop = above ? rect.y - PILL_HEIGHT - 8 : rect.y + rect.height + 8
  const top = Math.max(insets.top + 8, Math.min(belowMax, rawTop))
  const idealLeft = rect.x + rect.width / 2 - toolbarWidth / 2
  const left = Math.max(8, Math.min(screenWidth - toolbarWidth - 8, idealLeft))

  return (
    <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, { left: 0, top: 0 }]}>
      <Animated.View
        entering={FadeIn.duration(120)}
        exiting={FadeOut.duration(120)}
        style={[styles.wrap, { top, left, width: toolbarWidth }]}
      >
        <GlassSurface
          isDark={isDark}
          tintColor={tintColor}
          style={[styles.pill, { height: PILL_HEIGHT }]}
        >
          {HIGHLIGHT_COLOR_IDS.map((id) => (
            <Pressable
              key={id}
              onPress={() => onPickColor(id)}
              accessibilityRole="button"
              accessibilityLabel={t(`books.highlight.${id}`, { defaultValue: id })}
              style={styles.slot}
              hitSlop={4}
            >
              <View style={[styles.swatch, { backgroundColor: HIGHLIGHT_COLORS[id].swatch }]} />
            </Pressable>
          ))}
          <View style={styles.divider} />
          <Pressable
            onPress={onNote}
            accessibilityRole="button"
            accessibilityLabel={t(hasNote ? 'books.editNote' : 'books.addNote', {
              defaultValue: hasNote ? 'Edit note' : 'Add note',
            })}
            style={styles.slot}
            hitSlop={4}
          >
            <NotebookPen size={18} color={iconColor} />
          </Pressable>
          <Pressable
            onPress={onCopy}
            accessibilityRole="button"
            accessibilityLabel={t('books.copySelection', { defaultValue: 'Copy' })}
            style={styles.slot}
            hitSlop={4}
          >
            <Copy size={18} color={iconColor} />
          </Pressable>
          {showTrash ? (
            <Pressable
              onPress={onRemove}
              accessibilityRole="button"
              accessibilityLabel={t('books.removeHighlight', { defaultValue: 'Remove highlight' })}
              style={styles.slot}
              hitSlop={4}
            >
              <Trash2 size={18} color={iconColor} />
            </Pressable>
          ) : null}
        </GlassSurface>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: HPAD,
    borderRadius: 9999,
    overflow: 'hidden',
  },
  slot: {
    width: SLOT,
    height: PILL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatch: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(128,128,128,0.35)',
    marginHorizontal: 4,
  },
})
