import { useRouter } from 'expo-router'
import { Book } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, confirm, PageHeader, ScreenLayout } from '@/components'
import {
  useAvailableLibraries,
  useInstalledLibraries,
  useLibraryUpdates,
  useUpdateLibrary,
} from '@/features/libraries/hooks'
import type { RegistryEntry } from '@/features/libraries/libraryManager'
import { localizeContent } from '@/lib/i18n'

function BookCard({
  name,
  subtitle,
  onPress,
}: {
  name: string
  subtitle: string
  onPress: () => void
}) {
  const theme = useTheme()

  return (
    <AnimatedPressable onPress={onPress} accessibilityRole="link" accessibilityLabel={name}>
      <XStack
        backgroundColor="$backgroundSurface"
        borderRadius="$lg"
        padding="$md"
        gap="$md"
        alignItems="center"
        borderWidth={1}
        borderColor="$borderColor"
      >
        <YStack
          width={36}
          height={36}
          alignItems="center"
          justifyContent="center"
          backgroundColor="$accentSubtle"
          borderRadius="$md"
        >
          <Book size={20} color={theme.accent.val} />
        </YStack>
        <YStack flex={1} gap={2}>
          <Text fontFamily="$heading" fontSize="$3" color="$color">
            {name}
          </Text>
          <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
            {subtitle}
          </Text>
        </YStack>
        <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
          ›
        </Text>
      </XStack>
    </AnimatedPressable>
  )
}

