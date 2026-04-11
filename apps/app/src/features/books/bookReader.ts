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
body { background-color: #0E0D0C !important; color: #EDE4D8 !important; }
h1, h2, h3, h4 { color: #C75B6B !important; }
blockquote { border-left-color: #5C4D2A !important; color: #918880 !important; }
a { color: #7A9EC8 !important; }
hr { border-top-color: #5C4D2A !important; }
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
  padding: 1em 1.5em;
  box-sizing: border-box;
}
#ember-content img {
  max-height: 80vh;
  break-inside: avoid;
}
p, blockquote, ol, ul, h1, h2, h3, h4 {
  break-inside: avoid;
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
    if (n < 0) { send({ type: 'boundary', direction: 'prev' }); return; }
    if (n >= totalPages) { send({ type: 'boundary', direction: 'next' }); return; }
    currentPage = n;
    el.style.transform = 'translateX(' + (-n * pageWidth) + 'px)';
    send({ type: 'pageInfo', currentPage: currentPage, totalPages: totalPages });
  }

  function loadChapter(html, startPage) {
    el.innerHTML = html;
    requestAnimationFrame(function() {
      measure();
      var page = startPage < 0 ? totalPages - 1 : startPage;
      goToPage(page);
    });
  }

  document.addEventListener('click', function(e) {
    if (e.target.tagName === 'A') return;
    var x = e.clientX / window.innerWidth;
    if (x < 0.3) {
      goToPage(currentPage - 1);
    } else if (x > 0.7) {
      goToPage(currentPage + 1);
    }
  });

  window.addEventListener('message', function(e) {
    try {
      var msg = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      if (msg.type === 'goToPage') goToPage(msg.page < 0 ? totalPages - 1 : msg.page);
      if (msg.type === 'loadChapter') loadChapter(msg.html, msg.startPage);
    } catch(err) {}
  });

  // Initial measure
  requestAnimationFrame(function() {
    measure();
    goToPage(0);
    send({ type: 'ready' });
  });

  window.addEventListener('resize', function() {
    measure();
    goToPage(currentPage);
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

/** Build the reader shell HTML — loaded once, chapters swapped via messages */
export function buildReaderShell(
  content: BookContent,
  firstChapterId: string,
  isDark: boolean,
): string {
  const firstBody = getChapterBody(content, firstChapterId)
  const darkStyle = isDark ? `<style>${darkModeOverrides}</style>` : ''

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no"/>
<style>${content.css}</style>
<style>${paginationCss}</style>
${darkStyle}
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
export function getChapterBody(content: BookContent, chapterId: string): string {
  const html = content.chapters.get(chapterId)
  if (!html) return ''

  let body = extractBody(html)
  for (const [path, dataUri] of content.images) {
    if (body.includes(path)) body = body.replaceAll(path, dataUri)
  }
  return body
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
