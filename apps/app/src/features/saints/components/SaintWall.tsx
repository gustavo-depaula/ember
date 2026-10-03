import type { Copy } from '@ember/holy-cards'
import { useFocusEffect } from 'expo-router'
import type { ReactElement } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useWindowDimensions } from 'react-native'
import { View, XStack, YStack } from 'tamagui'
import { Typography } from '@/components/typography'
import type { SaintEntry } from '../data/catalog'
import { useHeldCards } from '../data/collection'
import { useSaintsViewStore } from '../store'
import { SaintShelves, shelfRows } from './SaintShelves'
import { SaintTile } from './SaintTile'

// `flat`: one untitled grid in the order given (a small shelf on its own screen).
export type SaintGrouping = 'shelves' | 'calendar' | 'collected' | 'alpha' | 'flat'

const gap = 12
const columns = 3

type Section = { key: string; title: string; data: SaintEntry[][] }

// Chunk a flat list into fixed-width rows (no native multi-column grid).
function toRows(items: SaintEntry[]): SaintEntry[][] {
  const rows: SaintEntry[][] = []
  for (let i = 0; i < items.length; i += columns) rows.push(items.slice(i, i + columns))
  return rows
}

function titleCase(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s
}

// A saint's sort name with the honorific prefix stripped, so "St. Anne" files
// under A and "Our Lady of Fátima" under F. Handles English + Portuguese forms.
function sortName(name: string): string {
  return name
    .replace(/^(St\.?|Ss\.?|S[ãa]o|Santa|Sta\.?|The|Our Lady of|Nossa Senhora)\s+/i, '')
    .trim()
}

function sortLetter(name: string): string {
  const ch = sortName(name)[0] ?? '#'
  return /[a-zà-ú]/i.test(ch) ? ch.toUpperCase() : '#'
}

function buildSections(
  saints: SaintEntry[],
  grouping: SaintGrouping,
  held: Map<string, Copy[]> | undefined,
  lang: string,
  t: (key: string) => string,
): Section[] {
  if (grouping === 'collected') {
    const collected = saints.filter((s) => held?.has(s.id))
    const rest = saints.filter((s) => !held?.has(s.id))
    return [
      { key: 'collected', title: t('saints.group.collectedLabel'), data: toRows(collected) },
      { key: 'notYet', title: t('saints.group.notYet'), data: toRows(rest) },
    ].filter((s) => s.data.length > 0)
  }

  if (grouping === 'alpha') {
    // Sort and group by the SAME key (the stripped name), then order the
    // buckets by letter — otherwise sections come out in full-name order.
    const buckets = new Map<string, SaintEntry[]>()
    for (const s of [...saints].sort((a, b) => sortName(a.name).localeCompare(sortName(b.name)))) {
      const letter = sortLetter(s.name)
      const arr = buckets.get(letter) ?? []
      arr.push(s)
      buckets.set(letter, arr)
    }
    return [...buckets.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([letter, items]) => ({
        key: `alpha-${letter}`,
        title: letter,
        data: toRows(items),
      }))
  }

  // calendar — by month, then the cards with no fixed date, one section per kind
  // (the catalog is already sorted, so the sections come out in order)
  const monthFmt = new Intl.DateTimeFormat(lang, { month: 'long' })
  const buckets = new Map<string, { title: string; items: SaintEntry[] }>()
  for (const s of saints) {
    const key = s.feast ? `month-${s.feast.month}` : `kind-${s.kind ?? 'devotion'}`
    const bucket = buckets.get(key) ?? {
      title: s.feast
        ? titleCase(monthFmt.format(new Date(2001, s.feast.month - 1, 1)))
        : t(`saints.group.kind.${s.kind ?? 'devotion'}`),
      items: [],
    }
    bucket.items.push(s)
    buckets.set(key, bucket)
  }
  return [...buckets.entries()].map(([key, { title, items }]) => ({
    key,
    title,
    data: toRows(items),
  }))
}

// Rows drawn with the screen, then per step: mounting every card at once froze
// the app for seconds when the gallery opened.
const firstRows = 6
const rowsPerStep = 10

