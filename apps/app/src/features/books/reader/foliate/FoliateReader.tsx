import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import { Platform, View } from 'react-native'
import { paginatorScript } from './paginatorScript'

export type FoliateConfig = {
  fontFamily: string
  fontSizePx: number
  lineHeightPx: number
  marginPx: number
  textAlign: 'justify' | 'left'
  background: string
  color: string
}

export type FoliateMessage =
  | { type: 'ready' }
  | { type: 'relocate'; index: number; fraction: number; page: number; pages: number }
  | { type: 'load'; index: number }
  | { type: 'centerTap' }
  | { type: 'log'; message: string }
  | { type: 'error'; message: string }

export type FoliateReaderHandle = {
  /** Jump to a chapter (and optional intra-chapter fraction). */
  goTo: (index: number, fraction?: number) => void
}

type Props = {
  /** Body HTML for each chapter, in reading order. */
  chapters: string[]
  /** Index of the chapter to open initially. */
  initialIndex?: number
  /** Intra-chapter fraction (0..1) to open at. */
  initialFraction?: number
  config: FoliateConfig
  onMessage?: (msg: FoliateMessage) => void
}

// biome-ignore lint/suspicious/noExplicitAny: WebView type not exported from react-native-webview
const WebView: any = Platform.OS !== 'web' ? require('react-native-webview').default : undefined

/**
 * foliate-js paginator running inside react-native-webview. Chapters are
 * passed in as HTML strings and rendered into per-chapter blob: URL iframes
 * by foliate. Style updates (font / size / theme) push through `setConfig`
 * over `injectJavaScript`, which re-blobs the chapters and restores the
 * current fraction — no WebView remount.
 */
