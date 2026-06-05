import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useMemo } from 'react'
import { Pressable, useColorScheme } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, useTheme, XStack, YStack } from 'tamagui'
import { PrayerSpinner, ScreenLayout } from '@/components'
import { getBookEntry } from '@/content/resolver'
import {
  buildTitleLookup,
  flattenTocLeaves,
  getChapterBody,
  loadBookContent,
} from '@/features/books/bookReader'
import { localizeContent } from '@/lib/i18n'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { FoliateReader } from './FoliateReader'

type Props = { bookId: string }

/**
 * POC orchestrator that loads a book via the existing corpus loader and feeds
 * every chapter's body HTML to `FoliateReader`. Intentionally minimal — no
 * chapter buffering, no cursor save, no settings UI, no fancy chrome. The
 * goal is to prove foliate-js's paginator works inside react-native-webview
 * before investing in the surrounding ergonomics.
 */
export function FoliateBookScreen({ bookId }: Props) {
  const router = useRouter()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const systemScheme = useColorScheme()
  const themePref = usePreferencesStore((s) => s.theme)
  const contentLanguage = usePreferencesStore((s) => s.contentLanguage)
  const isDark = themePref === 'system' ? systemScheme === 'dark' : themePref === 'dark'

  const bookEntry = useMemo(() => getBookEntry(bookId), [bookId])

  const lang = useMemo(() => {
    if (!bookEntry) return 'en-US'
    const langs = bookEntry.languages ?? []
    return langs.includes(contentLanguage) ? contentLanguage : (langs[0] ?? 'en-US')
  }, [bookEntry, contentLanguage])

  const leaves = useMemo(
    () => (bookEntry?.toc ? flattenTocLeaves(bookEntry.toc) : []),
    [bookEntry?.toc],
  )
  const titleLookup = useMemo(
    () => (bookEntry?.toc ? buildTitleLookup(bookEntry.toc, lang) : new Map<string, string>()),
    [bookEntry?.toc, lang],
  )

  const { data, isLoading } = useQuery({
    queryKey: ['foliate-book', bookId, lang],
    queryFn: () =>
      loadBookContent(
        bookId,
        lang,
        leaves.map((l) => l.id),
      ),
    enabled: !!bookId && !!bookEntry && leaves.length > 0,
    staleTime: Number.POSITIVE_INFINITY,
  })

  const chapterHtmls = useMemo(() => {
    if (!data) return []
    return leaves.map((leaf) => getChapterBody(data, leaf.id, titleLookup.get(leaf.id)))
  }, [data, leaves, titleLookup])

  const title = bookEntry ? localizeContent(bookEntry.name) : ''

  if (!bookEntry || isLoading || chapterHtmls.length === 0) {
    return (
      <ScreenLayout>
        <PrayerSpinner />
      </ScreenLayout>
    )
  }

  return (
    <YStack
      flex={1}
      backgroundColor={isDark ? '#0E0D0C' : '#FAF6F0'}
      paddingTop={insets.top}
      paddingBottom={insets.bottom}
    >
      <XStack
        alignItems="center"
        gap="$sm"
        paddingHorizontal="$md"
        paddingVertical="$sm"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ChevronLeft size={24} color={theme.color.val} />
        </Pressable>
        <Text fontFamily="$body" fontSize="$2" fontStyle="italic" color="$colorSecondary" flex={1}>
          {title} · foliate POC
        </Text>
      </XStack>

      <YStack flex={1}>
        <FoliateReader
          chapters={chapterHtmls}
          theme={{
            background: isDark ? '#0E0D0C' : '#FAF6F0',
            color: isDark ? '#EDE4D8' : '#1a1815',
          }}
          onMessage={(msg) => console.log('[foliate]', msg)}
        />
      </YStack>
    </YStack>
  )
}
