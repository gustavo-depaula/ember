import type { BilingualText } from '@ember/content-engine'
import { YStack } from 'tamagui'
import { PrayerLines } from '../PrayerText'
import { BilingualBlock } from './BilingualBlock'

export function LiturgicalPrayerBlock({
  speaker,
  text,
}: {
  speaker: 'priest' | 'people' | 'all'
  text: BilingualText
}) {
  if (speaker === 'all') {
    return <BilingualBlock content={text} renderText={(t) => <PrayerLines text={t} />} />
  }

  const prefix = speaker === 'people' ? '℟. ' : '℣. '
  const fontWeight = speaker === 'people' ? '600' : undefined
  return (
    <YStack paddingLeft="$md">
      <BilingualBlock
        content={text}
        renderText={(t) => <PrayerLines text={t} fontWeight={fontWeight} prefix={prefix} />}
      />
    </YStack>
  )
}
