import type { ComponentProps, ReactNode } from 'react'
import { useMemo } from 'react'
import { Text } from 'tamagui'

import { useLastLineGuard } from '@/hooks/useLastLineGuard'
import { useReadingStyle } from '@/hooks/useReadingStyle'
import type { TextStyleName } from '@/lib/typography/fontMetrics'
import type { StyledSegment } from '@/lib/typography/justifyText'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { blockFace } from '../prayer/InlineMarkdown'
import { JustifiedLines } from './JustifiedLines'
import { useReadingLanguage } from './readingLanguage'
import { SegmentRuns, useFaces } from './runs'

/**
 * A paragraph set in the reader's own type, broken by the Knuth–Plass pass.
 *
 * The platform breaks it instead when the reader chose ragged, a segment holds
 * a hard newline (the breaker has no model for it), a `lead` it can't measure
 * opens it, or the caller sets `platformBreaks`. Text the segment model can't
 * describe (Divinum Officium's inline markup) comes in as `children` and is
 * always platform-broken, with the same face and last-line guard.
 *
 * See `docs/design/typography-justification.md`.
 */
export function ReadingParagraph({
  source,
  lead,
  platformBreaks,
  children,
  base = 'regular',
  color = '$color',
  language,
  testID,
  accessibilityLabel,
}: {
  /** A meditation is italic throughout. */
  base?: TextStyleName
  color?: ComponentProps<typeof Text>['color']
  language?: string
  testID?: string
  /** Set on the block, so a nested mark isn't spelled out by a screen reader. */
  accessibilityLabel?: string
} & (
  | {
      source: StyledSegment[]
      /** An inline mark drawn before the text that the breaker can't measure
       *  — a ℟ prefix, a drop cap. Its paragraph is left to the platform. */
      lead?: ReactNode
      /** Leave the line breaking to the platform even where the breaker could
       *  take it — for a block that must not mix the two renderers. */
      platformBreaks?: boolean
      children?: never
    }
  | { children: ReactNode; source?: never; lead?: never; platformBreaks?: never }
)) {
  const reading = useReadingStyle()
  const fontFamilyId = usePreferencesStore((s) => s.fontFamily)
  const lang = useReadingLanguage(language)
  const baseFamily = reading.fontFamily as unknown as string
  const faces = useFaces(baseFamily, base)
  // Cast because the RN `TextStyle` blockFace returns also declares box
  // properties Tamagui types more narrowly; the keys it sets are Text props.
  const face = blockFace(baseFamily, base) as ComponentProps<typeof Text>

  const text = useMemo(() => source?.map((s) => s.text).join('') ?? '', [source])
  const guard = useLastLineGuard(
    `${reading.fontSize}|${reading.lineHeight}|${baseFamily}|${base}|${lang}|${text}`,
  )

  const platformText = source ? (
    <>
      {lead}
      <SegmentRuns segments={source} faces={faces} language={lang} />
    </>
  ) : (
    children
  )

  const justify =
    source !== undefined &&
    reading.textAlign === 'justify' &&
    !platformBreaks &&
    !lead &&
    !text.includes('\n')

  if (!justify) {
    return (
      <Text
        selectable
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        {...reading}
        color={color}
        {...face}
        minHeight={guard.minHeight}
        onLayout={guard.onLayout}
      >
        {platformText}
      </Text>
    )
  }

  return (
    <JustifiedLines
      segments={source}
      faces={faces}
      fontFamilyId={fontFamilyId}
      fontSizePx={reading.fontSize}
      language={lang}
      fallback={platformText}
      selectable
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      {...reading}
      color={color}
      // The line model already places every break, so the enclosing Text must
      // not add its own justification on top.
      textAlign="left"
      {...face}
    />
  )
}
