import { useRouter } from 'expo-router'
import { Book, ChevronLeft, FileDown } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Alert, Pressable } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'
import * as DocumentPicker from 'expo-document-picker'

import { AnimatedPressable, ScreenLayout } from '@/components'
import {
  useAvailableBooks,
  useImportBook,
  useInstalledBooks,
} from '@/features/books/hooks'
import type { InstalledBook, RegistryEntry } from '@/features/books/bookManager'
import { localizeContent } from '@/lib/i18n'

function InstalledBookCard({
  book,
  onPress,
}: {
  book: InstalledBook
  onPress: () => void
}) {
  const theme = useTheme()
  const manifest = JSON.parse(book.manifest)
  const name = localizeContent(manifest.name)
  const practiceCount = manifest.practices?.length ?? 0

  return (
    <AnimatedPressable onPress={onPress}>
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
          <Text fontFamily="$body" fontSize={11} color="$colorSecondary">
            {practiceCount} practices · v{book.version}
          </Text>
        </YStack>
        <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
          ›
        </Text>
      </XStack>
    </AnimatedPressable>
  )
}

function AvailableBookCard({
  entry,
  onPress,
}: {
  entry: RegistryEntry
  onPress: () => void
}) {
  const theme = useTheme()
  const name = localizeContent(entry.name)
  const sizeKb = Math.round(entry.size / 1024)

  return (
    <AnimatedPressable onPress={onPress}>
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
          <Text fontFamily="$body" fontSize={11} color="$colorSecondary">
            {entry.practiceCount} practices · {sizeKb} KB
          </Text>
        </YStack>
        <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
          ›
        </Text>
      </XStack>
    </AnimatedPressable>
  )
}

export default function PrayerBooksScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()

  const { data: installed = [] } = useInstalledBooks()
  const { data: available = [] } = useAvailableBooks()
  const importBook = useImportBook()

  async function handleImport() {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    })
    if (result.canceled || !result.assets?.length) return
    const file = result.assets[0]
    if (!file.name?.endsWith('.pray')) {
      Alert.alert('Invalid file', 'Please select a .pray file.')
      return
    }
    importBook.mutate(file.uri)
  }

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <XStack alignItems="center" gap="$md">
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ChevronLeft size={24} color={theme.color.val} />
          </Pressable>
          <Text flex={1} fontFamily="$heading" fontSize="$5" color="$color">
            {t('prayerBooks.title', { defaultValue: 'Prayer Books' })}
          </Text>
        </XStack>

        {installed.length > 0 && (
          <YStack gap="$sm">
            <Text fontFamily="$heading" fontSize="$2" color="$colorSecondary" textTransform="uppercase" letterSpacing={1}>
              {t('prayerBooks.installed', { defaultValue: 'Installed' })}
            </Text>
            {installed.map((book) => (
              <InstalledBookCard
                key={book.book_id}
                book={book}
                onPress={() => router.push(`/prayer-books/${book.book_id}` as any)}
              />
            ))}
          </YStack>
        )}

        {available.length > 0 && (
          <YStack gap="$sm">
            <Text fontFamily="$heading" fontSize="$2" color="$colorSecondary" textTransform="uppercase" letterSpacing={1}>
              {t('prayerBooks.available', { defaultValue: 'Available' })}
            </Text>
            {available.map((entry) => (
              <AvailableBookCard
                key={entry.id}
                entry={entry}
                onPress={() => router.push(`/prayer-books/${entry.id}` as any)}
              />
            ))}
          </YStack>
        )}

        <Pressable onPress={handleImport}>
          <XStack
            borderRadius="$lg"
            padding="$md"
            gap="$md"
            alignItems="center"
            borderWidth={1}
            borderColor="$accent"
            borderStyle="dashed"
          >
            <YStack width={36} height={36} alignItems="center" justifyContent="center">
              <FileDown size={24} color={theme.accent.val} />
            </YStack>
            <YStack flex={1} gap={2}>
              <Text fontFamily="$heading" fontSize="$3" color="$accent">
                {t('prayerBooks.import', { defaultValue: 'Import .pray file' })}
              </Text>
              <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                {t('prayerBooks.importDesc', { defaultValue: 'Open a prayer book from your device' })}
              </Text>
            </YStack>
          </XStack>
        </Pressable>
      </YStack>
    </ScreenLayout>
  )
}
