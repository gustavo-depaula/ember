import { Marked } from 'marked'
import markedFootnote from 'marked-footnote'
import { Platform } from 'react-native'
import type { TocNode } from '@/content/sources/filesystem'

// biome-ignore lint: conditional require for platform compat
const nativeFs = Platform.OS !== 'web' ? (require('expo-file-system') as any) : undefined

const md = new Marked().use(markedFootnote())

export type BookContent = {
  css: string
  chapters: Map<string, string>
  images: Map<string, string>
}

const darkModeOverrides = `
:root {
  --bg: #0E0D0C;
  --text: #EDE4D8;
  --heading: #EDE4D8;
  --text-secondary: #918880;
  --border: #2A2622;
  --link: #7A9EC8;
}
body { background-color: var(--bg); color: var(--text); }
h1, h2, h3, h4 { color: var(--heading); }
blockquote { border-left-color: var(--border); color: var(--text-secondary); }
a { color: var(--link); }
hr { border-top-color: var(--border); }
p.footnote { color: var(--text-secondary); }
`

// Pagination uses CSS multi-column layout.
// Key invariant: columnWidth + columnGap = viewportWidth.
// Padding on #ember-content (1.5em each side = 3em total) provides page margins.
// columnGap = 3em matches padding so each page translates by exactly viewportWidth.
const paginationCss = `
html, body {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
#ember-viewport {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
#ember-content {
  column-fill: auto;
  height: 100%;
  padding: 1em var(--reader-margin, 1.5em);
  box-sizing: border-box;
  transition: transform 300ms cubic-bezier(0.2, 0, 0, 1);
}
#ember-content img {
  max-height: 80vh;
  break-inside: avoid;
}
h1, h2, h3, h4 {
  break-inside: avoid;
  break-after: avoid;
}
body {
  orphans: 2;
  widows: 2;
}
.ch-panel + .ch-panel {
  break-before: column;
}
`

