import { useFocusEffect } from 'expo-router'
import { BookOpen } from 'lucide-react-native'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import Animated, { FadeOut, SlideInUp } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, useTheme, useThemeName } from 'tamagui'

import { GlassSurface } from '@/components/GlassSurface'
import { consumeReadingSession, type ReadingSession } from '@/features/books/reader/sessionToast'

const DISMISS_MS = 3500

export function SessionToast({ bookId }: { bookId: string }) {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const theme = useTheme()
  const isDark = useThemeName().startsWith('dark')
  const [session, setSession] = useState<ReadingSession | undefined>(undefined)

  useFocusEffect(
    useCallback(() => {
      const s = consumeReadingSession(bookId)
      if (!s) return
      setSession(s)
      const tid = setTimeout(() => setSession(undefined), DISMISS_MS)
      return () => clearTimeout(tid)
    }, [bookId]),
  )

  if (!session) return null

  const parts: string[] = [
    t('book.sessionMinutes', {
      defaultValue: '{{count}} min',
      count: session.minutes,
    }),
  ]
  if (session.pages > 0) {
    parts.push(
      t('book.sessionPages', {
        defaultValue: '{{count}} pages',
        count: session.pages,
      }),
    )
  }
  if (session.chaptersFinished > 0) {
    parts.push(
      t('book.sessionChaptersFinished', {
        defaultValue: '{{count}} chapters finished',
        count: session.chaptersFinished,
      }),
    )
  }

  const color = String(theme.color?.val ?? '#000')
  const tintColor = isDark ? 'rgba(28,26,24,0.6)' : 'rgba(244,240,234,0.7)'

  return (
    <View pointerEvents="none" style={[styles.wrap, { top: insets.top + 8 }]}>
      <Animated.View
        pointerEvents="none"
        entering={SlideInUp.duration(280)}
        exiting={FadeOut.duration(200)}
        style={styles.animWrap}
      >
        <GlassSurface
          isDark={isDark}
          tintColor={tintColor}
          style={styles.pill}
          isInteractive={false}
        >
          <BookOpen size={16} color={color} />
          <Text
            fontFamily="$body"
            fontSize="$2"
            color={color}
            numberOfLines={1}
            style={styles.label}
          >
            {parts.join(' · ')}
          </Text>
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
    zIndex: 100,
  },
  animWrap: { alignSelf: 'center' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
    overflow: 'hidden',
    gap: 8,
  },
  label: { letterSpacing: 0.2 },
})
