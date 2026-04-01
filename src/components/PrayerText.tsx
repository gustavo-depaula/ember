import { Children, type ComponentProps, type ReactNode } from 'react'
import { Text } from 'tamagui'

import { useReadingStyle } from '@/hooks/useReadingStyle'
import { useHyphenate } from '@/lib/hyphenation'

function HyphenatedText({ children }: { children: string }) {
  const text = useHyphenate(children)
  return <>{text}</>
}

function hyphenateChildren(children: ReactNode): ReactNode {
  return Children.map(children, (child) =>
    typeof child === 'string' ? <HyphenatedText>{child}</HyphenatedText> : child,
  )
}

export function PrayerText(props: ComponentProps<typeof Text>) {
  const style = useReadingStyle()
  return (
    <Text selectable color="$color" {...style} {...props}>
      {hyphenateChildren(props.children)}
    </Text>
  )
}
