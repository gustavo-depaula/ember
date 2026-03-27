import { useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { ScreenLayout } from '@/components'
import { useSetReadingPosition } from '@/features/divine-office'
import { getDrbBooks } from '@/lib/content'

type CccSection = { nameKey: string; start: number }
type CccPart = { nameKey: string; start: number; sections: CccSection[] }

const cccParts: CccPart[] = [
  {
    nameKey: 'catechism.prologue',
    start: 1,
    sections: [
      { nameKey: 'catechism.prologueS1', start: 1 },
      { nameKey: 'catechism.prologueS2', start: 4 },
      { nameKey: 'catechism.prologueS3', start: 11 },
      { nameKey: 'catechism.prologueS4', start: 13 },
      { nameKey: 'catechism.prologueS5', start: 18 },
      { nameKey: 'catechism.prologueS6', start: 23 },
    ],
  },
  {
    nameKey: 'catechism.partOne',
    start: 26,
    sections: [
      { nameKey: 'catechism.partOneS1', start: 26 },
      { nameKey: 'catechism.partOneS2', start: 185 },
    ],
  },
  {
    nameKey: 'catechism.partTwo',
    start: 1066,
    sections: [
      { nameKey: 'catechism.partTwoS1', start: 1076 },
      { nameKey: 'catechism.partTwoS2', start: 1210 },
    ],
  },
  {
    nameKey: 'catechism.partThree',
    start: 1691,
    sections: [
      { nameKey: 'catechism.partThreeS1', start: 1699 },
      { nameKey: 'catechism.partThreeS2', start: 2052 },
    ],
  },
  {
    nameKey: 'catechism.partFour',
    start: 2558,
    sections: [
      { nameKey: 'catechism.partFourS1', start: 2558 },
      { nameKey: 'catechism.partFourS2', start: 2759 },
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
              {selectedPart ? t(selectedPart.nameKey) : t('position.settings')}
            </Text>
          </XStack>
        </Pressable>

        <Text fontFamily="$heading" fontSize="$5" color="$color">
          {selectedPart ? t(selectedPart.nameKey) : t('readingLabel.catechism')}
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
                    {t(section.nameKey)}
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
                    {t(part.nameKey)}
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
