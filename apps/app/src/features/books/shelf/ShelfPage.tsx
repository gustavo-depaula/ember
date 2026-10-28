import { Stack } from 'expo-router'
import type { ReactElement, ReactNode } from 'react'
import { FlatList, type ListRenderItem } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { YStack } from 'tamagui'

import { HubFrame, HubHeader, PageHeader, useHubList } from '@/components'
import { useBottomClearance } from '@/components/tabAccessory'
import { Typography } from '@/components/typography'

/**
 * A page of the Books screen that can run long: its title, a line under it,
 * whatever sits above the list, then the list itself, virtualized because a
 * single author can have a hundred and sixty volumes, each a drawn cover.
 */
export function ShelfPage<T>({
  title,
  lede,
  header,
  data,
  renderItem,
  keyExtractor,
  empty,
}: {
  title: string
  lede?: string
  header?: ReactNode
  data: T[]
  renderItem: ListRenderItem<T>
  keyExtractor: (item: T) => string
  empty?: ReactElement
}) {
  return (
    <HubFrame>
      <Stack.Screen options={{ title }} />
      <ShelfList
        title={title}
        lede={lede}
        header={header}
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        empty={empty}
      />
    </HubFrame>
  )
}

// Inside the frame, so the list takes its side padding from the hub's column.
function ShelfList<T>({
  title,
  lede,
  header,
  data,
  renderItem,
  keyExtractor,
  empty,
}: {
  title: string
  lede?: string
  header?: ReactNode
  data: T[]
  renderItem: ListRenderItem<T>
  keyExtractor: (item: T) => string
  empty?: ReactElement
}) {
  const insets = useSafeAreaInsets()
  const bottomClearance = useBottomClearance()
  const { paddingLeft, paddingRight, onScroll, scrollEventThrottle } = useHubList()
  return (
    <FlatList
      style={{ flex: 1 }}
      contentContainerStyle={{
        paddingLeft,
        paddingRight,
        paddingTop: insets.top,
        paddingBottom: insets.bottom + bottomClearance + 24,
      }}
      contentInsetAdjustmentBehavior="never"
      onScroll={onScroll}
      scrollEventThrottle={scrollEventThrottle}
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={
        <HubHeader>
          <YStack paddingTop="$lg" paddingBottom="$lg" gap="$md">
            <PageHeader title={title} />
            {lede ? <Typography variant="caption">{lede}</Typography> : null}
            {header}
          </YStack>
        </HubHeader>
      }
      ListEmptyComponent={empty}
      // Every cover is an SVG: only a screenful is drawn ahead.
      initialNumToRender={12}
      windowSize={7}
      showsVerticalScrollIndicator={false}
    />
  )
}