// The grouped gallery, rendered inline so it lives inside the screen's own
// ScrollView (which lets the header flourish bleed into the notch). It isn't
// virtualized; it fills in a few rows at a time instead, over a spacer the height
// of the rows still to come, so the scroll length doesn't grow under the thumb.
export function SaintWall({
  saints,
  grouping,
  searching,
  ListHeaderComponent,
}: {
  saints: SaintEntry[]
  grouping: SaintGrouping
  /** When searching, ignore grouping and show one flat "Results" section. */
  searching?: boolean
  ListHeaderComponent?: ReactElement
}) {
  const { t, i18n } = useTranslation()
  const { width: screenWidth } = useWindowDimensions()
  const setOrderedIds = useSaintsViewStore((s) => s.setOrderedIds)
  // Only the collected grouping reads what's held: a redeem needn't rebuild the others.
  const held = useHeldCards()
  const heldFor = grouping === 'collected' || grouping === 'shelves' ? held : undefined

  const contentWidth = Math.min(screenWidth - 48, 640)
  const itemWidth = (contentWidth - gap * (columns - 1)) / columns

  // Build the sections and the flat display order in one pass: the pager swipes
  // in the same order the wall currently shows (tiles navigate by id).
  const { sections, shelves, orderedIds } = useMemo(() => {
    if (grouping === 'shelves' && !searching) {
      const rows = shelfRows(saints, heldFor ?? new Map())
      return {
        sections: [],
        shelves: rows,
        orderedIds: rows.flatMap((r) => r.items.map((e) => e.id)),
      }
    }
    const built = (() => {
      if (searching) return [{ key: 'results', title: t('saints.results'), data: toRows(saints) }]
      if (grouping === 'flat') return [{ key: 'flat', title: '', data: toRows(saints) }]
      return buildSections(saints, grouping, heldFor, i18n.language || 'en-US', t)
    })()
    return {
      sections: built,
      shelves: undefined,
      orderedIds: built.flatMap((s) => s.data.flat().map((e) => e.id)),
    }
  }, [saints, grouping, heldFor, searching, i18n.language, t])

  // On focus too: a shelf's screen publishes its own order over the album's.
  useFocusEffect(
    useCallback(() => {
      setOrderedIds(orderedIds)
    }, [orderedIds, setOrderedIds]),
  )

  const totalRows = sections.reduce((n, section) => n + section.data.length, 0)
  // Start over on a new view, not on each keystroke of a search.
  const view = searching ? 'search' : grouping
  const [drawn, setDrawn] = useState({ view, rows: firstRows })
  const rows = drawn.view === view ? drawn.rows : firstRows
  useEffect(() => {
    if (rows >= totalRows) return
    // A frame between steps keeps scrolling and taps alive while the wall fills in.
    const frame = requestAnimationFrame(() => setDrawn({ view, rows: rows + rowsPerStep }))
    return () => cancelAnimationFrame(frame)
  }, [rows, totalRows, view])

  let budget = rows
  const visible = sections.flatMap((section) => {
    const data = section.data.slice(0, budget)
    budget -= data.length
    return data.length > 0 ? [{ ...section, data }] : []
  })
  const rowHeight = itemWidth * 1.5 + gap

  if (shelves) {
    return (
      <YStack>
        {ListHeaderComponent}
        <SaintShelves rows={shelves} />
      </YStack>
    )
  }

  return (
    <YStack>
      {ListHeaderComponent}
      {visible.map((section) => (
        <YStack key={section.key} gap={gap} paddingTop="$lg">
          {section.title && (
            <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
              {section.title}
            </Typography>
          )}
          <YStack gap={gap}>
            {section.data.map((row, i) => (
              <XStack key={`${section.key}-${row[0]?.id ?? i}`} gap={gap} alignItems="flex-start">
                {row.map((saint) => (
                  <SaintTile
                    key={saint.id}
                    saint={saint}
                    width={itemWidth}
                    label={t('saints.cardLink', { name: saint.name })}
                  />
                ))}
              </XStack>
            ))}
          </YStack>
        </YStack>
      ))}
      <View height={Math.max(0, totalRows - rows) * rowHeight} />
    </YStack>
  )
}
