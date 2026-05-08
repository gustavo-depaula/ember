import { useLocalSearchParams, useRouter } from 'expo-router'
import { Book, BookOpen, ChevronLeft } from 'lucide-react-native'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, View } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, ScreenLayout, SectionDivider } from '@/components'
import { PracticeIcon } from '@/components/PracticeIcon'
import { getCollectionItems, getEntry, getRememberedManifest } from '@/content/contentIndex'
import type {
  BookItemManifest,
  CatalogEntry,
  ChapterItemManifest,
  PracticeItemManifest,
  PrayerItemManifest,
} from '@/content/manifestTypes'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { PinToggle } from '@/features/pinning/PinToggle'
import { useAllSlots } from '@/features/plan-of-life'
import { PrayerModal } from '@/features/practices/components'
import { localizeContent } from '@/lib/i18n'

function bareId(corpusId: string): string {
  const slash = corpusId.indexOf('/')
  return slash === -1 ? corpusId : corpusId.slice(slash + 1)
}

type GroupedItems = {
  chapters: { id: string; title: Record<string, string> }[]
  books: { id: string; name: Record<string, string>; author?: Record<string, string> }[]
  practices: { id: string; name: Record<string, string>; icon: string }[]
  prayers: { id: string; title: Record<string, string> }[]
}

function groupItemsByKind(refs: { ref: string; entry?: CatalogEntry }[]): GroupedItems {
  const out: GroupedItems = { chapters: [], books: [], practices: [], prayers: [] }
  for (const { ref, entry } of refs) {
    if (!entry) continue
    const id = bareId(ref)
    if (entry.kind === 'chapter') {
      const body = getRememberedManifest<ChapterItemManifest>(entry.hash)
      out.chapters.push({
        id,
        title: (body?.title ?? entry.title ?? entry.name ?? { 'en-US': id }) as Record<
          string,
          string
        >,
      })
    } else if (entry.kind === 'book') {
      const body = getRememberedManifest<BookItemManifest>(entry.hash)
      out.books.push({
        id,
        name: (body?.name ?? entry.name ?? { 'en-US': id }) as Record<string, string>,
        author: (body?.author ?? entry.author) as Record<string, string> | undefined,
      })
    } else if (entry.kind === 'practice') {
      const body = getRememberedManifest<PracticeItemManifest>(entry.hash)
      out.practices.push({
        id,
        name: (body?.name ?? entry.name ?? { 'en-US': id }) as Record<string, string>,
        icon: body?.icon ?? entry.icon ?? 'prayer',
      })
    } else if (entry.kind === 'prayer') {
      const body = getRememberedManifest<PrayerItemManifest>(entry.hash)
      out.prayers.push({
        id,
        title: (body?.title ?? entry.title ?? entry.name ?? { 'en-US': id }) as Record<
          string,
          string
        >,
      })
    }
  }
  return out
}

