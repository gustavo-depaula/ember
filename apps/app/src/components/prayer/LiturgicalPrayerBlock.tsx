import type { BilingualText } from '@ember/content-engine'
import { Text, YStack } from 'tamagui'
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

  return (
    <YStack gap="$xs" paddingLeft={isPeople ? '$md' : 0}>
      {isPeople && (
        <Text
          fontFamily="$heading"
          fontSize="$1"
          color="$accent"
          letterSpacing={1.5}
          textTransform="uppercase"
        >
          R.
        </Text>
      )}
      <BilingualBlock
        content={text}
        renderText={(t) => <PrayerLines text={t} fontWeight={isPeople ? '600' : undefined} />}
      />
    </YStack>
  )
}
