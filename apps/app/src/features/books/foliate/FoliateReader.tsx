import { useEffect, useMemo, useRef } from 'react'
import { Platform, View } from 'react-native'
import { paginatorScript } from './paginatorScript'

type FoliateMessage =
  | { type: 'ready' }
  | { type: 'relocate'; index: number; fraction: number }
  | { type: 'load'; index: number }
  | { type: 'centerTap' }
  | { type: 'log'; message: string }
  | { type: 'error'; message: string }

type Props = {
  /** Body HTML for each chapter, in reading order. */
  chapters: string[]
  /** Index of the chapter to open initially. */
  initialIndex?: number
  /** Background and text colors injected into the iframe document. */
  theme?: { background: string; color: string }
  onMessage?: (msg: FoliateMessage) => void
}

// biome-ignore lint/suspicious/noExplicitAny: WebView type not exported from react-native-webview
const WebView: any = Platform.OS !== 'web' ? require('react-native-webview').default : undefined

/**
 * Minimal POC: a foliate-js paginator running inside react-native-webview.
 * Bypasses Expo DOM Components entirely (no `"use dom"`, no @expo/dom-webview
 * native module required) — we already ship react-native-webview for
 * RichDescription.
 *
 * Each chapter is rendered into a sandboxed iframe by foliate's paginator,
 * with content delivered via in-document blob URLs (so no network round-trip
 * and no file-system permission needed).
 */
export function FoliateReader({
  chapters,
  initialIndex = 0,
  theme = { background: '#FAF6F0', color: '#1a1815' },
  onMessage,
}: Props) {
  const webViewRef = useRef<unknown>(null)

  // Build the host HTML eagerly with chapters baked in so first paint shows
  // content without a postMessage round-trip. Subsequent updates ride over
  // window.__foliate.loadBook(...) instead of remounting the WebView, which
  // is why the effect below depends on the same inputs but doesn't rebuild
  // html.
  //
  // biome-ignore lint/correctness/useExhaustiveDependencies(chapters): baked-in at first render only; updates flow through the effect below
  // biome-ignore lint/correctness/useExhaustiveDependencies(initialIndex): same
  const html = useMemo(() => buildHostHtml({ chapters, initialIndex, theme }), [theme])

  useEffect(() => {
    const ref = webViewRef.current as { injectJavaScript?: (js: string) => void } | null
    if (!ref?.injectJavaScript) return
    ref.injectJavaScript(
      `window.__foliate?.loadBook(${JSON.stringify(chapters)}, ${initialIndex});true;`,
    )
  }, [chapters, initialIndex])

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
      style={{ flex: 1, backgroundColor: theme.background }}
      originWhitelist={['*']}
      javaScriptEnabled
      domStorageEnabled
      onMessage={(e: { nativeEvent: { data: string } }) => {
        try {
          onMessage?.(JSON.parse(e.nativeEvent.data) as FoliateMessage)
        } catch {
          // swallow — protocol violation isn't actionable here
        }
      }}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
      bounces={false}
      overScrollMode="never"
    />
  )
}

function buildHostHtml({
  chapters,
  initialIndex,
  theme,
}: {
  chapters: string[]
  initialIndex: number
  theme: { background: string; color: string }
}): string {
  // The bootstrap script is a string template intentionally — it runs inside
  // the WebView, not in this RN JS context. Keep it small; everything heavy
  // (paginator.js) is the foliate vendor blob.
  const bootstrap = `
    (() => {
      const post = (msg) => {
        const json = JSON.stringify(msg);
        if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(json);
        else if (window.parent !== window) window.parent.postMessage(json, '*');
      };
      window.onerror = (m, _u, l) => post({ type: 'error', message: String(m) + ' @' + l });

      const STYLE = ${JSON.stringify(`
        html, body { margin: 0; padding: 0; height: 100%; background: ${theme.background}; color: ${theme.color}; font-family: Georgia, 'Times New Roman', serif; }
        a { color: inherit; }
        p { margin: 0 0 .85em; }
        p + p { text-indent: 1.2em; }
        h1, h2, h3, h4 { margin: 1.5em 0 .5em; line-height: 1.25; }
        img { max-width: 100%; height: auto; }
      `)};

      // foliate's iframe.src = blob:URL. Wrap each chapter HTML in a minimal
      // document so the paginator can read computed background / direction.
      const blobUrl = (body) => URL.createObjectURL(new Blob([
        '<!doctype html><html><head><meta charset="utf-8">',
        '<style>', STYLE, '</style></head><body>', body, '</body></html>'
      ], { type: 'text/html' }));

      let urls = [];
      let paginator;

      const buildBook = (chapters) => {
        for (const u of urls) URL.revokeObjectURL(u);
        urls = chapters.map(blobUrl);
        return {
          dir: 'ltr',
          sections: urls.map((u, i) => ({
            id: 'ch' + i,
            load: () => u,
            unload: () => {},
            size: chapters[i].length,
            linear: 'yes',
            cfi: '',
          })),
        };
      };

      const init = (chapters, index) => {
        if (!paginator) {
          paginator = document.createElement('foliate-paginator');
          paginator.setAttribute('flow', 'paginated');
          paginator.setAttribute('animated', ''); // smoother page-turn snap
          paginator.setAttribute('margin', '48px');
          paginator.setAttribute('gap', '7%');
          paginator.setAttribute('max-inline-size', '720px');
          paginator.setAttribute('max-block-size', '1440px');
          paginator.setAttribute('max-column-count', '1');
          paginator.style.position = 'absolute';
          paginator.style.inset = '0';
          paginator.style.background = ${JSON.stringify(theme.background)};
          paginator.addEventListener('relocate', (e) => {
            post({ type: 'relocate', index: e.detail.index, fraction: e.detail.fraction });
          });
          paginator.addEventListener('load', (e) => {
            post({ type: 'load', index: e.detail.index });
            // Wire tap zones inside the chapter iframe: left 30% = prev,
            // right 30% = next, middle = nothing (reserved for chrome toggle).
            const doc = e.detail.doc;
            if (doc && !doc.__tapWired) {
              doc.__tapWired = true;
              doc.addEventListener('click', (ev) => {
                const x = ev.clientX;
                const w = doc.defaultView.innerWidth;
                if (x < w * 0.3) paginator.prev();
                else if (x > w * 0.7) paginator.next();
                else post({ type: 'centerTap' });
              });
            }
          });
          document.body.append(paginator);
        }
        paginator.open(buildBook(chapters));
        paginator.goTo({ index: index ?? 0, anchor: 0 });
      };

      window.__foliate = {
        loadBook: init,
        next: () => paginator?.next(),
        prev: () => paginator?.prev(),
      };

      // Auto-init from the data we baked in.
      const initialChapters = ${JSON.stringify(chapters)};
      const initialIndex = ${JSON.stringify(initialIndex)};
      init(initialChapters, initialIndex);
      post({ type: 'ready' });
    })();
  `

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
<style>html, body { margin: 0; padding: 0; height: 100%; background: ${theme.background}; }</style>
</head>
<body>
<script>${paginatorScript}</script>
<script>${bootstrap}</script>
</body>
</html>`
}
