import { Directory, File } from 'expo-file-system'
import { Marked } from 'marked'
import markedFootnote from 'marked-footnote'
import type { TocNode } from '@/content/sources/filesystem'

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

  function goToPage(n) {
    if (n < 0) {
      el.style.transform = 'translateX(' + pageWidth + 'px)';
      setTimeout(function() {
        send({ type: 'boundary', direction: 'prev' });
      }, 300);
      return;
    }
    if (n >= totalPages) {
      el.style.transform = 'translateX(' + (-totalPages * pageWidth) + 'px)';
      setTimeout(function() {
        send({ type: 'boundary', direction: 'next' });
      }, 300);
      return;
    }
    currentPage = n;
    el.style.transform = 'translateX(' + (-n * pageWidth) + 'px)';
    send({ type: 'pageInfo', currentPage: currentPage, totalPages: totalPages });
  }

  function loadChapter(html, startPage, direction) {
    el.style.transition = 'none';
    el.innerHTML = html;
    requestAnimationFrame(function() {
      measure();
      var page = startPage < 0 ? totalPages - 1 : startPage;
      currentPage = page;
      var target = -page * pageWidth;

      if (direction === 'next') {
        el.style.transform = 'translateX(' + (target + pageWidth) + 'px)';
      } else if (direction === 'prev') {
        el.style.transform = 'translateX(' + (target - pageWidth) + 'px)';
      } else {
        el.style.transform = 'translateX(' + target + 'px)';
        send({ type: 'pageInfo', currentPage: page, totalPages: totalPages });
        requestAnimationFrame(function() { el.style.transition = ''; });
        return;
      }
      requestAnimationFrame(function() {
        el.style.transition = '';
        el.style.transform = 'translateX(' + target + 'px)';
        send({ type: 'pageInfo', currentPage: page, totalPages: totalPages });
      });
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
      // Swipe: threshold 40px or fast flick
      if (dx < -40 || (velocity > 0.3 && dx < -10)) {
        goToPage(currentPage + 1);
      } else if (dx > 40 || (velocity > 0.3 && dx > 10)) {
        goToPage(currentPage - 1);
      } else {
        // Snap back
        el.style.transform = 'translateX(' + (-currentPage * pageWidth) + 'px)';
      }
    } else if (elapsed < 300 && Math.abs(dx) < 10) {
      // Tap — determine zone
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
    // Skip if touch events are available (avoid double-fire)
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
      if (msg.type === 'goToPage') goToPage(msg.page < 0 ? totalPages - 1 : msg.page);
      if (msg.type === 'loadChapter') loadChapter(msg.html, msg.startPage, msg.direction);
      if (msg.type === 'updateStyles') {
        var style = document.getElementById('reader-config');
        if (style) style.textContent = msg.css;
        el.style.transition = 'none';
        requestAnimationFrame(function() {
          measure();
          goToPage(currentPage);
          requestAnimationFrame(function() { el.style.transition = ''; });
        });
      }
    } catch(err) {}
  });

  // Initial measure
  requestAnimationFrame(function() {
    el.style.transition = 'none';
    measure();
    goToPage(0);
    send({ type: 'ready' });
    requestAnimationFrame(function() {
      el.style.transition = '';
    });
  });

  window.addEventListener('resize', function() {
    el.style.transition = 'none';
    measure();
    goToPage(currentPage);
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

export async function loadBookContent(
  bookDirUri: string,
  lang: string,
  chapterIds: string[],
): Promise<BookContent> {
  const langDir = `${bookDirUri}${lang}/`

  // Read stylesheet
  let css = ''
  try {
    css = await new File(`${langDir}style.css`).text()
  } catch {}

  // Read chapters (.html preferred, .md fallback with runtime conversion)
  const chapters = new Map<string, string>()
  await Promise.all(
    chapterIds.map(async (id) => {
      try {
        const text = await new File(`${langDir}${id}.html`).text()
        chapters.set(id, text)
      } catch {
        try {
          const raw = await new File(`${langDir}${id}.md`).text()
          const html = await md.parse(raw)
          chapters.set(id, html)
        } catch {}
      }
    }),
  )

  // Read images
  const images = new Map<string, string>()
  try {
    const imagesDir = new Directory(`${langDir}images`)
    const entries = imagesDir.list()
    await Promise.all(
      entries
        .filter((entry): entry is File => entry instanceof File)
        .map(async (file) => {
          const b64 = await file.base64()
          const dataUri = `data:${mimeForExt(file.name)};base64,${b64}`
          images.set(`images/${file.name}`, dataUri)
        }),
    )
  } catch {}

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

/** Build the reader shell HTML — loaded once, chapters swapped via messages */
export function buildReaderShell(
  content: BookContent,
  firstChapterId: string,
  isDark: boolean,
  firstChapterTitle?: string,
  config?: ReaderConfig,
): string {
  const firstBody = getChapterBody(content, firstChapterId, firstChapterTitle)
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
${firstBody}
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
