import { useTranslation } from 'react-i18next'
import { Text, XStack } from 'tamagui'

import { Typography } from '@/components/typography'
import { getEntry } from '@/content/contentIndex'
import { getManifest } from '@/content/resolver'
import { coverFor } from '@/features/covers'
import { localizeContent } from '@/lib/i18n'
import { artFor } from './artMap'
import { blockInk, toneForKey } from './bgColor'
import { FeatureBlock } from './FeatureBlock'
import { clockOf } from './prayNowOrder'
import type { PrayNow } from './usePrayNow'

// ✠ sits high in the heading face; a measured nudge centres it on the
// lowercase of "1 min".
const crossNudge = 2

/**
 * The head of Today's carousel: what to pray now, as a feature block with the
 * practice's own cover and tone, and a ✠ pill with the minutes it takes. Not
 * audio, so no play triangle — the cross is the "pray" mark.
 */
export function PrayNowCard({ next, comingUp, suggestion, block, onPray }: PrayNow) {
  const { t } = useTranslation()
  const ref = next.practice_id.includes('/') ? next.practice_id : `practice/${next.practice_id}`
  const manifest = getManifest(next.practice_id)
  const entry = getEntry(ref)
  const description = manifest?.description ? localizeContent(manifest.description) : undefined
  const minutes = manifest?.estimatedMinutes
  const marker = t(
    (() => {
      if (suggestion) return 'explore.prayNow.suggestion'
      if (comingUp) return 'explore.prayNow.comingUp'
      return 'explore.prayNow.label'
    })(),
  )
  return (
    <FeatureBlock
      label={`${marker} · ${comingUp ? clockOf(next.due) : t(`timeBlock.${block}`)}`}
      title={next.name}
      subtitle={[next.subtitle, description].filter(Boolean).join(' — ') || undefined}
      image={artFor(ref)}
      cover={entry ? coverFor(entry) : undefined}
      // The cover names the practice; an office's card title is the hour.
      coverTitle={manifest ? localizeContent(manifest.name) : next.subtitle}
      // Keyed like the library tile (full catalog id), so it's the same color.
      tone={toneForKey(ref)}
      onPress={onPray}
      footer={
        <XStack alignItems="center" justifyContent="space-between" marginTop={10}>
          <XStack
            alignItems="center"
            gap={7}
            backgroundColor="rgba(245,239,226,0.14)"
            borderRadius={999}
            paddingHorizontal={12}
            paddingVertical={6}
          >
            <Text
              fontFamily="$heading"
              fontSize={15}
              lineHeight={18}
              color={blockInk}
              top={crossNudge}
            >
              ✠
            </Text>
            {!!minutes && (
              <Typography color={blockInk} fontSize={14} lineHeight={18} fontWeight="600">
                {t('explore.prayNow.minutes', { count: minutes })}
              </Typography>
            )}
          </XStack>
          {!suggestion && (
            <Typography color="rgba(245,239,226,0.55)" fontSize={13}>
              {t(`tier.${next.tier}`)}
            </Typography>
          )}
        </XStack>
      }
    />
  )
}
