import { useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronLeft, Plus } from 'lucide-react-native'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, { runOnJS, SlideInLeft, SlideInRight } from 'react-native-reanimated'
import { useTheme, XStack, YStack } from 'tamagui'

import { ScreenLayout, Typography } from '@/components'
import { GlassCircle } from '@/components/ornaments'
import { MovementList } from '@/features/movements'
import { lightTap } from '@/lib/haptics'

import { AltarCreateSheet, type AltarCreateType } from './AltarCreateSheet'
import { AltarResolution } from './AltarResolution'
import { AltarTabs } from './AltarTabs'

type TabKey = 'intentions' | 'gratitude' | 'resolution'

const tabOrder: TabKey[] = ['intentions', 'gratitude', 'resolution']

const createTypeForTab: Record<TabKey, AltarCreateType> = {
  intentions: 'intention',
  gratitude: 'thanksgiving',
  resolution: 'resolution',
}

/**
 * The Altar — what you lay before God: petitions, thanksgivings, and today's
 * resolution, behind one title with a typographic tab switch (tap or swipe).
 * Liquid-glass header controls flank the title; the gold + opens one joint sheet
 * to lay down any of the three. Reuses the movement + resolution features.
 */
export function AltarScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const { tab: tabParam } = useLocalSearchParams<{ tab?: string }>()
  const [tab, setTab] = useState<TabKey>(
    tabParam === 'gratitude' || tabParam === 'resolution' ? tabParam : 'intentions',
  )
  const [dir, setDir] = useState<1 | -1>(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [createType, setCreateType] = useState<AltarCreateType>('intention')
  const [editResolution, setEditResolution] = useState<{ id: string; text: string } | undefined>(
    undefined,
  )

  // Latest tab in a ref so the gesture's JS callback never reads a stale value.
  const tabRef = useRef<TabKey>(tab)
  tabRef.current = tab

  const tabs = [
    { key: 'intentions', label: t('altar.intentions') },
    { key: 'gratitude', label: t('altar.gratitude') },
    { key: 'resolution', label: t('altar.resolution') },
  ] as const

  const goRelative = useCallback((delta: number) => {
    const i = tabOrder.indexOf(tabRef.current)
    const next = Math.min(tabOrder.length - 1, Math.max(0, i + delta))
    if (next === i) return
    lightTap()
    setDir(delta > 0 ? 1 : -1)
    setTab(tabOrder[next])
  }, [])

  const select = useCallback((key: TabKey) => {
    const from = tabOrder.indexOf(tabRef.current)
    const to = tabOrder.indexOf(key)
    if (to === from) return
    setDir(to > from ? 1 : -1)
    setTab(key)
  }, [])

  const openCreate = useCallback((type: AltarCreateType) => {
    lightTap()
    setCreateType(type)
    setEditResolution(undefined)
    setCreateOpen(true)
  }, [])

  const openEditResolution = useCallback((resolution: { id: string; text: string }) => {
    lightTap()
    setCreateType('resolution')
    setEditResolution(resolution)
    setCreateOpen(true)
  }, [])

  // Horizontal fling switches tabs; the vertical bounds let the page keep
  // scrolling untouched (activate only on a clear sideways gesture).
  const swipe = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-16, 16])
        .failOffsetY([-12, 12])
        .onEnd((e) => {
          if (e.translationX <= -48 || e.velocityX <= -500) runOnJS(goRelative)(1)
          else if (e.translationX >= 48 || e.velocityX >= 500) runOnJS(goRelative)(-1)
        }),
    [goRelative],
  )

  const movementKind = tab === 'intentions' ? 'intention' : 'thanksgiving'

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <XStack alignItems="center" gap="$md">
          <GlassCircle onPress={() => router.back()} accessibilityLabel={t('a11y.goBack')}>
            <ChevronLeft size={22} color={theme.color?.val} />
          </GlassCircle>
          <Typography variant="sacred-title" flex={1} fontSize="$5">
            {t('altar.title')}
          </Typography>
          <GlassCircle
            onPress={() => openCreate(createTypeForTab[tab])}
            accessibilityLabel={t('common.add')}
          >
            <Plus size={22} color={theme.accent?.val} />
          </GlassCircle>
        </XStack>

        <AltarTabs tabs={tabs} active={tab} onChange={select} />

        <GestureDetector gesture={swipe}>
          <Animated.View
            key={tab}
            entering={(dir > 0 ? SlideInRight : SlideInLeft).duration(220)}
            style={{ minHeight: 240 }}
          >
            {tab === 'resolution' ? (
              <AltarResolution
                onCreate={() => openCreate('resolution')}
                onEdit={openEditResolution}
              />
            ) : (
              <MovementList
                kind={movementKind}
                hideHeading
                onAdd={() => openCreate(movementKind)}
              />
            )}
          </Animated.View>
        </GestureDetector>
      </YStack>

      <AltarCreateSheet
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        initialType={createType}
        existingResolution={editResolution}
      />
    </ScreenLayout>
  )
}
