import { YStack } from 'tamagui'

import { Typography } from '@/components'

import type { Voice } from '../commentary'

/**
 * A run of commentary: each voice a paragraph, opened by its Father's name
 * where the source gives one (the Catena), as the printed chains set it.
 */
export function CommentaryVoices({ voices }: { voices: Voice[] }) {
  return (
    <YStack gap="$sm">
      {voices.map((voice, i) =>
        voice.text.split('\n\n').map((paragraph, j) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: a fixed run of text, never reordered
          <Typography key={`${i}-${j}`} fontSize="$3" lineHeight="$3" selectable>
            {voice.who && j === 0 ? (
              <Typography
                variant="label"
                fontSize="$1"
                color="$colorBurgundy"
                textTransform="uppercase"
                letterSpacing={1}
              >
                {voice.who}
                {'  '}
              </Typography>
            ) : undefined}
            {paragraph}
          </Typography>
        )),
      )}
    </YStack>
  )
}
