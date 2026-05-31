import type { ContentLanguage } from '@ember/content-engine'
import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'

import { supportedLanguages } from '@/lib/i18n'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { PillSelector } from './PillSelector'

/**
 * The full language control set — shared between the Settings screen and the
 * praying experience's settings sheet. Includes interface language, content
 * language, an optional secondary language (side-by-side bilingual prayer), and
 * the display mode for that pairing. All wired straight to the preferences store.
 */
export function LanguageSettings() {
  const { t } = useTranslation()
  const language = usePreferencesStore((s) => s.language)
  const setLanguage = usePreferencesStore((s) => s.setLanguage)
  const contentLanguage = usePreferencesStore((s) => s.contentLanguage)
  const setContentLanguage = usePreferencesStore((s) => s.setContentLanguage)
  const secondaryLanguage = usePreferencesStore((s) => s.secondaryLanguage)
  const setSecondaryLanguage = usePreferencesStore((s) => s.setSecondaryLanguage)
  const displayMode = usePreferencesStore((s) => s.displayMode)
  const setDisplayMode = usePreferencesStore((s) => s.setDisplayMode)

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
    <YStack gap="$md">
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
  )
}
