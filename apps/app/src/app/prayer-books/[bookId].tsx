import type { BilingualText } from '@ember/content-engine'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronLeft, Download, Trash2 } from 'lucide-react-native'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Pressable, ScrollView, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { Text, useTheme, XStack, YStack } from 'tamagui'
import { AnimatedPressable, ScreenLayout, SectionDivider } from '@/components'
import { ManuscriptFrame } from '@/components/ManuscriptFrame'
import { PracticeIcon } from '@/components/PracticeIcon'
import { CanticleBlock } from '@/components/prayer/CanticleBlock'
import { PrayerTextBlock } from '@/components/prayer/PrayerTextBlock'
import { getManifest, resolvePrayer } from '@/content/registry'
import type { PrayerBook } from '@/content/sources/filesystem'
import type { PracticePreview, PrayerPreview } from '@/features/books/bookManager'
import {
  useAvailableBooks,
  useDownloadBook,
  useInstalledBooks,
  useRemoveBook,
} from '@/features/books/hooks'
import { useAllSlots } from '@/features/plan-of-life'
import { localizeBilingual, localizeContent } from '@/lib/i18n'
import { usePreferencesStore } from '@/stores/preferencesStore'

export default function BookDetailScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>()
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const removeBook = useRemoveBook()
  const downloadBook = useDownloadBook()
  const { data: installed = [] } = useInstalledBooks()
  const { data: available = [] } = useAvailableBooks()
  const { data: allSlots = [] } = useAllSlots()

  const installedRow = installed.find((b) => b.book_id === bookId)
  const registryEntry = available.find((b) => b.id === bookId)
  const isInstalled = !!installedRow

  const book = useMemo(() => {
    if (installedRow) return JSON.parse(installedRow.manifest) as PrayerBook
    return undefined
  }, [installedRow])

  // For installed books: read from registry. For available: use registry preview.
  const practiceList: PracticePreview[] = useMemo(() => {
    if (book) {
      return book.practices.map((pid) => {
        const m = getManifest(pid)
        return { id: pid, name: m?.name ?? { 'en-US': pid }, icon: m?.icon ?? 'prayer' }
      })
    }
    if (registryEntry) return registryEntry.practices
    return []
  }, [book, registryEntry])

  const prayerList: PrayerPreview[] = useMemo(() => {
    if (book) {
      return book.prayers.map((pid) => {
        const asset = resolvePrayer(pid, book.id)
        return { id: pid, title: asset?.title ?? { 'en-US': pid } }
      })
    }
    if (registryEntry) return registryEntry.prayers
    return []
  }, [book, registryEntry])

  const name = book
    ? localizeContent(book.name)
    : registryEntry
      ? localizeContent(registryEntry.name)
      : bookId
  const description = book?.description
    ? localizeContent(book.description)
    : registryEntry?.description
      ? localizeContent(registryEntry.description)
      : undefined
  const version = book?.version ?? registryEntry?.version
  const isDefault = book?.tags?.includes('default') ?? registryEntry?.tags?.includes('default')

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
    if (!selectedPrayer || !isInstalled) return undefined
    const asset = resolvePrayer(selectedPrayer, book?.id)
    if (!asset) return undefined
    const bil = (text: Record<string, string>): BilingualText =>
      localizeBilingual(text, contentLanguage, secondaryLanguage)
    return {
      title: bil(asset.title),
      body: bil(asset.body),
      subtitle: asset.subtitle ? bil(asset.subtitle) : undefined,
      source: asset.source ? bil(asset.source) : undefined,
      isCanticle: !!(asset.subtitle || asset.source),
    }
  }, [selectedPrayer, isInstalled, book, contentLanguage, secondaryLanguage])

  if (!book && !registryEntry) {
    return (
      <ScreenLayout>
        <YStack padding="$lg">
          <Text fontFamily="$body" color="$colorSecondary">
            Book not found.
          </Text>
        </YStack>
      </ScreenLayout>
    )
  }

  function handleRemove() {
    if (isDefault) {
      Alert.alert(t('prayerBooks.cannotRemove'), t('prayerBooks.cannotRemoveDesc'))
      return
    }
    Alert.alert(t('prayerBooks.removeConfirm'), t('prayerBooks.removeConfirmDesc'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('prayerBooks.remove'),
        style: 'destructive',
        onPress: () => {
          removeBook.mutate(bookId!, { onSuccess: () => router.back() })
        },
      },
    ])
  }

  return (
    <View style={{ flex: 1 }}>
      <ScreenLayout>
        <YStack gap="$lg" paddingVertical="$lg">
          <XStack alignItems="center" gap="$md">
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <ChevronLeft size={24} color={theme.color.val} />
            </Pressable>
            <YStack flex={1}>
              <Text fontFamily="$heading" fontSize="$5" color="$color">
                {name}
              </Text>
              <Text fontFamily="$body" fontSize={11} color="$colorSecondary">
                {practiceList.length} {t('prayerBooks.practices').toLowerCase()} · v{version}
              </Text>
            </YStack>
          </XStack>

          {description && (
            <Text fontFamily="$body" fontSize="$3" color="$colorSecondary">
              {description}
            </Text>
          )}

          {!isInstalled && registryEntry && (
            <AnimatedPressable
              onPress={() => downloadBook.mutate(registryEntry)}
              disabled={downloadBook.isPending}
            >
              <XStack
                backgroundColor="$accent"
                borderRadius="$lg"
                padding="$md"
                justifyContent="center"
                alignItems="center"
                gap="$sm"
              >
                <Download size={18} color="white" />
                <Text fontFamily="$heading" fontSize="$3" color="white">
                  {downloadBook.isPending
                    ? t('prayerBooks.downloading')
                    : t('prayerBooks.download')}
                </Text>
              </XStack>
            </AnimatedPressable>
          )}

          <SectionDivider />

          <Text fontFamily="$heading" fontSize="$3" color="$color">
            {t('prayerBooks.practices')}
          </Text>

          <YStack gap="$xs">
            {practiceList.map((practice) => {
              const inPlan = enabledIds.has(practice.id)

              return (
                <AnimatedPressable
                  key={practice.id}
                  onPress={
                    isInstalled ? () => router.push(`/practices/${practice.id}` as any) : undefined
                  }
                  disabled={!isInstalled}
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
                    opacity={isInstalled ? 1 : 0.7}
                  >
                    <PracticeIcon name={practice.icon} size={22} />
                    <Text flex={1} fontFamily="$body" fontSize="$2" color="$color">
                      {localizeContent(practice.name)}
                    </Text>
                    {inPlan && (
                      <Text fontFamily="$body" fontSize={11} color="$accent">
                        {t('catalog.alreadyInPlan')}
                      </Text>
                    )}
                    {isInstalled && (
                      <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
                        ›
                      </Text>
                    )}
                  </XStack>
                </AnimatedPressable>
              )
            })}
          </YStack>

          {prayerList.length > 0 && (
            <>
              <SectionDivider />

              <Text fontFamily="$heading" fontSize="$3" color="$color">
                {t('prayerBooks.prayers')}
              </Text>

              <YStack gap="$xs">
                {prayerList.map((prayer) => (
                  <AnimatedPressable
                    key={prayer.id}
                    onPress={isInstalled ? () => openPrayer(prayer.id) : undefined}
                    disabled={!isInstalled}
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
                      opacity={isInstalled ? 1 : 0.7}
                    >
                      <Text flex={1} fontFamily="$body" fontSize="$2" color="$color">
                        {localizeContent(prayer.title)}
                      </Text>
                      {isInstalled && (
                        <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
                          ›
                        </Text>
                      )}
                    </XStack>
                  </AnimatedPressable>
                ))}
              </YStack>
            </>
          )}

          {isInstalled && !isDefault && (
            <>
              <SectionDivider />
              <AnimatedPressable onPress={handleRemove}>
                <XStack justifyContent="center" alignItems="center" gap="$sm" paddingVertical="$sm">
                  <Trash2 size={16} color={theme.colorSecondary.val} />
                  <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
                    {t('prayerBooks.remove')}
                  </Text>
                </XStack>
              </AnimatedPressable>
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
          />
          <YStack
            backgroundColor="$background"
            maxWidth={360}
            width="100%"
            style={{ maxHeight: '85%' }}
          >
            <ManuscriptFrame>
              <ScrollView contentContainerStyle={{ padding: 16 }}>
                {selectedPrayerData?.isCanticle ? (
                  <CanticleBlock
                    title={selectedPrayerData.title}
                    subtitle={selectedPrayerData.subtitle ?? { primary: '' }}
                    source={selectedPrayerData.source ?? { primary: '' }}
                    text={selectedPrayerData.body}
                  />
                ) : selectedPrayerData ? (
                  <YStack gap="$sm">
                    <Text fontFamily="$heading" fontSize="$3" color="$accent" textAlign="center">
                      {selectedPrayerData.title.primary}
                    </Text>
                    <PrayerTextBlock text={selectedPrayerData.body} />
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
