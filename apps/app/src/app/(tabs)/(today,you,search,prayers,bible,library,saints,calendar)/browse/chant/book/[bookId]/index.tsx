import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronRight } from 'lucide-react-native'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Pressable, type ViewToken } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Polygon } from 'react-native-svg'
import { useTheme, XStack, YStack } from 'tamagui'

import { InlineRetry, Typography } from '@/components'
import { useBottomClearance } from '@/components/tabAccessory'
import { BackHeader } from '@/features/chant/BackHeader'
import {
  type ChantBook,
  type ChantBookGroup,
  type ChantBookSection,
  chantSummary,
  romanMode,
  sectionLabel,
} from '@/features/chant/chants'
import { useChantBook, useChantWeek } from '@/features/chant/hooks'
import { pageOfDay } from '@/features/chant/library'
import { chantHref, chantPageHref } from '@/features/chant/routes'
import { ThumbIndex } from '@/features/chant/ThumbIndex'
import { localizeContent } from '@/lib/i18n'

type Row =
  | { kind: 'part'; key: string; title: string }
  | { kind: 'group'; key: string; group: ChantBookGroup }
  | { kind: 'page'; key: string; section: ChantBookSection }
  | { kind: 'shelf'; key: string; section: ChantBookSection }
  | { kind: 'chant'; key: string; chant: string }

// Every row has a fixed height, so the thumb index can jump to a group at once.
const heights: Record<Row['kind'], number> = { part: 64, group: 52, page: 44, shelf: 52, chant: 44 }
const gutter = 24
const indexWidth = 36

function rowsOf(book: ChantBook): Row[] {
  if (book.list === 'chants') {
    return book.sections.flatMap((section): Row[] => [
      { kind: 'shelf', key: section.id, section },
      ...section.chants.map(
        (chant): Row => ({ kind: 'chant', key: `${section.id}/${chant}`, chant }),
      ),
    ])
  }
  const groups = new Map((book.groups ?? []).map((g) => [g.id, g]))
  const parts = new Map((book.parts ?? []).map((p) => [p.id, p]))
  const rows: Row[] = []
  let part: string | undefined
  let group: string | undefined
  for (const section of book.sections) {
    const g = section.group ? groups.get(section.group) : undefined
    if (g && g.part !== part) {
      part = g.part
      const title = parts.get(g.part)?.title
      if (title) rows.push({ kind: 'part', key: `part-${g.part}`, title: localizeContent(title) })
    }
    if (g && g.id !== group) {
      group = g.id
      rows.push({ kind: 'group', key: `group-${g.id}`, group: g })
    }
    rows.push({ kind: 'page', key: section.id, section })
  }
  return rows
}

