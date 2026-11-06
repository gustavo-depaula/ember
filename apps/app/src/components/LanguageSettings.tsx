import { X } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { useTheme, XStack, YStack } from 'tamagui'

import { getManifest } from '@/content/resolver'
import { localizeContent, supportedLanguages } from '@/lib/i18n'
import {
  type BilingualLayout,
  bilingualLayouts,
  type LatinStance,
  latinStances,
  resolveLanguages,
} from '@/lib/practiceLanguages'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { PillSelector } from './PillSelector'
import { Typography } from './typography'

/**
 * The languages of the app, on the Settings screen: how much of the praying is
 * in Latin, the reader's own language, how two languages share a page, the
 * prayers that keep a choice of their own, and the interface's language. A
 * prayer's own languages are changed from its page.
 */
export function LanguageSettings() {
  const { t } = useTranslation()
  const language = usePreferencesStore((s) => s.language)
  const setLanguage = usePreferencesStore((s) => s.setLanguage)
  const contentLanguage = usePreferencesStore((s) => s.contentLanguage)
  const setContentLanguage = usePreferencesStore((s) => s.setContentLanguage)
  const stance = usePreferencesStore((s) => s.latinStance)
  const setLatinStance = usePreferencesStore((s) => s.setLatinStance)
  const layout = usePreferencesStore((s) => s.bilingualLayout)
  const setBilingualLayout = usePreferencesStore((s) => s.setBilingualLayout)

  return (
    <YStack gap="$lg">
      <YStack gap="$sm">
        <Typography fontSize="$2">{t('prayerLanguage.howYouPray')}</Typography>
        {latinStances.map((s) => (
          <StanceCard key={s} stance={s} selected={s === stance} onPress={setLatinStance} />
        ))}
      </YStack>

      <PillSelector
        label={t('prayerLanguage.vernacular')}
        options={(['en-US', 'pt-BR'] as const).map((l) => ({
          value: l,
          label: t(`languages.${l}`),
        }))}
        value={contentLanguage}
        onChange={setContentLanguage}
      />

      <YStack gap="$xs">
        <PillSelector
          label={t('prayerLanguage.twoLanguages')}
          options={bilingualLayouts.map((l) => ({ value: l, label: t(layoutKey[l]) }))}
          value={layout}
          onChange={setBilingualLayout}
        />
        <Typography variant="annotation" fontSize={15}>
          {t('prayerLanguage.layoutAutoNote')}
        </Typography>
      </YStack>

      <Exceptions />

      <YStack gap="$xs">
        <PillSelector
          label={t('settings.language')}
          options={supportedLanguages.map((l) => ({ value: l.code, label: l.label }))}
          value={language}
          onChange={setLanguage}
        />
        <Typography variant="annotation" fontSize={15}>
          {t('prayerLanguage.interfaceNote')}
        </Typography>
      </YStack>
    </YStack>
  )
}

const layoutKey: Record<BilingualLayout, string> = {
  auto: 'prayerLanguage.layoutAuto',
  interleaved: 'prayerLanguage.layoutInterleaved',
  columns: 'prayerLanguage.layoutColumns',
  tap: 'prayerLanguage.layoutTap',
}

function StanceCard({
  stance,
  selected,
  onPress,
}: {
  stance: LatinStance
  selected: boolean
  onPress: (stance: LatinStance) => void
}) {
  const { t } = useTranslation()
  const ink = selected ? '$background' : '$color'
  return (
    <Pressable
      onPress={() => onPress(stance)}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={t(`prayerLanguage.stance.${stance}.title`)}
      accessibilityHint={t(`prayerLanguage.stance.${stance}.body`)}
    >
      <YStack
        backgroundColor={selected ? '$accent' : '$backgroundSurface'}
        borderRadius="$lg"
        paddingVertical="$md"
        paddingHorizontal="$md"
        gap={2}
      >
        <Typography fontSize="$3" color={ink}>
          {t(`prayerLanguage.stance.${stance}.title`)}
        </Typography>
        <Typography fontSize={15} lineHeight={20} color={ink} opacity={selected ? 0.85 : 0.7}>
          {t(`prayerLanguage.stance.${stance}.body`)}
        </Typography>
      </YStack>
    </Pressable>
  )
}

// The prayers whose languages the reader chose on their page, each with a way
// back to the defaults.
function Exceptions() {
  const { t } = useTranslation()
  const theme = useTheme()
  const overrides = usePreferencesStore((s) => s.practiceLanguages)
  const stance = usePreferencesStore((s) => s.latinStance)
  const vernacular = usePreferencesStore((s) => s.contentLanguage)
  const layout = usePreferencesStore((s) => s.bilingualLayout)
  const setPracticeLanguage = usePreferencesStore((s) => s.setPracticeLanguage)

  const rows = Object.entries(overrides).flatMap(([id, override]) => {
    const manifest = getManifest(id)
    if (!manifest) return []
    const resolved = resolveLanguages(manifest, { stance, vernacular, layout }, override)
    const languages = resolved.follow
      ? t('prayerLanguage.withCompanion', {
          pray: t(`languages.${resolved.pray}`),
          follow: t(`languages.${resolved.follow}`),
        })
      : t(`languages.${resolved.pray}`)
    const layoutNote = override.layout ? ` · ${t(layoutKey[override.layout])}` : ''
    return [{ id, name: localizeContent(manifest.name), languages: languages + layoutNote }]
  })

  return (
    <YStack gap="$xs">
      <Typography fontSize="$2">{t('prayerLanguage.exceptions')}</Typography>
      {rows.length === 0 ? (
        <Typography variant="annotation" fontSize={15}>
          {t('prayerLanguage.exceptionsEmpty')}
        </Typography>
      ) : (
        rows.map((row) => (
          <XStack key={row.id} alignItems="center" gap="$sm" minHeight={44}>
            <YStack flex={1}>
              <Typography fontSize="$2">{row.name}</Typography>
              <Typography variant="annotation" fontSize={15}>
                {row.languages}
              </Typography>
            </YStack>
            <Pressable
              onPress={() => setPracticeLanguage(row.id, undefined)}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={t('a11y.removeLanguageException', { name: row.name })}
            >
              <X size={18} strokeWidth={1.5} color={theme.colorSecondary.val} />
            </Pressable>
          </XStack>
        ))
      )}
    </YStack>
  )
}
