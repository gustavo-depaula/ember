import { useRouter } from 'expo-router'
import { Library as LibraryIcon, Mic2, Sparkle } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Text, useTheme, YStack } from 'tamagui'

import { PageHeader, ScreenLayout } from '@/components'
import { ContinueReading } from '@/features/bible/components/ContinueReading'
import { ShortcutRow } from '@/features/home'

// Library tab root (Phase 1 skeleton): the user's saved/collected content.
// Continue-reading resumes the Bible; the rows below reach the collection of
// holy cards, followed creators, and the catalog. Pinned books/practices and
// saved prayers land here in a later phase.
export default function LibraryScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <PageHeader title={t('nav.library')} />

        <ContinueReading />

        <YStack gap="$sm">
          <ShortcutRow
            leading={<Sparkle size={22} color={theme.accent?.val} />}
            title={t('library.saints')}
            tagline={t('library.saintsHint')}
            onPress={() => router.push('/saints')}
          />
          <ShortcutRow
            leading={<Mic2 size={22} color={theme.accent?.val} />}
            title={t('library.creators')}
            tagline={t('library.creatorsHint')}
            onPress={() => router.push('/creators')}
          />
          <ShortcutRow
            leading={<LibraryIcon size={22} color={theme.accent?.val} />}
            title={t('library.browse')}
            tagline={t('library.browseHint')}
            onPress={() => router.push('/browse')}
          />
        </YStack>

        <Text
          fontFamily="$body"
          fontSize="$1"
          color="$colorSecondary"
          fontStyle="italic"
          textAlign="center"
          paddingHorizontal="$lg"
          paddingTop="$md"
        >
          {t('library.soon')}
        </Text>
      </YStack>
    </ScreenLayout>
  )
}
