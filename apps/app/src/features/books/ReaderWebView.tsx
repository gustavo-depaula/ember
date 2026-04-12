import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react'
import { Platform, View } from 'react-native'

export type ReaderMessage =
  | { type: 'pageInfo'; currentPage: number; totalPages: number }
  | { type: 'boundary'; direction: 'prev' | 'next' }
  | { type: 'ready' }
  | { type: 'centerTap' }
  | { type: 'backSwipe' }

export type ReaderWebViewHandle = {
  loadChapter: (html: string, startPage: number, direction?: 'next' | 'prev') => void
  goToPage: (page: number) => void
  updateStyles: (css: string) => void
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
    loadChapter(body: string, startPage: number, direction?: 'next' | 'prev') {
      const escaped = JSON.stringify(body)
      const dir = direction ? `"${direction}"` : 'undefined'
      webViewRef.current?.injectJavaScript(
        `window.postMessage(JSON.stringify({ type: 'loadChapter', html: ${escaped}, startPage: ${startPage}, direction: ${dir} })); true;`,
      )
    },
    goToPage(page: number) {
      webViewRef.current?.injectJavaScript(
        `window.postMessage(JSON.stringify({ type: 'goToPage', page: ${page} })); true;`,
      )
    },
    updateStyles(css: string) {
      const escaped = JSON.stringify(css)
      webViewRef.current?.injectJavaScript(
        `window.postMessage(JSON.stringify({ type: 'updateStyles', css: ${escaped} })); true;`,
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
    loadChapter(body: string, startPage: number, direction?: 'next' | 'prev') {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ type: 'loadChapter', html: body, startPage, direction }),
        '*',
      )
    },
    goToPage(page: number) {
      iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ type: 'goToPage', page }), '*')
    },
    updateStyles(css: string) {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ type: 'updateStyles', css }),
        '*',
      )
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
