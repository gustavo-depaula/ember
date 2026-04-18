import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, useWindowDimensions } from 'react-native'

import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  clamp,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, View, YStack } from 'tamagui'

import {
  PrayerSpinner,
  ReaderErrorState,
  ReadingConfigBadge,
  ReadingConfigModal,
  ScreenLayout,
} from '@/components'
import { useCatechismStore } from '@/stores/catechismStore'

import { useSegment, useSegments } from '../hooks'
import { CatechismHeader } from './CatechismHeader'
import { SegmentContent } from './SegmentContent'
import { SegmentList } from './SegmentList'
import { SegmentNav } from './SegmentNav'
import { TocTree } from './TocTree'

const springConfig = { damping: 24, stiffness: 200, mass: 0.8 }

export function CatechismReader() {
  const { t } = useTranslation()
  const { width: screenWidth } = useWindowDimensions()
  const tocDrawerWidth = Math.min(screenWidth * 0.7, 340)
  const sectionDrawerWidth = Math.min(screenWidth * 0.55, 280)
  const stripWidth = tocDrawerWidth + screenWidth + sectionDrawerWidth

  const insets = useSafeAreaInsets()
  const { paragraph, setParagraph } = useCatechismStore()

  const slideX = useSharedValue(0)
  const startX = useSharedValue(0)
  const [panelOpen, setPanelOpen] = useState(false)
  const [readingConfigVisible, setReadingConfigVisible] = useState(false)

  const {
    data: segments = [],
    isLoading: segmentsLoading,
    isError: segmentsError,
    refetch: refetchSegments,
  } = useSegments()
  const currentSegment = useMemo(() => {
    if (segments.length === 0) return undefined
    return (
      segments.find((s) => paragraph >= s.startParagraph && paragraph <= s.endParagraph) ??
      segments[0]
    )
  }, [segments, paragraph])
  const {
    data: paragraphs = [],
    isLoading,
    isError: segmentError,
    refetch: refetchSegment,
  } = useSegment(currentSegment)

  const handleNavigate = useCallback(
    (index: number) => {
      const seg = segments[index]
      if (seg) setParagraph(seg.startParagraph)
    },
    [segments, setParagraph],
  )

  function openTocDrawer() {
    setPanelOpen(true)
    slideX.value = withSpring(tocDrawerWidth, springConfig)
  }

  function openSectionDrawer() {
    setPanelOpen(true)
    slideX.value = withSpring(-sectionDrawerWidth, springConfig)
  }

  function closeDrawer() {
    setPanelOpen(false)
    slideX.value = withSpring(0, springConfig)
  }

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-15, 15])
        .onStart(() => {
          startX.value = slideX.value
        })
        .onUpdate((e) => {
          const min = startX.value > 0 ? 0 : -sectionDrawerWidth
          const max = startX.value < 0 ? 0 : tocDrawerWidth
          slideX.value = clamp(startX.value + e.translationX, min, max)
        })
        .onEnd((e) => {
          const closingFromToc = startX.value > 0
          const closingFromSection = startX.value < 0

          if (closingFromToc && (e.translationX < -20 || e.velocityX < -300)) {
            slideX.value = withSpring(0, springConfig)
            runOnJS(setPanelOpen)(false)
            return
          }
          if (closingFromSection && (e.translationX > 20 || e.velocityX > 300)) {
            slideX.value = withSpring(0, springConfig)
            runOnJS(setPanelOpen)(false)
            return
          }

          if (slideX.value > tocDrawerWidth * 0.4 || (slideX.value > 0 && e.velocityX > 800)) {
            slideX.value = withSpring(tocDrawerWidth, springConfig)
            runOnJS(setPanelOpen)(true)
            return
          }
          if (
            slideX.value < -sectionDrawerWidth * 0.4 ||
            (slideX.value < 0 && e.velocityX < -800)
          ) {
            slideX.value = withSpring(-sectionDrawerWidth, springConfig)
            runOnJS(setPanelOpen)(true)
            return
          }

          slideX.value = withSpring(0, springConfig)
          runOnJS(setPanelOpen)(false)
        }),
    [slideX, startX, tocDrawerWidth, sectionDrawerWidth],
  )

  const stripStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -tocDrawerWidth + slideX.value }],
  }))

  const dimStyle = useAnimatedStyle(() => ({
    opacity: interpolate(slideX.value, [-sectionDrawerWidth, 0, tocDrawerWidth], [0.4, 1, 0.4]),
  }))

  const sectionName = currentSegment?.section ?? t('readingLabel.catechism')
  const paragraphRange = currentSegment
    ? currentSegment.startParagraph === currentSegment.endParagraph
      ? String(currentSegment.startParagraph)
      : `${currentSegment.startParagraph}–${currentSegment.endParagraph}`
    : ''

  function renderContent() {
    if (segmentsError || segmentError) {
      return (
        <ReaderErrorState
          onRetry={() => {
            if (segmentsError) refetchSegments()
            if (segmentError) refetchSegment()
          }}
        />
      )
    }
    if (segmentsLoading || isLoading || !currentSegment) {
      return <PrayerSpinner />
    }
    return (
      <>
        <SegmentContent segment={currentSegment} paragraphs={paragraphs} />
        <SegmentNav
          segments={segments}
          currentIndex={currentSegment.index}
          onNavigate={handleNavigate}
        />
      </>
    )
  }

  return (
    <View flex={1} backgroundColor="$background" overflow="hidden">
      {readingConfigVisible ? (
        <ReadingConfigModal
          visible={readingConfigVisible}
          onClose={() => setReadingConfigVisible(false)}
        />
      ) : undefined}
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.strip, { width: stripWidth }, stripStyle]}>
          {/* TOC drawer */}
          <View style={[styles.tocPanel, { width: tocDrawerWidth }]}>
            <YStack flex={1} paddingTop={insets.top + 12}>
              <YStack paddingHorizontal="$md" paddingBottom="$md" gap="$sm">
                <Text fontFamily="$heading" fontSize="$2" color="$colorSecondary">
                  {t('catechism.toc')}
                </Text>
                <ReadingConfigBadge onPress={() => setReadingConfigVisible(true)} />
              </YStack>
              {segments.length > 0 && (
                <TocTree
                  segments={segments}
                  currentSegmentIndex={currentSegment?.index ?? 0}
                  onSelectSegment={(index) => {
                    handleNavigate(index)
                    closeDrawer()
                  }}
                />
              )}
            </YStack>
          </View>

          {/* Reading content */}
          <Animated.View style={[{ width: screenWidth }, dimStyle]}>
            <ScreenLayout>
              <YStack flex={1}>
                <CatechismHeader
                  sectionName={sectionName}
                  paragraphRange={paragraphRange}
                  onTocPress={openTocDrawer}
                  onSectionPress={openSectionDrawer}
                />
                {renderContent()}
              </YStack>
            </ScreenLayout>
            {panelOpen ? (
              <Pressable
                style={StyleSheet.absoluteFill}
                onPress={closeDrawer}
                accessibilityRole="button"
                accessibilityLabel={t('a11y.closeModal')}
              />
            ) : undefined}
          </Animated.View>

          {/* Section drawer */}
          <View style={[styles.sectionPanel, { width: sectionDrawerWidth }]}>
            <YStack flex={1} paddingTop={insets.top + 12}>
              {segments.length > 0 && (
                <SegmentList
                  segments={segments}
                  currentSegmentIndex={currentSegment?.index ?? 0}
                  onSelectSegment={(index) => {
                    handleNavigate(index)
                    closeDrawer()
                  }}
                />
              )}
            </YStack>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  )
}

const styles = StyleSheet.create({
  strip: {
    flex: 1,
    flexDirection: 'row',
  },
  tocPanel: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: 'rgba(128,128,128,0.3)',
  },
  sectionPanel: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: 'rgba(128,128,128,0.3)',
  },
})
