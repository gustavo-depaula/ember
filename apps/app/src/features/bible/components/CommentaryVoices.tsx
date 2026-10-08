import { useMemo } from 'react'
import { useTheme, YStack } from 'tamagui'
import { useReadingStyle } from '@/hooks/useReadingStyle'
import type { StyledSegment } from '@/lib/typography/justifyText'
import type { Voice } from '../commentary'
import { LongParagraph } from './LongParagraph'

const nameScale = 0.72

/**
 * A run of commentary, set as the reader's own text is: each voice a
 * paragraph, opened by its Father's name where the source gives one (the
 * Catena), as the printed chains set it.
 */
export function CommentaryVoices({
  voices,
  language = 'en-US',
}: {
  voices: Voice[]
  /** The commentaries are held in English, whatever the reader's language. */
  language?: string
}) {
  const theme = useTheme()
  const { fontSize } = useReadingStyle()
  const burgundy = theme.colorBurgundy?.val as string
  const paragraphs = useMemo(
    () =>
      voices.flatMap((voice) =>
        voice.text.split('\n\n').map((paragraph, j): StyledSegment[] => {
          const body = { text: paragraph.replace(/\n/g, ' '), style: 'regular' as const }
          if (!voice.who || j > 0) return [body]
          const name = {
            text: `${voice.who.toUpperCase()}  `,
            style: 'bold' as const,
            fontSizePx: Math.round(fontSize * nameScale),
            letterSpacing: 1,
            // A raw RN style, where a Tamagui token would not resolve.
            render: { color: burgundy },
            atomic: true,
          }
          return [name, body]
        }),
      ),
    [voices, fontSize, burgundy],
  )

  return (
    <YStack gap="$sm">
      {paragraphs.map((source, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: a fixed run of text, never reordered
        <LongParagraph key={i} source={source} language={language} />
      ))}
    </YStack>
  )
}
