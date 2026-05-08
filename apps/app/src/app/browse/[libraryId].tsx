// biome-ignore-all lint/suspicious/noArrayIndexKey: static render lists
import type { BilingualText, LocalizedText } from '@ember/content-engine'
import { resolveFlow } from '@ember/content-engine'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Book, BookOpen, ChevronLeft } from 'lucide-react-native'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { Text, useTheme, XStack, YStack } from 'tamagui'
import { AnimatedPressable, ScreenLayout, SectionDivider } from '@/components'
import { ManuscriptFrame } from '@/components/ManuscriptFrame'
import { PracticeIcon } from '@/components/PracticeIcon'
import { SectionBlock } from '@/components/SectionBlock'
import { createEngineContext } from '@/content/engineContext'
import {
  getAllBookEntries,
  getAllChapterManifestsForLibrary,
  getManifest,
  qualifyId,
  resolveCanticle,
  resolvePrayer,
} from '@/content/registry'

type Library = {
  id: string
  version: string
  practices: string[]
  prayers: string[]
  chapters?: string[]
  books?: string[]
  languages: string[]
  name: Record<string, string>
  description?: Record<string, string>
}

import { useAvailableLibraries, useInstalledLibraries } from '@/features/libraries/hooks'
import type {
  BookPreview,
  PracticePreview,
  PrayerPreview,
} from '@/features/libraries/libraryManager'
import { PinToggle } from '@/features/pinning/PinToggle'
import { useAllSlots } from '@/features/plan-of-life'
import { localizeBilingual, localizeContent } from '@/lib/i18n'
import { usePreferencesStore } from '@/stores/preferencesStore'

