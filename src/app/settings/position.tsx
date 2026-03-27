import { useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { ScreenLayout } from '@/components'
import { useSetReadingPosition } from '@/features/divine-office'
import { getDrbBooks } from '@/lib/content'

type CccSection = { name: string; start: number }
type CccPart = { name: string; start: number; sections: CccSection[] }

const cccParts: CccPart[] = [
  {
    name: 'Prologue',
    start: 1,
    sections: [
      { name: 'I. The life of man — to know and love God', start: 1 },
      { name: 'II. Handing on the Faith: Catechesis', start: 4 },
      { name: 'III. The Aim and Intended Readership', start: 11 },
      { name: 'IV. Structure of this Catechism', start: 13 },
      { name: 'V. Practical Directions for Using this Catechism', start: 18 },
      { name: 'VI. Necessary Adaptations', start: 23 },
    ],
  },
  {
    name: 'Part One: The Profession of Faith',
    start: 26,
    sections: [
      { name: 'Section One: "I Believe" — "We Believe"', start: 26 },
      { name: 'Section Two: The Creeds', start: 185 },
    ],
  },
  {
    name: 'Part Two: The Celebration of the Christian Mystery',
    start: 1066,
    sections: [
      { name: 'Section One: The Sacramental Economy', start: 1076 },
      { name: 'Section Two: The Seven Sacraments', start: 1210 },
    ],
  },
  {
    name: 'Part Three: Life in Christ',
    start: 1691,
    sections: [
      { name: "Section One: Man's Vocation — Life in the Spirit", start: 1699 },
      { name: 'Section Two: The Ten Commandments', start: 2052 },
    ],
  },
  {
    name: 'Part Four: Christian Prayer',
    start: 2558,
    sections: [
      { name: 'Section One: Prayer in the Christian Life', start: 2558 },
      { name: "Section Two: The Lord's Prayer", start: 2759 },
    ],
  },
]

export default function PositionScreen() {
  const { type } = useLocalSearchParams<{ type: string }>()

  if (type === 'catechism') {
    return <CccPicker />
  }

  return <BiblePicker testament={type as 'ot' | 'nt'} />
}

function BiblePicker({ testament }: { testament: 'ot' | 'nt' }) {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const setPosition = useSetReadingPosition()
  const [selectedBook, setSelectedBook] = useState<{ id: string; name: string; chapters: number }>()
  const books = getDrbBooks().filter((b) => b.testament === testament)

  function handleSelectChapter(chapter: number) {
    if (!selectedBook) return
    setPosition.mutate(
      { type: testament, book: selectedBook.id, chapter },
      { onSuccess: () => router.back() },
    )
  }

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$md">
        <Pressable
          onPress={() => {
            if (selectedBook) setSelectedBook(undefined)
            else router.back()
          }}
        >
          <XStack alignItems="center" gap="$sm">
            <ChevronLeft size={20} color={theme.accent.val} />
            <Text fontFamily="$body" fontSize="$2" color="$accent">
              {selectedBook ? selectedBook.name : t('position.settings')}
            </Text>
          </XStack>
        </Pressable>

        <Text fontFamily="$heading" fontSize="$5" color="$color">
          {(() => {
            if (selectedBook) return selectedBook.name
            return testament === 'ot' ? t('readingLabel.ot') : t('readingLabel.nt')
          })()}
        </Text>
        <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
          {selectedBook ? t('position.selectChapter') : t('position.selectBook')}
        </Text>

        {selectedBook ? (
          <YStack gap="$xs">
            {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((ch) => (
              <Pressable key={ch} onPress={() => handleSelectChapter(ch)}>
                <XStack
                  backgroundColor="$backgroundSurface"
                  borderRadius="$lg"
                  padding="$sm"
                  paddingHorizontal="$md"
                >
                  <Text fontFamily="$body" fontSize="$2" color="$color">
                    {t('position.chapter', { n: ch })}
                  </Text>
                </XStack>
              </Pressable>
            ))}
          </YStack>
        ) : (
          <YStack gap="$xs">
            {books.map((book) => (
              <Pressable key={book.id} onPress={() => setSelectedBook(book)}>
                <XStack
                  backgroundColor="$backgroundSurface"
                  borderRadius="$lg"
                  padding="$sm"
                  paddingHorizontal="$md"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Text fontFamily="$body" fontSize="$2" color="$color">
                    {book.name}
                  </Text>
                  <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                    {t('position.chapterAbbr', { n: book.chapters })}
                  </Text>
                </XStack>
              </Pressable>
            ))}
          </YStack>
        )}
      </YStack>
    </ScreenLayout>
  )
}

function CccPicker() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const setPosition = useSetReadingPosition()
  const [selectedPart, setSelectedPart] = useState<CccPart>()

  function handleSelectSection(section: CccSection) {
    setPosition.mutate(
      { type: 'catechism', chapter: section.start },
      { onSuccess: () => router.back() },
    )
  }

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$md">
        <Pressable
          onPress={() => {
            if (selectedPart) setSelectedPart(undefined)
            else router.back()
          }}
        >
          <XStack alignItems="center" gap="$sm">
            <ChevronLeft size={20} color={theme.accent.val} />
            <Text fontFamily="$body" fontSize="$2" color="$accent">
              {selectedPart ? selectedPart.name : t('position.settings')}
            </Text>
          </XStack>
        </Pressable>

        <Text fontFamily="$heading" fontSize="$5" color="$color">
          {selectedPart ? selectedPart.name : t('readingLabel.catechism')}
        </Text>
        <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
          {selectedPart ? t('position.selectSection') : t('position.selectPart')}
        </Text>

        {selectedPart ? (
          <YStack gap="$xs">
            {selectedPart.sections.map((section) => (
              <Pressable key={section.start} onPress={() => handleSelectSection(section)}>
                <XStack
                  backgroundColor="$backgroundSurface"
                  borderRadius="$lg"
                  padding="$sm"
                  paddingHorizontal="$md"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Text fontFamily="$body" fontSize="$2" color="$color" flex={1}>
                    {section.name}
                  </Text>
                  <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                    §{section.start}
                  </Text>
                </XStack>
              </Pressable>
            ))}
          </YStack>
        ) : (
          <YStack gap="$xs">
            {cccParts.map((part) => (
              <Pressable key={part.start} onPress={() => setSelectedPart(part)}>
                <XStack
                  backgroundColor="$backgroundSurface"
                  borderRadius="$lg"
                  padding="$sm"
                  paddingHorizontal="$md"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Text fontFamily="$body" fontSize="$2" color="$color" flex={1}>
                    {part.name}
                  </Text>
                  <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                    §{part.start}
                  </Text>
                </XStack>
              </Pressable>
            ))}
          </YStack>
        )}
      </YStack>
    </ScreenLayout>
  )
}