export const FoliateReader = forwardRef<FoliateReaderHandle, Props>(function FoliateReader(
  { chapters, initialIndex = 0, initialFraction = 0, config, onMessage },
  ref,
) {
  const webViewRef = useRef<unknown>(null)

  // Host HTML is built ONCE with the initial chapters + config baked in, so
  // first paint shows content without a postMessage round-trip. Subsequent
  // chapter / config updates ride over `injectJavaScript` instead of
  // rebuilding `html` — which would remount the WebView and blank the screen.
  //
  // biome-ignore lint/correctness/useExhaustiveDependencies: html is baked at first paint only; updates flow through the effects below
  const html = useMemo(() => buildHostHtml({ chapters, initialIndex, initialFraction, config }), [])

  // Reload the book when the chapter list itself changes (e.g. language switch).
  useEffect(() => {
    inject(
      webViewRef,
      `window.__foliate?.loadBook(${JSON.stringify(chapters)}, ${initialIndex}, ${initialFraction});true;`,
    )
  }, [chapters, initialIndex, initialFraction])

  // Push style / theme updates without remounting.
  useEffect(() => {
    inject(webViewRef, `window.__foliate?.setConfig(${JSON.stringify(config)});true;`)
  }, [config])

  useImperativeHandle(
    ref,
    () => ({
      goTo: (index, fraction = 0) => {
        inject(webViewRef, `window.__foliate?.goTo({index: ${index}, fraction: ${fraction}});true;`)
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
})

function inject(ref: { current: unknown }, js: string) {
  const node = ref.current as { injectJavaScript?: (js: string) => void } | null
  node?.injectJavaScript?.(js)
}

function buildHostHtml({
  chapters,
  initialIndex,
  initialFraction,
  config,
}: {
  chapters: string[]
  initialIndex: number
  initialFraction: number
  config: FoliateConfig
}): string {
  // The bootstrap script runs inside the WebView, not in this RN JS context.
  // Everything heavy (paginator.js) is the foliate vendor blob.
  const bootstrap = `
    (() => {
      const post = (msg) => {
        const json = JSON.stringify(msg);
        if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(json);
        else if (window.parent !== window) window.parent.postMessage(json, '*');
      };
      window.onerror = (m, _u, l) => post({ type: 'error', message: String(m) + ' @' + l });

      let cfg = ${JSON.stringify(config)};
      let chapters = ${JSON.stringify(chapters)};
      let urls = [];
      let paginator;

      const buildStyle = (c) => \`
        html, body { margin: 0; padding: 0; height: 100%; background: \${c.background}; color: \${c.color}; }
        body { font-family: \${c.fontFamily}, Georgia, 'Times New Roman', serif; font-size: \${c.fontSizePx}px; line-height: \${c.lineHeightPx}px; text-align: \${c.textAlign}; }
        a { color: inherit; }
        p { margin: 0 0 .85em; }
        p + p { text-indent: 1.2em; }
        h1, h2, h3, h4 { margin: 1.5em 0 .5em; line-height: 1.25; text-align: left; }
        img { max-width: 100%; height: auto; }
        h2.chapter-title { font-size: 1.4em; margin-top: 0; }
      \`;

      // foliate's iframe.src = blob:URL. Wrap each chapter HTML in a minimal
      // document so the paginator can read computed background / direction.
      const blobUrl = (body) => URL.createObjectURL(new Blob([
        '<!doctype html><html><head><meta charset="utf-8">',
        '<style>', buildStyle(cfg), '</style></head><body>', body, '</body></html>'
      ], { type: 'text/html' }));

      const buildBook = () => {
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

      const postRelocate = (e) => {
        // foliate's pages count includes two dummy pages (cover sentinels), so
        // the user-visible total is pages - 2.
        const total = Math.max(1, (paginator.pages || 1) - 2);
        const current = Math.max(1, Math.min(total, paginator.page || 1));
        post({ type: 'relocate', index: e.detail.index, fraction: e.detail.fraction, page: current, pages: total });
      };

      const ensurePaginator = () => {
        if (paginator) return;
        paginator = document.createElement('foliate-paginator');
        paginator.setAttribute('flow', 'paginated');
        paginator.setAttribute('animated', '');
        paginator.setAttribute('margin', cfg.marginPx + 'px');
        paginator.setAttribute('gap', '7%');
        paginator.setAttribute('max-inline-size', '720px');
        paginator.setAttribute('max-block-size', '1440px');
        paginator.setAttribute('max-column-count', '1');
        paginator.style.position = 'absolute';
        paginator.style.inset = '0';
        paginator.style.background = cfg.background;
        paginator.addEventListener('relocate', postRelocate);
        paginator.addEventListener('load', (e) => {
          post({ type: 'load', index: e.detail.index });
          // Wire tap zones inside the chapter iframe: left 30% = prev, right
          // 30% = next, middle posts centerTap so the chrome can toggle.
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
      };

      const openBook = (index, fraction) => {
        ensurePaginator();
        paginator.open(buildBook());
        paginator.goTo({ index: index ?? 0, anchor: fraction ?? 0 });
      };

      window.__foliate = {
        loadBook: (newChapters, index, fraction) => {
          chapters = newChapters;
          openBook(index, fraction);
        },
        goTo: ({ index, fraction }) => {
          if (!paginator) return;
          paginator.goTo({ index: index ?? 0, anchor: fraction ?? 0 });
        },
        setConfig: (newCfg) => {
          cfg = newCfg;
          if (!paginator) return;
          paginator.setAttribute('margin', cfg.marginPx + 'px');
          paginator.style.background = cfg.background;
          // Re-blobbing every chapter with the new STYLE is the only way to
          // update the inner iframe's CSS — there's no setStyles() on
          // foliate-paginator. Cheap (blobs are in-memory) and preserves
          // position because we restore the same {index, fraction}.
          const here = { index: paginator.index ?? 0, fraction: 0 };
          // Read fraction off the live page/pages so the restore lands close
          // to where the user was after the reflow.
          if (paginator.pages > 2) {
            here.fraction = (Math.max(1, paginator.page) - 1) / (paginator.pages - 2);
          }
          paginator.open(buildBook());
          paginator.goTo({ index: here.index, anchor: here.fraction });
        },
      };

      openBook(${JSON.stringify(initialIndex)}, ${JSON.stringify(initialFraction)});
      post({ type: 'ready' });
    })();
  `

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
<style>html, body { margin: 0; padding: 0; height: 100%; background: ${config.background}; }</style>
</head>
<body>
<script>${paginatorScript}</script>
<script>${bootstrap}</script>
</body>
</html>`
}