// The WebView loads this shell once. Chapter content is swapped via postMessage
// so the WebView never remounts — no blank flash between chapters.
const paginationScript = `
<script>
(function() {
  var currentPage = 0;
  var totalPages = 1;
  var viewport = document.getElementById('ember-viewport');
  var el = document.getElementById('ember-content');
  var pageWidth;
  var chapterBounds = { curStart: 0, nextStart: 0, hasPrev: false, hasNext: false };

  function send(msg) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(msg));
    } else if (window.parent !== window) {
      window.parent.postMessage(JSON.stringify(msg), '*');
    }
  }

  function measure() {
    pageWidth = viewport.offsetWidth;
    var style = getComputedStyle(el);
    var gap = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    var colWidth = pageWidth - gap;
    el.style.columnWidth = colWidth + 'px';
    el.style.columnGap = gap + 'px';
    totalPages = Math.max(1, Math.round(el.scrollWidth / pageWidth));
  }

  function findChapterBounds() {
    var elLeft = el.getBoundingClientRect().left;
    var padLeft = parseFloat(getComputedStyle(el).paddingLeft);
    function startPage(panel) {
      var r = panel.getClientRects();
      if (!r.length) return 0;
      return Math.round((r[0].left - elLeft - padLeft) / pageWidth);
    }
    var cur = el.querySelector('[data-ch="cur"]');
    var next = el.querySelector('[data-ch="next"]');
    var prev = el.querySelector('[data-ch="prev"]');
    chapterBounds.curStart = cur ? startPage(cur) : 0;
    chapterBounds.nextStart = next ? startPage(next) : totalPages;
    chapterBounds.hasPrev = !!prev;
    chapterBounds.hasNext = !!next;
  }

  function chapterRelativePage() {
    return currentPage - chapterBounds.curStart;
  }

  function chapterPageCount() {
    return chapterBounds.nextStart - chapterBounds.curStart;
  }

  function sendPageInfo() {
    send({ type: 'pageInfo', currentPage: chapterRelativePage(), totalPages: chapterPageCount() });
  }

  function goToPage(n) {
    // Clamp at true boundaries
    if (n < 0) n = 0;
    if (n >= totalPages) n = totalPages - 1;

    currentPage = n;
    el.style.transform = 'translateX(' + (-n * pageWidth) + 'px)';

    // Detect chapter crossing — don't send pageInfo (bounds are stale until refreshBuffer)
    if (chapterBounds.hasNext && n >= chapterBounds.nextStart) {
      send({ type: 'chapterCross', direction: 'next', page: n - chapterBounds.nextStart });
    } else if (chapterBounds.hasPrev && n < chapterBounds.curStart) {
      send({ type: 'chapterCross', direction: 'prev', page: n });
    } else {
      sendPageInfo();
    }
  }

  function loadSequence(html, startPage) {
    el.style.transition = 'none';
    el.innerHTML = html;
    requestAnimationFrame(function() {
      measure();
      findChapterBounds();
      var chapPages = chapterPageCount();
      var relPage = startPage < 0 ? chapPages - 1 : Math.min(startPage, chapPages - 1);
      currentPage = chapterBounds.curStart + relPage;
      el.style.transform = 'translateX(' + (-currentPage * pageWidth) + 'px)';
      sendPageInfo();
      send({ type: 'ready' });
      requestAnimationFrame(function() { el.style.transition = ''; });
    });
  }

  // --- Touch / swipe handling ---
  var touchStartX = 0;
  var touchStartY = 0;
  var touchStartTime = 0;
  var isSwiping = false;
  var swipeBlocked = false;
  var edgeSwipe = false;

  document.addEventListener('touchstart', function(e) {
    if (e.target.tagName === 'A') return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
    isSwiping = false;
    swipeBlocked = false;
    edgeSwipe = touchStartX < 20;
    if (!edgeSwipe) {
      el.style.transition = 'none';
    }
  }, { passive: true });

  document.addEventListener('touchmove', function(e) {
    if (swipeBlocked || edgeSwipe) return;
    var dx = e.touches[0].clientX - touchStartX;
    var dy = e.touches[0].clientY - touchStartY;

    // If vertical movement dominates, block horizontal swipe
    if (!isSwiping && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10) {
      swipeBlocked = true;
      return;
    }

    if (Math.abs(dx) > 10) isSwiping = true;
    if (isSwiping) {
      var base = -currentPage * pageWidth;
      el.style.transform = 'translateX(' + (base + dx) + 'px)';
    }
  }, { passive: true });

  document.addEventListener('touchend', function(e) {
    if (swipeBlocked) return;
    if (edgeSwipe) {
      var edgeDx = e.changedTouches[0].clientX - touchStartX;
      if (edgeDx > 60) send({ type: 'backSwipe' });
      return;
    }
    var dx = e.changedTouches[0].clientX - touchStartX;
    var elapsed = Date.now() - touchStartTime;
    var velocity = Math.abs(dx) / elapsed;

    el.style.transition = '';

    if (isSwiping) {
      if (dx < -40 || (velocity > 0.3 && dx < -10)) {
        goToPage(currentPage + 1);
      } else if (dx > 40 || (velocity > 0.3 && dx > 10)) {
        goToPage(currentPage - 1);
      } else {
        el.style.transform = 'translateX(' + (-currentPage * pageWidth) + 'px)';
      }
    } else if (elapsed < 300 && Math.abs(dx) < 10) {
      var x = touchStartX / window.innerWidth;
      if (x < 0.3) {
        goToPage(currentPage - 1);
      } else if (x > 0.7) {
        goToPage(currentPage + 1);
      } else {
        send({ type: 'centerTap' });
      }
    }
  });

  // Click fallback for mouse/desktop
  document.addEventListener('click', function(e) {
    if (e.target.tagName === 'A') return;
    if ('ontouchstart' in window) return;
    var x = e.clientX / window.innerWidth;
    if (x < 0.3) {
      goToPage(currentPage - 1);
    } else if (x > 0.7) {
      goToPage(currentPage + 1);
    } else {
      send({ type: 'centerTap' });
    }
  });

  window.addEventListener('message', function(e) {
    try {
      var msg = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      if (msg.type === 'goToPage') {
        var absPage = chapterBounds.curStart + (msg.page < 0 ? chapterPageCount() - 1 : msg.page);
        goToPage(absPage);
      }
      if (msg.type === 'loadSequence') loadSequence(msg.html, msg.startPage);
      if (msg.type === 'refreshBuffer') {
        requestAnimationFrame(function() {
          el.style.transition = 'none';
          var oldCurStart = chapterBounds.curStart;

          if (msg.direction === 'next') {
            var oldPrev = el.querySelector('[data-ch="prev"]');
            if (oldPrev) el.removeChild(oldPrev);
            var oldCur = el.querySelector('[data-ch="cur"]');
            if (oldCur) oldCur.setAttribute('data-ch', 'prev');
            var oldNext = el.querySelector('[data-ch="next"]');
            if (oldNext) oldNext.setAttribute('data-ch', 'cur');
            if (msg.html) {
              var panel = document.createElement('div');
              panel.className = 'ch-panel';
              panel.setAttribute('data-ch', 'next');
              panel.innerHTML = msg.html;
              el.appendChild(panel);
            }
            measure();
            findChapterBounds();
            currentPage -= oldCurStart;
          } else {
            var oldNext2 = el.querySelector('[data-ch="next"]');
            if (oldNext2) el.removeChild(oldNext2);
            var oldCur2 = el.querySelector('[data-ch="cur"]');
            if (oldCur2) oldCur2.setAttribute('data-ch', 'next');
            var oldPrev2 = el.querySelector('[data-ch="prev"]');
            if (oldPrev2) oldPrev2.setAttribute('data-ch', 'cur');
            if (msg.html) {
              var panel2 = document.createElement('div');
              panel2.className = 'ch-panel';
              panel2.setAttribute('data-ch', 'prev');
              panel2.innerHTML = msg.html;
              el.insertBefore(panel2, el.firstChild);
            }
            measure();
            findChapterBounds();
            currentPage += chapterBounds.curStart;
          }

          el.style.transform = 'translateX(' + (-currentPage * pageWidth) + 'px)';
          sendPageInfo();
          requestAnimationFrame(function() { el.style.transition = ''; });
        });
      }
      if (msg.type === 'updateStyles') {
        var style = document.getElementById('reader-config');
        if (style) style.textContent = msg.css;
        el.style.transition = 'none';
        requestAnimationFrame(function() {
          measure();
          findChapterBounds();
          goToPage(currentPage);
          requestAnimationFrame(function() { el.style.transition = ''; });
        });
      }
    } catch(err) { console.error('[reader] message handler failed:', err); }
  });

  // Initial measure
  requestAnimationFrame(function() {
    el.style.transition = 'none';
    measure();
    findChapterBounds();
    currentPage = chapterBounds.curStart;
    el.style.transform = 'translateX(' + (-currentPage * pageWidth) + 'px)';
    sendPageInfo();
    send({ type: 'ready' });
    requestAnimationFrame(function() {
      el.style.transition = '';
    });
  });

  window.addEventListener('resize', function() {
    el.style.transition = 'none';
    var relPage = chapterRelativePage();
    measure();
    findChapterBounds();
    currentPage = chapterBounds.curStart + Math.min(relPage, chapterPageCount() - 1);
    el.style.transform = 'translateX(' + (-currentPage * pageWidth) + 'px)';
    sendPageInfo();
    requestAnimationFrame(function() {
      el.style.transition = '';
    });
  });
})();
</script>
`