export default function CollectionDetailScreen() {
  const { libraryId } = useLocalSearchParams<{ libraryId: string }>()
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const allSlots = useAllSlots()
  const catalogVersion = useCatalogVersion()
  const [selectedPrayerId, setSelectedPrayerId] = useState<string | undefined>()

  const collectionId = `collection/${libraryId}`
  const collectionEntry = getEntry(collectionId)

  // biome-ignore lint/correctness/useExhaustiveDependencies: catalogVersion drives re-derivation as deferred manifests warm.
  const grouped = useMemo<GroupedItems>(
    () => groupItemsByKind(getCollectionItems(collectionId)),
    [collectionId, catalogVersion],
  )

  const enabledIds = useMemo(
    () => new Set(allSlots.filter((s) => s.enabled).map((s) => s.practice_id)),
    [allSlots],
  )

  if (!collectionEntry) {
    return (
      <ScreenLayout>
        <YStack padding="$lg">
          <Text fontFamily="$body" color="$colorSecondary">
            {t('library.libraryNotFound')}
          </Text>
        </YStack>
      </ScreenLayout>
    )
  }

  const name = collectionEntry.name ? localizeContent(collectionEntry.name) : (libraryId ?? '')
  const description = collectionEntry.description
    ? localizeContent(collectionEntry.description)
    : undefined
  const totalCount =
    grouped.chapters.length +
    grouped.books.length +
    grouped.practices.length +
    grouped.prayers.length

  return (
    <View style={{ flex: 1 }}>
      <ScreenLayout>
        <YStack gap="$lg" paddingVertical="$lg">
          <XStack alignItems="center" gap="$md">
            <Pressable
              onPress={() => router.back()}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('a11y.goBack')}
            >
              <ChevronLeft size={24} color={theme.color?.val} />
            </Pressable>
            <YStack flex={1}>
              <Text fontFamily="$heading" fontSize="$5" color="$color">
                {name}
              </Text>
              <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                {totalCount} {t('library.items', { defaultValue: 'items' })}
              </Text>
            </YStack>
          </XStack>

          {description && (
            <Text fontFamily="$body" fontSize="$3" color="$colorSecondary">
              {description}
            </Text>
          )}

          <XStack>
            <PinToggle itemId={collectionId} />
          </XStack>

          {grouped.chapters.length > 0 && (
            <>
              <SectionDivider />
              <Text fontFamily="$heading" fontSize="$3" color="$color">
                {t('library.contents')}
              </Text>
              <YStack gap="$xs">
                {grouped.chapters.map((chapter) => (
                  <AnimatedPressable
                    key={chapter.id}
                    onPress={() =>
                      router.push({
                        pathname: '/browse/chapters/[chapterId]',
                        params: { chapterId: chapter.id },
                      })
                    }
                    accessibilityRole="link"
                    accessibilityLabel={localizeContent(chapter.title)}
                  >
                    <XStack
                      backgroundColor="$backgroundSurface"
                      borderRadius="$md"
                      padding="$sm"
                      paddingHorizontal="$md"
                      gap="$md"
                      alignItems="center"
                      borderWidth={1}
                      borderColor="$borderColor"
                    >
                      <BookOpen size={22} color={theme.colorSecondary?.val} />
                      <Text flex={1} fontFamily="$body" fontSize="$2" color="$color">
                        {localizeContent(chapter.title)}
                      </Text>
                      <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
                        ›
                      </Text>
                    </XStack>
                  </AnimatedPressable>
                ))}
              </YStack>
            </>
          )}

          {grouped.books.length > 0 && (
            <>
              <SectionDivider />
              <Text fontFamily="$heading" fontSize="$3" color="$color">
                {t('library.books')}
              </Text>
              <YStack gap="$xs">
                {grouped.books.map((book) => (
                  <AnimatedPressable
                    key={book.id}
                    onPress={() =>
                      router.push({
                        pathname: '/browse/book/[bookId]',
                        params: { bookId: book.id },
                      })
                    }
                    accessibilityRole="link"
                    accessibilityLabel={localizeContent(book.name)}
                  >
                    <XStack
                      backgroundColor="$backgroundSurface"
                      borderRadius="$md"
                      padding="$sm"
                      paddingHorizontal="$md"
                      gap="$md"
                      alignItems="center"
                      borderWidth={1}
                      borderColor="$borderColor"
                    >
                      <Book size={22} color={theme.accent?.val} />
                      <YStack flex={1}>
                        <Text fontFamily="$body" fontSize="$2" color="$color">
                          {localizeContent(book.name)}
                        </Text>
                        {book.author && (
                          <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                            {localizeContent(book.author)}
                          </Text>
                        )}
                      </YStack>
                      <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
                        ›
                      </Text>
                    </XStack>
                  </AnimatedPressable>
                ))}
              </YStack>
            </>
          )}

          {grouped.practices.length > 0 && (
            <>
              <SectionDivider />
              <Text fontFamily="$heading" fontSize="$3" color="$color">
                {t('library.practices')}
              </Text>
              <YStack gap="$xs">
                {grouped.practices.map((practice) => {
                  const inPlan = enabledIds.has(practice.id)
                  return (
                    <AnimatedPressable
                      key={practice.id}
                      onPress={() =>
                        router.push({
                          pathname: '/practices/[manifestId]',
                          params: { manifestId: practice.id },
                        })
                      }
                      accessibilityRole="link"
                      accessibilityLabel={localizeContent(practice.name)}
                    >
                      <XStack
                        backgroundColor="$backgroundSurface"
                        borderRadius="$md"
                        padding="$sm"
                        paddingHorizontal="$md"
                        gap="$md"
                        alignItems="center"
                        borderWidth={1}
                        borderColor="$borderColor"
                      >
                        <PracticeIcon name={practice.icon} size={22} />
                        <Text flex={1} fontFamily="$body" fontSize="$2" color="$color">
                          {localizeContent(practice.name)}
                        </Text>
                        {inPlan && (
                          <Text fontFamily="$body" fontSize="$1" color="$accent">
                            {t('catalog.alreadyInPlan')}
                          </Text>
                        )}
                        <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
                          ›
                        </Text>
                      </XStack>
                    </AnimatedPressable>
                  )
                })}
              </YStack>
            </>
          )}

          {grouped.prayers.length > 0 && (
            <>
              <SectionDivider />
              <Text fontFamily="$heading" fontSize="$3" color="$color">
                {t('library.prayers')}
              </Text>
              <YStack gap="$xs">
                {grouped.prayers.map((prayer) => (
                  <AnimatedPressable
                    key={prayer.id}
                    onPress={() => setSelectedPrayerId(prayer.id)}
                    accessibilityRole="button"
                    accessibilityLabel={localizeContent(prayer.title)}
                  >
                    <XStack
                      backgroundColor="$backgroundSurface"
                      borderRadius="$md"
                      padding="$sm"
                      paddingHorizontal="$md"
                      gap="$md"
                      alignItems="center"
                      borderWidth={1}
                      borderColor="$borderColor"
                    >
                      <Text flex={1} fontFamily="$body" fontSize="$2" color="$color">
                        {localizeContent(prayer.title)}
                      </Text>
                      <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
                        ›
                      </Text>
                    </XStack>
                  </AnimatedPressable>
                ))}
              </YStack>
            </>
          )}
        </YStack>
      </ScreenLayout>

      <PrayerModal prayerId={selectedPrayerId} onClose={() => setSelectedPrayerId(undefined)} />
    </View>
  )
}
