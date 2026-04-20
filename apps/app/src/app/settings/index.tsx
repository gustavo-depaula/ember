import type { ContentLanguage } from '@ember/content-engine'
import DateTimePicker from '@react-native-community/datetimepicker'
import { format, parseISO } from 'date-fns'
import Constants from 'expo-constants'
import * as Updates from 'expo-updates'
import { useUpdates } from 'expo-updates'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, Switch } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'
import { confirm, PageHeader, ScreenLayout, SectionDivider } from '@/components'
import { ReadingConfig } from '@/components/ReadingConfigModal'
import { resetDatabase } from '@/db/client'
import { TranslationModal } from '@/features/bible/components/TranslationModal'
import { getTranslationLanguage, suggestedTranslations } from '@/lib/bolls'
import { isLocalHearth, setLocalHearth } from '@/lib/hearth'
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
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              accessibilityRole="radio"
              accessibilityLabel={opt.label}
              accessibilityState={{ selected }}
            >
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
  const contentLanguage = usePreferencesStore((s) => s.contentLanguage)
  const setContentLanguage = usePreferencesStore((s) => s.setContentLanguage)
  const secondaryLanguage = usePreferencesStore((s) => s.secondaryLanguage)
  const setSecondaryLanguage = usePreferencesStore((s) => s.setSecondaryLanguage)
  const displayMode = usePreferencesStore((s) => s.displayMode)
  const setDisplayMode = usePreferencesStore((s) => s.setDisplayMode)
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

  const contentLanguageOptions = [
    { value: 'en-US' as const, label: t('languages.en-US') },
    { value: 'pt-BR' as const, label: t('languages.pt-BR') },
    { value: 'la' as const, label: t('languages.la') },
  ]

  const secondaryOptions = [
    { value: '' as const, label: t('settings.none') },
    ...contentLanguageOptions.filter((o) => o.value !== contentLanguage),
  ]

  const displayModeOptions = [
    { value: 'side-by-side' as const, label: t('settings.sideBySide') },
    { value: 'tap-to-switch' as const, label: t('settings.tapToSwitch') },
  ]

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <PageHeader title={t('settings.title')} />

        <YStack gap="$md">
          <Text fontFamily="$heading" fontSize="$3" color="$color">
            {t('settings.bibleTranslation')}
          </Text>
          <Pressable
            onPress={() => setTranslationModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel={`${t('settings.bibleTranslation')}: ${suggestedTranslations.find((tr) => tr.code === translation)?.name ?? translation}. ${t('settings.change')}`}
          >
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

        <YStack gap="$md">
          <Text fontFamily="$heading" fontSize="$3" color="$color">
            {t('settings.languagesSection')}
          </Text>
          <PillSelector
            label={t('settings.language')}
            options={supportedLanguages.map((l) => ({ value: l.code, label: l.label }))}
            value={language}
            onChange={setLanguage}
          />

          <PillSelector
            label={t('settings.contentLanguage')}
            options={contentLanguageOptions}
            value={contentLanguage}
            onChange={setContentLanguage}
          />

          <PillSelector
            label={t('settings.secondaryLanguage')}
            options={secondaryOptions}
            value={secondaryLanguage ?? ''}
            onChange={(v) => setSecondaryLanguage((v || undefined) as ContentLanguage | undefined)}
          />

          {secondaryLanguage && (
            <PillSelector
              label={t('settings.displayMode')}
              options={displayModeOptions}
              value={displayMode}
              onChange={setDisplayMode}
            />
          )}
        </YStack>

        <SectionDivider />

        <YStack gap="$md">
          <Text fontFamily="$heading" fontSize="$3" color="$color">
            {t('settings.calendarSection')}
          </Text>
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
        </YStack>

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
                <Pressable
                  onPress={() => setShowDatePicker(true)}
                  accessibilityRole="button"
                  accessibilityLabel={t('settings.change')}
                >
                  <Text fontFamily="$body" fontSize="$2" color="$accent">
                    {t('settings.change')}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setTimeTravelDate(undefined)}
                  accessibilityRole="button"
                  accessibilityLabel={t('settings.timeTravelClear')}
                >
                  <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
                    {t('settings.timeTravelClear')}
                  </Text>
                </Pressable>
              </>
            ) : (
              <Pressable
                onPress={() => setShowDatePicker(true)}
                accessibilityRole="button"
                accessibilityLabel={t('settings.timeTravelPick')}
              >
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
          <YStack gap="$sm">
            <YStack backgroundColor="$backgroundSurface" borderRadius="$lg" padding="$md">
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontFamily="$body" fontSize="$2" color="$color">
                  Local Hearth
                </Text>
                <LocalHearthToggle />
              </XStack>
            </YStack>
          </YStack>
        )}

        <Pressable
          onPress={async () => {
            const ok = await confirm({
              title: t('settings.resetDatabase'),
              description: t('settings.resetDatabaseConfirm'),
              confirmLabel: t('settings.resetDatabaseAction'),
              destructive: true,
            })
            if (ok) resetDatabase()
          }}
          accessibilityRole="button"
          accessibilityLabel={t('settings.resetDatabase')}
        >
          <YStack
            backgroundColor="$backgroundSurface"
            borderRadius="$lg"
            padding="$md"
            alignItems="center"
          >
            <Text fontFamily="$body" fontSize="$2" color="$colorBurgundy">
              {t('settings.resetDatabase')}
            </Text>
          </YStack>
        </Pressable>

        <SectionDivider />

        <AppUpdateSection />

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

