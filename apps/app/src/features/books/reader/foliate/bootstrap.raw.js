// Foliate reader bootstrap. Runs INSIDE the WebView (not in the RN JS
// context). bundle.mjs wraps this file's source into bootstrapScript.ts as
// a JSON-stringified constant which is then spliced into the WebView's
// host HTML by FoliateReader.tsx. The host calls window.__foliateInit
// once after the script loads, passing the initial config + chapters.
//
// Comments and string literals inside this file can use backticks freely
// — that's the entire point of extracting it. It's never embedded in a
// host-side template literal.

window.__foliateInit = (initialCfg, chapterCount, initialIndex, initialFraction, initialChapter) => {
  const post = (msg) => {
    const json = JSON.stringify(msg);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(json);
    else if (window.parent !== window) window.parent.postMessage(json, '*');
  };
  window.onerror = (m, _u, l) => post({ type: 'error', message: String(m) + ' @' + l });

  let cfg = initialCfg;
  let chapterTotal = chapterCount;
  // One Map<index, {body?, url?, pending?}>. Map insertion order is recency
  // for the LRU pass below — a long reading session would otherwise grow this
  // unboundedly (12k chapters * ~10 KB = 120 MB worst case).
  const SECTION_LRU_CAP = 64;
  const sections = new Map();
  const getSection = (i) => {
    let s = sections.get(i);
    if (!s) { s = {}; sections.set(i, s); }
    return s;
  };
  const evictIfNeeded = () => {
    while (sections.size > SECTION_LRU_CAP) {
      const oldestIdx = sections.keys().next().value;
      if (oldestIdx === undefined) break;
      const old = sections.get(oldestIdx);
      if (old && old.url) URL.revokeObjectURL(old.url);
      sections.delete(oldestIdx);
    }
  };
  if (typeof initialChapter === 'string') getSection(initialIndex).body = initialChapter;
  let paginator;
  // Per-chapter highlight store; persisted-state mirror that lives across
  // chapter loads. Replayed into each overlayer as foliate creates one.
  const highlightsByChapter = new Map(); // index -> Map<id, {anchor, color, hasNote}>
  const overlayers = new Map(); // index -> HighlightOverlayer
  let selectionDebounce;

  const buildStyle = (c) => `
    html, body { margin: 0; padding: 0; height: 100%; background: ${c.background}; color: ${c.color}; }
    body {
      font-family: ${c.fontFamily}, Georgia, 'Times New Roman', serif;
      font-size: ${c.fontSizePx}px;
      line-height: ${c.lineHeightPx}px;
      text-align: ${c.textAlign};
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
  `;

  // foliate's iframe.src = blob:URL. Wrap each chapter HTML in a minimal
  // document so the paginator can read computed background / direction.
  const blobUrl = (body) =>
    URL.createObjectURL(
      new Blob(
        [
          '<!doctype html><html lang="',
          cfg.lang || 'en',
          '"><head><meta charset="utf-8">',
          '<style>',
          buildStyle(cfg),
          '</style></head><body>',
          body,
          '</body></html>',
        ],
        { type: 'text/html' },
      ),
    );

  // --- Plain-text anchor scheme (mirrors highlightAnchor.ts on the RN side).
  const walkText = (root, visit) => {
    let n = root.firstChild;
    while (n) {
      if (n.nodeType === 3) {
        const out = visit(n);
        if (out !== undefined) return out;
      } else if (n.firstChild) {
        const out = walkText(n, visit);
        if (out !== undefined) return out;
      }
      n = n.nextSibling;
    }
    return undefined;
  };
  const offsetOf = (root, target, targetOffset) => {
    let acc = 0;
    let found;
    walkText(root, (text) => {
      if (text === target) {
        found = acc + targetOffset;
        return found;
      }
      acc += (text.nodeValue || '').length;
      return undefined;
    });
    return found !== undefined ? found : Math.min(acc, targetOffset);
  };
  const locate = (root, offset) => {
    let rem = offset;
    let hit;
    walkText(root, (text) => {
      const len = (text.nodeValue || '').length;
      if (rem <= len) {
        hit = { node: text, local: rem };
        return hit;
      }
      rem -= len;
      return undefined;
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
      this.doc = doc;
      this.index = index;
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
    // CROSS-DOCUMENT COORDINATE TRANSLATION (load-bearing — do not
    // simplify). The SVG is created in the iframe document but foliate
    // appends it to the host view container, so the SVG is adopted into
    // the host doc on insert. After adoption, the SVG bounding rect is
    // host-viewport-relative; `range.getClientRects()` on ranges inside
    // the iframe doc is iframe-viewport-relative. The two coord systems
    // differ by exactly the iframe element's offset within the host. A
    // previous simplification to `r.x - svgRect.x` made every highlight
    // land off-screen by exactly that delta.
    _iframeToSvgDelta() {
      const iframe = this.doc.defaultView && this.doc.defaultView.frameElement;
      const iframeRect = iframe
        ? iframe.getBoundingClientRect()
        : { left: 0, top: 0 };
      const svgRect = this.element.getBoundingClientRect();
      return {
        dx: iframeRect.left - svgRect.x,
        dy: iframeRect.top - svgRect.y,
      };
    }
    redraw() {
      while (this.element.firstChild)
        this.element.removeChild(this.element.firstChild);
      const map = highlightsByChapter.get(this.index);
      if (!map || !map.size) return;
      const delta = this._iframeToSvgDelta();
      for (const [id, hl] of map) this._paint(id, hl, delta);
    }
    addOne(id, hl) {
      this._paint(id, hl, this._iframeToSvgDelta());
    }
    removeOne(id) {
      const nodes = this.element.querySelectorAll(
        '[data-hl-id="' + id + '"]',
      );
      for (let i = 0; i < nodes.length; i++) nodes[i].remove();
    }
    _paint(id, hl, delta) {
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
        dot.setAttribute('cx', String(first.x + delta.dx - 6));
        dot.setAttribute(
          'cy',
          String(first.y + delta.dy + first.height / 2),
        );
        dot.setAttribute('r', '4');
        dot.setAttribute('fill', hl.color);
        dot.setAttribute('opacity', '1');
        dot.setAttribute('data-hl-id', id);
        this.element.appendChild(dot);
      }
      for (let i = 0; i < rects.length; i++) {
        const r = rects[i];
        const x = r.x + delta.dx;
        const y = r.y + delta.dy;
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
          ev.preventDefault();
          ev.stopPropagation();
          // The SVG rect lives in the host (WebView) document, not the
          // iframe — its bounding rect is already viewport-local, so no
          // frame offset to add.
          const tapped = ev.currentTarget.getBoundingClientRect();
          post({
            type: 'highlightTap',
            id: id,
            chapterIndex: this.index,
            rect: {
              x: tapped.left,
              y: tapped.top,
              width: tapped.width,
              height: tapped.height,
            },
          });
        });
        this.element.appendChild(rect);
      }
    }
  }

  // Lazy blob URL backed by the section's body. Returns undefined when the
  // body hasn't arrived yet; loadSection handles the request round-trip.
  const ensureSectionUrl = (i) => {
    const s = getSection(i);
    if (s.url) return s.url;
    if (s.body === undefined) return undefined;
    s.url = blobUrl(s.body);
    return s.url;
  };

  // Foliate awaits this (paginator line ~1013). Cache-hit returns synchronously;
  // cache-miss posts requestChapter and resolves once provideChapter lands.
  const loadSection = (i) => {
    const ready = ensureSectionUrl(i);
    if (ready) return Promise.resolve(ready);
    const s = getSection(i);
    if (s.pending) return s.pending.promise;
    let resolve, reject;
    const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
    const timeoutId = setTimeout(() => {
      const cur = sections.get(i);
      if (cur) cur.pending = undefined;
      reject(new Error('chapter ' + i + ' load timed out'));
    }, 15000);
    s.pending = { promise, resolve, reject, timeoutId };
    post({ type: 'requestChapter', index: i });
    return promise;
  };

  // Revoke the URL but keep the body — cheap to re-blob if foliate revisits.
  const unloadSection = (i) => {
    const s = sections.get(i);
    if (!s || !s.url) return;
    URL.revokeObjectURL(s.url);
    s.url = undefined;
  };

  const buildBook = () => {
    // Drop any stale URLs so the next load re-blobs with the current CSS.
    for (const s of sections.values()) {
      if (s.url) { URL.revokeObjectURL(s.url); s.url = undefined; }
    }
    const out = [];
    for (let i = 0; i < chapterTotal; i++) {
      const idx = i;
      const s = sections.get(idx);
      out.push({
        id: 'ch' + idx,
        load: () => loadSection(idx),
        unload: () => unloadSection(idx),
        size: (s && s.body && s.body.length) || 1,
        linear: 'yes',
        cfi: '',
      });
    }
    return { dir: 'ltr', sections: out };
  };

  // Mirror of the paginator's private #index (no public getter exists) —
  // updated on every relocate. Used to bound over-scroll chapter navigation.
  let lastIndex = initialIndex ?? 0;

  const postRelocate = (e) => {
    lastIndex = e.detail.index;
    let total;
    let current;
    let fraction;
    if (cfg.flow === 'scrolled') {
      // Scrolled layout has no sentinel pages; a "page" is one viewport
      // screen. Fraction is progress through the SCROLLABLE range (not the
      // full content height) so it reaches 1 at the true bottom — otherwise
      // a chapter shorter than ~20 screens could never hit the 0.95
      // completion threshold. A chapter that fits one screen is read on sight.
      const size = paginator.size;
      const viewSize = paginator.viewSize;
      total = Math.max(1, Math.round(viewSize / size));
      current = Math.max(1, Math.min(total, Math.floor(paginator.start / size) + 1));
      fraction =
        viewSize > size ? Math.max(0, Math.min(1, paginator.start / (viewSize - size))) : 1;
    } else {
      // foliate's pages count includes two dummy pages (cover sentinels), so
      // the user-visible total is pages - 2.
      total = Math.max(1, (paginator.pages || 1) - 2);
      current = Math.max(1, Math.min(total, paginator.page || 1));
      fraction = e.detail.fraction;
    }
    post({
      type: 'relocate',
      index: e.detail.index,
      fraction: fraction,
      page: current,
      pages: total,
    });
  };

  // Per-iframe wiring. The iframe doc is taken as an explicit parameter
  // so it is structurally impossible to repeat the earlier TDZ bug where
  // one wiring block referenced `doc` before the shared `const doc = …`
  // declaration was reached; the ReferenceError silently aborted the
  // entire load handler and disabled tap zones for every chapter.
  const wireSelectionListener = (doc, sectionIndex) => {
    if (!doc || doc.__selWired) return;
    doc.__selWired = true;
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
  };

  // Tap zones inside the chapter iframe: left 30% prev, right 30% next,
  // middle posts centerTap so the chrome can toggle. `ev.clientX` is
  // iframe-local; the iframe is sized to the FULL multi-column content
  // (much wider than the viewport) so reverse-engineering the offset
  // from `paginator.start` is fragile. Use the iframe element's
  // bounding rect, which gives viewport-relative position directly;
  // on-screen x is just `rect.left + clientX`.
  const wireTapZones = (doc) => {
    if (!doc || doc.__tapWired) return;
    doc.__tapWired = true;
    doc.addEventListener('click', (ev) => {
      // Anchor click: fragment links open in a popover (footnotes,
      // glossary); cross-references post the href up so the host can
      // navigate + push a back-stack entry.
      const a = ev.target && ev.target.closest && ev.target.closest('a');
      if (a) {
        const href = a.getAttribute('href') || '';
        if (href.startsWith('#')) {
          const target = doc.getElementById(href.slice(1));
          if (target) {
            ev.preventDefault();
            ev.stopImmediatePropagation();
            const html = target.innerHTML
              .replace(
                /<a[^>]*class="footnote-backref"[^>]*>[\s\S]*?<\/a>/g,
                '',
              )
              .trim();
            post({ type: 'footnoteTap', html: html });
          }
          return;
        }
        // External http(s) links: let the system handle (or block).
        if (/^[a-z]+:\/\//.test(href)) return;
        // Anything else: assume it points at another chapter in this
        // book. Host resolves to a leaf id and navigates.
        ev.preventDefault();
        ev.stopImmediatePropagation();
        post({ type: 'crossRefTap', href: href });
        return;
      }
      // In scrolled mode every tap toggles chrome; side-tap paging would
      // fight the active vertical scroll the user is reading with.
      if (cfg.flow === 'scrolled') {
        post({ type: 'centerTap' });
        return;
      }
      const frame = doc.defaultView.frameElement;
      if (!frame) return;
      const onScreenX = frame.getBoundingClientRect().left + ev.clientX;
      const w = paginator.getBoundingClientRect().width;
      if (onScreenX < w * 0.3) paginator.prev();
      else if (onScreenX > w * 0.7) paginator.next();
      else post({ type: 'centerTap' });
    });
  };

  // Over-scroll chapter navigation (scrolled mode only). Native scroll stops
  // dead at the chapter's edge with no affordance to continue. A swipe that
  // STARTS while already pinned at the boundary is a deliberate second
  // gesture, so treat it as next/prev chapter. The 70px threshold filters
  // out taps and accidental nudges. Boundary checks mirror foliate's own
  // #scrollNext / #scrollPrev guards.
  const wireOverscroll = (doc) => {
    if (!doc || doc.__overscrollWired) return;
    doc.__overscrollWired = true;
    let gesture;
    doc.addEventListener(
      'touchstart',
      (ev) => {
        gesture = undefined;
        if (cfg.flow !== 'scrolled' || !paginator) return;
        if (globalThis.visualViewport && globalThis.visualViewport.scale > 1) return;
        const touch = ev.changedTouches[0];
        if (!touch) return;
        gesture = {
          y: touch.screenY,
          atTop: paginator.start <= 0,
          atBottom: paginator.viewSize - paginator.end < 2,
        };
      },
      { passive: true },
    );
    doc.addEventListener('touchend', (ev) => {
      const g = gesture;
      gesture = undefined;
      if (!g || cfg.flow !== 'scrolled') return;
      const touch = ev.changedTouches[0];
      if (!touch) return;
      const dy = g.y - touch.screenY;
      // Bound by the spine: foliate's scrolled #scrollNext returns true even
      // on the last chapter, and #goTo({index: undefined}) throws.
      if (g.atBottom && dy > 70 && lastIndex + 1 < chapterTotal) paginator.next();
      else if (g.atTop && dy < -70 && lastIndex > 0) paginator.prev();
    });
  };

  // Cross-chapter fade-in. Foliate swaps the iframe element outright on
  // chapter boundaries, which otherwise reads as a hard snap. 200ms read as a
  // perceptible lag at the boundary; 120ms is short enough to feel like a
  // page-flip continuation rather than a transition of its own.
  const fadeInChapter = (doc) => {
    const docEl = doc && doc.documentElement;
    if (!docEl) return;
    docEl.style.opacity = '0';
    docEl.style.transition = 'opacity 120ms ease-out';
    requestAnimationFrame(() => {
      docEl.style.opacity = '1';
    });
  };

  const ensurePaginator = () => {
    if (paginator) return;
    paginator = document.createElement('foliate-paginator');
    paginator.setAttribute('flow', cfg.flow);
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
      fadeInChapter(doc);
      wireSelectionListener(doc, e.detail.index);
      wireTapZones(doc);
      wireOverscroll(doc);
    });
    document.body.append(paginator);
  };

  // In scrolled mode our posted fraction is normalized over the SCROLLABLE
  // range (see postRelocate), but foliate's numeric anchors are a fraction of
  // the full content height. Function anchors are evaluated after the section
  // loads, when viewSize is finally known — invert the normalization there.
  const toAnchor = (fraction) => {
    const f = fraction ?? 0;
    if (cfg.flow !== 'scrolled') return f;
    return () => {
      const size = paginator.size;
      const viewSize = paginator.viewSize;
      return viewSize > size ? (f * (viewSize - size)) / viewSize : 0;
    };
  };

  const openBook = (index, fraction) => {
    ensurePaginator();
    paginator.open(buildBook());
    paginator.goTo({ index: index ?? 0, anchor: toAnchor(fraction) });
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
    // Host streams chapter bodies as the user navigates. Idempotent — the
    // same body arriving twice is a no-op.
    provideChapter: (index, body) => {
      const s = getSection(index);
      if (s.body !== body) {
        s.body = body;
        // Drop the stale blob URL so ensureSectionUrl regenerates from the
        // new body (covers lang switch / content edits).
        if (s.url) { URL.revokeObjectURL(s.url); s.url = undefined; }
      }
      const pending = s.pending;
      if (pending) {
        clearTimeout(pending.timeoutId);
        s.pending = undefined;
        try {
          const url = ensureSectionUrl(index);
          if (url) pending.resolve(url);
          else pending.reject(new Error('chapter ' + index + ' body unavailable'));
        } catch (err) { pending.reject(err); }
      }
      // Move to most-recent slot in the LRU, then evict.
      sections.delete(index);
      sections.set(index, s);
      evictIfNeeded();
    },
    goTo: ({ index, fraction }) => {
      if (!paginator) return;
      paginator.goTo({ index: index ?? 0, anchor: toAnchor(fraction) });
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
      // The flow attribute change triggers foliate's render(), which restores
      // the last visible range — position survives the relayout natively.
      // Never reopen the book here: goTo with the current index skips the
      // section reload, and the index isn't even readable from outside.
      paginator.setAttribute('flow', cfg.flow);
      paginator.style.background = cfg.background;
      // Live-restyle the loaded chapter via foliate's setStyles; drop cached
      // blob URLs so future section loads re-blob with the new CSS.
      for (const s of sections.values()) {
        if (s.url) { URL.revokeObjectURL(s.url); s.url = undefined; }
      }
      paginator.setStyles(buildStyle(cfg));
    },
    setHighlights: (list) => {
      highlightsByChapter.clear();
      for (const h of list) {
        let m = highlightsByChapter.get(h.chapterIndex);
        if (!m) {
          m = new Map();
          highlightsByChapter.set(h.chapterIndex, m);
        }
        m.set(h.id, { anchor: h.anchor, color: h.color, hasNote: !!h.hasNote });
      }
      for (const ov of overlayers.values()) ov.redraw();
    },
    addHighlight: (h) => {
      // Idempotent — if a highlight with this id is already painted, sweep
      // its old rects before adding the new ones. Lets BookReader call
      // addHighlight to recolor / toggle-note without a separate remove.
      let m = highlightsByChapter.get(h.chapterIndex);
      if (!m) {
        m = new Map();
        highlightsByChapter.set(h.chapterIndex, m);
      }
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
        post({
          type: 'error',
          message:
            'copyText (clipboard API): ' +
            String(err && err.message ? err.message : err),
        });
      }
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        post({
          type: 'error',
          message:
            'copyText: ' + String(err && err.message ? err.message : err),
        });
      }
      document.body.removeChild(ta);
    },
    clearSelection: () => {
      try {
        const sel = window.getSelection();
        if (sel) sel.removeAllRanges();
        const contents =
          paginator && paginator.getContents ? paginator.getContents() : [];
        for (const c of contents) {
          const s =
            c.doc &&
            c.doc.defaultView &&
            c.doc.defaultView.getSelection();
          if (s) s.removeAllRanges();
        }
      } catch (err) {
        post({
          type: 'error',
          message:
            'clearSelection: ' +
            String(err && err.message ? err.message : err),
        });
      }
    },
  };

  openBook(initialIndex, initialFraction);
  post({ type: 'ready' });
};
