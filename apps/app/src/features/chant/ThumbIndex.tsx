import { usePreventZoomTransitionDismissal } from 'expo-router'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { type GestureResponderEvent, StyleSheet, useWindowDimensions, View } from 'react-native'
import { Text, YStack } from 'tamagui'

import { Typography } from '@/components'
import { ToneFill } from '@/features/covers/parts'
import { blockInk, blockLabelInk } from '@/features/explore/bgColor'
import { selectionTick } from '@/lib/haptics'
import { localizeContent } from '@/lib/i18n'
import type { ChantBookGroup } from './chants'
import { toneOfGroup } from './library'

const width = 36
const seal = 150

/**
 * Keeps the iOS drag-to-close of a zoomed page off the index's strip, and
 * leaves it everywhere else. The chant library opens with a zoom from the
 * Acervo, and that zoom's dismissal reaches through every page pushed above it:
 * a thumb running down the tabs closed the whole library. It must be called
 * from the page the zoom opened, whose dismissal it is.
 */
export function useThumbIndexDismissal(): void {
  const { width: screen } = useWindowDimensions()
  usePreventZoomTransitionDismissal({ unstable_dismissalBoundsRect: { maxX: screen - width - 12 } })
}

/**
 * A printed missal's thumb tabs, down the page's edge: a touch or a drag lands
 * on a season, a month, the Commons, and a seal in the season's color says
 * which while the thumb is down.
 */
export function ThumbIndex({
  groups,
  current,
  bookName,
  bottom,
  onPick,
}: {
  groups: ChantBookGroup[]
  current?: string
  bookName: string
  bottom: number
  onPick: (group: ChantBookGroup) => void
}) {
  const { t } = useTranslation()
  const strip = useRef<View>(null)
  const top = useRef(0)
  const height = useRef(1)
  const [touched, setTouched] = useState<{ group: ChantBookGroup; y: number }>()

  const pick = (e: GestureResponderEvent) => {
    // Read synchronously: React Native recycles the event once the handler returns.
    const y = e.nativeEvent.pageY - top.current
    const i = Math.min(
      groups.length - 1,
      Math.max(0, Math.floor((y / height.current) * groups.length)),
    )
    const group = groups[i]
    if (group.id !== touched?.group.id) {
      selectionTick()
      onPick(group)
    }
    setTouched({ group, y: Math.min(Math.max(y, seal / 2), height.current - seal / 2) })
  }

  const at = groups.findIndex((g) => g.id === current)
  const step = (by: number) => {
    const next = groups[Math.min(groups.length - 1, Math.max(0, (at < 0 ? 0 : at) + by))]
    if (next) onPick(next)
  }

  return (
    <>
      <View
        ref={strip}
        style={[styles.strip, { bottom }]}
        onLayout={() =>
          strip.current?.measureInWindow((_, y, __, h) => {
            top.current = y
            height.current = h
          })
        }
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={pick}
        onResponderMove={pick}
        onResponderRelease={() => setTouched(undefined)}
        onResponderTerminate={() => setTouched(undefined)}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={t('a11y.chantIndex', { name: bookName })}
        accessibilityValue={{ text: at >= 0 ? localizeContent(groups[at].title) : undefined }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => step(e.nativeEvent.actionName === 'increment' ? 1 : -1)}
      >
        {groups.map((group, i) => {
          const on = group.id === (touched?.group.id ?? current)
          const newPart = i > 0 && groups[i - 1].part !== group.part
          return (
            // Each tab an equal cell, so where the thumb is down is the tab under it.
            <YStack
              key={group.id}
              flex={1}
              alignItems="center"
              justifyContent="center"
              borderTopWidth={newPart ? 1 : 0}
              borderColor="$borderColor"
            >
              <Text
                fontFamily="$heading"
                fontSize={10}
                letterSpacing={0.4}
                color={on ? '$colorBurgundy' : '$colorSecondary'}
              >
                {group.short}
              </Text>
            </YStack>
          )
        })}
      </View>

      {touched && (
        <View pointerEvents="none" style={[styles.seal, { top: touched.y - seal / 2 }]}>
          <ToneFill
            id="thumb-seal"
            tone={toneOfGroup(touched.group.id)}
            width={seal}
            height={seal}
            radius={seal / 2}
          />
          <Text fontFamily="$heading" fontSize={11} letterSpacing={1.4} color={blockLabelInk}>
            {touched.group.short}
          </Text>
          <Typography
            fontFamily="$title"
            fontSize="$2"
            color={blockInk}
            textAlign="center"
            paddingHorizontal="$md"
            numberOfLines={2}
          >
            {localizeContent(touched.group.title)}
          </Typography>
        </View>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  strip: {
    position: 'absolute',
    right: 2,
    top: 8,
    width,
    alignItems: 'stretch',
  },
  seal: {
    position: 'absolute',
    right: width + 16,
    width: seal,
    height: seal,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
})
