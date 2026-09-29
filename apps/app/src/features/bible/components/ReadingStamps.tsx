import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useWindowDimensions } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { PracticeCard } from '@/features/covers'
import { type BlockTone, jewelTones } from '@/features/explore/bgColor'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { useBibleResume, useBooks } from '../hooks'

const gutter = 14

// The home row's stamp size, shrunk so two still fit side by side on a narrow phone.
function useStampSize(): number {
  const { width } = useWindowDimensions()
  const content = Math.min(width, 640) - 24 * 2
  return Math.min(160, Math.floor((content - gutter) / 2))
}

/** Continue reading + browse the Bible, as the home row's Bíblia stamp. */
export function ReadingStamps() {
  const { t } = useTranslation()
  const router = useRouter()
  const size = useStampSize()
  const resume = useBibleResume()
  const translation = usePreferencesStore((s) => s.translation)
  const { data: books } = useBooks(translation)

  return (
    <XStack gap={gutter}>
      {resume && (
        <Stamp
          title={resume.bookName}
          note={
            resume.chapters
              ? t('bible.discovery.chapterOf', { n: resume.chapter, total: resume.chapters })
              : t('bible.chapterAbbr', { n: resume.chapter })
          }
          caption={t('bible.discovery.continueReading')}
          accessibilityLabel={`${t('bible.discovery.continueReading')}: ${resume.bookName} ${resume.chapter}`}
          tone={jewelTones.red}
          size={size}
          onPress={() => router.push('/bible/reader')}
        />
      )}
      <Stamp
        title={t('home.bible')}
        note={books ? t('bible.discovery.bookCount', { count: books.length }) : undefined}
        caption={t('bible.discovery.openBible')}
        accessibilityLabel={t('bible.discovery.openBible')}
        tone={jewelTones.marian}
        size={size}
        onPress={() => router.push('/bible/reader')}
      />
    </XStack>
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
