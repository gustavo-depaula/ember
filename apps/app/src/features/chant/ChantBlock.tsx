import { ChevronDown, ChevronRight } from 'lucide-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { useTheme, XStack, YStack } from 'tamagui'

import { Typography } from '@/components/typography'
import type { ChantPrimitive } from '@/content/primitives'
import { readingScale, useReadingFontSizePx } from '@/hooks/useReadingStyle'
import { romanMode } from './chants'
import { ScoreView } from './ScoreView'

/**
 * The chant of the text above it, folded away until asked for: a line naming
 * it, which opens in place onto the score. Most who pray a Mass from the app
 * read it; the one who sings it should not have to leave the page to do so.
 */
export function ChantBlock({ chant }: { chant: ChantPrimitive }) {
  const { t } = useTranslation()
  const theme = useTheme()
  const [open, setOpen] = useState(false)
  const [width, setWidth] = useState(0)
  // The score follows the reader's text size, as the text it sets does.
  const scale = useReadingFontSizePx() / readingScale.fontSize[2]
  const mode = romanMode(chant.mode)

  return (
    <YStack onLayout={(e) => setWidth(Math.floor(e.nativeEvent.layout.width))}>
      <Pressable
        onPress={() => setOpen((was) => !was)}
        accessibilityRole="button"
        accessibilityLabel={t(open ? 'a11y.hideChant' : 'a11y.showChant', { name: chant.name })}
        accessibilityState={{ expanded: open }}
        aria-expanded={open}
      >
        {/* The line a collapsed priest's prayer wears (CollapsibleBlock), with the chant's name and mode. */}
        <XStack minHeight={44} alignItems="center" gap="$xs">
          {open ? (
            <ChevronDown size={14} color={theme.colorSecondary.val} />
          ) : (
            <ChevronRight size={14} color={theme.colorSecondary.val} />
          )}
          <Typography
            variant="label"
            fontSize="$1"
            tone="muted"
            letterSpacing={1}
            textTransform="uppercase"
          >
            {t('chant.cantus')}
          </Typography>
          <Typography flex={1} fontStyle="italic" tone="muted" numberOfLines={1} paddingLeft="$xs">
            {chant.name}
          </Typography>
          {/* A chant has a mode; a psalm set to a tone has the tone, which its note says. */}
          <Typography variant="annotation">
            {mode ? t('chant.mode', { mode }) : chant.commentary}
          </Typography>
        </XStack>
      </Pressable>
      {open && width > 0 && (
        <YStack gap="$sm" paddingBottom="$sm">
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
      )}
    </YStack>
  )
}