function mimeForExt(filename: string): string {
  if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) return 'image/jpeg'
  if (filename.endsWith('.png')) return 'image/png'
  if (filename.endsWith('.gif')) return 'image/gif'
  if (filename.endsWith('.svg')) return 'image/svg+xml'
  if (filename.endsWith('.webp')) return 'image/webp'
  return 'image/jpeg'
}

// Scan chapter HTML for <img src="..."> values, skipping data: URIs already inlined.
function collectImgSrcs(htmls: Iterable<string>): string[] {
  const srcs = new Set<string>()
  const re = /<img\b[^>]*\bsrc=["']([^"']+)["']/gi
  for (const html of htmls) {
    let m = re.exec(html)
    while (m !== null) {
      const src = m[1]
      if (!src.startsWith('data:')) srcs.add(src)
      m = re.exec(html)
    }
  }
  return [...srcs]
}

// Resolve a chapter-relative src ("../images/foo.jpg" or "images/foo.jpg") against
// the book directory. Returns the path under bookDirUri (no scheme).
function resolveImgSrc(src: string, bookDirUri: string): string {
  const rel = src.startsWith('../') ? src.slice(3) : src
  return `${bookDirUri}${rel}`
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize)
    binary += String.fromCharCode.apply(null, chunk as unknown as number[])
  }
  return btoa(binary)
}