function AppUpdateSection() {
  const { t } = useTranslation()
  const {
    currentlyRunning,
    isUpdateAvailable,
    isUpdatePending,
    isChecking,
    isDownloading,
    checkError,
  } = useUpdates()

  const version = Constants.expoConfig?.version ?? '—'
  const updateId = currentlyRunning.updateId
  const shortId = updateId ? updateId.slice(0, 8) : t('settings.revisionNone')

  async function handlePress() {
    if (isUpdatePending) {
      await Updates.reloadAsync()
      return
    }
    if (isUpdateAvailable) {
      await Updates.fetchUpdateAsync()
      return
    }
    await Updates.checkForUpdateAsync()
  }

  const statusLabel = (() => {
    if (isChecking) return t('settings.checking')
    if (isDownloading) return t('settings.downloading')
    if (isUpdatePending) return t('settings.updateReady')
    if (isUpdateAvailable) return t('settings.updateAvailable')
    if (checkError) return t('settings.updateError')
    return t('settings.checkForUpdates')
  })()

  const statusColor = isUpdateAvailable || isUpdatePending ? '$accent' : '$colorSecondary'

  return (
    <YStack gap="$md">
      <Text fontFamily="$heading" fontSize="$3" color="$color">
        {t('settings.about')}
      </Text>
      <YStack backgroundColor="$backgroundSurface" borderRadius="$lg" padding="$md" gap="$sm">
        <XStack justifyContent="space-between">
          <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
            {t('settings.version')}
          </Text>
          <Text fontFamily="$body" fontSize="$2" color="$color">
            {version}
          </Text>
        </XStack>
        <XStack justifyContent="space-between">
          <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
            {t('settings.revision')}
          </Text>
          <Text fontFamily="$body" fontSize="$2" color="$color" fontVariant={['tabular-nums']}>
            {shortId}
          </Text>
        </XStack>
      </YStack>
      <Pressable
        onPress={__DEV__ ? undefined : handlePress}
        disabled={__DEV__ || isChecking || isDownloading}
        accessibilityRole="button"
        accessibilityLabel={statusLabel}
      >
        <YStack
          backgroundColor="$backgroundSurface"
          borderRadius="$lg"
          padding="$md"
          alignItems="center"
          opacity={__DEV__ ? 0.4 : 1}
        >
          <Text fontFamily="$body" fontSize="$2" color={statusColor}>
            {__DEV__ ? t('settings.checkForUpdates') : statusLabel}
          </Text>
        </YStack>
      </Pressable>
    </YStack>
  )
}

function LocalHearthToggle() {
  const [local, setLocal] = useState(isLocalHearth)

  return (
    <Switch
      value={local}
      onValueChange={(value) => {
        setLocal(value)
        setLocalHearth(value)
      }}
    />
  )
}
