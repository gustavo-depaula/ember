import * as DocumentPicker from 'expo-document-picker'
import { useRouter } from 'expo-router'
import { Book, FileDown } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Alert, Pressable } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, PageHeader, ScreenLayout } from '@/components'
import { useAvailableBooks, useImportBook, useInstalledBooks } from '@/features/books/hooks'
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
      Alert.alert(t('library.invalidFile'), t('library.invalidFileDesc'))
      return
    }
    importBook.mutate(file.uri)
  }

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <PageHeader title={t('library.title')} />

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
                      pathname: '/library/[libraryId]',
                      params: { libraryId: book.book_id },
                    })
                  }
                />
              )
            })}
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
                  router.push({ pathname: '/library/[libraryId]', params: { libraryId: entry.id } })
                }
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
                {t('library.import')}
              </Text>
              <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                {t('library.importDesc')}
              </Text>
            </YStack>
          </XStack>
        </Pressable>
      </YStack>
    </ScreenLayout>
  )
}
