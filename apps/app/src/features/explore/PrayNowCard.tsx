import { useTranslation } from 'react-i18next'
import Svg, { Path } from 'react-native-svg'
import { XStack } from 'tamagui'

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

// Phosphor's "hands-praying" (MIT), on a 256 box — lucide has no praying hands.
const prayingHands =
  'M235.32,180l-36.24-36.25L162.62,23.46A21.76,21.76,0,0,0,128,12.93,21.76,21.76,0,0,0,93.38,23.46L56.92,143.76,20.68,180a16,16,0,0,0,0,22.62l32.69,32.69a16,16,0,0,0,22.63,0L124.28,187a40.68,40.68,0,0,0,3.72-4.29,40.68,40.68,0,0,0,3.72,4.29L180,235.32a16,16,0,0,0,22.63,0l32.69-32.69A16,16,0,0,0,235.32,180ZM64.68,224,32,191.32l12.69-12.69,32.69,32.69ZM120,158.75a23.85,23.85,0,0,1-7,17L88.68,200,56,167.32l13.65-13.66a8,8,0,0,0,2-3.34l37-122.22A5.78,5.78,0,0,1,120,29.78Zm23,17a23.85,23.85,0,0,1-7-17v-129a5.78,5.78,0,0,1,11.31-1.68l37,122.22a8,8,0,0,0,2,3.34l14.49,14.49-33.4,32ZM191.32,224l-12.56-12.57,33.39-32L224,191.32Z'

/**
 * The head of Today's carousel: what to pray now, as a feature block with the
 * practice's own cover and tone, and a praying-hands pill with the minutes it
 * takes. Not audio, so no play triangle — the hands are the "pray" mark.
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
        <XStack alignItems="center" justifyContent="space-between" marginTop={8}>
          <XStack
            alignItems="center"
            gap={7}
            backgroundColor="rgba(245,239,226,0.14)"
            borderRadius={999}
            paddingHorizontal={12}
            paddingVertical={6}
          >
            <Svg width={15} height={15} viewBox="0 0 256 256">
              <Path d={prayingHands} fill={blockInk} />
            </Svg>
            {!!minutes && (
              <Typography
                // A reader face, not a theme font token, so it goes in by name.
                style={{ fontFamily: 'SourceSerif4_400Regular' }}
                color={blockInk}
                fontSize={13}
                lineHeight={18}
              >
                {t('explore.prayNow.minutes', { count: minutes })}
              </Typography>
            )}
          </XStack>
          {!suggestion && (
            <Typography
              fontFamily="$heading"
              color="rgba(245,239,226,0.55)"
              fontSize={11}
              letterSpacing={1.4}
              textTransform="uppercase"
            >
              {t(`tier.${next.tier}`)}
            </Typography>
          )}
        </XStack>
      }
    />
  )
}
