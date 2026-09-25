// biome-ignore-all lint/suspicious/noArrayIndexKey: static verse lists never reorder

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, useTheme, XStack, YStack } from 'tamagui'
import type { VersesPrimitive } from '@/content/primitives'
import { useReadingStyle } from '@/hooks/useReadingStyle'
import type { StyledSegment } from '@/lib/typography/justifyText'
import { BilingualBlock } from './prayer/BilingualBlock'
import { parseDoInline } from './prayer/DoInline'
import { ResponseMark } from './prayer/ResponseMark'
import { verseRefLabel, verseRefScale, verseRefTracking } from './prayer/VerseRef'
import { ReadingParagraph } from './ReadingParagraph'
import { Typography } from './typography'

/**
 * A prayed verse, optionally led by its citation.
 *
 * The citation is an inline run of its own — 0.72x body, tracked, muted and
 * `atomic`, so justif prices it at what it actually draws and never stretches
 * or hyphenates it. Nothing here needs to opt out of justification: a ℣/℟ mark
 * sits in a sibling column, and a verse number in a fixed gutter, so the prayed
 * text reaches the breaker as ordinary prose.
 */
function Verse({
  text,
  citation,
  bold,
  markup,
}: {
  text: string
  citation?: string
  bold?: boolean
  markup?: 'do'
}) {
  const reading = useReadingStyle()
  const theme = useTheme()
  // Resolved rather than a token: a run's `render` is a raw RN style.
  const citationRender = useMemo(
    () => ({
      color: theme.colorSecondary?.val as string,
      lineHeight: reading.lineHeight,
    }),
    [theme.colorSecondary, reading.lineHeight],
  )

  // DO verses carry the same inline markup as DO body text (a Confíteor's
  // /:bate no peito:/, a Gloria's mediant), styled as DoInline styles it.
  const doMarkRender = useMemo(
    () => ({
      mark: { color: theme.colorBurgundy?.val as string, lineHeight: reading.lineHeight },
      point: { color: theme.colorBurgundy?.val as string },
      mediant: { color: theme.colorSecondary?.val as string },
    }),
    [theme.colorBurgundy, theme.colorSecondary, reading.lineHeight],
  )
  const runs = useMemo(() => (markup === 'do' ? parseDoInline(text) : undefined), [markup, text])

  const source = useMemo<StyledSegment[]>(() => {
    const base = bold ? ('bold' as const) : ('regular' as const)
    if (runs) {
      return runs.map((run) => {
        if (run.kind === 'body') return { text: run.text, style: base }
        if (run.kind === 'smallcaps') {
          return { text: run.text.toUpperCase(), style: base, letterSpacing: 0.5 }
        }
        if (run.kind === 'mark') {
          return {
            text: run.text,
            style: 'regular' as const,
            fontSizePx: Math.round(reading.fontSize * 0.72),
            render: doMarkRender.mark,
          }
        }
        return { text: run.text, style: base, render: doMarkRender[run.kind] }
      })
    }
    const verse = { text, style: base }
    if (!citation) return [verse]
    return [
      {
        text: verseRefLabel(citation),
        style: 'regular' as const,
        fontSizePx: Math.round(reading.fontSize * verseRefScale),
        letterSpacing: verseRefTracking,
        render: citationRender,
        atomic: true,
      },
      verse,
    ]
  }, [text, citation, bold, reading.fontSize, citationRender, runs, doMarkRender])

  return (
    <ReadingParagraph
      source={source}
      base={bold ? 'bold' : 'regular'}
      // `aria-hidden` on a nested VerseRef only takes on web — RN flattens a
      // nested <Text> into its parent's accessibility label, so a screen reader
      // would spell the citation before every verse. Labelling the block with
      // the prayed text alone suppresses it on both platforms.
      accessibilityLabel={runs ? runs.map((r) => r.text).join('') : text}
    />
  )
}

export function VersesBlock({
  header,
  items,
  style = 'numbered',
  fallback,
  markup,
}: VersesPrimitive) {
  const { t } = useTranslation()
  const reading = useReadingStyle()
  if (items.length === 0) return undefined

  if (style === 'vr') {
    return (
      <YStack gap="$sm">
        {items.map((item, i) => {
          const isResponse = item.role === 'r'
          if (item.mark) {
            return (
              <XStack
                key={`vr-${i}`}
                gap={6}
                alignItems="baseline"
                accessibilityLabel={
                  item.mark === 'Ant.'
                    ? t('a11y.antiphon', { text: item.text.primary })
                    : `${item.mark} ${item.text.primary}`
                }
              >
                <ResponseMark value={item.mark} fontSize={reading.fontSize} />
                <YStack flex={1}>
                  <BilingualBlock
                    content={item.text}
                    renderText={(text) => <Verse text={text} markup={markup} />}
                  />
                </YStack>
              </XStack>
            )
          }
          return (
            <XStack
              key={`vr-${i}`}
              gap={4}
              alignItems="baseline"
              accessibilityLabel={t(isResponse ? 'a11y.response' : 'a11y.versicle', {
                text: item.text.primary,
              })}
            >
              <ResponseMark value={isResponse ? '℟' : '℣'} width={18} />
              <YStack flex={1}>
                <BilingualBlock
                  content={item.text}
                  renderText={(text) => <Verse text={text} bold={isResponse} markup={markup} />}
                />
              </YStack>
            </XStack>
          )
        })}
      </YStack>
    )
  }

  // Cento — the citation leads the verse inline, so the prayed text keeps the
  // full column width instead of being squeezed beside a gutter wide enough for
  // "Ps. 56:1". Inline, it is a run of the same paragraph rather than a
  // separate element, which is what lets the whole line justify as one.
  if (style === 'cento') {
    return (
      <YStack gap="$sm">
        {items.map((item, i) => (
          <BilingualBlock
            key={`c-${i}`}
            content={item.text}
            renderText={(text, side) => (
              <Verse
                text={text}
                citation={
                  item.ref
                    ? ((side === 'secondary' ? item.ref.secondary : item.ref.primary) ??
                      item.ref.primary)
                    : undefined
                }
              />
            )}
          />
        ))}
      </YStack>
    )
  }

  // Default — numbered style: optional header label + numbered rows.
  return (
    <YStack gap="$sm">
      {fallback && (
        <XStack backgroundColor="$backgroundSurface" borderRadius="$md" padding="$sm">
          <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
            {t('office.fallbackNotice')}
          </Text>
        </XStack>
      )}
      {header && (
        <BilingualBlock
          content={header}
          renderText={(text) => (
            <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" fontWeight="500">
              {text}
            </Text>
          )}
        />
      )}
      {items.map((item, i) => (
        <XStack key={`v-${i}`} gap="$sm" alignItems="flex-start">
          {item.num !== undefined && (
            <Typography variant="verse-number" fontSize="$1" fontWeight="600" width={36}>
              {item.num}
            </Typography>
          )}
          {/* The flex has to sit on a wrapper, not on the PrayerText inside:
              BilingualBlock puts its own stack in between, and a stack that
              neither grows nor shrinks takes its intrinsic width — which the
              text measures at the FULL row width, ignoring the number gutter.
              Every verse then hangs one gutter past the right margin. */}
          <YStack flex={1}>
            <BilingualBlock content={item.text} renderText={(text) => <Verse text={text} />} />
          </YStack>
        </XStack>
      ))}
    </YStack>
  )
}