export default function LibraryDetailScreen() {
  const { libraryId } = useLocalSearchParams<{ libraryId: string }>()
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const { data: installed = [] } = useInstalledLibraries()
  const { data: available = [] } = useAvailableLibraries()
  const allSlots = useAllSlots()

  const installedRow = installed.find((b) => b.book_id === libraryId)
  const registryEntry = available.find((b) => b.id === libraryId)

  // The pinned-collection's reconstructed manifest gives us full per-id lists
  // when warmed; otherwise we render the catalog preview from the registry
  // entry. Either way the screen is open-able, no install gate.
  const library = useMemo(() => {
    if (installedRow) return JSON.parse(installedRow.manifest) as Library
    return undefined
  }, [installedRow])

  const practiceList: PracticePreview[] = useMemo(() => {
    if (library) {
      return library.practices.map((pid) => {
        const qid = qualifyId(library.id, pid)
        const m = getManifest(qid)
        // Use the bare id for navigation/comparison; `/practices/[manifestId]`
        // is a single dynamic segment and the slot store keys on the bare id.
        const bareId = pid.includes('/') ? pid.split('/').slice(1).join('/') : pid
        return { id: bareId, name: m?.name ?? { 'en-US': bareId }, icon: m?.icon ?? 'prayer' }
      })
    }
    if (registryEntry) return registryEntry.practices
    return []
  }, [library, registryEntry])

  const prayerList: PrayerPreview[] = useMemo(() => {
    if (library) {
      return library.prayers.map((pid) => {
        const asset = resolvePrayer(pid, library.id) ?? resolveCanticle(pid)
        return { id: pid, title: asset?.title ?? { 'en-US': pid } }
      })
    }
    if (registryEntry) return registryEntry.prayers
    return []
  }, [library, registryEntry])

  const chapterList: { id: string; title: LocalizedText }[] = useMemo(() => {
    if (library) {
      return getAllChapterManifestsForLibrary(library.id).map((ch) => ({
        id: ch.id,
        title: ch.title,
      }))
    }
    return registryEntry?.chapters ?? []
  }, [library, registryEntry])

  const bookList: BookPreview[] = useMemo(() => {
    if (library) {
      return getAllBookEntries(library.id).map((e) => ({
        id: e.id,
        name: e.name,
        author: e.author,
        image: e.image,
      }))
    }
    return registryEntry?.books ?? []
  }, [library, registryEntry])

  const name = library
    ? localizeContent(library.name)
    : registryEntry
      ? localizeContent(registryEntry.name)
      : libraryId
  const description = library?.description
    ? localizeContent(library.description)
    : registryEntry?.description
      ? localizeContent(registryEntry.description)
      : undefined
  const version = library?.version ?? registryEntry?.version

  const enabledIds = useMemo(
    () => new Set(allSlots.filter((s) => s.enabled).map((s) => s.practice_id)),
    [allSlots],
  )

  const [selectedPrayer, setSelectedPrayer] = useState<string | undefined>()
  const [prayerModalMounted, setPrayerModalMounted] = useState(false)
  const { contentLanguage, secondaryLanguage } = usePreferencesStore()
  const overlayOpacity = useSharedValue(0)

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
    pointerEvents: overlayOpacity.value > 0 ? ('auto' as const) : ('none' as const),
  }))

  const handleBookTap = useCallback(
    (bookId: string) => {
      router.push({
        // biome-ignore lint/suspicious/noExplicitAny: expo-router untyped route
        pathname: '/browse/book/[bookId]' as any,
        // biome-ignore lint/style/noNonNullAssertion: guarded by early return
        params: { bookId, libraryId: libraryId! },
      })
    },
    [router, libraryId],
  )

  const openPrayer = useCallback(
    (id: string) => {
      setSelectedPrayer(id)
      setPrayerModalMounted(true)
      overlayOpacity.value = withTiming(1, { duration: 150 })
    },
    [overlayOpacity],
  )

  const closePrayer = useCallback(() => {
    overlayOpacity.value = withTiming(0, { duration: 120 })
    setTimeout(() => {
      setPrayerModalMounted(false)
      setSelectedPrayer(undefined)
    }, 130)
  }, [overlayOpacity])

  const selectedPrayerData = useMemo(() => {
    if (!selectedPrayer) return undefined
    const asset = resolvePrayer(selectedPrayer, library?.id) ?? resolveCanticle(selectedPrayer)
    if (!asset) return undefined
    const bil = (text: Record<string, string>): BilingualText =>
      localizeBilingual(text, contentLanguage, secondaryLanguage)
    // Legacy format: body was LocalizedText before migration to FlowSection[]
    if (!Array.isArray(asset.body)) {
      return {
        title: bil(asset.title),
        sections: [
          {
            type: 'prayer' as const,
            title: bil(asset.title),
            text: bil(asset.body as unknown as Record<string, string>),
          },
        ],
      }
    }
    const ec = createEngineContext(library?.id)
    const sections = resolveFlow({ sections: asset.body }, { date: new Date() }, ec)
    return {
      title: bil(asset.title),
      sections,
    }
  }, [selectedPrayer, library, contentLanguage, secondaryLanguage])

  if (!library && !registryEntry) {
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
              <ChevronLeft size={24} color={theme.color.val} />
            </Pressable>
            <YStack flex={1}>
              <Text fontFamily="$heading" fontSize="$5" color="$color">
                {name}
              </Text>
              <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                {practiceList.length} {t('library.practices').toLowerCase()} · v{version}
              </Text>
            </YStack>
          </XStack>

          {description && (
            <Text fontFamily="$body" fontSize="$3" color="$colorSecondary">
              {description}
            </Text>
          )}

          <XStack>
            <PinToggle itemId={`collection/${libraryId}`} />
          </XStack>

          <SectionDivider />

          {chapterList.length > 0 && (
            <>
              <Text fontFamily="$heading" fontSize="$3" color="$color">
                {t('library.contents')}
              </Text>

              <YStack gap="$xs">
                {chapterList.map((chapter) => {
                  const chapterTitle = localizeContent(chapter.title)
                  return (
                    <AnimatedPressable
                      key={chapter.id}
                      onPress={() =>
                        router.push({
                          // biome-ignore lint/suspicious/noExplicitAny: expo-router untyped route
                          pathname: '/browse/chapters/[chapterId]' as any,
                          // biome-ignore lint/style/noNonNullAssertion: guarded by early return
                          params: { chapterId: chapter.id, libraryId: libraryId! },
                        })
                      }
                      accessibilityRole="link"
                      accessibilityLabel={chapterTitle}
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
                        <BookOpen size={22} color={theme.colorSecondary.val} />
                        <Text flex={1} fontFamily="$body" fontSize="$2" color="$color">
                          {chapterTitle}
                        </Text>
                        <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
                          ›
                        </Text>
                      </XStack>
                    </AnimatedPressable>
                  )
                })}
              </YStack>

              <SectionDivider />
            </>
          )}

          {bookList.length > 0 && (
            <>
              <Text fontFamily="$heading" fontSize="$3" color="$color">
                {t('library.books')}
              </Text>

              <YStack gap="$xs">
                {bookList.map((book) => {
                  const bookName = localizeContent(book.name)
                  return (
                    <AnimatedPressable
                      key={book.id}
                      onPress={() => handleBookTap(book.id)}
                      accessibilityRole="link"
                      accessibilityLabel={bookName}
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
                        <Book size={22} color={theme.accent.val} />
                        <YStack flex={1}>
                          <Text fontFamily="$body" fontSize="$2" color="$color">
                            {bookName}
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
                  )
                })}
              </YStack>

              <SectionDivider />
            </>
          )}

          {practiceList.length > 0 && (
            <>
              <Text fontFamily="$heading" fontSize="$3" color="$color">
                {t('library.practices')}
              </Text>

              <YStack gap="$xs">
                {practiceList.map((practice) => {
                  const inPlan = enabledIds.has(practice.id)
                  const practiceName = localizeContent(practice.name)

                  return (
                    <AnimatedPressable
                      key={practice.id}
                      onPress={() =>
                        // biome-ignore lint/suspicious/noExplicitAny: expo-router untyped route
                        router.push(`/practices/${practice.id}` as any)
                      }
                      accessibilityRole="link"
                      accessibilityLabel={practiceName}
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
                          {practiceName}
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

          {prayerList.length > 0 && (
            <>
              <SectionDivider />

              <Text fontFamily="$heading" fontSize="$3" color="$color">
                {t('library.prayers')}
              </Text>

              <YStack gap="$xs">
                {prayerList.map((prayer) => {
                  const prayerTitle = localizeContent(prayer.title)
                  return (
                    <AnimatedPressable
                      key={prayer.id}
                      onPress={() => openPrayer(prayer.id)}
                      accessibilityRole="button"
                      accessibilityLabel={prayerTitle}
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
                          {prayerTitle}
                        </Text>
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
        </YStack>
      </ScreenLayout>

      {prayerModalMounted && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.6)',
              padding: 32,
            },
            overlayStyle,
          ]}
        >
          <Pressable
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            onPress={closePrayer}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.closeModal')}
          />
          <YStack
            backgroundColor="$background"
            maxWidth={360}
            width="100%"
            style={{ maxHeight: '85%' }}
          >
            <ManuscriptFrame>
              <ScrollView contentContainerStyle={{ padding: 16 }}>
                {selectedPrayerData ? (
                  <YStack gap="$sm">
                    <Text fontFamily="$heading" fontSize="$3" color="$accent" textAlign="center">
                      {selectedPrayerData.title.primary}
                    </Text>
                    {selectedPrayerData.sections.map((s, i) => (
                      <SectionBlock key={`${s.type}-${i}`} section={s} />
                    ))}
                  </YStack>
                ) : null}
              </ScrollView>
            </ManuscriptFrame>
          </YStack>
        </Animated.View>
      )}
    </View>
  )
}
