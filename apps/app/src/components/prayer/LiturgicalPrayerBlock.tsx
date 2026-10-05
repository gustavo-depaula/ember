import type { BilingualText } from '@ember/content-engine'
import { useTranslation } from 'react-i18next'
import { XStack, YStack } from 'tamagui'
import { PrayerLines } from '../PrayerText'
import { BilingualBlock } from './BilingualBlock'
import { ResponseMark } from './ResponseMark'

export function LiturgicalPrayerBlock({
  speaker,
  text,
}: {
  speaker: 'priest' | 'people' | 'all'
  text: BilingualText
}) {
  const { t } = useTranslation()
  if (speaker === 'all') {
    return <BilingualBlock content={text} renderText={(line) => <PrayerLines text={line} />} />
  }

  // Same mark gutter as a `response` versicle in VersesBlock: a spoken part
  // usually sits right under one, and the two must share a left edge.
  const isResponse = speaker === 'people'
  return (
    <XStack
      gap={4}
      alignItems="baseline"
      accessibilityLabel={t(isResponse ? 'a11y.response' : 'a11y.versicle', {
        text: text.primary,
      })}
    >
      <ResponseMark value={isResponse ? '℟' : '℣'} width={18} />
      <YStack flex={1}>
        <BilingualBlock
          content={text}
          renderText={(line) => (
            <PrayerLines text={line} fontWeight={isResponse ? 'bold' : undefined} />
          )}
        />
      </YStack>
    </XStack>
  )
}
