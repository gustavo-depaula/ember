import { useTranslation } from 'react-i18next'
import { XStack, YStack } from 'tamagui'

import { Typography } from '@/components/typography'
import type { ChantPrimitive } from '@/content/primitives'
import { readingScale, useReadingFontSizePx } from '@/hooks/useReadingStyle'
import { romanMode } from './chants'
import { ScoreView } from './ScoreView'

/** A chant as its book prints it: what it is and its mode, the score, where it comes from. */
export function ChantBlock({
  chant,
  width,
  named = true,
}: {
  chant: ChantPrimitive
  width: number
  named?: boolean
}) {
  const { t } = useTranslation()
  // The score follows the reader's text size, as the text it sets does.
  const scale = useReadingFontSizePx() / readingScale.fontSize[2]
  const mode = romanMode(chant.mode)

  return (
    <YStack gap="$sm">
      <XStack alignItems="baseline" gap="$sm">
        <Typography flex={1} fontStyle="italic" tone="muted" numberOfLines={1}>
          {[named && chant.part, chant.name].filter(Boolean).join(' · ')}
        </Typography>
        {/* A chant has a mode; a psalm set to a tone has the tone, which its note says. */}
        <Typography variant="annotation">
          {mode ? t('chant.mode', { mode }) : chant.commentary}
        </Typography>
      </XStack>
      <ScoreView score={chant.score} width={width} scale={scale} label={chant.name} />
      <Typography variant="reference">
        {[
          chant.book,
          chant.transcriber && t('chant.transcribedBy', { name: chant.transcriber }),
          t('chant.license'),
        ]
          .filter(Boolean)
          .join(' · ')}
      </Typography>
    </YStack>
  )
}