export default function LibraryScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()

  const { data: installed = [] } = useInstalledLibraries()
  const {
    data: available = [],
    isError: availableError,
    refetch: refetchAvailable,
  } = useAvailableLibraries()
  const { data: pendingUpdates = [] } = useLibraryUpdates()
  const updateLibrary = useUpdateLibrary()

  const [updateRun, setUpdateRun] = useState<
    { index: number; total: number; entry: RegistryEntry } | undefined
  >()
  const isUpdatingAll = updateRun !== undefined
  const currentEntryProgress = updateRun ? (updateLibrary.progress[updateRun.entry.id] ?? 0) : 0
  const overallProgress = updateRun ? (updateRun.index + currentEntryProgress) / updateRun.total : 0

  const progressValue = useSharedValue(0)
  useEffect(() => {
    progressValue.value = withTiming(overallProgress, { duration: 250 })
  }, [overallProgress, progressValue])
  const progressFillStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value * 100}%`,
  }))

  async function handleUpdateAll() {
    const updates = pendingUpdates
    if (updates.length === 0) return
    try {
      for (let i = 0; i < updates.length; i++) {
        setUpdateRun({ index: i, total: updates.length, entry: updates[i] })
        await updateLibrary.mutateAsync(updates[i])
      }
    } catch (err) {
      console.error('[library] update failed:', err)
      const detail = err instanceof Error ? err.message : undefined
      confirm({
        title: t('library.updateFailed'),
        description: detail
          ? `${t('library.updateFailedDesc')}\n\n${detail}`
          : t('library.updateFailedDesc'),
        singleAction: true,
      })
    } finally {
      setUpdateRun(undefined)
    }
  }

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <PageHeader title={t('library.title')} />

        {(pendingUpdates.length > 0 || isUpdatingAll) && (
          <YStack
            paddingVertical="$sm"
            paddingHorizontal="$md"
            borderRadius="$md"
            borderWidth={1}
            borderColor="$accent"
            backgroundColor="$backgroundSurface"
            gap="$sm"
            overflow="hidden"
          >
            <XStack alignItems="center" justifyContent="space-between" gap="$sm">
              {isUpdatingAll && updateRun ? (
                <YStack flex={1} gap={2}>
                  <Text fontFamily="$body" fontSize="$2" color="$color" numberOfLines={1}>
                    {t('library.updatingNamed', {
                      name: localizeContent(updateRun.entry.name),
                    })}
                  </Text>
                  <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                    {t('library.updatingProgress', {
                      current: updateRun.index + 1,
                      total: updateRun.total,
                    })}
                  </Text>
                </YStack>
              ) : (
                <>
                  <Text fontFamily="$body" fontSize="$2" color="$color" flex={1}>
                    {t('library.updatesAvailable', { count: pendingUpdates.length })}
                  </Text>
                  <AnimatedPressable
                    onPress={handleUpdateAll}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={t('library.updateAll')}
                  >
                    <Text fontFamily="$heading" fontSize="$2" color="$accent">
                      {t('library.updateAll')}
                    </Text>
                  </AnimatedPressable>
                </>
              )}
            </XStack>
            {isUpdatingAll && (
              <YStack height={4} backgroundColor="$borderColor" borderRadius={2} overflow="hidden">
                <Animated.View
                  style={[
                    {
                      height: 4,
                      backgroundColor: theme.accent.val,
                      borderRadius: 2,
                    },
                    progressFillStyle,
                  ]}
                />
              </YStack>
            )}
          </YStack>
        )}

        {installed.length > 0 && (
          <YStack gap="$sm">
            <Text
              fontFamily="$heading"
              fontSize="$2"
              color="$colorSecondary"
              textTransform="uppercase"
              letterSpacing={1}
            >
              {t('library.installed')}
            </Text>
            {installed.map((book) => {
              const manifest = JSON.parse(book.manifest)
              return (
                <BookCard
                  key={book.book_id}
                  name={localizeContent(manifest.name)}
                  subtitle={`${manifest.practices?.length ?? 0} ${t('library.practices').toLowerCase()} · v${book.version}`}
                  onPress={() =>
                    router.push({
                      pathname: '/browse/[libraryId]',
                      params: { libraryId: book.book_id },
                    })
                  }
                />
              )
            })}
          </YStack>
        )}

        {availableError && (
          <XStack
            gap="$sm"
            alignItems="center"
            justifyContent="space-between"
            paddingVertical="$sm"
            paddingHorizontal="$md"
            borderRadius="$md"
            borderWidth={1}
            borderColor="$borderColor"
            backgroundColor="$backgroundSurface"
          >
            <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" flex={1}>
              {t('library.registryOffline')}
            </Text>
            <AnimatedPressable
              onPress={() => refetchAvailable()}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('common.retry')}
            >
              <Text fontFamily="$heading" fontSize="$2" color="$accent">
                {t('common.retry')}
              </Text>
            </AnimatedPressable>
          </XStack>
        )}

        {installed.length === 0 && available.length === 0 && !availableError && (
          <YStack alignItems="center" gap="$sm" paddingVertical="$lg" paddingHorizontal="$lg">
            <Text fontFamily="$heading" fontSize="$3" color="$color" textAlign="center">
              {t('library.emptyState')}
            </Text>
            <Text
              fontFamily="$body"
              fontSize="$2"
              color="$colorSecondary"
              textAlign="center"
              fontStyle="italic"
            >
              {t('library.emptyStateDescription', { ext: '.pray' })}
            </Text>
          </YStack>
        )}

        {available.length > 0 && (
          <YStack gap="$sm">
            <Text
              fontFamily="$heading"
              fontSize="$2"
              color="$colorSecondary"
              textTransform="uppercase"
              letterSpacing={1}
            >
              {t('library.available')}
            </Text>
            {available.map((entry) => (
              <BookCard
                key={entry.id}
                name={localizeContent(entry.name)}
                subtitle={`${entry.practiceCount} ${t('library.practices').toLowerCase()} · ${entry.size >= 1024 * 1024 ? `${(entry.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(entry.size / 1024)} KB`}`}
                onPress={() =>
                  router.push({ pathname: '/browse/[libraryId]', params: { libraryId: entry.id } })
                }
              />
            ))}
          </YStack>
        )}

        {/* The .pray file-import flow was a v1 affordance; v2 has no
            self-contained library zip to import from disk. Hidden until a
            v2 sideload format exists. */}
      </YStack>
    </ScreenLayout>
  )
}
