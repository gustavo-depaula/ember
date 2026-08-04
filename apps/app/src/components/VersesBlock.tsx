// biome-ignore-all lint/suspicious/noArrayIndexKey: static verse lists never reorder

import { useTranslation } from 'react-i18next'
import { Text, XStack, YStack } from 'tamagui'
import type { VersesPrimitive } from '@/content/primitives'
import { PrayerText } from './PrayerText'
import { BilingualBlock } from './prayer/BilingualBlock'
import { ResponseMark } from './prayer/ResponseMark'
import { VerseRef } from './prayer/VerseRef'
import { Typography } from './typography'

export function VersesBlock({ header, items, style = 'numbered', fallback }: VersesPrimitive) {
  const { t } = useTranslation()
  if (items.length === 0) return undefined

  if (style === 'vr') {
    return (
      <YStack gap="$sm">
        {items.map((item, i) => {
          const isResponse = item.role === 'r'
          return (
            <XStack
              key={`vr-${i}`}
              gap={4}
              alignItems="baseline"
              accessibilityLabel={`${isResponse ? t('a11y.response') : t('a11y.versicle')}: ${item.text.primary}`}
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

  // Cento — the citation leads the verse inline, so the prayed text keeps the
  // full column width instead of being squeezed beside a gutter wide enough for
  // "Ps. 56:1". Nesting the mark inside PrayerText is the same pattern
  // ResponseMark uses for ℣/℟.
  if (style === 'cento') {
    return (
      <YStack gap="$sm">
        {items.map((item, i) => (
          <BilingualBlock
            key={`c-${i}`}
            content={item.text}
            renderText={(text) => (
              <PrayerText>
                {item.num !== undefined && <VerseRef value={String(item.num)} />}
                {text}
              </PrayerText>
            )}
          />
        ))}
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
            <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" fontWeight="500">
              {text}
            </Text>
          )}
        />
      )}
      {items.map((item, i) => (
        <XStack key={`v-${i}`} gap="$sm" alignItems="flex-start">
          {item.num !== undefined && (
            <Typography variant="verse-number" fontSize="$1" fontWeight="600" width={36}>
              {item.num}
            </Typography>
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
