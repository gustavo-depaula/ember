// biome-ignore-all lint/suspicious/noArrayIndexKey: static prayer text lines never reorder
import type { ComponentProps } from 'react'
import { useMemo } from 'react'
import { Text, YStack } from 'tamagui'

import { useReadingStyle } from '@/hooks/useReadingStyle'
import type { TextStyleName } from '@/lib/typography/fontMetrics'
import type { StyledSegment } from '@/lib/typography/justifyText'
import { DoInlineLine } from './prayer/DoInline'
import { composeStyle } from './prayer/InlineMarkdown'
import { parseInline } from './prayer/parseMarkdown'
import { ResponseMark } from './prayer/ResponseMark'
import { ReadingParagraph, useReadingLanguage } from './ReadingParagraph'

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
  const lang = useReadingLanguage(language)
  const lines = useMemo(() => text.split('\n'), [text])
  const base = baseStyleOf(fontWeight, fontStyle)
  const segments = useMemo(
    () => (markup === 'do' ? undefined : lines.map((line) => toSegments(line, base))),
    [markup, lines, base],
  )

  // Divinum Officium lines carry verse numbers, pointing marks and small caps
  // the segment model doesn't describe, so they reach the paragraph as
  // ready-made text. A response mark is a separate leading element the breaker
  // can't measure, and a prayer never mixes the two renderers mid-way, so its
  // other lines stay with the platform too.
  return (
    <YStack gap="$xs">
      {lines.map((line, i) => {
        const lead = i === 0 && prefix ? <ResponseMark value={prefix} /> : undefined
        if (!segments) {
          return (
            <ReadingParagraph key={`${i}`} base={base} language={lang}>
              {lead}
              <DoInlineLine text={line} language={lang} reading={reading} />
            </ReadingParagraph>
          )
        }
        return (
          <ReadingParagraph
            key={`${i}`}
            source={segments[i]}
            base={base}
            language={lang}
            lead={lead}
            platformBreaks={!!prefix}
          />
        )
      })}
    </YStack>
  )
}
