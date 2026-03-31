import type { ComponentProps } from 'react'
import { Text } from 'tamagui'

import { useReadingStyle } from '@/hooks/useReadingStyle'

export function PrayerText(props: ComponentProps<typeof Text>) {
  const style = useReadingStyle()
  return <Text selectable color="$color" {...style} {...props} />
}
