import { format } from 'date-fns'
import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { Pressable } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

import { HeaderFlourish, ProgressBar, ScreenLayout, SectionDivider } from '@/components'
import { ReadingConfig } from '@/components/ReadingConfigModal'
import { readingFonts } from '@/config/readingFonts'
import type { ReadingProgress } from '@/db/schema'
import { TranslationModal } from '@/features/bible/components/TranslationModal'
import { useAllReadingProgress } from '@/features/divine-office'
import { getEstimatedCompletion, getProgressPercentage } from '@/features/divine-office/utils'
import { readingScale, useReadingMargin, useReadingStyle } from '@/hooks/useReadingStyle'
import { getTranslationLanguage, suggestedTranslations } from '@/lib/bolls'
import { getDrbBooks } from '@/lib/content'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { useReadingConfigStore } from '@/stores/readingConfigStore'
import { useThemeStore } from '@/stores/themeStore'

const themeOptions = [
  { value: 'light' as const, label: 'Light' },
  { value: 'dark' as const, label: 'Dark' },
  { value: 'system' as const, label: 'System' },
]

function Stepper({
  label,
  displayValue,
  onDecrement,
  onIncrement,
  decrementDisabled,
  incrementDisabled,
}: {
  label: string
  displayValue: string
  onDecrement: () => void
  onIncrement: () => void
  decrementDisabled: boolean
  incrementDisabled: boolean
}) {
  return (
    <XStack justifyContent="space-between" alignItems="center">
      <Text fontFamily="$body" fontSize="$2" color="$color">
        {label}
      </Text>
      <XStack alignItems="center" gap="$sm">
        <Pressable onPress={onDecrement} disabled={decrementDisabled}>
          <YStack
            backgroundColor="$backgroundSurface"
            borderRadius="$md"
            width={36}
            height={36}
            alignItems="center"
            justifyContent="center"
            opacity={decrementDisabled ? 0.3 : 1}
          >
            <Text fontFamily="$body" fontSize="$3" color="$color">
              -
            </Text>
          </YStack>
        </Pressable>
        <Text fontFamily="$body" fontSize="$2" color="$accent" width={32} textAlign="center">
          {displayValue}
        </Text>
        <Pressable onPress={onIncrement} disabled={incrementDisabled}>
          <YStack
            backgroundColor="$backgroundSurface"
            borderRadius="$md"
            width={36}
            height={36}
            alignItems="center"
            justifyContent="center"
            opacity={incrementDisabled ? 0.3 : 1}
          >
            <Text fontFamily="$body" fontSize="$3" color="$color">
              +
            </Text>
          </YStack>
        </Pressable>
      </XStack>
    </XStack>
  )
}

function PillSelector<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: Array<{ value: T; label: string }>
  value: T
  onChange: (value: T) => void
}) {
  return (
    <YStack gap="$xs">
      <Text fontFamily="$body" fontSize="$2" color="$color">
        {label}
      </Text>
      <XStack gap="$sm">
        {options.map((opt) => {
          const selected = value === opt.value
          return (
            <Pressable key={opt.value} onPress={() => onChange(opt.value)}>
              <YStack
                backgroundColor={selected ? '$accent' : '$backgroundSurface'}
                borderRadius="$lg"
                paddingVertical="$sm"
                paddingHorizontal="$md"
                alignItems="center"
              >
                <Text fontFamily="$body" fontSize="$2" color={selected ? '$background' : '$color'}>
                  {opt.label}
                </Text>
              </YStack>
            </Pressable>
          )
        })}
      </XStack>
    </YStack>
  )
}

const readingLabels: Record<string, string> = {
  ot: 'Old Testament',
  nt: 'New Testament',
  catechism: 'Catechism',
}

function getPositionLabel(progress: ReadingProgress): string {
  if (progress.type === 'catechism') {
    return `CCC §${progress.current_chapter}`
  }
  const books = getDrbBooks()
  const book = books.find((b) => b.id === progress.current_book)
  return `${book?.name ?? progress.current_book} ${progress.current_chapter}`
}

function getBookCount(progress: ReadingProgress): string | undefined {
  if (progress.type === 'catechism') return undefined
  const testament = progress.type as 'ot' | 'nt'
  const books = getDrbBooks().filter((b) => b.testament === testament)
  const completed: string[] = JSON.parse(progress.completed_books)
  return `${completed.length} of ${books.length} books`
}

