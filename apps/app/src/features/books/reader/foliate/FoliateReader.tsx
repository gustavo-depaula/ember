import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import { Platform, View } from 'react-native'
import { bootstrapScript } from './bootstrapScript'
import { paginatorScript } from './paginatorScript'

export type FoliateConfig = {
  fontFamily: string
  fontSizePx: number
  lineHeightPx: number
  marginPx: number
  textAlign: 'justify' | 'left'
  background: string
  color: string
  /** BCP-47 language tag for the chapter content (e.g. `en-US`, `pt-BR`, `la`).
   *  Drives WebKit's `hyphens: auto` dictionary selection. */
  lang: string
}

export type FoliateMessage =
  | { type: 'ready' }
  | { type: 'relocate'; index: number; fraction: number; page: number; pages: number }
  | { type: 'load'; index: number }
  | { type: 'centerTap' }
  | { type: 'footnoteTap'; html: string }
  | { type: 'crossRefTap'; href: string }
  | {
      type: 'selectionChange'
      chapterIndex: number
      text: string
      anchor: { startOffset: number; endOffset: number }
      rect: { x: number; y: number; width: number; height: number }
    }
  | { type: 'selectionCleared' }
  | {
      type: 'highlightTap'
      id: string
      chapterIndex: number
      rect: { x: number; y: number; width: number; height: number }
    }
  /** Bridge asks the host for a chapter body the WebView doesn't have yet.
   *  The host fetches via the BookSession and answers with provideChapter. */
  | { type: 'requestChapter'; index: number }
  | { type: 'log'; message: string }
  | { type: 'error'; message: string }

export type BootstrapHighlight = {
  id: string
  chapterIndex: number
  anchor: { startOffset: number; endOffset: number }
  /** CSS color string (with alpha). The host owns light/dark palette mapping. */
  color: string
  /** When true, the overlayer adds a small ✎ marker at the start of the range. */
  hasNote?: boolean
}

export type FoliateReaderHandle = {
  /** Jump to a chapter (and optional intra-chapter fraction). */
  goTo: (index: number, fraction?: number) => void
  /**
   * Jump to a chapter and, after the iframe loads, scroll to the first
   * occurrence of `findText`. Used by in-book search to land on the match.
   */
  goToWithFind: (index: number, findText: string) => void
  /**
   * Jump to a chapter and scroll to the exact text range described by a
   * stored anchor. Used by the highlights list to land on the highlighted
   * passage — preferred over `goToWithFind` when an anchor is known, since
   * `findText` resolves the first textual occurrence (wrong target when the
   * phrase repeats).
   */
  goToAnchor: (index: number, anchor: { startOffset: number; endOffset: number }) => void
  /** Bulk-replace the current highlight set across all chapters. */
  setHighlights: (highlights: BootstrapHighlight[]) => void
  addHighlight: (highlight: BootstrapHighlight) => void
  removeHighlight: (id: string) => void
  /** Clear the current text selection (e.g. after the user dismisses the toolbar). */
  clearSelection: () => void
  /** Write a string to the system clipboard via the WebView (iOS WKWebView's
   *  navigator.clipboard). Avoids a native dep for the rare copy-text path. */
  copyText: (text: string) => void
  /** Stream a chapter body into the WebView, resolving any pending
   *  requestChapter for the same index. Idempotent — sending the same body
   *  again is a no-op. */
  provideChapter: (index: number, html: string) => void
}

type Props = {
  /** Total number of chapters in the spine — drives the paginator's section
   *  count without forcing every body into memory at open time. */
  chapterCount: number
  /** Body HTML for the chapter to open first; the host streams the rest in
   *  response to requestChapter messages. */
  initialChapter: string
  /** Index of the chapter to open initially. */
  initialIndex?: number
  /** Intra-chapter fraction (0..1) to open at. */
  initialFraction?: number
  config: FoliateConfig
  onMessage?: (msg: FoliateMessage) => void
}

// biome-ignore lint/suspicious/noExplicitAny: WebView type not exported from react-native-webview
const WebView: any = Platform.OS !== 'web' ? require('react-native-webview').default : undefined

