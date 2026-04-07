import type { BilingualText } from '@ember/content-engine'
import { PrayerLines } from '../PrayerText'
import { BilingualBlock } from './BilingualBlock'

export function PrayerTextBlock({ text }: { text: BilingualText }) {
  return <BilingualBlock content={text} renderText={(t) => <PrayerLines text={t} />} />
}
