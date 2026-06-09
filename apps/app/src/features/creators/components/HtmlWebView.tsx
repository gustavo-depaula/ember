import { Platform, View } from 'react-native'

// biome-ignore lint/suspicious/noExplicitAny: WebView type not exported from react-native-webview
const WebView: any = Platform.OS !== 'web' ? require('react-native-webview').default : undefined

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
  if (Platform.OS === 'web') {
    return (
      <View style={{ flex: 1 }}>
        <iframe
          title="HTML content"
          srcDoc={html}
          sandbox="allow-scripts"
          style={{
            flex: 1,
            width: '100%',
            height: '100%',
            border: 'none',
            backgroundColor: 'transparent',
          }}
        />
      </View>
    )
  }

  return (
    <WebView
      source={{ html }}
      style={{ flex: 1, backgroundColor: 'transparent' }}
      originWhitelist={['*']}
      javaScriptEnabled
      showsVerticalScrollIndicator={false}
      scrollEnabled={scrollEnabled}
      bounces={scrollEnabled}
      overScrollMode={scrollEnabled ? 'auto' : 'never'}
    />
  )
}
