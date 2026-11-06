import { Star } from 'lucide-react-native'
import { memo, useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Pressable, ScrollView, useWindowDimensions, type ViewToken } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, XStack, YStack } from 'tamagui'

import { InlineRetry, Typography } from '@/components'
import { useBottomClearance } from '@/components/tabAccessory'
import { useSaveToggle } from '@/features/library/savedHooks'
import { readingScale, useReadingFontSizePx } from '@/hooks/useReadingStyle'
import { localizeContent } from '@/lib/i18n'
import { BackHeader } from './BackHeader'
import { type ChantBookSection, chantSummary, romanMode } from './chants'
import { useChant } from './hooks'
import { PlayToggle } from './PlayToggle'
import { ScoreView } from './ScoreView'
import type { ChantGenre } from './textKey'

const gutter = 20
// A staff wider than this spreads its neumes too thin to read as phrases.
const maxScoreWidth = 720
// The chant whose top has passed this far into the sheet is the one being read.
const viewability = { itemVisiblePercentThreshold: 20 }

type Head = NonNullable<ChantBookSection['heads']>[number]
type Tab = { label: string; at: number }

/**
 * A page of a chant book read as one sheet, the way a missal prints it: each
 * chant under its part in red, one after another, with a strip of the parts
 * fixed above that follows the reading and jumps on a tap. An Office day's
 * strip names its hours; a Mass's, its parts.
 */
export function ChantSheet({
  title,
  chants,
  heads = [],
  parts,
  hours = false,
}: {
  title: string
  chants: string[]
  /** The part each chant is sung as, where the page says (`ChantBookSection.parts`). */
  parts?: ChantGenre[]
  /** Rubrics printed before a chant: an hour of the Office, "Tempore Paschali". */
  heads?: Head[]
  /** The heads are the Office's hours, which the strip then names. */
  hours?: boolean
}) {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const bottomClearance = useBottomClearance()
  const { width: pageWidth } = useWindowDimensions()
  const scoreWidth = Math.min(pageWidth, maxScoreWidth) - gutter * 2
  const list = useRef<FlatList<string>>(null)
  const [current, setCurrent] = useState(0)

  const tabs = useMemo(
    (): Tab[] =>
      hours
        ? heads.map((head) => ({ label: head.short ?? localizeContent(head.title), at: head.at }))
        : chants.map((chant, at) => {
            const genre = parts?.[at] ?? chantSummary(chant).genre
            return { label: genre ? t(`chant.genreShort.${genre}`) : String(at + 1), at }
          }),
    [chants, heads, hours, parts, t],
  )
  const headAt = useMemo(() => new Map(heads.map((h) => [h.at, h])), [heads])

  const onViewable = useCallback(({ viewableItems }: { viewableItems: ViewToken<string>[] }) => {
    const first = viewableItems[0]?.index
    if (typeof first === 'number') setCurrent(first)
  }, [])

  const jump = useCallback((at: number) => {
    setCurrent(at)
    list.current?.scrollToIndex({ index: at, viewOffset: 8 })
  }, [])

  const renderItem = useCallback(
    ({ item, index }: { item: string; index: number }) => {
      const head = headAt.get(index)
      return (
        <YStack paddingTop={index === 0 ? 0 : 40} gap="$sm">
          {head && (
            <Typography variant={hours ? 'marker' : 'rubric'} paddingBottom={hours ? '$sm' : 0}>
              {localizeContent(head.title)}
            </Typography>
          )}
          <SheetChant id={item} part={parts?.[index]} width={scoreWidth} />
        </YStack>
      )
    },
    [headAt, hours, parts, scoreWidth],
  )

  return (
    <YStack flex={1} backgroundColor="$background" paddingTop={insets.top}>
      <BackHeader title={title} gutter={gutter} />
      {tabs.length > 1 && <SheetTabs tabs={tabs} current={current} onJump={jump} />}
      <FlatList
        ref={list}
        style={{ flex: 1 }}
        contentContainerStyle={{
          width: scoreWidth,
          alignSelf: 'center',
          paddingTop: 12,
          paddingBottom: insets.bottom + bottomClearance + 48,
        }}
        data={chants}
        renderItem={renderItem}
        keyExtractor={(chant) => chant}
        // A day of the Office sets thirty scores: engrave the few in view, and the rest as they near.
        initialNumToRender={3}
        windowSize={5}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={viewability}
        // Heights are only known once engraved: land near, let the list measure, then land exactly.
        onScrollToIndexFailed={({ index, averageItemLength }) => {
          list.current?.scrollToOffset({ offset: index * averageItemLength, animated: false })
          setTimeout(() => list.current?.scrollToIndex({ index, viewOffset: 8 }), 60)
        }}
        ListEmptyComponent={<Typography tone="muted">{t('chant.noChants')}</Typography>}
        showsVerticalScrollIndicator={false}
      />
    </YStack>
  )
}