export default function SettingsScreen() {
  const router = useRouter()
  const translation = usePreferencesStore((s) => s.translation)
  const [translationModalVisible, setTranslationModalVisible] = useState(false)
  const themePreference = useThemeStore((s) => s.preference)
  const setTheme = useThemeStore((s) => s.setTheme)

  const rc = useReadingConfigStore()
  const readingStyle = useReadingStyle()
  const readingMargin = useReadingMargin()

  const { data: allProgress = [] } = useAllReadingProgress()

  const progressItems = useMemo(
    () =>
      allProgress.map((p) => {
        const row = {
          type: p.type,
          currentBook: p.current_book,
          currentChapter: p.current_chapter,
          completedBooks: p.completed_books,
          startDate: p.start_date,
        }
        return {
          type: p.type,
          label: readingLabels[p.type] ?? p.type,
          percentage: getProgressPercentage(row),
          position: getPositionLabel(p),
          bookCount: getBookCount(p),
          estimated: format(getEstimatedCompletion(row), 'MMM yyyy'),
        }
      }),
    [allProgress],
  )

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <YStack alignItems="center" gap="$xs">
          <HeaderFlourish />
          <Text fontFamily="$display" fontSize={28} lineHeight={34} color="$color">
            Settings
          </Text>
        </YStack>

        <YStack gap="$md">
          <Text fontFamily="$heading" fontSize="$3" color="$color">
            Reading Progress
          </Text>
          {progressItems.map((item) => (
            <YStack
              key={item.type}
              backgroundColor="$backgroundSurface"
              borderRadius="$lg"
              padding="$md"
              gap="$sm"
            >
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontFamily="$heading" fontSize="$2" color="$color">
                  {item.label}
                </Text>
                <Text fontFamily="$body" fontSize="$1" color="$accent">
                  {Math.round(item.percentage * 100)}%
                </Text>
              </XStack>
              <ProgressBar value={item.percentage} />
              <XStack alignItems="center" justifyContent="space-between">
                <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                  {item.position}
                </Text>
                <Pressable
                  onPress={() => router.push(`/settings/position?type=${item.type}` as never)}
                >
                  <Text fontFamily="$body" fontSize="$1" color="$accent">
                    Change
                  </Text>
                </Pressable>
              </XStack>
              {item.bookCount ? (
                <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                  {item.bookCount}
                </Text>
              ) : undefined}
              <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                Est. completion: {item.estimated}
              </Text>
            </YStack>
          ))}
        </YStack>

        <SectionDivider />

        <YStack gap="$md">
          <Text fontFamily="$heading" fontSize="$3" color="$color">
            Bible Translation
          </Text>
          <Pressable onPress={() => setTranslationModalVisible(true)}>
            <XStack
              backgroundColor="$backgroundSurface"
              borderRadius="$lg"
              padding="$md"
              alignItems="center"
              justifyContent="space-between"
            >
              <YStack>
                <Text fontFamily="$body" fontSize="$2" color="$color">
                  {suggestedTranslations.find((t) => t.code === translation)?.name ?? translation}
                </Text>
                <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                  {getTranslationLanguage(translation)} · {translation}
                </Text>
              </YStack>
              <Text fontFamily="$body" fontSize="$2" color="$accent">
                Change
              </Text>
            </XStack>
          </Pressable>
          {translationModalVisible ? (
            <TranslationModal
              visible={translationModalVisible}
              onClose={() => setTranslationModalVisible(false)}
            />
          ) : undefined}
        </YStack>

        <SectionDivider />

        <PillSelector
          label="Theme"
          options={themeOptions}
          value={themePreference}
          onChange={setTheme}
        />

        <SectionDivider />

        <YStack gap="$md">
          <Text fontFamily="$heading" fontSize="$3" color="$color">
            Reading
          </Text>

          <ReadingConfig />
        </YStack>

        <SectionDivider />

        <Pressable onPress={() => router.push('/settings/books' as never)}>
          <XStack
            backgroundColor="$backgroundSurface"
            borderRadius="$lg"
            padding="$md"
            alignItems="center"
            justifyContent="space-between"
          >
            <YStack>
              <Text fontFamily="$body" fontSize="$2" color="$color">
                Mark Books as Already Read
              </Text>
              <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                Update your starting position
              </Text>
            </YStack>
            <Text fontFamily="$body" fontSize="$2" color="$accent">
              →
            </Text>
          </XStack>
        </Pressable>

        <SectionDivider />

        <YStack gap="$sm">
          <Text fontFamily="$heading" fontSize="$3" color="$color">
            Attribution
          </Text>
          <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
            Bible text: Douay-Rheims Bible (public domain)
          </Text>
          <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
            Catechism of the Catholic Church (USCCB)
          </Text>
          <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
            Online translations via Bolls.life API
          </Text>
        </YStack>
      </YStack>
    </ScreenLayout>
  )
}
