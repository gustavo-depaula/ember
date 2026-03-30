import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
import { supportedLanguages } from '@/lib/i18n'
import { formatLocalized } from '@/lib/i18n/dateLocale'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { useReadingConfigStore } from '@/stores/readingConfigStore'
import { useThemeStore } from '@/stores/themeStore'

const themeOptions = [
  { value: 'light' as const, labelKey: 'settings.themeLight' },
  { value: 'dark' as const, labelKey: 'settings.themeDark' },
  { value: 'system' as const, labelKey: 'settings.themeSystem' },
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

const readingLabelKeys: Record<string, string> = {
  ot: 'readingLabel.ot',
  nt: 'readingLabel.nt',
  catechism: 'readingLabel.catechism',
}

function getPositionLabel(
  progress: ReadingProgress,
  t: (key: string, opts?: Record<string, unknown>) => string,
): string {
  if (progress.type === 'catechism') {
    return `CCC §${progress.current_chapter}`
  }
  const bookName = t(`bookName.${progress.current_book}`, { defaultValue: progress.current_book })
  return `${bookName} ${progress.current_chapter}`
}

function getBookCountData(
  progress: ReadingProgress,
): { completed: number; total: number } | undefined {
  if (progress.type === 'catechism') return undefined
  const testament = progress.type as 'ot' | 'nt'
  const books = getDrbBooks().filter((b) => b.testament === testament)
  const completed: string[] = JSON.parse(progress.completed_books)
  return { completed: completed.length, total: books.length }
}

export default function SettingsScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const translation = usePreferencesStore((s) => s.translation)
  const language = usePreferencesStore((s) => s.language)
  const setLanguage = usePreferencesStore((s) => s.setLanguage)
  const liturgicalCalendar = usePreferencesStore((s) => s.liturgicalCalendar)
  const setLiturgicalCalendar = usePreferencesStore((s) => s.setLiturgicalCalendar)
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
          completedChapters: p.completed_chapters,
          startDate: p.start_date,
        }
        return {
          type: p.type,
          labelKey: readingLabelKeys[p.type] ?? p.type,
          percentage: getProgressPercentage(row),
          position: getPositionLabel(p, t),
          bookCountData: getBookCountData(p),
          estimated: formatLocalized(getEstimatedCompletion(row), 'MMM yyyy'),
        }
      }),
    [allProgress, t],
  )

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <YStack alignItems="center" gap="$xs">
          <HeaderFlourish />
          <Text fontFamily="$display" fontSize={28} lineHeight={34} color="$color">
            {t('settings.title')}
          </Text>
        </YStack>

        <YStack gap="$md">
          <Text fontFamily="$heading" fontSize="$3" color="$color">
            {t('settings.readingProgress')}
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
                  {t(item.labelKey)}
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
                    {t('settings.change')}
                  </Text>
                </Pressable>
              </XStack>
              {item.bookCountData ? (
                <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                  {t('settings.booksOf', {
                    completed: item.bookCountData.completed,
                    total: item.bookCountData.total,
                  })}
                </Text>
              ) : undefined}
              <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                {t('settings.estCompletion', { date: item.estimated })}
              </Text>
            </YStack>
          ))}
        </YStack>

        <SectionDivider />

        <YStack gap="$md">
          <Text fontFamily="$heading" fontSize="$3" color="$color">
            {t('settings.bibleTranslation')}
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
                  {suggestedTranslations.find((tr) => tr.code === translation)?.name ?? translation}
                </Text>
                <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                  {getTranslationLanguage(translation)} · {translation}
                </Text>
              </YStack>
              <Text fontFamily="$body" fontSize="$2" color="$accent">
                {t('settings.change')}
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
          label={t('settings.theme')}
          options={themeOptions.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
          value={themePreference}
          onChange={setTheme}
        />

        <SectionDivider />

        <PillSelector
          label={t('settings.language')}
          options={supportedLanguages.map((l) => ({ value: l.code, label: l.label }))}
          value={language}
          onChange={setLanguage}
        />

        <SectionDivider />

        <PillSelector
          label={t('settings.liturgicalCalendar')}
          options={[
            { value: 'of' as const, label: t('settings.calendarOF') },
            { value: 'ef' as const, label: t('settings.calendarEF') },
          ]}
          value={liturgicalCalendar}
          onChange={setLiturgicalCalendar}
        />

        <SectionDivider />

        <YStack gap="$md">
          <Text fontFamily="$heading" fontSize="$3" color="$color">
            {t('settings.reading')}
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
                {t('settings.markBooks')}
              </Text>
              <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                {t('settings.updatePosition')}
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
            {t('settings.attribution')}
          </Text>
          <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
            {t('settings.attrBible')}
          </Text>
          <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
            {t('settings.attrCatechism')}
          </Text>
          <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
            {t('settings.attrBolls')}
          </Text>
        </YStack>
      </YStack>
    </ScreenLayout>
  )
}
