import { Link } from 'expo-router'
import type { ReactElement } from 'react'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, useWindowDimensions } from 'react-native'
import { XStack, YStack } from 'tamagui'
import { Typography } from '@/components/typography'
import type { SaintEntry } from '../data/catalog'
import { isCollected } from '../data/collection'
import { useSaintsViewStore } from '../store'
import { SaintCardTile } from './SaintCardTile'

export type SaintGrouping = 'calendar' | 'collected' | 'alpha'

const gap = 12
const columns = 2

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
  lang: string,
  t: (key: string) => string,
): Section[] {
  if (grouping === 'collected') {
    const collected = saints.filter(isCollected)
    const rest = saints.filter((s) => !isCollected(s))
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

  // calendar — by month, in liturgical-year order (the catalog is already sorted)
  const monthFmt = new Intl.DateTimeFormat(lang, { month: 'long' })
  const buckets = new Map<number, SaintEntry[]>()
  for (const s of saints) {
    const month = s.feast?.month ?? 13
    const arr = buckets.get(month) ?? []
    arr.push(s)
    buckets.set(month, arr)
  }
  return [...buckets.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([month, items]) => ({
      key: `month-${month}`,
      title:
        month === 13
          ? t('saints.group.undated')
          : titleCase(monthFmt.format(new Date(2001, month - 1, 1))),
      data: toRows(items),
    }))
}

// The grouped gallery, rendered inline so it lives inside the screen's own
// ScrollView (which lets the header flourish bleed into the notch). At the
// current card count this needs no virtualization; revisit if the full
// sanctoral (hundreds) is ever shown at once.
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

  const contentWidth = Math.min(screenWidth - 48, 640)
  const itemWidth = (contentWidth - gap) / columns

  // Build the sections and the flat display order in one pass: the pager swipes
  // in the same order the wall currently shows (tiles navigate by id).
  const { sections, orderedIds } = useMemo(() => {
    const built = searching
      ? [{ key: 'results', title: t('saints.results'), data: toRows(saints) }]
      : buildSections(saints, grouping, i18n.language || 'en-US', t)
    return { sections: built, orderedIds: built.flatMap((s) => s.data.flat().map((e) => e.id)) }
  }, [saints, grouping, searching, i18n.language, t])

  useEffect(() => {
    setOrderedIds(orderedIds)
  }, [orderedIds, setOrderedIds])

  return (
    <YStack>
      {ListHeaderComponent}
      {sections.map((section) => (
        <YStack key={section.key} gap={gap} paddingTop="$lg">
          <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
            {section.title}
          </Typography>
          <YStack gap={gap}>
            {section.data.map((row, i) => (
              <XStack key={`${section.key}-${row[0]?.id ?? i}`} gap={gap}>
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
    </YStack>
  )
}

function SaintTile({ saint, width, label }: { saint: SaintEntry; width: number; label: string }) {
  return (
    // The `[index]` route param carries the saint's id (the viewer locates it in
    // the wall's published order), not a positional index. A plain Link (not the
    // AppleZoom morph) gives a reliable modal present/dismiss.
    <Link href={{ pathname: '/saints/[index]', params: { index: saint.id } }} push asChild>
      <Pressable accessibilityRole="link" accessibilityLabel={label}>
        <SaintCardTile saint={saint} width={width} showLabel />
      </Pressable>
    </Link>
  )
}