// A book's table of contents, as a printed one sets it: the Mass or the day,
// a dotted leader, the incipit it opens with. The thumb index on the edge
// jumps through the seasons and the months, and a red ribbon marks today.
export default function ChantBookScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const bottomClearance = useBottomClearance()
  const { bookId } = useLocalSearchParams<{ bookId: string }>()
  const book = useChantBook(`chant-book/${bookId}`)
  const week = useChantWeek()
  const list = useRef<FlatList<Row>>(null)
  const [headerHeight, setHeaderHeight] = useState(0)
  const [visibleGroup, setVisibleGroup] = useState<string>()

  const rows = useMemo(() => (book.data ? rowsOf(book.data) : []), [book.data])
  const layout = useMemo(() => {
    let offset = 0
    return rows.map((row) => {
      const at = { length: heights[row.kind], offset }
      offset += at.length
      return at
    })
  }, [rows])
  const groupRow = useMemo(
    () =>
      new Map(rows.flatMap((row, i) => (row.kind === 'group' ? [[row.group.id, i] as const] : []))),
    [rows],
  )
  const today = book.data && week.data?.[0] ? pageOfDay(book.data, week.data[0]) : undefined
  const name = book.data ? localizeContent(book.data.name) : t('chant.title')

  const openPage = useCallback(
    (section: ChantBookSection) => router.push(chantPageHref(bookId, section.id)),
    [router, bookId],
  )
  const openChant = useCallback((chant: string) => router.push(chantHref(chant)), [router])

  const onViewable = useCallback(({ viewableItems }: { viewableItems: ViewToken<Row>[] }) => {
    const first = viewableItems.find((v) => v.item.kind === 'page')?.item
    if (first?.kind === 'page' && first.section.group) setVisibleGroup(first.section.group)
  }, [])

  const renderItem = useCallback(
    ({ item }: { item: Row }) => {
      switch (item.kind) {
        case 'part':
          return (
            <YStack height={heights.part} justifyContent="flex-end" paddingBottom="$sm">
              <Typography variant="marker">{item.title}</Typography>
            </YStack>
          )
        case 'group':
        case 'shelf':
          return (
            <YStack height={heights.group} justifyContent="flex-end" paddingBottom={6}>
              <Typography variant="section-title" numberOfLines={1}>
                {localizeContent(item.kind === 'group' ? item.group.title : item.section.title)}
              </Typography>
            </YStack>
          )
        case 'page': {
          const { section } = item
          const title = localizeContent(section.title)
          const opens = section.name ?? (section.chants[0] && chantSummary(section.chants[0]).name)
          return (
            <Leader
              title={title}
              trail={opens}
              italic
              highlight={section.id === today?.id}
              onPress={() => openPage(section)}
              label={t('a11y.openChants', { name: title })}
            />
          )
        }
        case 'chant': {
          const { name: chantName, mode } = chantSummary(item.chant)
          return (
            <Leader
              title={chantName}
              trail={romanMode(mode)}
              onPress={() => openChant(item.chant)}
              label={t('a11y.openChants', { name: chantName })}
            />
          )
        }
      }
    },
    [openPage, openChant, t, today?.id],
  )

  const groups = book.data?.list === 'chants' ? [] : (book.data?.groups ?? [])

  return (
    <YStack flex={1} backgroundColor="$background" paddingTop={insets.top}>
      <Stack.Screen options={{ title: name }} />
      <BackHeader gutter={gutter - 4} />
      <YStack flex={1}>
        <FlatList
          ref={list}
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingLeft: gutter,
            paddingRight: groups.length ? gutter + indexWidth - 8 : gutter,
            paddingBottom: insets.bottom + bottomClearance + 24,
          }}
          data={rows}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={(_, index) => ({
            length: layout[index]?.length ?? 0,
            offset: headerHeight + (layout[index]?.offset ?? 0),
            index,
          })}
          onViewableItemsChanged={onViewable}
          initialNumToRender={30}
          ListHeaderComponent={
            <YStack
              gap="$xs"
              paddingBottom="$sm"
              onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
            >
              <Typography variant="screen-title">{name}</Typography>
              {book.data && (
                <Typography variant="annotation">
                  {localizeContent(book.data.description)}
                </Typography>
              )}
              {book.isError && <InlineRetry onRetry={() => book.refetch()} />}
              {today && (
                <Pressable
                  onPress={() => openPage(today)}
                  accessibilityRole="link"
                  accessibilityLabel={`${t('chant.today')}, ${localizeContent(today.title)}`}
                >
                  <XStack
                    marginTop="$md"
                    paddingVertical="$sm"
                    gap="$md"
                    alignItems="center"
                    borderTopWidth={1}
                    borderBottomWidth={1}
                    borderColor="$borderColor"
                  >
                    <Ribbon color={theme.colorBurgundy.val} />
                    <YStack flex={1}>
                      <Typography
                        variant="label"
                        fontSize="$1"
                        letterSpacing={1.4}
                        color="$colorBurgundy"
                      >
                        {t('chant.today')}
                      </Typography>
                      <Typography fontSize="$3" numberOfLines={1}>
                        {sectionLabel(today)}
                      </Typography>
                    </YStack>
                    <ChevronRight size={18} color={theme.colorSecondary.val} />
                  </XStack>
                </Pressable>
              )}
            </YStack>
          }
          showsVerticalScrollIndicator={false}
        />
        {groups.length > 1 && (
          <ThumbIndex
            groups={groups}
            current={visibleGroup}
            bookName={name}
            bottom={insets.bottom + bottomClearance + 12}
            onPick={(group) => {
              const index = groupRow.get(group.id)
              if (index !== undefined) list.current?.scrollToIndex({ index, animated: false })
              setVisibleGroup(group.id)
            }}
          />
        )}
      </YStack>
    </YStack>
  )
}

const keyExtractor = (row: Row) => row.key
const leaderDots = ' .'.repeat(120)

/** A contents line: the title, a dotted leader, what it opens with. */
function Leader({
  title,
  trail,
  italic = false,
  highlight = false,
  onPress,
  label,
}: {
  title: string
  trail?: string
  italic?: boolean
  highlight?: boolean
  onPress: () => void
  label: string
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="link" accessibilityLabel={label}>
      <XStack height={heights.page} alignItems="center">
        <Typography
          fontSize="$3"
          numberOfLines={1}
          flexShrink={1}
          color={highlight ? '$colorBurgundy' : '$color'}
        >
          {title}
        </Typography>
        {/* A leader of dots, clipped to the space between: a one-sided dotted
            border draws nothing on iOS. */}
        <YStack
          flex={1}
          minWidth={16}
          marginHorizontal={6}
          overflow="hidden"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Typography fontSize="$1" tone="muted" numberOfLines={1} ellipsizeMode="clip">
            {leaderDots}
          </Typography>
        </YStack>
        {trail && (
          <Typography
            fontSize="$2"
            fontStyle={italic ? 'italic' : 'normal'}
            tone="muted"
            numberOfLines={1}
            maxWidth="48%"
          >
            {trail}
          </Typography>
        )}
      </XStack>
    </Pressable>
  )
}

/** The bookmark ribbon that marks today's page. */
function Ribbon({ color }: { color: string }) {
  return (
    <Svg
      width={10}
      height={30}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Polygon points="0,0 10,0 10,30 5,23 0,30" fill={color} />
    </Svg>
  )
}
