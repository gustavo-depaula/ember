import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react'
import { Platform, View } from 'react-native'

export type ReaderMessage =
  | { type: 'pageInfo'; currentPage: number; totalPages: number }
  | { type: 'boundary'; direction: 'prev' | 'next' }
  | { type: 'ready' }

export type ReaderWebViewHandle = {
  loadChapter: (html: string, startPage: number) => void
  goToPage: (page: number) => void
}

type Props = {
  html: string
  onMessage?: (msg: ReaderMessage) => void
}

// biome-ignore lint/suspicious/noExplicitAny: WebView type not exported from react-native-webview
const WebView: any = Platform.OS !== 'web' ? require('react-native-webview').default : undefined

const NativeWebView = forwardRef<ReaderWebViewHandle, Props>(function NativeWebView(
  { html, onMessage },
  ref,
) {
  // biome-ignore lint/suspicious/noExplicitAny: WebView ref type not exported
  const webViewRef = useRef<any>(null)

  useImperativeHandle(ref, () => ({
    loadChapter(body: string, startPage: number) {
      const escaped = JSON.stringify(body)
      webViewRef.current?.injectJavaScript(
        `window.postMessage(JSON.stringify({ type: 'loadChapter', html: ${escaped}, startPage: ${startPage} })); true;`,
      )
    },
    goToPage(page: number) {
      webViewRef.current?.injectJavaScript(
        `window.postMessage(JSON.stringify({ type: 'goToPage', page: ${page} })); true;`,
      )
    },
  }))

  const handleMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      try {
        onMessage?.(JSON.parse(event.nativeEvent.data) as ReaderMessage)
      } catch {}
    },
    [onMessage],
  )

  return (
    <WebView
      ref={webViewRef}
      source={{ html }}
      style={{ flex: 1, backgroundColor: 'transparent' }}
      originWhitelist={['*']}
      javaScriptEnabled
      onMessage={handleMessage}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
      bounces={false}
      overScrollMode="never"
    />
  )
})

const WebIframe = forwardRef<ReaderWebViewHandle, Props>(function WebIframe(
  { html, onMessage },
  ref,
) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useImperativeHandle(ref, () => ({
    loadChapter(body: string, startPage: number) {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ type: 'loadChapter', html: body, startPage }),
        '*',
      )
    },
    goToPage(page: number) {
      iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ type: 'goToPage', page }), '*')
    },
  }))

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      try {
        const msg = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
        onMessage?.(msg as ReaderMessage)
      } catch {}
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onMessage])

  return (
    <View style={{ flex: 1 }}>
      <iframe
        ref={iframeRef}
        title="Reader"
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
})

export const ReaderWebView = forwardRef<ReaderWebViewHandle, Props>(
  function ReaderWebView(props, ref) {
    if (Platform.OS === 'web') return <WebIframe ref={ref} {...props} />
    return <NativeWebView ref={ref} {...props} />
  },
)
