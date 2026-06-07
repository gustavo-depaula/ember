/**
 * Plain-text character offsets into the chapter body. Survives every CSS
 * change (font, size, line height, palette) because we count characters in
 * the live text-node tree, not DOM positions or screen pixels.
 *
 * The only thing that invalidates an anchor is the chapter HTML itself
 * changing (e.g. a typo fix lands in a future content update) — bookmarks
 * share this fragility and it has not been a problem in practice.
 */
export type HighlightAnchor = {
  startOffset: number
  endOffset: number
}

/**
 * Walk all text nodes of `root` in document order, applying `visit` to each.
 * Returns whatever `visit` returns the first time it produces a non-undefined
 * value (lets callers short-circuit). Encapsulates the recursion so the
 * encode/decode pair stay symmetric.
 */
function walkText<T>(root: Node, visit: (node: Text) => T | undefined): T | undefined {
  let n: Node | null = root.firstChild
  while (n) {
    if (n.nodeType === 3) {
      const out = visit(n as Text)
      if (out !== undefined) return out
    } else if (n.firstChild) {
      const out = walkText(n, visit)
      if (out !== undefined) return out
    }
    n = n.nextSibling
  }
  return undefined
}

/** Plain-text offset of a (node, offsetInNode) pair within a root element. */
function offsetOf(root: Node, target: Node, targetOffset: number): number {
  let acc = 0
  let found: number | undefined
  walkText(root, (text) => {
    if (text === target) {
      found = acc + targetOffset
      return found
    }
    acc += text.nodeValue?.length ?? 0
    return undefined
  })
  // If `target` isn't a text node (e.g. selection is at an element boundary
  // because the user clicked into a padding gap), fall back to the cumulative
  // text length up to that element's position. Slightly imprecise but never
  // throws.
  if (found !== undefined) return found
  return Math.min(acc, targetOffset)
}

/**
 * Resolve a plain-text offset within `root` to the text node + local offset
 * that contains it. Returns undefined if the offset is past the end.
 */
function locate(root: Node, offset: number): { node: Text; local: number } | undefined {
  let remaining = offset
  let hit: { node: Text; local: number } | undefined
  walkText(root, (text) => {
    const len = text.nodeValue?.length ?? 0
    if (remaining <= len) {
      hit = { node: text, local: remaining }
      return hit
    }
    remaining -= len
    return undefined
  })
  return hit
}

/**
 * Encode a live DOM Range as a plain-text anchor. The Range must be inside
 * `root` (typically `doc.body`).
 */
export function encodeRange(root: Node, range: Range): HighlightAnchor {
  const startOffset = offsetOf(root, range.startContainer, range.startOffset)
  const endOffset = offsetOf(root, range.endContainer, range.endOffset)
  if (endOffset < startOffset) return { startOffset: endOffset, endOffset: startOffset }
  return { startOffset, endOffset }
}

/**
 * Resolve a stored anchor back into a live Range. Returns undefined if the
 * underlying text has shrunk past the anchor's offsets (rare; chapter HTML
 * changed).
 */
export function resolveAnchor(
  doc: { createRange: () => Range; body: Node },
  anchor: HighlightAnchor,
): Range | undefined {
  const start = locate(doc.body, anchor.startOffset)
  const end = locate(doc.body, anchor.endOffset)
  if (!start || !end) return undefined
  const range = doc.createRange()
  range.setStart(start.node, start.local)
  range.setEnd(end.node, end.local)
  return range
}
