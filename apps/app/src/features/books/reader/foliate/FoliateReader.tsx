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

  // Host HTML is built ONCE with initial chapters + config baked in. Update
  // effects below ride over `injectJavaScript` so we never remount the
  // WebView (which would blank the screen).
  //
  // biome-ignore lint/correctness/useExhaustiveDependencies: baked at first paint only
  const html = useMemo(() => buildHostHtml({ chapters, initialIndex, initialFraction, config }), [])

  // First mount already has chapters + config baked in — skip the redundant
  // re-inject that would re-open the book.
  const chapterMounted = useRef(false)
  useEffect(() => {
    if (!chapterMounted.current) {
      chapterMounted.current = true
      return
    }
    // No index/fraction — bootstrap preserves current paginator position. The
    // initial location was set on first paint; mid-session chapter list
    // changes (e.g. titleLookup mutation on language switch) shouldn't yank
    // the reader back to the start.
    inject(webViewRef, `window.__foliate?.loadBook(${JSON.stringify(chapters)});true;`)
  }, [chapters])

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
      // Per-chapter highlight store; persisted-state mirror that lives across
      // chapter loads. Replayed into each overlayer as foliate creates one.
      const highlightsByChapter = new Map(); // index -> Map<id, {anchor, color, hasNote}>
      const overlayers = new Map();          // index -> HighlightOverlayer
      let selectionDebounce;

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
          /* Suppress the iOS native Copy / Look Up / Share callout on text
             selection; our floating toolbar replaces it. Text selection
             itself stays enabled. */
          -webkit-touch-callout: none;
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

      // --- Plain-text anchor scheme (mirrors highlightAnchor.ts on the RN side).
      const walkText = (root, visit) => {
        let n = root.firstChild;
        while (n) {
          if (n.nodeType === 3) { const out = visit(n); if (out !== undefined) return out; }
          else if (n.firstChild) { const out = walkText(n, visit); if (out !== undefined) return out; }
          n = n.nextSibling;
        }
        return undefined;
      };
      const offsetOf = (root, target, targetOffset) => {
        let acc = 0; let found;
        walkText(root, (text) => {
          if (text === target) { found = acc + targetOffset; return found; }
          acc += (text.nodeValue || '').length; return undefined;
        });
        return found !== undefined ? found : Math.min(acc, targetOffset);
      };
      const locate = (root, offset) => {
        let rem = offset; let hit;
        walkText(root, (text) => {
          const len = (text.nodeValue || '').length;
          if (rem <= len) { hit = { node: text, local: rem }; return hit; }
          rem -= len; return undefined;
        });
        return hit;
      };
      const encodeRange = (root, range) => {
        const s = offsetOf(root, range.startContainer, range.startOffset);
        const e = offsetOf(root, range.endContainer, range.endOffset);
        return e < s ? { startOffset: e, endOffset: s } : { startOffset: s, endOffset: e };
      };
      const resolveAnchor = (doc, anchor) => {
        const s = locate(doc.body, anchor.startOffset);
        const e = locate(doc.body, anchor.endOffset);
        if (!s || !e) return undefined;
        const r = doc.createRange();
        r.setStart(s.node, s.local);
        r.setEnd(e.node, e.local);
        return r;
      };

      // SVG overlayer: foliate-paginator dispatches a create-overlayer event
      // per section; we construct our own (foliate expects an attachable
      // element plus a redraw method invoked on column-layout changes).
      class HighlightOverlayer {
        constructor(doc, index) {
          this.doc = doc; this.index = index;
          const svgNs = 'http://www.w3.org/2000/svg';
          this.element = doc.createElementNS(svgNs, 'svg');
          this.element.setAttribute('xmlns', svgNs);
          this.element.style.position = 'absolute';
          this.element.style.top = '0';
          this.element.style.left = '0';
          this.element.style.width = '100%';
          this.element.style.height = '100%';
          this.element.style.pointerEvents = 'none';
        }
        // The iframe's offset within the host viewport. `range.getClientRects()`
        // returns iframe-viewport-relative rects; the SVG is in the HOST doc
        // (foliate appends it to the view container), so we translate to the
        // SVG's local coords via `iframe_offset + rect - svg_offset`.
        _offsets() {
          const iframe = this.doc.defaultView && this.doc.defaultView.frameElement;
          const iframeRect = iframe ? iframe.getBoundingClientRect() : { left: 0, top: 0 };
          const svgRect = this.element.getBoundingClientRect();
          return {
            dx: iframeRect.left - svgRect.x,
            dy: iframeRect.top - svgRect.y,
          };
        }
        redraw() {
          while (this.element.firstChild) this.element.removeChild(this.element.firstChild);
          const map = highlightsByChapter.get(this.index);
          if (!map || !map.size) return;
          const off = this._offsets();
          for (const [id, hl] of map) this._paint(id, hl, off);
        }
        addOne(id, hl) {
          this._paint(id, hl, this._offsets());
        }
        removeOne(id) {
          const nodes = this.element.querySelectorAll('[data-hl-id="' + id + '"]');
          for (let i = 0; i < nodes.length; i++) nodes[i].remove();
        }
        _paint(id, hl, off) {
          const range = resolveAnchor(this.doc, hl.anchor);
          if (!range) return;
          const svgNs = 'http://www.w3.org/2000/svg';
          const rects = range.getClientRects();
          // Note marker: a 6pt filled dot to the left of the first character,
          // colored to match the highlight. The dot is data-hl-id-tagged so
          // recolor/remove sweeps it along with the highlight rects.
          if (hl.hasNote && rects.length > 0) {
            const first = rects[0];
            const dot = this.doc.createElementNS(svgNs, 'circle');
            dot.setAttribute('cx', String(first.x + off.dx - 6));
            dot.setAttribute('cy', String(first.y + off.dy + first.height / 2));
            dot.setAttribute('r', '4');
            dot.setAttribute('fill', hl.color);
            dot.setAttribute('opacity', '1');
            dot.setAttribute('data-hl-id', id);
            this.element.appendChild(dot);
          }
          for (let i = 0; i < rects.length; i++) {
            const r = rects[i];
            const x = r.x + off.dx;
            const y = r.y + off.dy;
            const rect = this.doc.createElementNS(svgNs, 'rect');
            rect.setAttribute('x', String(x));
            rect.setAttribute('y', String(y));
            rect.setAttribute('width', String(r.width));
            rect.setAttribute('height', String(r.height));
            rect.setAttribute('fill', hl.color);
            rect.setAttribute('data-hl-id', id);
            rect.style.pointerEvents = 'auto';
            rect.style.cursor = 'pointer';
            rect.addEventListener('click', (ev) => {
              ev.preventDefault(); ev.stopPropagation();
              // The SVG rect lives in the host (WebView) document, not the
              // iframe — its bounding rect is already viewport-local, so no
              // frame offset to add.
              const tapped = ev.currentTarget.getBoundingClientRect();
              post({
                type: 'highlightTap',
                id: id,
                chapterIndex: this.index,
                rect: { x: tapped.left, y: tapped.top, width: tapped.width, height: tapped.height },
              });
            });
            this.element.appendChild(rect);
          }
        }
      }

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
        // Each section gets its own overlayer; foliate appends element to the
        // view container and calls redraw() on layout changes.
        paginator.addEventListener('create-overlayer', (e) => {
          const ov = new HighlightOverlayer(e.detail.doc, e.detail.index);
          overlayers.set(e.detail.index, ov);
          e.detail.attach(ov);
          // Replay any highlights already stored for this chapter on next paint
          // tick (foliate calls redraw post-layout).
          setTimeout(() => ov.redraw(), 0);
        });
        paginator.addEventListener('load', (e) => {
          post({ type: 'load', index: e.detail.index });
          const doc = e.detail.doc;
          // Fade the new chapter iframe in — foliate swaps the iframe element
          // outright on chapter boundaries, which otherwise reads as a snap.
          const docEl = doc && doc.documentElement;
          if (docEl) {
            docEl.style.opacity = '0';
            docEl.style.transition = 'opacity 200ms ease-out';
            requestAnimationFrame(() => { docEl.style.opacity = '1'; });
          }
          // Selection plumbing: post stable selection state to the host so it
          // can show the highlight toolbar at the right position.
          if (doc && !doc.__selWired) {
            doc.__selWired = true;
            const sectionIndex = e.detail.index;
            doc.addEventListener('selectionchange', () => {
              if (selectionDebounce) clearTimeout(selectionDebounce);
              selectionDebounce = setTimeout(() => {
                const sel = doc.defaultView.getSelection();
                if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
                  post({ type: 'selectionCleared' });
                  return;
                }
                const range = sel.getRangeAt(0);
                const text = range.toString();
                if (!text || text.trim().length < 2) {
                  post({ type: 'selectionCleared' });
                  return;
                }
                const frame = doc.defaultView.frameElement;
                if (!frame) return;
                const r = range.getBoundingClientRect();
                const frameRect = frame.getBoundingClientRect();
                post({
                  type: 'selectionChange',
                  chapterIndex: sectionIndex,
                  text: text,
                  anchor: encodeRange(doc.body, range),
                  rect: {
                    x: frameRect.left + r.left,
                    y: frameRect.top + r.top,
                    width: r.width,
                    height: r.height,
                  },
                });
              }, 250);
            });
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

      const currentLocation = () => {
        if (!paginator || !(paginator.pages > 2)) return { index: 0, fraction: 0 };
        return {
          index: paginator.index ?? 0,
          fraction: (Math.max(1, paginator.page) - 1) / (paginator.pages - 2),
        };
      };

      const findRange = (doc, needleLower) => {
        if (!doc || !needleLower) return null;
        const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
          const text = node.nodeValue || '';
          const idx = text.toLowerCase().indexOf(needleLower);
          if (idx >= 0) {
            const range = doc.createRange();
            range.setStart(node, idx);
            range.setEnd(node, Math.min(text.length, idx + needleLower.length));
            return range;
          }
        }
        return null;
      };

      window.__foliate = {
        loadBook: (newChapters, index, fraction) => {
          chapters = newChapters;
          // No explicit location → preserve current paginator position so
          // mid-session chapter-list changes don't reset the reader.
          const here = (index === undefined && paginator)
            ? currentLocation()
            : { index: index ?? 0, fraction: fraction ?? 0 };
          openBook(here.index, here.fraction);
        },
        goTo: ({ index, fraction }) => {
          if (!paginator) return;
          paginator.goTo({ index: index ?? 0, anchor: fraction ?? 0 });
        },
        goToWithFind: async (index, findText) => {
          if (!paginator) return;
          await paginator.goTo({ index: index ?? 0, anchor: 0 });
          const contents = paginator.getContents();
          if (!contents.length) return;
          const range = findRange(contents[0].doc, String(findText).toLowerCase());
          if (range) await paginator.scrollToAnchor(range);
        },
        goToAnchor: async (index, anchor) => {
          if (!paginator) return;
          await paginator.goTo({ index: index ?? 0, anchor: 0 });
          const contents = paginator.getContents();
          if (!contents.length) return;
          const range = resolveAnchor(contents[0].doc, anchor);
          if (range) await paginator.scrollToAnchor(range);
        },
        setConfig: (newCfg) => {
          cfg = newCfg;
          if (!paginator) return;
          paginator.setAttribute('margin', cfg.marginPx + 'px');
          paginator.style.background = cfg.background;
          // Re-blob every chapter with the new STYLE (foliate-paginator has
          // no setStyles); restore {index, fraction} so position is preserved.
          const here = currentLocation();
          paginator.open(buildBook());
          paginator.goTo({ index: here.index, anchor: here.fraction });
        },
        setHighlights: (list) => {
          highlightsByChapter.clear();
          for (const h of list) {
            let m = highlightsByChapter.get(h.chapterIndex);
            if (!m) { m = new Map(); highlightsByChapter.set(h.chapterIndex, m); }
            m.set(h.id, { anchor: h.anchor, color: h.color, hasNote: !!h.hasNote });
          }
          for (const ov of overlayers.values()) ov.redraw();
        },
        addHighlight: (h) => {
          // Idempotent — if a highlight with this id is already painted, sweep
          // its old rects before adding the new ones. Lets BookReader call
          // addHighlight to recolor / toggle-note without a separate remove.
          let m = highlightsByChapter.get(h.chapterIndex);
          if (!m) { m = new Map(); highlightsByChapter.set(h.chapterIndex, m); }
          const stored = { anchor: h.anchor, color: h.color, hasNote: !!h.hasNote };
          m.set(h.id, stored);
          const ov = overlayers.get(h.chapterIndex);
          if (ov) {
            ov.removeOne(h.id);
            ov.addOne(h.id, stored);
          }
        },
        removeHighlight: (id) => {
          for (const [idx, m] of highlightsByChapter) {
            if (m.delete(id)) {
              const ov = overlayers.get(idx);
              if (ov) ov.removeOne(id);
              break;
            }
          }
        },
        copyText: (text) => {
          // iOS WKWebView (and modern Android WebView) ship navigator.clipboard.
          // Fall back to a textarea + execCommand on the off-chance it's missing.
          try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(text);
              return;
            }
          } catch (err) {
            post({ type: 'error', message: 'copyText (clipboard API): ' + String(err && err.message ? err.message : err) });
          }
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.left = '-9999px';
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand('copy'); } catch (err) {
            post({ type: 'error', message: 'copyText: ' + String(err && err.message ? err.message : err) });
          }
          document.body.removeChild(ta);
        },
        clearSelection: () => {
          try {
            const sel = window.getSelection();
            if (sel) sel.removeAllRanges();
            const contents = paginator && paginator.getContents ? paginator.getContents() : [];
            for (const c of contents) {
              const s = c.doc && c.doc.defaultView && c.doc.defaultView.getSelection();
              if (s) s.removeAllRanges();
            }
          } catch (err) {
            post({ type: 'error', message: 'clearSelection: ' + String(err && err.message ? err.message : err) });
          }
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
