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
  const isPeople = speaker === 'people'

  if (!isPeople) {
    return <BilingualBlock content={text} renderText={(t) => <PrayerLines text={t} />} />
  }

  return (
    <YStack paddingLeft="$md">
      <BilingualBlock
        content={text}
        renderText={(t) => <PrayerLines text={t} fontWeight="600" prefix="℟. " />}
      />
    </YStack>
  )
}
