import { Platform, View } from 'react-native'

// biome-ignore lint/suspicious/noExplicitAny: WebView type not exported from react-native-webview
const WebView: any = Platform.OS !== 'web' ? require('react-native-webview').default : undefined

export function HtmlWebView({ html }: { html: string }) {
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
      scrollEnabled={false}
      bounces={false}
      overScrollMode="never"
    />
  )
}
