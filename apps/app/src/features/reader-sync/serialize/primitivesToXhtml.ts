// Primitive[] → XHTML body. Mirrors PrimitiveBlock's switch, but emits static
// XHTML for an EPUB instead of React. Two deliberate departures from the live
// renderer, both because paper/e-ink has no interaction:
//   - `interaction` primitives are dropped (they capture app state).
//   - `select`/`options`/`choice-rich-text` collapse to the selected/default
//     branch only — the reader can't switch tabs.
// Everything renders the user's primary language; secondary facing text is
// dropped (single-column e-ink).

import type { BilingualText } from '@ember/content-engine'
import type { Primitive, ProseBlock, ProseInline, VersesPrimitive } from '@/content/primitives'
import { inlineToXhtml, markdownToXhtml, prayerToXhtml, richTextToXhtml, xmlEscape } from './inline'

// Records corpus images for embedding and returns the EPUB-relative href.
// Non-corpus URIs (data:, http) pass through unchanged.
export type ImageSink = (src: string) => string

function block(text: BilingualText, render: (s: string) => string): string {
  if (!text.primary) return ''
  return render(text.primary)
}

export function primitivesToXhtml(primitives: Primitive[], imageSink: ImageSink): string {
  return primitives.map((p) => primitiveToXhtml(p, imageSink)).join('\n')
}

function primitiveToXhtml(p: Primitive, img: ImageSink): string {
  switch (p.type) {
    case 'text': {
      const voiceClass = p.voice ? ` voice-${p.voice}` : ''
      const styleClass = p.style === 'italic' ? ' italic' : ''
      if (!p.text.primary) return ''
      const body = p.text.primary
        .split('\n')
        .map((l) => inlineToXhtml(l))
        .join('<br/>')
      return `<p class="text${voiceClass}${styleClass}">${body}</p>`
    }

    case 'heading': {
      const tag = p.size === 'h1' ? 'h1' : 'h2'
      return block(p.text, (s) => `<${tag}>${inlineToXhtml(s)}</${tag}>`)
    }

    case 'rubric':
      return block(p.text, (s) => `<p class="rubric">${inlineToXhtml(s)}</p>`)

    case 'link':
      return block(p.text, (s) => `<p><a href="${xmlEscape(p.href)}">${inlineToXhtml(s)}</a></p>`)

    case 'divider':
      return '<hr/>'

    case 'verses':
      return versesToXhtml(p)

    case 'image':
      return figure(img(p.src), p.caption, p.attribution)

    case 'gallery':
      // Carousel/row are screen interactions; on paper everything stacks.
      return p.items
        .map((it) => figure(img(it.src), it.caption ?? it.title, it.attribution))
        .join('\n')

    case 'holy-card': {
      const fig = figure(img(p.image), p.title, p.attribution)
      const prayer = p.prayer?.primary ? prayerToXhtml(p.prayer.primary) : ''
      return `${fig}\n${prayer}`
    }

    case 'prose':
      if (p.blocks) return proseBlocksToXhtml(p.blocks)
      if (p.text?.primary) return markdownToXhtml(p.text.primary)
      return ''

    case 'callout':
      return calloutToXhtml(p)

    case 'container':
      return containerToXhtml(p, img)

    case 'interaction':
      // Stateful app UI (offerings, resolutions, movements) — nothing to print.
      return ''
  }
}

function versesToXhtml(p: VersesPrimitive): string {
  const header = p.header?.primary
    ? `<p class="verses-header">${inlineToXhtml(p.header.primary)}</p>`
    : ''
  const items = p.items
    .map((it) => {
      if (!it.text.primary) return ''
      const roleClass = it.role ? ` ${it.role}` : ''
      const num =
        it.num !== undefined ? `<span class="num">${xmlEscape(String(it.num))}</span> ` : ''
      return `<p class="verse${roleClass}">${num}${inlineToXhtml(it.text.primary)}</p>`
    })
    .join('')
  return `${header}<div class="verses">${items}</div>`
}

function figure(src: string, caption?: BilingualText, attribution?: BilingualText): string {
  if (!src) return ''
  const cap = caption?.primary ? `<figcaption>${inlineToXhtml(caption.primary)}</figcaption>` : ''
  const attr = attribution?.primary
    ? `<figcaption class="attribution">${inlineToXhtml(attribution.primary)}</figcaption>`
    : ''
  return `<figure><img src="${xmlEscape(src)}" alt=""/>${cap}${attr}</figure>`
}

