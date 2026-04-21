export type ProseNode =
  | { type: 'paragraph'; children: InlineNode[] }
  | { type: 'heading'; level: number; text: string }
  | { type: 'blockquote'; children: InlineNode[] }
  | { type: 'list'; ordered: boolean; items: InlineNode[][] }

export type InlineNode =
  | { type: 'text'; text: string }
  | { type: 'bold'; text: string }
  | { type: 'italic'; text: string }
  | { type: 'bolditalic'; text: string }

export function parseInline(text: string): InlineNode[] {
  const nodes: InlineNode[] = []

  // Handle ***boldpart** ...rest...* (bold closes before italic)
  // Common in Liguori meditations: ***Sumário.** paragraph body.*
  // Trailing punctuation after closing * is allowed (e.g. *. or *,)
  const nestedRe = /^\*\*\*(.+?)\*\*(.+)\*([\p{P}]?)$/u
  const nestedMatch = nestedRe.exec(text)
  if (nestedMatch) {
    nodes.push({ type: 'bolditalic', text: nestedMatch[1] })
    // Inner *...* pairs are italic-within-italic — strip the markers since already in italic context
    const italicBody = nestedMatch[2].replace(/\*([^*]+)\*/g, '$1') + nestedMatch[3]
    nodes.push({ type: 'italic', text: italicBody })
    return nodes
  }

  const regex = /\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*/g
  let lastIndex = 0
  let match = regex.exec(text)

  while (match !== null) {
    if (match.index > lastIndex) {
      nodes.push({ type: 'text', text: text.slice(lastIndex, match.index) })
    }
    if (match[1]) nodes.push({ type: 'bolditalic', text: match[1] })
    else if (match[2]) nodes.push({ type: 'bold', text: match[2] })
    else if (match[3]) nodes.push({ type: 'italic', text: match[3] })
    lastIndex = regex.lastIndex
    match = regex.exec(text)
  }

  if (lastIndex < text.length) {
    nodes.push({ type: 'text', text: text.slice(lastIndex) })
  }

  return nodes.length > 0 ? nodes : [{ type: 'text', text }]
}

const footnoteDefRe = /^\[\^\d+\]:/

function stripFootnoteRefs(text: string): string {
  return text.replace(/\s*\[\^\d+\]/g, '')
}

export function parseMarkdown(markdown: string): ProseNode[] {
  const lines = markdown.split('\n')
  const nodes: ProseNode[] = []
  let paragraph: string[] = []
  let blockquoteLines: string[] = []
  let listItems: InlineNode[][] = []
  let listOrdered = false

  function flushParagraph() {
    if (paragraph.length > 0) {
      const text = stripFootnoteRefs(paragraph.join(' ').trim())
      if (text) nodes.push({ type: 'paragraph', children: parseInline(text) })
      paragraph = []
    }
  }

  function flushBlockquote() {
    if (blockquoteLines.length > 0) {
      const text = stripFootnoteRefs(blockquoteLines.join('\n').trim())
      if (text) nodes.push({ type: 'blockquote', children: parseInline(text) })
      blockquoteLines = []
    }
  }

  function flushList() {
    if (listItems.length > 0) {
      nodes.push({ type: 'list', ordered: listOrdered, items: listItems })
      listItems = []
      listOrdered = false
    }
  }

  for (const line of lines) {
    const trimmed = line.trim()

    if (footnoteDefRe.test(trimmed)) continue

    if (trimmed === '') {
      // Empty line inside a blockquote run → paragraph break within the quote
      if (blockquoteLines.length > 0) {
        blockquoteLines.push('')
        continue
      }
      flushParagraph()
      flushList()
      continue
    }

    // Blockquote line: "> text" or bare ">" continuation
    if (trimmed.startsWith('> ') || trimmed === '>') {
      flushParagraph()
      flushList()
      blockquoteLines.push(trimmed === '>' ? '' : trimmed.slice(2))
      continue
    }

    // Non-blockquote line ends any blockquote run
    flushBlockquote()

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/)
    if (headingMatch) {
      flushParagraph()
      flushList()
      nodes.push({ type: 'heading', level: headingMatch[1].length, text: headingMatch[2] })
      continue
    }

    const unorderedMatch = trimmed.match(/^[-*+]\s+(.+)$/)
    if (unorderedMatch) {
      flushParagraph()
      if (listItems.length > 0 && listOrdered) flushList()
      listOrdered = false
      listItems.push(parseInline(stripFootnoteRefs(unorderedMatch[1])))
      continue
    }

    const orderedMatch = trimmed.match(/^\d+\.[°ª]?\s+(?![-—–])(.+)$/)
    if (orderedMatch) {
      flushParagraph()
      if (listItems.length > 0 && !listOrdered) flushList()
      listOrdered = true
      listItems.push(parseInline(stripFootnoteRefs(orderedMatch[1])))
      continue
    }

    flushList()
    paragraph.push(trimmed)
  }

  flushParagraph()
  flushBlockquote()
  flushList()
  return nodes
}
