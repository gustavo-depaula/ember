import type { ContentLanguage } from '@ember/content-engine'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { XStack, YStack } from 'tamagui'

import { AnimatedCheckbox } from '@/components/AnimatedCheckbox'
import { PillSelector } from '@/components/PillSelector'
import { Typography } from '@/components/typography'
import {
  completeOnboarding,
  nextRoute,
  OnboardingScaffold,
  stepProgress,
} from '@/features/onboarding'
import { supportedLanguages } from '@/lib/i18n'
import { usePreferencesStore } from '@/stores/preferencesStore'

const allContentLanguages: ContentLanguage[] = ['en-US', 'pt-BR', 'la']

export default function OnboardingLanguageScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const language = usePreferencesStore((s) => s.language)
  const setLanguage = usePreferencesStore((s) => s.setLanguage)
  const storedKnown = usePreferencesStore((s) => s.knownLanguages)
  const setKnownLanguages = usePreferencesStore((s) => s.setKnownLanguages)
  const setContentLanguage = usePreferencesStore((s) => s.setContentLanguage)
  const setSecondaryLanguage = usePreferencesStore((s) => s.setSecondaryLanguage)

  // The interface language is always one you know; seed the pool with it.
  const interfaceContent = language as ContentLanguage
  const [known, setKnown] = useState<Set<ContentLanguage>>(
    () => new Set(storedKnown.length ? storedKnown : [interfaceContent]),
  )

  function toggle(lang: ContentLanguage) {
    // The interface language stays known — you can read what the app speaks to you.
    if (lang === interfaceContent) return
    setKnown((prev) => {
      const next = new Set(prev)
      if (next.has(lang)) next.delete(lang)
      else next.add(lang)
      return next
    })
  }

  function persistAndAdvance() {
    const list = allContentLanguages.filter((l) => known.has(l) || l === interfaceContent)
    setKnownLanguages(list)
    // The renderer shows two languages today: primary + one secondary, derived
    // from the pool (interface language leads; first other known language pairs).
    const primary = allContentLanguages.includes(interfaceContent) ? interfaceContent : list[0]
    setContentLanguage(primary)
    setSecondaryLanguage(list.find((l) => l !== primary))
    router.push(nextRoute('language'))
  }

  return (
    <OnboardingScaffold
      title={t('onboarding.language.title')}
      subtitle={t('onboarding.language.subtitle')}
      progress={stepProgress('language')}
      onContinue={persistAndAdvance}
      onSkip={completeOnboarding}
    >
      <YStack gap="$lg">
        <PillSelector
          label={t('onboarding.language.interface')}
          options={supportedLanguages.map((l) => ({ value: l.code, label: l.label }))}
          value={language}
          onChange={setLanguage}
        />

        <YStack gap="$sm">
          <Typography variant="interface" fontSize="$2">
            {t('onboarding.language.known')}
          </Typography>
          <Typography variant="whisper">{t('onboarding.language.knownHint')}</Typography>
          <YStack gap="$xs" paddingTop="$xs">
            {allContentLanguages.map((lang) => {
              const checked = known.has(lang) || lang === interfaceContent
              const locked = lang === interfaceContent
              return (
                <XStack
                  key={lang}
                  alignItems="center"
                  gap="$md"
                  paddingVertical="$sm"
                  opacity={locked ? 0.7 : 1}
                >
                  <AnimatedCheckbox
                    checked={checked}
                    onToggle={() => toggle(lang)}
                    accessibilityLabel={t(`languages.${lang}`)}
                  />
                  <Typography variant="interface">{t(`languages.${lang}`)}</Typography>
                </XStack>
              )
            })}
          </YStack>
        </YStack>
      </YStack>
    </OnboardingScaffold>
  )
}
