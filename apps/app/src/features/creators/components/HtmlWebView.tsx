import WebView from 'react-native-webview'
export function HtmlWebView({
  html,
  scrollEnabled = false,
}: {
  html: string
  /** Let the WebView own its own scroll. Opt-in: keep off when the parent is
   * already a ScrollView (avoids nested scrolling), turn on for fixed-height
   * containers like the audio player description. */
  scrollEnabled?: boolean
}) {
  return (
    <WebView
      source={{ html }}
      style={{ flex: 1, backgroundColor: 'transparent' }}
      originWhitelist={['*']}
      javaScriptEnabled
      showsVerticalScrollIndicator={false}
      scrollEnabled={scrollEnabled}
      bounces={scrollEnabled}
      overScrollMode={scrollEnabled ? 'always' : 'never'}
    />
  )
}
