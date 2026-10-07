import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useWindowDimensions } from 'react-native'
import { ScrollView, Text, XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { PracticeCard } from '@/features/covers'
import { ArtCoverCard } from '@/features/explore/ArtCoverCard'
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

/** One carousel: the Bible itself first, then each place last read as Home's book tile. */
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
          <ArtCoverCard
            key={place.bookId}
            title={`${place.bookName} ${place.chapter}`}
            subtitle={t('bible.discovery.continueReading')}
            cover={{ kind: 'book', format: 'missal' }}
            tone={ribbonTones[place.ribbon % ribbonTones.length]}
            // Home's book tile: 1.5× as tall as wide, so this width stands it level with the stamp.
            size={Math.round(size / 1.5)}
            aspectRatio={1.5}
            radius={4}
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