/** The strip of the sheet's parts or hours: the one in reading underlined, a tap to jump. */
const SheetTabs = memo(function SheetTabs({
  tabs,
  current,
  onJump,
}: {
  tabs: Tab[]
  current: number
  onJump: (at: number) => void
}) {
  const { t } = useTranslation()
  const selected = tabs.reduce((on, tab, i) => (tab.at <= current ? i : on), 0)
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0 }}
      contentContainerStyle={{ paddingHorizontal: gutter, gap: 18 }}
      accessibilityRole="tablist"
      accessibilityLabel={t('a11y.chantParts')}
    >
      {tabs.map((tab, i) => {
        const on = i === selected
        return (
          <Pressable
            key={`${tab.at}-${tab.label}`}
            onPress={() => onJump(tab.at)}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: on }}
          >
            <YStack minHeight={44} justifyContent="center">
              <YStack
                paddingBottom={3}
                borderBottomWidth={1.5}
                borderBottomColor={on ? '$accent' : 'transparent'}
              >
                <Typography
                  variant="label"
                  fontSize="$1"
                  letterSpacing={1.2}
                  color={on ? '$colorBurgundy' : '$colorSecondary'}
                >
                  {tab.label}
                </Typography>
              </YStack>
            </YStack>
          </Pressable>
        )
      })}
    </ScrollView>
  )
})

/** One chant of the sheet: its part and mode in red, its incipit, the score, where it was read from. */
const SheetChant = memo(function SheetChant({
  id,
  part: sungAs,
  width,
}: {
  id: string
  part?: ChantGenre
  width: number
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  // The score follows the reader's text size, as every other page does.
  const scale = useReadingFontSizePx() / readingScale.fontSize[2]
  const query = useChant(id)
  const chant = query.data
  const summary = chantSummary(id)
  const { saved, isWorking, toggle } = useSaveToggle(id, 'chant')

  const genre = sungAs ?? summary.genre
  const part = [
    genre && t(`chant.genre.${genre}`),
    summary.mode && t('chant.mode', { mode: romanMode(summary.mode) }),
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <YStack gap="$md">
      <XStack alignItems="flex-start" gap="$sm">
        <YStack flex={1} gap={2}>
          {part !== '' && (
            <Typography variant="label" fontSize="$1" letterSpacing={1.4} color="$colorBurgundy">
              {part}
            </Typography>
          )}
          <Typography variant="sacred-title" textAlign="left">
            {summary.name}
          </Typography>
        </YStack>
        {chant && <PlayToggle id={id} score={chant.score} name={summary.name} />}
        <Pressable
          onPress={toggle}
          disabled={isWorking}
          hitSlop={6}
          accessibilityRole="switch"
          accessibilityState={{ checked: saved, busy: isWorking }}
          accessibilityLabel={t(saved ? 'a11y.unsaveChant' : 'a11y.saveChant', {
            name: summary.name,
          })}
        >
          <YStack width={44} height={44} alignItems="center" justifyContent="center">
            <Star
              size={20}
              color={saved ? theme.accent.val : theme.colorSecondary.val}
              fill={saved ? theme.accent.val : 'none'}
            />
          </YStack>
        </Pressable>
      </XStack>
      {query.isError && <InlineRetry onRetry={() => query.refetch()} />}
      {chant === null && <Typography tone="muted">{t('chant.notFound')}</Typography>}
      {chant && (
        <>
          <ScoreView score={chant.score} width={width} scale={scale} label={summary.name} />
          <Typography variant="reference">
            {[
              chant.book,
              chant.transcriber && t('chant.transcribedBy', { name: chant.transcriber }),
              t('chant.license'),
            ]
              .filter(Boolean)
              .join(' · ')}
          </Typography>
        </>
      )}
    </YStack>
  )
})
