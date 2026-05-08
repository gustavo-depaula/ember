import { useRouter } from 'expo-router'
import { Book } from 'lucide-react-native'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, PageHeader, ScreenLayout } from '@/components'
import { useAvailableLibraries, useInstalledLibraries } from '@/features/libraries/hooks'
import { PinToggle } from '@/features/pinning/PinToggle'
import { localizeContent } from '@/lib/i18n'

type CollectionSummary = {
  id: string
  name: Record<string, string>
  practiceCount: number
}

function CollectionRow({ entry, onPress }: { entry: CollectionSummary; onPress: () => void }) {
  const { t } = useTranslation()
  const theme = useTheme()
  const subtitle = `${entry.practiceCount} ${t('library.practices').toLowerCase()}`

  return (
    <XStack
      backgroundColor="$backgroundSurface"
      borderRadius="$lg"
      borderWidth={1}
      borderColor="$borderColor"
      gap="$md"
      alignItems="center"
      paddingHorizontal="$md"
      paddingVertical="$sm"
    >
      <AnimatedPressable
        onPress={onPress}
        accessibilityRole="link"
        accessibilityLabel={localizeContent(entry.name)}
        style={{ flex: 1 }}
      >
        <XStack gap="$md" alignItems="center" paddingVertical="$xs">
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
              {localizeContent(entry.name)}
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
      <PinToggle itemId={`collection/${entry.id}`} />
    </XStack>
  )
}

export default function LibraryScreen() {
  const { t } = useTranslation()
  const router = useRouter()

  // The two hooks together produce the full catalog: installed (pinned)
  // collections + available (un-pinned) collections. In v2 every collection
  // is openable regardless of pin state, so we render them as a single list.
  const { data: installed = [] } = useInstalledLibraries()
  const { data: available = [] } = useAvailableLibraries()

  const collections = useMemo<CollectionSummary[]>(() => {
    const merged: CollectionSummary[] = [
      ...installed.map((row) => {
        const manifest = JSON.parse(row.manifest) as {
          name: Record<string, string>
          practices?: string[]
        }
        return {
          id: row.book_id,
          name: manifest.name,
          practiceCount: manifest.practices?.length ?? 0,
        }
      }),
      ...available.map((entry) => ({
        id: entry.id,
        name: entry.name,
        practiceCount: entry.practiceCount,
      })),
    ]
    merged.sort((a, b) => localizeContent(a.name).localeCompare(localizeContent(b.name)))
    return merged
  }, [installed, available])

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <PageHeader title={t('library.title')} />

        {collections.length === 0 ? (
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
              {t('library.registryOffline')}
            </Text>
          </YStack>
        ) : (
          <YStack gap="$sm">
            {collections.map((c) => (
              <CollectionRow
                key={c.id}
                entry={c}
                onPress={() =>
                  router.push({ pathname: '/browse/[libraryId]', params: { libraryId: c.id } })
                }
              />
            ))}
          </YStack>
        )}
      </YStack>
    </ScreenLayout>
  )
}
