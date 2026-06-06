import { CheckCircle2 } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import Animated, { FadeOut, SlideInDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from 'tamagui'

import { GlassSurface } from '@/components/GlassSurface'

type Props = {
  /** Chapter title to celebrate. `undefined` = nothing to show. */
  title: string | undefined
  isDark: boolean
  color: string
}

export function ChapterCompleteToast({ title, isDark, color }: Props) {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  if (!title) return null

  const tintColor = isDark ? 'rgba(28,26,24,0.6)' : 'rgba(244,240,234,0.7)'

  return (
    <View pointerEvents="none" style={[styles.wrap, { bottom: insets.bottom + 72 }]}>
      <Animated.View
        pointerEvents="none"
        entering={SlideInDown.duration(260)}
        exiting={FadeOut.duration(200)}
        style={styles.animWrap}
      >
        <GlassSurface
          isDark={isDark}
          tintColor={tintColor}
          style={styles.pill}
          isInteractive={false}
        >
          <CheckCircle2 size={18} color={color} />
          <View style={{ flexShrink: 1 }}>
            <Text fontFamily="$body" fontSize="$1" color={color} opacity={0.6}>
              {t('books.chapterCompleteLabel', { defaultValue: 'Chapter complete' })}
            </Text>
            <Text
              fontFamily="$body"
              fontSize="$2"
              color={color}
              numberOfLines={1}
              style={styles.title}
            >
              {title}
            </Text>
          </View>
        </GlassSurface>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  animWrap: { alignSelf: 'center', maxWidth: 360 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 9999,
    overflow: 'hidden',
    gap: 12,
  },
  title: { letterSpacing: 0.2 },
})
