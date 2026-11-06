import type { ContentLanguage } from '@ember/content-engine'
import { BottomSheet } from '@expo/ui/community/bottom-sheet'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { useTheme, View, XStack, YStack } from 'tamagui'

import { PillSelector, Typography } from '@/components'
import type { PracticeManifest } from '@/content/manifestTypes'
import { localizeContent } from '@/lib/i18n'
import type { BilingualLayout } from '@/lib/practiceLanguages'
import { usePracticeLanguageActions, usePracticePageLanguage } from './usePracticeLanguages'

const languageCode: Record<ContentLanguage, string> = { 'en-US': 'EN', 'pt-BR': 'PT', la: 'LA' }

/** Whether a practice has any language choice to offer. */
export function hasLanguageChoice(resolved: {
  prayOptions: ContentLanguage[]
  followOptions: ContentLanguage[]
}) {
  return resolved.prayOptions.length > 1 || resolved.followOptions.length > 0
}

/** The practice's languages in the header, `LA · PT`; it opens the language sheet. */
export function LanguageChip({
  manifest,
  onPress,
}: {
  manifest: PracticeManifest
  onPress: () => void
}) {
  const { t } = useTranslation()
  const { resolved } = usePracticeLanguageActions(manifest)
  if (!hasLanguageChoice(resolved)) return null
  const label = resolved.follow
    ? t('prayerLanguage.withCompanion', {
        pray: t(`languages.${resolved.pray}`),
        follow: t(`languages.${resolved.follow}`),
      })
    : t(`languages.${resolved.pray}`)
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={t('a11y.prayerLanguage', { languages: label })}
      testID="prayer-language"
    >
      <XStack
        height={32}
        paddingHorizontal={12}
        borderRadius={16}
        borderWidth={0.5}
        borderColor="$borderColor"
        alignItems="center"
        gap={6}
      >
        <Typography variant="label" color="$color" fontSize={13} letterSpacing={1.5}>
          {languageCode[resolved.pray]}
        </Typography>
        {resolved.follow ? (
          <>
            <Typography color="$colorSecondary" fontSize={13}>
              ·
            </Typography>
            <Typography variant="label" color="$colorSecondary" fontSize={13} letterSpacing={1.5}>
              {languageCode[resolved.follow]}
            </Typography>
          </>
        ) : null}
      </XStack>
    </Pressable>
  )
}

/**
 * One prayer's languages: what to pray in, what keeps it company, how the two
 * share the page, and whether the choice is this prayer's alone or everyone's.
 */
