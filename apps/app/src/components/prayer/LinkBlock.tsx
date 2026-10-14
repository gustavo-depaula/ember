import type { BilingualText } from '@ember/content-engine'
import * as WebBrowser from 'expo-web-browser'
import { useTheme } from 'tamagui'
import { AnimatedPressable } from '@/components'
import { Typography } from '../typography'

// In-app browser (themed page sheet, matching the Explore rows).
export function LinkBlock({ text, href }: { text: BilingualText; href: string }) {
  const theme = useTheme()
  const open = () => {
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
