import type { BilingualText } from '@ember/content-engine'
import * as WebBrowser from 'expo-web-browser'
import { Platform } from 'react-native'
import { useTheme } from 'tamagui'
import { AnimatedPressable } from '@/components'
import { Typography } from '../typography'

// Renders a `link` primitive as a tappable accent line: the in-app browser on
// native (themed page sheet, matching the Explore rows), a new tab on web.
export function LinkBlock({ text, href }: { text: BilingualText; href: string }) {
  const theme = useTheme()
  const open = () => {
    if (Platform.OS === 'web') {
      window.open(href, '_blank', 'noopener')
      return
    }
    WebBrowser.openBrowserAsync(href, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      controlsColor: theme.accent?.val,
      toolbarColor: theme.background?.val,
    })
  }
  return (
    <AnimatedPressable onPress={open} accessibilityRole="link" accessibilityLabel={text.primary}>
      <Typography variant="reference" color="$accent" paddingVertical="$sm">
        {text.primary} →
      </Typography>
    </AnimatedPressable>
  )
}
