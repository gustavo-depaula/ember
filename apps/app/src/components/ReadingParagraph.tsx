import type { ComponentProps, ReactNode } from 'react'
import { Text } from 'tamagui'

import { useReadingStyle } from '@/hooks/useReadingStyle'
import type { TextStyleName } from '@/lib/typography/fontMetrics'
import type { StyledSegment } from '@/lib/typography/justifyText'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { JustifiedText } from './JustifiedText'
import { blockFace } from './prayer/InlineMarkdown'

/**
 * A paragraph set in the reader's own type, broken by the Knuth–Plass pass.
 *
 * One place for the decision every reading surface has to make the same way:
 * when the reader asks for justified text the breaker owns the line endings and
 * the block declares itself `left` (so the platform leaves them alone), and
 * when they ask for ragged the block is ordinary wrapped text. Either way the
 * block's face is NAMED rather than asked for as a slant, because a synthetic
 * oblique has the roman advances and the justifier would be measuring a face
 * the screen isn't drawing.
 *
 * `fallback` renders wherever justification isn't available — the first frame
 * before `onLayout`, or a face whose width can't be known — so it has to be a
 * real rendering of the same text, not a flattened string.
 *
 * See `docs/design/typography-justification.md`.
 */
export function ReadingParagraph({
  source,
  fallback,
  base = 'regular',
  color = '$color',
  language,
  testID,
  accessibilityLabel,
}: {
  source: StyledSegment[]
  fallback: ReactNode
  /** The face the block is set in — a meditation is italic throughout. */
  base?: TextStyleName
  color?: ComponentProps<typeof Text>['color']
  /** Overrides the content language the hyphenator is chosen by. */
  language?: string
  testID?: string
  /** Set on the block, so a nested mark isn't spelled out by a screen reader. */
  accessibilityLabel?: string
}) {
  const reading = useReadingStyle()
  const fontFamilyId = usePreferencesStore((s) => s.fontFamily)
  const contentLanguage = usePreferencesStore((s) => s.contentLanguage)
  const baseFamily = reading.fontFamily as unknown as string
  // Cast because the RN `TextStyle` blockFace returns also declares box
  // properties Tamagui types more narrowly; the keys it sets are Text props.
  const face = blockFace(baseFamily, base) as ComponentProps<typeof Text>

  if (reading.textAlign !== 'justify') {
    return (
      <Text
        selectable
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        {...reading}
        color={color}
        {...face}
      >
        {fallback}
      </Text>
    )
  }

  return (
    <JustifiedText
      source={source}
      fontFamilyId={fontFamilyId}
      fontSizePx={reading.fontSize}
      baseStyle={base}
      language={language ?? contentLanguage}
      fallback={fallback}
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