export async function loadBookContent(
  bookDirUri: string,
  lang: string,
  chapterIds: string[],
): Promise<BookContent> {
  if (Platform.OS === 'web') {
    return loadBookContentWeb(bookDirUri, lang, chapterIds)
  }
  return loadBookContentNative(bookDirUri, lang, chapterIds)
}

async function loadBookContentNative(
  bookDirUri: string,
  lang: string,
  chapterIds: string[],
): Promise<BookContent> {
  const { File: NativeFile } = nativeFs
  const langDir = `${bookDirUri}${lang}/`

  // Read stylesheet
  let css = ''
  try {
    css = await new NativeFile(`${langDir}style.css`).text()
  } catch {}

  // Read chapters (.html preferred, .md fallback with runtime conversion)
  const chapters = new Map<string, string>()
  await Promise.all(
    chapterIds.map(async (id) => {
      try {
        const text = await new NativeFile(`${langDir}${id}.html`).text()
        chapters.set(id, text)
      } catch {
        try {
          const raw = await new NativeFile(`${langDir}${id}.md`).text()
          const html = await md.parse(raw)
          chapters.set(id, html)
        } catch {}
      }
    }),
  )

  // Inline only images actually referenced by chapter HTML; avoids relying on
  // Directory.list(), which has been unreliable on iOS.
  const images = new Map<string, string>()
  await Promise.all(
    collectImgSrcs(chapters.values()).map(async (src) => {
      try {
        const absPath = resolveImgSrc(src, bookDirUri)
        const b64 = await new NativeFile(absPath).base64()
        images.set(src, `data:${mimeForExt(absPath)};base64,${b64}`)
      } catch {}
    }),
  )

  return { css, chapters, images }
}

async function loadBookContentWeb(
  bookDirUri: string,
  lang: string,
  chapterIds: string[],
): Promise<BookContent> {
  const { idbReadText, idbReadBinary } = await import('@/lib/idb-fs')

  // bookDirUri is like "idb://books/libraryId/" — strip the idb:// prefix
  const basePath = bookDirUri.replace(/^idb:\/\//, '')
  const langDir = `${basePath}${lang}/`

  let css = ''
  try {
    css = (await idbReadText(`${langDir}style.css`)) ?? ''
  } catch {}

  const chapters = new Map<string, string>()
  await Promise.all(
    chapterIds.map(async (id) => {
      const html = await idbReadText(`${langDir}${id}.html`)
      if (html) {
        chapters.set(id, html)
      } else {
        const raw = await idbReadText(`${langDir}${id}.md`)
        if (raw) {
          const parsed = await md.parse(raw)
          chapters.set(id, parsed)
        }
      }
    }),
  )

  // IDB has no directory listing, so resolve only the images the chapters reference.
  const images = new Map<string, string>()
  await Promise.all(
    collectImgSrcs(chapters.values()).map(async (src) => {
      try {
        const absPath = resolveImgSrc(src, basePath)
        const bytes = await idbReadBinary(absPath)
        if (!bytes) return
        const b64 = bytesToBase64(bytes)
        images.set(src, `data:${mimeForExt(absPath)};base64,${b64}`)
      } catch {}
    }),
  )

  return { css, chapters, images }
}

function extractBody(html: string): string {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)
  return bodyMatch ? bodyMatch[1].trim() : html
}

