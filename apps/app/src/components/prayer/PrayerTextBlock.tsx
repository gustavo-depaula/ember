import type { BilingualText } from '@ember/content-engine'
import type { ComponentProps } from 'react'
import type { Text } from 'tamagui'
import { PrayerLines } from '../PrayerText'
import { BilingualBlock } from './BilingualBlock'

export function PrayerTextBlock({
  text,
  fontStyle,
}: {
  text: BilingualText
  fontStyle?: ComponentProps<typeof Text>['fontStyle']
}) {
  return (
    <BilingualBlock
      content={text}
      renderText={(t) => <PrayerLines text={t} fontStyle={fontStyle} />}
    />
  )
}