function calloutToXhtml(p: Extract<Primitive, { type: 'callout' }>): string {
  const title = p.title?.primary
    ? `<p class="callout-title">${inlineToXhtml(p.title.primary)}</p>`
    : ''
  const body = p.body?.primary ? `<p>${inlineToXhtml(p.body.primary)}</p>` : ''
  const rank = p.rank?.primary ? `<p class="callout-meta">${inlineToXhtml(p.rank.primary)}</p>` : ''
  if (!title && !body && !rank) return ''
  return `<aside class="callout ${p.variant}">${title}${rank}${body}</aside>`
}

function containerToXhtml(p: Extract<Primitive, { type: 'container' }>, img: ImageSink): string {
  const { behavior } = p
  const children = p.children ?? []
  const renderChildren = () => primitivesToXhtml(children, img)

  switch (behavior.kind) {
    case 'group':
    case 'color-scope':
      return renderChildren()

    case 'collapsible': {
      const title = behavior.title.primary
        ? `<h3>${inlineToXhtml(behavior.title.primary)}</h3>`
        : ''
      return `${title}${renderChildren()}`
    }

    case 'prayer': {
      const title = behavior.title.primary
        ? `<h3>${inlineToXhtml(behavior.title.primary)}</h3>`
        : ''
      const text = behavior.text.primary ? prayerToXhtml(behavior.text.primary) : ''
      return `${title}${text}${renderChildren()}`
    }

    case 'liturgical-prayer': {
      if (!behavior.text.primary) return ''
      return `<div class="voice-${behavior.speaker}">${prayerToXhtml(behavior.text.primary)}</div>`
    }

    case 'options': {
      // No selection on paper — render the first (default) branch.
      const chosen = behavior.options[0]
      return chosen ? primitivesToXhtml(chosen.children, img) : ''
    }

    case 'select': {
      const chosen =
        behavior.options.find((o) => o.id === behavior.selectedId) ?? behavior.options[0]
      return chosen ? primitivesToXhtml(chosen.children, img) : ''
    }

    case 'choice-rich-text': {
      const chosen =
        behavior.options.find((o) => o.id === behavior.selectedId) ?? behavior.options[0]
      if (!chosen) return ''
      const intro = chosen.introduction?.primary
        ? `<p>${inlineToXhtml(chosen.introduction.primary)}</p>`
        : ''
      const body = richTextToXhtml(chosen.body.primary)
      const concl = chosen.conclusion?.primary
        ? `<p>${inlineToXhtml(chosen.conclusion.primary)}</p>`
        : ''
      return `${intro}${body}${concl}`
    }
  }
}

function proseInlineToXhtml(inline: ProseInline): string {
  switch (inline.kind) {
    case 'bold':
      return `<strong>${xmlEscape(inline.text)}</strong>`
    case 'italic':
      return `<em>${xmlEscape(inline.text)}</em>`
    case 'ref':
      return `<span class="reference">${xmlEscape(inline.text)}</span>`
    case 'break':
      return '<br/>'
    case 'text':
      return xmlEscape(inline.text)
  }
}

function proseBlocksToXhtml(blocks: ProseBlock[]): string {
  return blocks
    .map((b) => {
      switch (b.kind) {
        case 'paragraph':
          return `<p>${b.inline.map(proseInlineToXhtml).join('')}</p>`
        case 'question':
          return `<p class="question"><strong>${xmlEscape(b.number)}.</strong> ${xmlEscape(b.text)}</p>`
        case 'heading': {
          const tag = b.level === 'part' ? 'h1' : b.level === 'section' ? 'h2' : 'h3'
          return `<${tag}>${xmlEscape(b.text)}</${tag}>`
        }
        case 'subheading':
          return `<h4>${xmlEscape(b.text)}</h4>`
        case 'paragraph-number':
          return `<p class="paragraph-number">${xmlEscape(b.text)}</p>`
        case 'blockquote':
          return `<blockquote>${proseBlocksToXhtml(b.children)}</blockquote>`
        default:
          return ''
      }
    })
    .join('\n')
}
