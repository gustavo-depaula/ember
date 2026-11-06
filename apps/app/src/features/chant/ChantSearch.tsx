import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import type { TFunction } from 'i18next'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet } from 'react-native'
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg'
import { Text, XStack, YStack } from 'tamagui'

import { AnimatedPressable, Typography } from '@/components'
import { artFor } from '@/features/explore/artMap'
import { blockInk } from '@/features/explore/bgColor'
import { CardRow } from '@/features/explore/CardRow'
import { useSavedItems } from '@/features/library/savedHooks'
import { ChantRow } from './ChantRow'
import { romanMode } from './chants'
import { useChantEntries } from './hooks'
import { genreOrder, occasions, searchChants } from './library'
import { chantListHref } from './routes'
import type { ChantGenre } from './textKey'

const modes = ['1', '2', '3', '4', '5', '6', '7', '8']
// A group of results shows this many before "see all".
const shown = 8

/** Before a search is typed: what was kept, and the ways into the library a search would otherwise need. */
export function ChantSearchStart() {
  const { t } = useTranslation()
  const router = useRouter()
  const savedItems = useSavedItems()
  const saved = (savedItems.data ?? []).filter((s) => s.kind === 'chant').map((s) => s.itemId)

  const openList = (params: Record<string, string>) => router.push(chantListHref(params))

  return (
    <YStack gap="$lg" paddingTop="$md">
      {saved.length > 0 && (
        <YStack>
          <Typography variant="label" paddingBottom="$xs">
            {t('chant.saved')}
          </Typography>
          {saved.map((id) => (
            <ChantRow key={id} id={id} />
          ))}
        </YStack>
      )}

      <YStack>
        <Typography variant="label" paddingBottom="$xs">
          {t('chant.byForm')}
        </Typography>
        {/* Spaced, not dotted: a separator would start a wrapped line. */}
        <XStack flexWrap="wrap" alignItems="center" columnGap="$lg">
          {genreOrder.map((genre) => (
            <Pressable
              key={genre}
              onPress={() => openList({ genre })}
              hitSlop={{ top: 8, bottom: 8 }}
              accessibilityRole="link"
              accessibilityLabel={t(`chant.genres.${genre}`)}
            >
              <Typography fontSize="$3" lineHeight={36} color="$colorMutedBlue">
                {t(`chant.genres.${genre}`)}
              </Typography>
            </Pressable>
          ))}
        </XStack>
      </YStack>

      <YStack>
        <Typography variant="label" paddingBottom="$xs">
          {t('chant.byMode')}
        </Typography>
        <XStack justifyContent="space-between">
          {modes.map((mode) => (
            <Pressable
              key={mode}
              onPress={() => openList({ mode })}
              accessibilityRole="link"
              accessibilityLabel={t('chant.mode', { mode: romanMode(mode) })}
            >
              <YStack minWidth={36} height={44} alignItems="center" justifyContent="center">
                <Typography fontFamily="$title" fontSize="$4" color="$colorMutedBlue">
                  {romanMode(mode)}
                </Typography>
              </YStack>
            </Pressable>
          ))}
        </XStack>
      </YStack>

      <YStack>
        <Typography variant="label" paddingBottom="$sm">
          {t('chant.occasions')}
        </Typography>
        <CardRow>
          {occasions.map(({ id, art }) => {
            const title = t(`chant.occasion.${id}`)
            return (
              <AnimatedPressable
                key={id}
                onPress={() => openList({ occasion: id })}
                accessibilityRole="link"
                accessibilityLabel={title}
              >
                <YStack
                  width={130}
                  height={110}
                  borderRadius={16}
                  overflow="hidden"
                  justifyContent="flex-end"
                >
                  <Image
                    source={artFor(art)}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                    transition={200}
                    cachePolicy="memory-disk"
                  />
                  {/* Bottom scrim so the cream title reads over any painting. */}
                  <Svg width={130} height={110} style={StyleSheet.absoluteFill}>
                    <Defs>
                      <LinearGradient id={`occ-${id}`} x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0.35" stopColor="#000000" stopOpacity="0" />
                        <Stop offset="1" stopColor="#000000" stopOpacity="0.62" />
                      </LinearGradient>
                    </Defs>
                    <Rect width={130} height={110} fill={`url(#occ-${id})`} />
                  </Svg>
                  <Text
                    fontFamily="$title"
                    fontSize={17}
                    color={blockInk}
                    padding="$sm"
                    numberOfLines={2}
                  >
                    {title}
                  </Text>
                </YStack>
              </AnimatedPressable>
            )
          })}
        </CardRow>
      </YStack>
    </YStack>
  )
}

export type SearchRow =
  | { kind: 'group'; key: string; genre?: ChantGenre; count: number }
  | { kind: 'chant'; key: string; id: string }
  | { kind: 'more'; key: string; genre?: ChantGenre; count: number }

/** The chants a query finds, grouped by form in the Mass's order then the Office's, prayers last. */
export function useChantSearchRows(query: string, texts: Record<string, string> | undefined) {
  const entries = useChantEntries()
  return useMemo((): SearchRow[] => {
    const byGenre = new Map<ChantGenre | undefined, string[]>()
    for (const { id, genre } of searchChants(query, entries, texts)) {
      const list = byGenre.get(genre)
      if (list) list.push(id)
      else byGenre.set(genre, [id])
    }
    return [...genreOrder, undefined].flatMap((genre): SearchRow[] => {
      const list = byGenre.get(genre)
      if (!list) return []
      const key = genre ?? 'prayers'
      const more: SearchRow[] =
        list.length > shown ? [{ kind: 'more', key: `m-${key}`, genre, count: list.length }] : []
      return [
        { kind: 'group', key: `g-${key}`, genre, count: list.length },
        ...list.slice(0, shown).map((id): SearchRow => ({ kind: 'chant', key: id, id })),
        ...more,
      ]
    })
  }, [query, entries, texts])
}

export function groupTitle(t: TFunction, genre: ChantGenre | undefined): string {
  return genre ? t(`chant.genres.${genre}`) : t('chant.prayers')
}