export const FoliateReader = forwardRef<FoliateReaderHandle, Props>(function FoliateReader(
  { chapterCount, initialChapter, initialIndex = 0, initialFraction = 0, config, onMessage },
  ref,
) {
  const webViewRef = useRef<unknown>(null)

  // iOS leaves the WebView's UIScrollView attached to the window hit-test
  // chain for a few frames after unmount in fullScreenModal dismissals — the
  // result is that the entire app stops receiving taps (scrolling still
  // works, since scroll is owned by a different gesture recognizer) until
  // the next full layout. Calling stopLoading on unmount forces WebKit to
  // release its event-handling state immediately.
  useEffect(() => {
    return () => {
      const node = webViewRef.current as { stopLoading?: () => void } | null
      node?.stopLoading?.()
    }
  }, [])

  // Host HTML is built ONCE with the spine length + initial chapter + config
  // baked in. Additional chapter bodies stream in via provideChapter; we
  // never remount the WebView (which would blank the screen).
  //
  // biome-ignore lint/correctness/useExhaustiveDependencies: baked at first paint only
  const html = useMemo(
    () => buildHostHtml({ chapterCount, initialChapter, initialIndex, initialFraction, config }),
    [],
  )

  // Stringify-guard the config inject — identical configs (re-renders that
  // changed an unrelated prop) shouldn't trigger a full chapter re-blob.
  const configKey = useRef('')
  useEffect(() => {
    const key = JSON.stringify(config)
    if (configKey.current === '') {
      configKey.current = key
      return
    }
    if (configKey.current === key) return
    configKey.current = key
    inject(webViewRef, `window.__foliate?.setConfig(${key});true;`)
  }, [config])

  useImperativeHandle(
    ref,
    () => ({
      goTo: (index, fraction = 0) => {
        inject(webViewRef, `window.__foliate?.goTo({index: ${index}, fraction: ${fraction}});true;`)
      },
      goToWithFind: (index, findText) => {
        inject(
          webViewRef,
          `window.__foliate?.goToWithFind(${index}, ${JSON.stringify(findText)});true;`,
        )
      },
      goToAnchor: (index, anchor) => {
        inject(
          webViewRef,
          `window.__foliate?.goToAnchor(${index}, ${JSON.stringify(anchor)});true;`,
        )
      },
      setHighlights: (highlights) => {
        inject(webViewRef, `window.__foliate?.setHighlights(${JSON.stringify(highlights)});true;`)
      },
      addHighlight: (highlight) => {
        inject(webViewRef, `window.__foliate?.addHighlight(${JSON.stringify(highlight)});true;`)
      },
      removeHighlight: (id) => {
        inject(webViewRef, `window.__foliate?.removeHighlight(${JSON.stringify(id)});true;`)
      },
      clearSelection: () => {
        inject(webViewRef, `window.__foliate?.clearSelection();true;`)
      },
      copyText: (text) => {
        inject(webViewRef, `window.__foliate?.copyText(${JSON.stringify(text)});true;`)
      },
      provideChapter: (index, htmlBody) => {
        inject(
          webViewRef,
          `window.__foliate?.provideChapter(${index}, ${JSON.stringify(htmlBody)});true;`,
        )
      },
    }),
    [],
  )

  if (Platform.OS === 'web') {
    return (
      <View style={{ flex: 1 }}>
        <iframe
          title="Foliate reader"
          srcDoc={html}
          sandbox="allow-scripts allow-same-origin"
          style={{ flex: 1, width: '100%', height: '100%', border: 0 }}
        />
      </View>
    )
  }

  return (
    <WebView
      ref={webViewRef}
      source={{ html, baseUrl: 'about:blank' }}
      style={{ flex: 1, backgroundColor: config.background }}
      originWhitelist={['*']}
      javaScriptEnabled
      domStorageEnabled
      onMessage={(e: { nativeEvent: { data: string } }) => {
        try {
          onMessage?.(JSON.parse(e.nativeEvent.data) as FoliateMessage)
        } catch (err) {
          console.warn('[FoliateReader] bad message from WebView:', err)
        }
      }}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
      bounces={false}
      overScrollMode="never"
      // Suppress the iOS system selection menu items so our floating
      // ReaderSelectionToolbar doesn't end up stacked next to the system
      // menu. `menuItems={[]}` alone is insufficient on iOS 16+ (it only
      // affects the long-press path); `suppressMenuItems` blocks actions
      // via `canPerformAction:withSender:`, which is on the responder
      // chain WebKit walks when assembling its selection menu.
      // `share` (`_share:`) and `translate` (`_translate:`) are both in
      // the library's selector map (RNCWebViewImpl.m).
      // Known unresolved gap: iOS 18 Writing Tools (Apple Intelligence)
      // lives outside `canPerformAction:` and can only be suppressed via
      // `WKWebViewConfiguration.writingToolsBehavior = .none`, which
      // react-native-webview doesn't expose as a prop yet. It only renders
      // for users with Apple Intelligence enabled.
      suppressMenuItems={[
        'cut',
        'copy',
        'paste',
        'select',
        'selectAll',
        'lookup',
        'replace',
        'bold',
        'italic',
        'underline',
        'share',
        'translate',
      ]}
    />
  )
})

function inject(ref: { current: unknown }, js: string) {
  const node = ref.current as { injectJavaScript?: (js: string) => void } | null
  node?.injectJavaScript?.(js)
}

function buildHostHtml({
  chapterCount,
  initialChapter,
  initialIndex,
  initialFraction,
  config,
}: {
  chapterCount: number
  initialChapter: string
  initialIndex: number
  initialFraction: number
  config: FoliateConfig
}): string {
  // Both scripts live as standalone .raw.js files bundled into TS modules
  // by bundle.mjs (`paginatorScript.ts`, `bootstrapScript.ts`). They run
  // inside the WebView, not in this RN JS context. The trailing init call
  // hands the initial config + spine length + opening chapter into the
  // bootstrap's `window.__foliateInit(...)` entry point.
  const initCall = `window.__foliateInit(${JSON.stringify(config)}, ${JSON.stringify(chapterCount)}, ${JSON.stringify(initialIndex)}, ${JSON.stringify(initialFraction)}, ${JSON.stringify(initialChapter)});`
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
<style>html, body { margin: 0; padding: 0; height: 100%; background: ${config.background}; }</style>
</head>
<body>
<script>${paginatorScript}</script>
<script>${bootstrapScript}</script>
<script>${initCall}</script>
</body>
</html>`
}
