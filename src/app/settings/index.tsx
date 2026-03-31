import { DateTimePicker } from '@/lib/nativePickers'
import { format, parseISO } from 'date-fns'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Platform, Pressable } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'
import { HeaderFlourish, ScreenLayout, SectionDivider } from '@/components'
import { ReadingConfig } from '@/components/ReadingConfigModal'
import { resetDatabase } from '@/db/client'
import { TranslationModal } from '@/features/bible/components/TranslationModal'
import { getTranslationLanguage, suggestedTranslations } from '@/lib/bolls'
import { supportedLanguages } from '@/lib/i18n'
import { usePreferencesStore } from '@/stores/preferencesStore'

const themeOptions = [
  { value: 'light' as const, labelKey: 'settings.themeLight' },
  { value: 'dark' as const, labelKey: 'settings.themeDark' },
  { value: 'system' as const, labelKey: 'settings.themeSystem' },
]

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

export default function SettingsScreen() {
  const { t } = useTranslation()
  const translation = usePreferencesStore((s) => s.translation)
  const language = usePreferencesStore((s) => s.language)
  const setLanguage = usePreferencesStore((s) => s.setLanguage)
  const liturgicalCalendar = usePreferencesStore((s) => s.liturgicalCalendar)
  const setLiturgicalCalendar = usePreferencesStore((s) => s.setLiturgicalCalendar)
  const jurisdiction = usePreferencesStore((s) => s.jurisdiction)
  const setJurisdiction = usePreferencesStore((s) => s.setJurisdiction)
  const timeTravelDate = usePreferencesStore((s) => s.timeTravelDate)
  const setTimeTravelDate = usePreferencesStore((s) => s.setTimeTravelDate)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [translationModalVisible, setTranslationModalVisible] = useState(false)
  const themePreference = usePreferencesStore((s) => s.theme)
  const setTheme = usePreferencesStore((s) => s.setTheme)

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

        <PillSelector
          label={t('settings.jurisdiction')}
          options={[
            { value: '' as const, label: t('settings.jurisdictionUniversal') },
            { value: 'BR' as const, label: t('settings.jurisdictionBR') },
            { value: 'US' as const, label: t('settings.jurisdictionUS') },
          ]}
          value={jurisdiction ?? ''}
          onChange={(v) => setJurisdiction(v || undefined)}
        />

        <SectionDivider />

        <YStack gap="$md">
          <Text fontFamily="$heading" fontSize="$3" color="$color">
            {t('settings.reading')}
          </Text>

          <ReadingConfig />
        </YStack>

        <SectionDivider />

        <YStack gap="$sm">
          <Text fontFamily="$heading" fontSize="$3" color="$color">
            {t('settings.timeTravel')}
          </Text>
          <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
            {t('settings.timeTravelDescription')}
          </Text>
          <XStack gap="$sm" alignItems="center">
            {timeTravelDate ? (
              <>
                <YStack
                  flex={1}
                  backgroundColor="$backgroundSurface"
                  borderRadius="$lg"
                  padding="$sm"
                >
                  <Text fontFamily="$body" fontSize="$2" color="$accent">
                    {format(parseISO(timeTravelDate), 'MMMM d, yyyy')}
                  </Text>
                </YStack>
                <Pressable onPress={() => setShowDatePicker(true)}>
                  <Text fontFamily="$body" fontSize="$2" color="$accent">
                    {t('settings.change')}
                  </Text>
                </Pressable>
                <Pressable onPress={() => setTimeTravelDate(undefined)}>
                  <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
                    {t('settings.timeTravelClear')}
                  </Text>
                </Pressable>
              </>
            ) : (
              <Pressable onPress={() => setShowDatePicker(true)}>
                <YStack
                  backgroundColor="$backgroundSurface"
                  borderRadius="$lg"
                  paddingVertical="$sm"
                  paddingHorizontal="$md"
                >
                  <Text fontFamily="$body" fontSize="$2" color="$accent">
                    {t('settings.timeTravelPick')}
                  </Text>
                </YStack>
              </Pressable>
            )}
          </XStack>
          {showDatePicker && (
            <DateTimePicker
              value={timeTravelDate ? parseISO(timeTravelDate) : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onValueChange={(_, date) => {
                setShowDatePicker(Platform.OS === 'ios')
                if (date) setTimeTravelDate(format(date, 'yyyy-MM-dd'))
              }}
            />
          )}
        </YStack>

        <SectionDivider />

        {__DEV__ && (
          <Pressable
            onPress={() =>
              Alert.alert('Reset Database', 'Drop all data and re-seed?', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Reset',
                  style: 'destructive',
                  onPress: () => resetDatabase(),
                },
              ])
            }
          >
            <YStack
              backgroundColor="$backgroundSurface"
              borderRadius="$lg"
              padding="$md"
              alignItems="center"
            >
              <Text fontFamily="$body" fontSize="$2" color="$colorBurgundy">
                Reset Database (Dev)
              </Text>
            </YStack>
          </Pressable>
        )}

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
