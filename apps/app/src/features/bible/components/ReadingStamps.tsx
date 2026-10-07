import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useWindowDimensions } from 'react-native'
import { ScrollView, Text, XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { PracticeCard } from '@/features/covers'
import { type BlockTone, jewelTones } from '@/features/explore/bgColor'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { useBiblePlaces, useBooks } from '../hooks'
import { ribbonTones } from '../placeLabel'
import { useOpenBiblePlace } from '../useOpenBiblePlace'

const gutter = 14

// The home row's stamp size, shrunk so two still fit side by side on a narrow phone.
function useStampSize(): number {
  const { width } = useWindowDimensions()
  const content = Math.min(width, 640) - 24 * 2
  return Math.min(160, Math.floor((content - gutter) / 2))
}

/** One carousel: the Bible itself first, then a stamp for each place last read. */
export function ReadingStamps() {
  const { t } = useTranslation()
  const router = useRouter()
  const size = useStampSize()
  const places = useBiblePlaces()
  const openPlace = useOpenBiblePlace()
  const translation = usePreferencesStore((s) => s.translation)
  const { data: books } = useBooks(translation)

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <XStack gap={gutter}>
        <Stamp
          title={t('home.bible')}
          note={books ? t('bible.discovery.bookCount', { count: books.length }) : undefined}
          caption={t('bible.discovery.openBible')}
          accessibilityLabel={t('bible.discovery.openBible')}
          tone={jewelTones.marian}
          size={size}
          // Browsing starts from the book list, so the reader opens on its drawer.
          onPress={() => router.push({ pathname: '/bible/reader', params: { drawer: 'open' } })}
        />
        {places.map((place) => (
          <Stamp
            key={place.bookId}
            title={place.bookName}
            note={
              place.chapters
                ? t('bible.discovery.chapterOf', { n: place.chapter, total: place.chapters })
                : t('bible.chapterAbbr', { n: place.chapter })
            }
            caption={t('bible.discovery.continueReading')}
            accessibilityLabel={t('a11y.resumeReading', {
              place: `${place.bookName} ${place.chapter}`,
            })}
            tone={ribbonTones[place.ribbon % ribbonTones.length]}
            size={size}
            onPress={() => openPlace(place.bookId, place.chapter)}
          />
        ))}
      </XStack>
    </ScrollView>
  )
}

function Stamp({
  title,
  note,
  caption,
  accessibilityLabel,
  tone,
  size,
  onPress,
}: {
  title: string
  note?: string
  caption: string
  accessibilityLabel: string
  tone: BlockTone
  size: number
  onPress: () => void
}) {
  return (
    <AnimatedPressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel}
    >
      <YStack width={size} gap="$sm">
        <PracticeCard title={title} tone={tone} icon="book" note={note} size={size} />
        <Text fontFamily="$heading" fontSize="$2" color="$color" numberOfLines={2}>
          {caption}
        </Text>
      </YStack>
    </AnimatedPressable>
  )
}
