// biome-ignore-all lint/suspicious/noArrayIndexKey: static prayer text lines never reorder
import type { ComponentProps } from 'react'
import { useMemo } from 'react'
import { Text, YStack } from 'tamagui'

import { useReadingStyle } from '@/hooks/useReadingStyle'
import type { TextStyleName } from '@/lib/typography/fontMetrics'
import type { StyledSegment } from '@/lib/typography/justifyText'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { DoInlineLine } from './prayer/DoInline'
import { blockFace, composeStyle, InlineMarkdownLine } from './prayer/InlineMarkdown'
import { parseInline } from './prayer/parseMarkdown'
import { ResponseMark } from './prayer/ResponseMark'
import { ReadingParagraph } from './ReadingParagraph'

// Emphasis is not an obstacle to justification — justif breaks across mixed
// runs natively, so `*Mater Dei*` is measured in the italic face and justified
// with everything else.
//
// The block's own face has to be part of that: a meditation is italic
// throughout, so its plain words are italic and its emphasis flips to roman.
// Measuring both against `regular` would price every line off the wrong table.
const toSegments = (line: string, base: TextStyleName): StyledSegment[] =>
  parseInline(line).map((node) => ({
    text: node.text,
    style: composeStyle(node.type, base),
  }))

// The face a block is set in, as the props actually reach us.
function baseStyleOf(
  fontWeight: ComponentProps<typeof Text>['fontWeight'],
  fontStyle: ComponentProps<typeof Text>['fontStyle'],
): TextStyleName {
  const bold = fontWeight === 'bold' || fontWeight === '700'
  const italic = fontStyle === 'italic'
  if (bold) return italic ? 'boldItalic' : 'bold'
  return italic ? 'italic' : 'regular'
}

export function PrayerText(props: ComponentProps<typeof Text>) {
  const style = useReadingStyle()
  return <Text selectable userSelect="text" color="$color" {...style} {...props} />
}

export function PrayerLines({
  text,
  fontWeight,
  fontStyle,
  language,
  prefix,
  markup,
}: {
  text: string
  fontWeight?: ComponentProps<typeof Text>['fontWeight']
  fontStyle?: ComponentProps<typeof Text>['fontStyle']
  language?: string
  // Inline missal mark placed at the start of the first line (e.g. "℟. "
  // for people responses). Rendered through `ResponseMark` so styling
  // stays in sync with versicle/response markers across the app.
  prefix?: string
  // 'do' renders each line with the Divinum Officium inline renderer (verse
  // numbers, pointing marks, small caps) instead of the markdown one.
  markup?: 'do'
}) {
  const reading = useReadingStyle()
  const baseFamily = reading.fontFamily as unknown as string
  const lines = useMemo(() => text.split('\n'), [text])
  const contentLanguage = usePreferencesStore((s) => s.contentLanguage)

  // Emphasis no longer disqualifies a line; what remains are the two cases the
  // justifier genuinely can't own end to end. Divinum Officium lines carry
  // verse numbers, pointing marks and small caps that `DoInlineLine` renders,
  // and a response mark is a separate leading element. Both are block-level
  // decisions, so a prayer never mixes the two renderers mid-way.
  const canJustify = reading.textAlign === 'justify' && markup !== 'do' && !prefix

  const base = baseStyleOf(fontWeight, fontStyle)
  const segments = useMemo(
    () => (canJustify ? lines.map((line) => toSegments(line, base)) : undefined),
    [canJustify, lines, base],
  )

  if (segments) {
    return (
      <YStack gap="$xs">
        {segments.map((source, i) => (
          <ReadingParagraph
            // biome-ignore lint/suspicious/noArrayIndexKey: prayer lines are positional and never reorder
            key={`${i}`}
            source={source}
            base={base}
            language={language ?? contentLanguage}
            // Where justification gives up — the first frame, or a face whose
            // width can't be known — the same line still has to render with its
            // emphasis intact, so hand it the ordinary inline renderer.
            fallback={
              <InlineMarkdownLine
                text={lines[i]}
                baseFamily={baseFamily}
                language={language}
                base={base}
              />
            }
          />
        ))}
      </YStack>
    )
  }

  return (
    <YStack gap="$xs">
      {lines.map((line, i) => {
        return (
          <PrayerText
            key={`${i}`}
            // Cast for the same reason as `ReadingParagraph`: the RN TextStyle
            // blockFace returns declares box properties Tamagui types more
            // narrowly, and the keys it actually sets are all Text props.
            {...(blockFace(baseFamily, base) as ComponentProps<typeof Text>)}
          >
            {i === 0 && prefix && <ResponseMark value={prefix} />}
            {markup === 'do' ? (
              <DoInlineLine text={line} language={language} reading={reading} />
            ) : (
              <InlineMarkdownLine
                text={line}
                baseFamily={baseFamily}
                language={language}
                base={base}
              />
            )}
          </PrayerText>
        )
      })}
    </YStack>
  )
}
