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

export const FoliateReader = forwardRef<FoliateReaderHandle, Props>(function FoliateReader(
  { chapters, initialIndex = 0, initialFraction = 0, config, onMessage },
  ref,
) {
  const webViewRef = useRef<unknown>(null)

  // Host HTML is built ONCE with initial chapters + config baked in. Update
  // effects below ride over `injectJavaScript` so we never remount the
  // WebView (which would blank the screen).
  //
  // biome-ignore lint/correctness/useExhaustiveDependencies: baked at first paint only
  const html = useMemo(() => buildHostHtml({ chapters, initialIndex, initialFraction, config }), [])

  // First mount already has chapters + config baked in — skip the redundant
  // re-inject that would re-open the book and reset position.
  const chapterMounted = useRef(false)
  useEffect(() => {
    if (!chapterMounted.current) {
      chapterMounted.current = true
      return
    }
    inject(
      webViewRef,
      `window.__foliate?.loadBook(${JSON.stringify(chapters)}, ${initialIndex}, ${initialFraction});true;`,
    )
  }, [chapters, initialIndex, initialFraction])

  const configMounted = useRef(false)
  useEffect(() => {
    if (!configMounted.current) {
      configMounted.current = true
      return
    }
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
        } catch (err) {
          console.warn('[FoliateReader] bad message from WebView:', err)
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
        body {
          font-family: \${c.fontFamily}, Georgia, 'Times New Roman', serif;
          font-size: \${c.fontSizePx}px;
          line-height: \${c.lineHeightPx}px;
          text-align: \${c.textAlign};
          /* Hyphenation: WebKit picks the dictionary from the html @lang.
             Critical for justified text — avoids ugly inter-word gaps. */
          -webkit-hyphens: auto;
          hyphens: auto;
          -webkit-hyphenate-limit-before: 3;
          -webkit-hyphenate-limit-after: 3;
          overflow-wrap: break-word;
        }
        a { color: inherit; }
        p { margin: 0 0 .85em; }
        p + p { text-indent: 1.2em; }
        h1, h2, h3, h4 { margin: 1.5em 0 .5em; line-height: 1.25; text-align: left; }
        img { max-width: 100%; height: auto; }

        /* Illuminated chapter opening: centered italic title + fleuron ornament,
           then a drop cap on the first paragraph. The :not(.no-dropcap) opt-out
           lets a chapter suppress the drop cap if its first paragraph is a quote
           or pull-out. */
        h2.chapter-title {
          font-size: 1.3em;
          font-style: italic;
          font-weight: 500;
          text-align: center;
          margin: 0.3em 0 1.4em;
          letter-spacing: 0.02em;
        }
        h2.chapter-title::after {
          content: '✦';
          display: block;
          font-size: 0.7em;
          font-style: normal;
          opacity: 0.45;
          margin-top: 0.6em;
        }
        h2.chapter-title + p:not(.no-dropcap)::first-letter {
          font-family: inherit;
          font-size: 3.4em;
          line-height: 0.88;
          font-weight: 600;
          float: left;
          margin: 0.05em 0.08em 0 0;
          padding: 0;
        }
        h2.chapter-title + p { text-indent: 0; }
      \`;

      // foliate's iframe.src = blob:URL. Wrap each chapter HTML in a minimal
      // document so the paginator can read computed background / direction.
      const blobUrl = (body) => URL.createObjectURL(new Blob([
        '<!doctype html><html lang="', cfg.lang || 'en', '"><head><meta charset="utf-8">',
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
        // Two columns on landscape viewports wide enough for it (iPad,
        // desktop). Foliate's portrait container query keeps phone screens
        // at one column regardless.
        paginator.setAttribute('max-column-count', '2');
        paginator.style.position = 'absolute';
        paginator.style.inset = '0';
        paginator.style.background = cfg.background;
        paginator.addEventListener('relocate', postRelocate);
        paginator.addEventListener('load', (e) => {
          post({ type: 'load', index: e.detail.index });
          // Fade the new chapter iframe in — foliate swaps the iframe element
          // outright on chapter boundaries, which otherwise reads as a snap.
          const docEl = e.detail.doc && e.detail.doc.documentElement;
          if (docEl) {
            docEl.style.opacity = '0';
            docEl.style.transition = 'opacity 200ms ease-out';
            requestAnimationFrame(() => { docEl.style.opacity = '1'; });
          }
          // Wire tap zones inside the chapter iframe: left 30% = prev, right
          // 30% = next, middle posts centerTap so the chrome can toggle.
          //
          // ev.clientX is iframe-local and the iframe is sized to the FULL
          // multi-column content (much wider than the viewport) and centered
          // inside a wrapper that's even wider — reverse-engineering the
          // offset from paginator.start is fragile. Use the iframe element's
          // own bounding rect, which gives us its viewport-relative position
          // directly; on-screen x is just rect.left + clientX.
          const doc = e.detail.doc;
          if (doc && !doc.__tapWired) {
            doc.__tapWired = true;
            doc.addEventListener('click', (ev) => {
              // Anchor click — fragment links (footnotes, glossary) open
              // in a popover; cross-references to other chapters post the
              // href up so the host can navigate + push a back-stack entry.
              const a = ev.target && ev.target.closest && ev.target.closest('a');
              if (a) {
                const href = a.getAttribute('href') || '';
                if (href.startsWith('#')) {
                  const target = doc.getElementById(href.slice(1));
                  if (target) {
                    ev.preventDefault();
                    ev.stopImmediatePropagation();
                    const html = target.innerHTML
                      .replace(/<a[^>]*class="footnote-backref"[^>]*>[\\s\\S]*?<\\/a>/g, '')
                      .trim();
                    post({ type: 'footnoteTap', html: html });
                  }
                  return;
                }
                // External http(s) links — let the system handle (or block).
                if (/^[a-z]+:\\/\\//.test(href)) return;
                // Anything else: assume it points at another chapter in this
                // book. Host resolves to a leaf id and navigates.
                ev.preventDefault();
                ev.stopImmediatePropagation();
                post({ type: 'crossRefTap', href: href });
                return;
              }
              // Page-region tap: left 30% = prev, right 30% = next, middle =
              // chrome toggle.
              const frame = doc.defaultView.frameElement;
              if (!frame) return;
              const onScreenX = frame.getBoundingClientRect().left + ev.clientX;
              const w = paginator.getBoundingClientRect().width;
              if (onScreenX < w * 0.3) paginator.prev();
              else if (onScreenX > w * 0.7) paginator.next();
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
