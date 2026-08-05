import type { ContentLanguage } from '@ember/content-engine'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet } from 'react-native'
import { XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components/AnimatedPressable'
import { Typography } from '@/components/typography'
import { nextRoute, OnboardingScaffold, stepProgress } from '@/features/onboarding'
import { selectionTick } from '@/lib/haptics'
import { supportedLanguages } from '@/lib/i18n'
import { usePreferencesStore } from '@/stores/preferencesStore'

const allContentLanguages: ContentLanguage[] = ['en-US', 'pt-BR', 'la']

// Each tongue names itself — the way a missal's own title page would.
const endonyms: Record<ContentLanguage, string> = {
  'en-US': 'English',
  'pt-BR': 'Português',
  la: 'Latina',
}

export default function OnboardingLanguageScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const language = usePreferencesStore((s) => s.language)
  const setLanguage = usePreferencesStore((s) => s.setLanguage)
  const storedKnown = usePreferencesStore((s) => s.knownLanguages)
  const setKnownLanguages = usePreferencesStore((s) => s.setKnownLanguages)

  // The interface language is always one you know; seed the pool with it.
  const interfaceContent = language as ContentLanguage
  const [known, setKnown] = useState<Set<ContentLanguage>>(
    () => new Set(storedKnown.length ? storedKnown : [interfaceContent]),
  )

  function toggle(lang: ContentLanguage) {
    // The interface language stays known — you can read what the app speaks to you.
    if (lang === interfaceContent) return
    selectionTick()
    setKnown((prev) => {
      const next = new Set(prev)
      if (next.has(lang)) next.delete(lang)
      else next.add(lang)
      return next
    })
  }

  function persistAndAdvance() {
    // setKnownLanguages also derives the primary + secondary display languages.
    const list = allContentLanguages.filter((l) => known.has(l) || l === interfaceContent)
    setKnownLanguages(list)
    router.push(nextRoute('language'))
  }

  const speaksIn = supportedLanguages.find((l) => l.code === language)

  return (
    <OnboardingScaffold
      marker={t('onboarding.language.marker')}
      title={t('onboarding.language.title')}
      subtitle={t('onboarding.language.subtitle')}
      progress={stepProgress('language')}
      onContinue={persistAndAdvance}
      onSkip={() => router.push(nextRoute('language'))}
      skipLabel={t('common.notNow')}
    >
      <YStack gap="$xl">
        <Section label={t('onboarding.language.interface')}>
          {supportedLanguages.map((l) => (
            <ChoiceLine
              key={l.code}
              label={endonyms[l.code as ContentLanguage] ?? l.label}
              chosen={l.code === language}
              onPress={() => {
                selectionTick()
                setLanguage(l.code)
              }}
            />
          ))}
        </Section>

        <Section
          label={t('onboarding.language.known')}
          hint={t('onboarding.language.knownHint', { language: speaksIn?.label ?? '' })}
        >
          {allContentLanguages.map((lang) => (
            <ChoiceLine
              key={lang}
              label={endonyms[lang]}
              chosen={known.has(lang) || lang === interfaceContent}
              locked={lang === interfaceContent}
              onPress={() => toggle(lang)}
            />
          ))}
        </Section>
      </YStack>
    </OnboardingScaffold>
  )
}

function Section({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <YStack gap="$sm">
      <Typography
        variant="label"
        tone="muted"
        textTransform="uppercase"
        letterSpacing={1.5}
        fontSize="$1"
      >
        {label}
      </Typography>
      {hint ? <Typography variant="whisper">{hint}</Typography> : null}
      <YStack paddingTop="$xs">{children}</YStack>
    </YStack>
  )
}

/** A tongue as a line to tap, marked with a fleuron when it's yours. */
function ChoiceLine({
  label,
  chosen,
  locked = false,
  onPress,
}: {
  label: string
  chosen: boolean
  locked?: boolean
  onPress: () => void
}) {
  return (
    <AnimatedPressable
      onPress={locked ? undefined : onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: chosen, disabled: locked }}
      accessibilityLabel={label}
    >
      <XStack
        alignItems="center"
        gap="$sm"
        paddingVertical="$sm"
        borderBottomWidth={StyleSheet.hairlineWidth}
        borderBottomColor="$borderColor"
        opacity={locked ? 0.75 : 1}
      >
        <Typography
          variant="ceremonial"
          fontSize={16}
          lineHeight={26}
          width={22}
          opacity={chosen ? 1 : 0}
        >
          ✦
        </Typography>
        <Typography
          variant="section-title"
          fontSize={24}
          lineHeight={32}
          color={chosen ? '$accent' : undefined}
          opacity={chosen ? 1 : 0.7}
        >
          {label}
        </Typography>
      </XStack>
    </AnimatedPressable>
  )
}
