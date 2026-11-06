import type { BilingualText, ContentLanguage } from '@ember/content-engine'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { View, XStack, YStack } from 'tamagui'

import { ReadingScaleProvider } from '@/hooks/useReadingStyle'
import { ReadingLanguage } from '../ReadingParagraph'
import { usePageLanguage } from './PageLanguage'

type Side = 'primary' | 'secondary'
type RenderText = (text: string, side: Side) => React.ReactNode

// The companion under each paragraph: a step smaller and quieter than the
// prayer, so the eye keeps to the language being prayed.
const companionScale = 0.86

export function BilingualBlock({
  content,
  renderText,
}: {
  content: BilingualText
  renderText: RenderText
}) {
  const page = usePageLanguage()
  // A source that fixes its secondary's language (the missals' Latin) speaks
  // only to a reader who asked for that language beside the prayer.
  const companionFits =
    content.secondary !== undefined &&
    page.secondary !== undefined &&
    (content.secondaryLanguage === undefined || content.secondaryLanguage === page.secondary)

  const primary = { text: content.primary, side: 'primary' as const, language: page.primary }
  const secondary =
    companionFits && content.secondary !== undefined && page.secondary !== undefined
      ? { text: content.secondary, side: 'secondary' as const, language: page.secondary }
      : undefined
  // A prayer in Latin is fetched vernacular-first and turned here; where the
  // Latin is missing, the vernacular stands alone.
  const main = page.swapped && secondary ? secondary : primary
  const companion = page.swapped ? (secondary ? primary : undefined) : secondary

  // Each column is hyphenated and broken in its own language, however far down
  // the reading surface that draws it sits.
  const render = (part: { text: string; side: Side; language: ContentLanguage }) => (
    <ReadingLanguage language={part.language}>{renderText(part.text, part.side)}</ReadingLanguage>
  )

  if (!companion || page.layout === 'single') return <YStack>{render(main)}</YStack>

  if (page.layout === 'tap')
    return <TapToSwitch main={main} companion={companion} render={render} />

  // A hymn is one text of many stanzas: set each beside its own translation,
  // where the two have as many, rather than the whole Latin before the whole
  // vernacular.
  const pairs = stanzaPairs(main, companion)

  if (page.layout === 'columns') {
    return (
      <YStack gap="$md">
        {pairs.map(([m, c], i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: a text's stanzas never reorder
          <XStack key={i} gap="$sm">
            <YStack flex={1}>{render(m)}</YStack>
            <View width={1} backgroundColor="$borderColor" />
            <YStack flex={1} opacity={0.85}>
              {render(c)}
            </YStack>
          </XStack>
        ))}
      </YStack>
    )
  }

  return (
    <YStack gap="$md">
      {pairs.map(([m, c], i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: a text's stanzas never reorder
        <YStack key={i} gap="$xs">
          {render(m)}
          <ReadingScaleProvider value={companionScale}>
            <YStack opacity={0.7}>{render(c)}</YStack>
          </ReadingScaleProvider>
        </YStack>
      ))}
    </YStack>
  )
}

const stanzaBreak = /\n[ \t]*\n/

function stanzaPairs(main: Part, companion: Part): Array<[Part, Part]> {
  const ms = main.text.split(stanzaBreak)
  const cs = companion.text.split(stanzaBreak)
  if (ms.length < 2 || ms.length !== cs.length) return [[main, companion]]
  return ms.map((text, i) => [
    { ...main, text },
    { ...companion, text: cs[i] },
  ])
}

type Part = { text: string; side: Side; language: ContentLanguage }

function TapToSwitch({
  main,
  companion,
  render,
}: {
  main: Part
  companion: Part
  render: (part: Part) => React.ReactNode
}) {
  const { t } = useTranslation()
  const [showCompanion, setShowCompanion] = useState(false)
  const shown = showCompanion ? companion : main
  const other = showCompanion ? main : companion
  return (
    <Pressable
      onPress={() => setShowCompanion((v) => !v)}
      accessibilityRole="button"
      accessibilityLabel={t('a11y.switchLanguage', { language: t(`languages.${other.language}`) })}
    >
      {render(shown)}
    </Pressable>
  )
}
