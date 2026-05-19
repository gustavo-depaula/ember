// Renders the `verses` primitive. Unifies what used to be five distinct
// blocks — BibleReadingBlock, CccReadingBlock, HymnBlock, CanticleBlock,
// ResponseBlock — into one component driven by the verses' `style`.

// biome-ignore-all lint/suspicious/noArrayIndexKey: static verse lists never reorder

import { useTranslation } from 'react-i18next'
import { Text, XStack, YStack } from 'tamagui'
import type { VersesPrimitive } from '@/content/primitives'
import { BilingualBlock } from './prayer/BilingualBlock'
import { ResponseMark } from './prayer/ResponseMark'
import { PrayerText } from './PrayerText'

export function VersesBlock({ header, items, style = 'numbered', fallback }: VersesPrimitive) {
  const { t } = useTranslation()
  if (items.length === 0) return undefined

  if (style === 'vr') {
    return (
      <YStack gap="$sm">
        {items.map((item, i) => {
          const isResponse = String(item.num).toUpperCase().startsWith('R')
          return (
            <XStack
              key={`vr-${i}`}
              gap={4}
              alignItems="baseline"
              accessibilityLabel={(isResponse ? t('a11y.response') : t('a11y.versicle')) +
                ': ' + item.text.primary}
            >
              <ResponseMark value={isResponse ? '℟' : '℣'} width={18} />
              <YStack flex={1}>
                <BilingualBlock
                  content={item.text}
                  renderText={(text) => (
                    <PrayerText fontWeight={isResponse ? '600' : undefined}>{text}</PrayerText>
                  )}
                />
              </YStack>
            </XStack>
          )
        })}
      </YStack>
    )
  }

  // Default — numbered style: optional header label + numbered rows.
  return (
    <YStack gap="$sm">
      {fallback && (
        <XStack backgroundColor="$backgroundSurface" borderRadius="$md" padding="$sm">
          <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
            {t('office.fallbackNotice')}
          </Text>
        </XStack>
      )}
      {header && (
        <BilingualBlock
          content={header}
          renderText={(text) => (
            <Text fontFamily="$body" fontSize="$2" color="$colorMutedBlue" fontWeight="500">
              {text}
            </Text>
          )}
        />
      )}
      {items.map((item, i) => (
        <XStack key={`v-${i}`} gap="$sm" alignItems="flex-start">
          {item.num !== undefined && (
            <Text
              fontFamily="$body"
              fontSize="$1"
              color="$colorMutedBlue"
              fontWeight="600"
              width={36}
            >
              {item.num}
            </Text>
          )}
          <BilingualBlock
            content={item.text}
            renderText={(text) => <PrayerText flex={1}>{text}</PrayerText>}
          />
        </XStack>
      ))}
    </YStack>
  )
}
