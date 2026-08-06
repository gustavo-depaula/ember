// biome-ignore-all lint/suspicious/noArrayIndexKey: static prayer text lines never reorder
import type { ComponentProps } from 'react'
import { useMemo } from 'react'
import { Text, YStack } from 'tamagui'

import { useReadingStyle } from '@/hooks/useReadingStyle'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { JustifiedText } from './JustifiedText'
import { DoInlineLine } from './prayer/DoInline'
import { InlineMarkdownLine } from './prayer/InlineMarkdown'
import { ResponseMark } from './prayer/ResponseMark'

// Justification owns the whole line's spacing, so it can only take lines it
// renders end to end: no emphasis spans, no Divinum Officium markup, no
// response mark. Anything else keeps the existing inline renderer.
const isPlainLine = (line: string) => !/[*_`[\]]/.test(line)

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
  const fontFamilyId = usePreferencesStore((s) => s.fontFamily)
  const contentLanguage = usePreferencesStore((s) => s.contentLanguage)

  return (
    <YStack gap="$xs">
      {lines.map((line, i) => {
        const canJustify =
          reading.textAlign === 'justify' &&
          markup !== 'do' &&
          !(i === 0 && prefix) &&
          isPlainLine(line)

        if (canJustify) {
          return (
            <JustifiedText
              // biome-ignore lint/suspicious/noArrayIndexKey: prayer lines are positional and never reorder
              key={`${i}`}
              text={line}
              fontFamilyId={fontFamilyId}
              fontSizePx={reading.fontSize}
              language={language ?? contentLanguage}
              selectable
              userSelect="text"
              color="$color"
              {...reading}
              // The line model already places every break, so the enclosing
              // Text must not add its own justification on top.
              textAlign="left"
              fontWeight={fontWeight}
              fontStyle={fontStyle}
            />
          )
        }

        return (
          <PrayerText key={`${i}`} fontWeight={fontWeight} fontStyle={fontStyle}>
            {i === 0 && prefix && <ResponseMark value={prefix} />}
            {markup === 'do' ? (
              <DoInlineLine text={line} language={language} reading={reading} />
            ) : (
              <InlineMarkdownLine text={line} baseFamily={baseFamily} language={language} />
            )}
          </PrayerText>
        )
      })}
    </YStack>
  )
}