export type ReaderConfig = {
  fontSizePx: number
  lineHeightPx: number
  textAlign: 'justify' | 'left'
  margin: 'narrow' | 'normal' | 'wide'
}

const marginToCss = { narrow: '0.8em', normal: '1.5em', wide: '2.5em' } as const

export function buildConfigCss(config: ReaderConfig): string {
  const ratio = config.lineHeightPx / config.fontSizePx
  return `:root {
    --reader-font-size: ${config.fontSizePx}px;
    --reader-line-height: ${ratio.toFixed(3)};
    --reader-text-align: ${config.textAlign};
    --reader-margin: ${marginToCss[config.margin]};
  }`
}

/** Wrap chapter bodies in panel divs for three-panel pre-rendering */
export function buildSequenceBody(
  content: BookContent,
  chapters: { prev?: string; current: string; next?: string },
  titleLookup: Map<string, string>,
): string {
  let html = ''
  if (chapters.prev) {
    html += `<div class="ch-panel" data-ch="prev">${getChapterBody(content, chapters.prev, titleLookup.get(chapters.prev))}</div>`
  }
  html += `<div class="ch-panel" data-ch="cur">${getChapterBody(content, chapters.current, titleLookup.get(chapters.current))}</div>`
  if (chapters.next) {
    html += `<div class="ch-panel" data-ch="next">${getChapterBody(content, chapters.next, titleLookup.get(chapters.next))}</div>`
  }
  return html
}

/** Build the reader shell HTML — loaded once, chapters swapped via messages */
export function buildReaderShell(
  content: BookContent,
  chapters: { prev?: string; current: string; next?: string },
  isDark: boolean,
  titleLookup: Map<string, string>,
  config?: ReaderConfig,
): string {
  const sequenceBody = buildSequenceBody(content, chapters, titleLookup)
  const darkStyle = isDark ? `<style>${darkModeOverrides}</style>` : ''
  const configStyle = config ? `<style id="reader-config">${buildConfigCss(config)}</style>` : ''

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no"/>
<style>${content.css}</style>
<style>${paginationCss}</style>
${darkStyle}
${configStyle}
</head>
<body>
<div id="ember-viewport">
<div id="ember-content">
${sequenceBody}
</div>
</div>
${paginationScript}
</body>
</html>`
}

/** Get a chapter's body HTML with images resolved to data URIs */
export function getChapterBody(content: BookContent, chapterId: string, title?: string): string {
  const html = content.chapters.get(chapterId)
  if (!html) return ''

  let body = extractBody(html)
  for (const [path, dataUri] of content.images) {
    if (body.includes(path)) body = body.replaceAll(path, dataUri)
    const parentPath = `../${path}`
    if (body.includes(parentPath)) body = body.replaceAll(parentPath, dataUri)
  }
  if (title) body = `<h2 class="chapter-title">${title}</h2>${body}`
  return body
}

function localizedTitle(title: TocNode['title'], lang: string): string | undefined {
  return (title as Record<string, string>)[lang] ?? Object.values(title)[0]
}

export function buildTitleLookup(toc: TocNode[], lang: string): Map<string, string> {
  const map = new Map<string, string>()
  function walk(nodes: TocNode[]) {
    for (const node of nodes) {
      const title = localizedTitle(node.title, lang)
      if (title) map.set(node.id, title)
      if (node.children) walk(node.children)
    }
  }
  walk(toc)
  return map
}

export function findTocTitle(toc: TocNode[], id: string, lang: string): string | undefined {
  for (const node of toc) {
    if (node.id === id) return localizedTitle(node.title, lang)
    if (node.children) {
      const found = findTocTitle(node.children, id, lang)
      if (found) return found
    }
  }
}

export type TocLeaf = { id: string; index: number }

export function flattenTocLeaves(toc: TocNode[]): TocLeaf[] {
  const leaves: TocLeaf[] = []
  function walk(nodes: TocNode[]) {
    for (const node of nodes) {
      if (node.children?.length) {
        walk(node.children)
      } else {
        leaves.push({ id: node.id, index: leaves.length })
      }
    }
  }
  walk(toc)
  return leaves
}
