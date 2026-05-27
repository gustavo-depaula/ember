import { Stack, useRouter } from 'expo-router'
import {
  BookMarked,
  BookOpen,
  CalendarDays,
  Church,
  CircleDot,
  Compass,
  Flame,
  Heart,
  HeartHandshake,
  Mic2,
  Music,
  ScrollText,
  ShieldCheck,
  Skull,
  Sparkle,
  Sun,
} from 'lucide-react-native'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, useTheme, YStack } from 'tamagui'

import { ScreenLayout } from '@/components'
import { flags } from '@/config/flags'
import { ShortcutRow } from '@/features/home'
import { SearchAutocomplete } from '@/features/practices/components'

// Search tab: the iOS 26 header search bar morphs out of the tab. With a query
// it runs live corpus search (practices/books/collections); empty, it's the
// feature-map — the temporary catch-all home for every secondary feature so
// nothing is orphaned while later phases give them permanent homes elsewhere.
export default function SearchScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const [query, setQuery] = useState('')

  const ic = (Icon: typeof Flame): ReactNode => <Icon size={22} color={theme.accent?.val} />

  const isSearching = query.trim().length > 0

  return (
    <>
      <Stack.Screen
        options={{
          headerTransparent: true,
          headerTitle: '',
          headerSearchBarOptions: {
            placeholder: t('nav.searchPlaceholder'),
            onChangeText: (e: { nativeEvent: { text: string } }) => setQuery(e.nativeEvent.text),
          },
        }}
      />
      <ScreenLayout>
        {isSearching ? (
          <YStack paddingVertical="$lg">
            <SearchAutocomplete query={query} />
          </YStack>
        ) : (
          <YStack gap="$lg" paddingVertical="$lg">
            <Section title={t('search.sectionPray')}>
              <ShortcutRow
                leading={ic(Church)}
                title={t('home.holyMass')}
                tagline={t('search.massHint')}
                onPress={() =>
                  router.push({ pathname: '/pray/[practiceId]', params: { practiceId: 'mass' } })
                }
              />
              <ShortcutRow
                leading={ic(BookOpen)}
                title={t('home.bible')}
                tagline={t('search.bibleHint')}
                onPress={() => router.push('/bible')}
              />
              <ShortcutRow
                leading={ic(Flame)}
                title={t('oratio.title')}
                tagline={t('oratio.homeTagline')}
                onPress={() => router.push('/oratio')}
              />
              <ShortcutRow
                leading={ic(CircleDot)}
                title={t('kyrie.title')}
                tagline={t('kyrie.homeTagline')}
                onPress={() => router.push('/kyrie')}
              />
              <ShortcutRow
                leading={ic(Compass)}
                title={t('examen.title')}
                tagline={t('examen.homeTagline')}
                onPress={() =>
                  router.push({
                    pathname: '/pray/[practiceId]',
                    params: { practiceId: 'examination-of-conscience' },
                  })
                }
              />
              <ShortcutRow
                leading={ic(Skull)}
                title={t('memento.title')}
                tagline={t('memento.subtitle')}
                onPress={() => router.push('/memento')}
              />
            </Section>

            <Section title={t('search.sectionCapture')}>
              <ShortcutRow
                leading={ic(Heart)}
                title={t('intentions.title')}
                tagline={t('you.intentionsHint')}
                onPress={() => router.push('/intentions')}
              />
              <ShortcutRow
                leading={ic(Sparkle)}
                title={t('gratias.title')}
                tagline={t('you.gratiasHint')}
                onPress={() => router.push('/gratias')}
              />
              <ShortcutRow
                leading={ic(ScrollText)}
                title={t('memoria.title')}
                tagline={t('you.journalHint')}
                onPress={() => router.push('/memoria')}
              />
              <ShortcutRow
                leading={ic(HeartHandshake)}
                title={t('confessio.title')}
                tagline={t('confessio.subtitle')}
                onPress={() => router.push('/confessio')}
              />
            </Section>

            <Section title={t('search.sectionStudy')}>
              <ShortcutRow
                leading={ic(BookMarked)}
                title={t('catechism.title')}
                tagline={t('catechism.homeTagline')}
                onPress={() => router.push('/catechism')}
              />
              <ShortcutRow
                leading={ic(Sparkle)}
                title={t('saints.title')}
                tagline={t('saints.homeTagline')}
                onPress={() => router.push('/saints')}
              />
              <ShortcutRow
                leading={ic(Mic2)}
                title={t('creators.title')}
                tagline={t('creators.homeTagline')}
                onPress={() => router.push('/creators')}
              />
              <ShortcutRow
                leading={ic(CalendarDays)}
                title={t('calendar.title')}
                tagline={t('search.calendarHint')}
                onPress={() => router.push('/calendar')}
              />
              <ShortcutRow
                leading={ic(Sun)}
                title={t('diesDomini.title')}
                tagline={t('search.diesDominiHint')}
                onPress={() => router.push('/dies-domini')}
              />
            </Section>

            <Section title={t('search.sectionTools')}>
              {flags.custody && (
                <ShortcutRow
                  leading={ic(ShieldCheck)}
                  title={t('you.custody')}
                  tagline={t('you.custodyHint')}
                  onPress={() => router.push('/custody')}
                />
              )}
              <ShortcutRow
                leading={ic(Music)}
                title={t('piano.title')}
                tagline={t('piano.homeTagline')}
                onPress={() => router.push('/piano')}
              />
            </Section>
          </YStack>
        )}
      </ScreenLayout>
    </>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <YStack gap="$sm">
      <Text
        fontFamily="$heading"
        fontSize="$2"
        color="$accent"
        letterSpacing={2}
        textTransform="uppercase"
        paddingHorizontal="$md"
      >
        {title}
      </Text>
      {children}
    </YStack>
  )
}