export function LanguageSheet({
  manifest,
  open,
  onClose,
}: {
  manifest: PracticeManifest
  open: boolean
  onClose: () => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const actions = usePracticeLanguageActions(manifest)
  const page = usePracticePageLanguage(manifest)
  const { resolved, defaults } = actions
  const name = localizeContent(manifest.name)
  const stance = t(`prayerLanguage.stanceInline.${defaults.stance}`)
  const languageName = (lang: ContentLanguage) => t(`languages.${lang}`)
  const inlineName = (lang: ContentLanguage) => t(`prayerLanguage.inline.${lang}`)

  return (
    <BottomSheet
      index={open ? 0 : -1}
      // No snapPoints: the sheet sizes to what this prayer has to offer.
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={{ backgroundColor: theme.background?.val }}
    >
      <YStack width="100%" paddingHorizontal="$lg" paddingTop="$lg" paddingBottom="$lg" gap="$md">
        <XStack justifyContent="space-between" alignItems="baseline">
          <Typography variant="label" color="$accent" letterSpacing={2}>
            {t('prayerLanguage.title')}
          </Typography>
          <Typography variant="annotation" fontSize={16} fontStyle="italic">
            {name}
          </Typography>
        </XStack>

        {resolved.prayOptions.length > 1 && (
          <PillSelector
            label={t('prayerLanguage.prayIn')}
            options={resolved.prayOptions.map((l) => ({ value: l, label: languageName(l) }))}
            value={resolved.pray}
            onChange={actions.choosePray}
          />
        )}

        {resolved.followOptions.length > 0 && (
          <PillSelector
            label={t('prayerLanguage.followWith')}
            options={[
              { value: '' as const, label: t('prayerLanguage.none') },
              ...resolved.followOptions.map((l) => ({ value: l, label: languageName(l) })),
            ]}
            value={resolved.follow ?? ''}
            onChange={(v) => actions.chooseFollow(v || undefined)}
          />
        )}

        {resolved.follow ? (
          <YStack gap="$xs">
            <Typography fontSize="$2">{t('prayerLanguage.layout')}</Typography>
            <XStack gap="$sm">
              {(['interleaved', 'columns', 'tap'] as const).map((layout) => (
                <LayoutTile
                  key={layout}
                  layout={layout}
                  selected={page.layout === layout}
                  onPress={() => {
                    if (page.layout !== layout) actions.chooseLayout(layout)
                  }}
                />
              ))}
            </XStack>
            <Pressable
              onPress={actions.swap}
              accessibilityRole="button"
              accessibilityLabel={t('prayerLanguage.swap', {
                language: inlineName(resolved.follow),
              })}
            >
              <XStack
                marginTop="$sm"
                minHeight={44}
                borderRadius="$lg"
                borderWidth={0.5}
                borderColor="$borderColor"
                alignItems="center"
                justifyContent="center"
              >
                <Typography color="$colorSecondary" fontSize="$2">
                  ⇄{' '}
                  {t('prayerLanguage.swap', {
                    language: inlineName(resolved.follow),
                  })}
                </Typography>
              </XStack>
            </Pressable>
          </YStack>
        ) : null}

        <YStack height={0.5} backgroundColor="$borderColor" />

        <YStack gap="$sm">
          <Typography fontSize="$2">{t('prayerLanguage.scope')}</Typography>
          <Segmented
            value={resolved.overridden ? 'this' : 'every'}
            onChange={(v) => (v === 'this' ? actions.onlyThisPrayer() : actions.everyPrayer())}
            options={[
              { value: 'this', label: t('prayerLanguage.onlyThis') },
              { value: 'every', label: t('prayerLanguage.every') },
            ]}
          />
          <Typography variant="annotation" fontSize={15} lineHeight={21}>
            {resolved.overridden
              ? t('prayerLanguage.scopeOwn', {
                  name,
                  languages: resolved.follow
                    ? t('prayerLanguage.withCompanion', {
                        pray: inlineName(resolved.pray),
                        follow: inlineName(resolved.follow),
                      })
                    : inlineName(resolved.pray),
                  stance,
                })
              : t('prayerLanguage.scopeDefault', { stance })}
          </Typography>
          {resolved.overridden ? (
            <Pressable
              onPress={actions.restore}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={t('prayerLanguage.restore')}
            >
              <Typography variant="label" color="$colorSecondary" fontSize={12} letterSpacing={1.5}>
                {t('prayerLanguage.restore')}
              </Typography>
            </Pressable>
          ) : null}
        </YStack>
      </YStack>
    </BottomSheet>
  )
}

const layoutNote: Record<Exclude<BilingualLayout, 'auto'>, string> = {
  interleaved: 'prayerLanguage.layoutInterleavedNote',
  columns: 'prayerLanguage.layoutColumnsNote',
  tap: 'prayerLanguage.layoutTapNote',
}
const layoutLabel: Record<Exclude<BilingualLayout, 'auto'>, string> = {
  interleaved: 'prayerLanguage.layoutInterleaved',
  columns: 'prayerLanguage.layoutColumns',
  tap: 'prayerLanguage.layoutTap',
}

function LayoutTile({
  layout,
  selected,
  onPress,
}: {
  layout: Exclude<BilingualLayout, 'auto'>
  selected: boolean
  onPress: () => void
}) {
  const { t } = useTranslation()
  const ink = selected ? '$background' : '$colorSecondary'
  return (
    <Pressable
      onPress={onPress}
      style={{ flex: 1 }}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={t(layoutLabel[layout])}
    >
      <YStack
        backgroundColor={selected ? '$accent' : '$backgroundSurface'}
        borderRadius="$lg"
        paddingVertical="$sm"
        paddingHorizontal={4}
        alignItems="center"
        gap={6}
        minHeight={96}
      >
        <LayoutGlyph layout={layout} selected={selected} />
        <Typography
          fontSize={15}
          lineHeight={18}
          color={selected ? '$background' : '$color'}
          textAlign="center"
        >
          {t(layoutLabel[layout])}
        </Typography>
        <Typography fontSize={12} lineHeight={15} color={ink} opacity={0.8} textAlign="center">
          {t(layoutNote[layout])}
        </Typography>
      </YStack>
    </Pressable>
  )
}

// A page in miniature: the prayer's lines, and the companion's in a paler ink.
function LayoutGlyph({
  layout,
  selected,
}: {
  layout: Exclude<BilingualLayout, 'auto'>
  selected: boolean
}) {
  const ink = selected ? '$background' : '$colorSecondary'
  const pale = selected ? '$background' : '$accentSubtle'
  const bar = (width: number, color: string, key: string, thin = false) => (
    <View
      key={key}
      width={width}
      height={thin ? 3 : 4}
      borderRadius={2}
      backgroundColor={color}
      opacity={color === pale ? 0.55 : 1}
    />
  )
  if (layout === 'columns') {
    return (
      <XStack gap={4} height={32} alignItems="center">
        <YStack gap={4}>{[21, 19, 21, 16].map((w, i) => bar(w, ink, `a${i}`))}</YStack>
        <YStack gap={4}>{[21, 19, 21, 14].map((w, i) => bar(w, pale, `b${i}`))}</YStack>
      </XStack>
    )
  }
  if (layout === 'tap') {
    return (
      <YStack gap={4} height={32} justifyContent="center">
        {bar(46, ink, 'a')}
        {bar(40, ink, 'b')}
        {bar(46, pale, 'c')}
        {bar(30, pale, 'd')}
      </YStack>
    )
  }
  return (
    <YStack gap={3} height={32} justifyContent="center">
      {bar(46, ink, 'a')}
      {bar(38, pale, 'b', true)}
      {bar(46, ink, 'c')}
      {bar(34, pale, 'd', true)}
    </YStack>
  )
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (value: T) => void
  options: ReadonlyArray<{ value: T; label: string }>
}) {
  return (
    <XStack width="100%" padding={3} borderRadius="$lg" backgroundColor="$backgroundSurface">
      {options.map((opt) => {
        const selected = opt.value === value
        return (
          <Pressable
            key={opt.value}
            onPress={() => {
              if (!selected) onChange(opt.value)
            }}
            style={{ flex: 1 }}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={opt.label}
          >
            <YStack
              minHeight={44}
              borderRadius="$md"
              alignItems="center"
              justifyContent="center"
              backgroundColor={selected ? '$accent' : 'transparent'}
            >
              <Typography fontSize="$2" color={selected ? '$background' : '$colorSecondary'}>
                {opt.label}
              </Typography>
            </YStack>
          </Pressable>
        )
      })}
    </XStack>
  )
}
