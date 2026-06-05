// Container-directive marked extension that recognizes `:::gallery` and
// `:::row` blocks, parses their image-and-caption bodies, and emits a
// `<figure class="ember-gallery">` shape that the reader WebView styles
// via [data-display] CSS. The HTML degrades gracefully (each item is a
// figure with an <img> + <figcaption>), so even if the page's CSS or
// JS shim is missing, the content survives as readable prose.
//
// Both directives produce identical HTML aside from the default display
// mode (`:::row` → row, `:::gallery` → carousel). Attributes after the
// directive name can override (e.g. `:::row{display=stack}`).
import type { MarkedExtension, Token, Tokens } from 'marked'

export type GalleryDisplay = 'carousel' | 'stack' | 'row'

export type GalleryItem = {
  src: string
  alt?: string
  attribution?: string
  captionTokens?: Token[]
}

export type GalleryToken = Tokens.Generic & {
  type: 'gallery'
  raw: string
  display: GalleryDisplay
  caption?: string
  captionTokens?: Token[]
  weights?: number[]
  items: GalleryItem[]
}

// Body group is `(?:[\s\S]*?\n)?` so an empty `:::row\n:::` still tokenizes
// (renders to an HTML comment). Author-friendly; validator catches the empty
// case as a hard error anyway.
const BLOCK_RULE = /^:::(gallery|row)(?:\{([^}]*)\})?[ \t]*\n((?:[\s\S]*?\n)?):::[ \t]*(?:\n|$)/
const START_RULE = /^:::(?:gallery|row)\b/m
const IMAGE_LINE_RULE = /^!\[([^\]]*)\]\(([^\s)]+)(?:[ \t]+"([^"]*)")?\)[ \t]*$/

type ParsedAttrs = {
  display?: GalleryDisplay
  weights?: number[]
  caption?: string
}

export function parseAttrs(input: string | undefined): ParsedAttrs {
  if (!input) return {}
  const out: ParsedAttrs = {}
  // Match key="value with spaces" | key='value' | key=bareword
  const rule = /(\w+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s,]+))/g
  let m = rule.exec(input)
  while (m !== null) {
    const key = m[1]
    const value = m[2] ?? m[3] ?? m[4] ?? ''
    if (key === 'display') {
      if (value === 'carousel' || value === 'stack' || value === 'row') out.display = value
    } else if (key === 'weights') {
      const parts = value
        .split(',')
        .map((s) => Number.parseFloat(s.trim()))
        .filter((n) => Number.isFinite(n) && n > 0)
      if (parts.length > 0) out.weights = parts
    } else if (key === 'caption') {
      out.caption = value
    }
    m = rule.exec(input)
  }
  return out
}

export type ParsedBodyItem = {
  src: string
  alt?: string
  attribution?: string
  captionText?: string
}

// Walk the body line-by-line. Each `![alt](src "attribution")` line starts
// a new item; the lines that follow (until a blank line or the next image)
// become that item's caption. Anything before the first image is ignored,
// as is text after a caption-closing blank line until the next image.
export function parseBody(body: string): ParsedBodyItem[] {
  const items: ParsedBodyItem[] = []
  let current: ParsedBodyItem | undefined
  let captionLines: string[] = []
  let captionOpen = false

  const flush = () => {
    if (current && captionLines.length) {
      const text = captionLines.join('\n').trim()
      if (text) current.captionText = text
    }
    captionLines = []
    captionOpen = false
  }

  for (const line of body.split('\n')) {
    const m = line.match(IMAGE_LINE_RULE)
    if (m) {
      flush()
      current = { src: m[2], alt: m[1] || undefined, attribution: m[3] || undefined }
      items.push(current)
      captionOpen = true
      continue
    }
    if (line.trim() === '') {
      flush()
      continue
    }
    if (current && captionOpen) {
      captionLines.push(line)
    }
  }
  flush()
  return items
}

export function escapeHtml(input: string): string {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export function renderGalleryToken(
  token: GalleryToken,
  parseInline: (tokens: Token[]) => string,
): string {
  if (token.items.length === 0) {
    // Empty directive — leave a comment so downstream HTML cleanup can spot
    // and skip it. Validation should already have flagged this.
    return '<!-- empty gallery -->'
  }
  const count = token.items.length
  const slides = token.items
    .map((item, index) => {
      const weight = token.weights?.[index]
      const weightAttr = weight ? ` data-weight="${weight}"` : ''
      const altAttr = item.alt ? ` alt="${escapeHtml(item.alt)}"` : ' alt=""'
      const titleAttr = item.attribution ? ` title="${escapeHtml(item.attribution)}"` : ''
      const captionHtml = renderItemCaption(item, parseInline)
      return `<div class="ember-gallery-slide"${weightAttr}><img src="${escapeHtml(item.src)}"${altAttr}${titleAttr} />${captionHtml}</div>`
    })
    .join('')
  const sharedCaption = token.captionTokens?.length
    ? `<figcaption class="ember-gallery-caption">${parseInline(token.captionTokens)}</figcaption>`
    : ''
  const trackStyle =
    token.display === 'row' && token.weights && token.weights.length === count
      ? ` style="grid-template-columns:${token.weights.map((w) => `${w}fr`).join(' ')}"`
      : ''
  return `<figure class="ember-gallery" data-display="${token.display}" data-count="${count}"><div class="ember-gallery-track"${trackStyle}>${slides}</div>${sharedCaption}</figure>`
}

function renderItemCaption(item: GalleryItem, parseInline: (tokens: Token[]) => string): string {
  const parts: string[] = []
  if (item.attribution) {
    parts.push(`<em class="ember-gallery-attribution">${escapeHtml(item.attribution)}</em>`)
  }
  if (item.alt) {
    parts.push(`<strong class="ember-gallery-title">${escapeHtml(item.alt)}</strong>`)
  }
  if (item.captionTokens?.length) {
    parts.push(`<span class="ember-gallery-prose">${parseInline(item.captionTokens)}</span>`)
  }
  if (parts.length === 0) return ''
  return `<figcaption>${parts.join('')}</figcaption>`
}

export function galleryExtension(): MarkedExtension {
  return {
    extensions: [
      {
        name: 'gallery',
        level: 'block',
        start(src) {
          const m = src.match(START_RULE)
          return m?.index
        },
        tokenizer(src): GalleryToken | undefined {
          const m = BLOCK_RULE.exec(src)
          if (!m) return undefined
          const [raw, directive, attrString, body] = m
          const attrs = parseAttrs(attrString)
          const display: GalleryDisplay =
            attrs.display ?? (directive === 'row' ? 'row' : 'carousel')
          const bodyItems = parseBody(body)
          const items: GalleryItem[] = bodyItems.map((b) => ({
            src: b.src,
            alt: b.alt,
            attribution: b.attribution,
            captionTokens: b.captionText ? this.lexer.inlineTokens(b.captionText) : undefined,
          }))
          const captionTokens = attrs.caption ? this.lexer.inlineTokens(attrs.caption) : undefined
          return {
            type: 'gallery',
            raw,
            display,
            caption: attrs.caption,
            captionTokens,
            weights: attrs.weights,
            items,
          }
        },
        renderer(token) {
          return renderGalleryToken(token as GalleryToken, (tokens) =>
            this.parser.parseInline(tokens),
          )
        },
      },
    ],
  }
}
