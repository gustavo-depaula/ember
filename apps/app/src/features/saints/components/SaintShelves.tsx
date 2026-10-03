import type { Copy } from '@ember/holy-cards'
import { Link } from 'expo-router'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Pressable, StyleSheet } from 'react-native'
import { XStack, YStack } from 'tamagui'
import { Typography } from '@/components/typography'
import { type AlbumShelf, albumShelves, type SaintEntry } from '../data/catalog'
import { SaintTile } from './SaintTile'

export type ShelfRow = { shelf: AlbumShelf; items: SaintEntry[]; held: number }

/** The album's shelves in order, each with the cards held first. */
export function shelfRows(saints: SaintEntry[], held: Map<string, Copy[]>): ShelfRow[] {
  return albumShelves.flatMap((shelf) => {
    const items = saints.filter((s) => s.shelf === shelf)
    if (items.length === 0) return []
    const mine = items.filter((s) => held.has(s.id))
    const rest = items.filter((s) => !held.has(s.id))
    return [{ shelf, items: [...mine, ...rest], held: mine.length }]
  })
}

// Narrow enough that the next card peeks in from the edge: the row scrolls.
const tileWidth = 104

/**
 * The album by shelves: Our Lord, Our Lady, the Angels and the saints in the
 * Litany's order, then the year, the Rosary and the Mass. Each shelf is a row
 * to swipe through; its heading opens the whole shelf.
 */
export function SaintShelves({ rows }: { rows: ShelfRow[] }) {
  return (
    <YStack gap="$lg" paddingTop="$lg">
      {rows.map((row) => (
        <Shelf key={row.shelf} row={row} />
      ))}
    </YStack>
  )
}

function Shelf({ row }: { row: ShelfRow }) {
  const { t } = useTranslation()
  const title = t(`saints.group.shelf.${row.shelf}`)
  const renderItem = useCallback(
    ({ item }: { item: SaintEntry }) => (
      <SaintTile saint={item} width={tileWidth} label={t('saints.cardLink', { name: item.name })} />
    ),
    [t],
  )
  return (
    <YStack gap="$sm">
      <Link href={{ pathname: '/saints/shelf/[shelf]', params: { shelf: row.shelf } }} asChild>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={t('saints.group.seeAll', { name: title })}
          hitSlop={8}
        >
          <XStack alignItems="baseline" gap="$sm">
            <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
              {title}
            </Typography>
            <Typography variant="annotation" color="$colorSecondary" flex={1}>
              {row.held} / {row.items.length}
            </Typography>
            <Typography variant="label" color="$accentHover">
              →
            </Typography>
          </XStack>
        </Pressable>
      </Link>
      <FlatList
        data={row.items}
        renderItem={renderItem}
        keyExtractor={(s) => s.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        initialNumToRender={4}
        windowSize={3}
        maxToRenderPerBatch={4}
      />
    </YStack>
  )
}

const styles = StyleSheet.create({
  // Room for a held card's stacked copies, which peek below and to the right.
  row: { gap: 12, paddingRight: 24, paddingBottom: 8 },
})
