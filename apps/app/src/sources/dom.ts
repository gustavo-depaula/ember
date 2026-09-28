// Generic htmlparser2 tree predicates shared by the HTML-scraping sources;
// each source owns its own parse logic.

import type { ChildNode, Element } from 'domhandler'

export const isTag = (n: ChildNode): n is Element => n.type === 'tag'

export function hasClass(el: Element, cls: string): boolean {
  const c = el.attribs.class
  return c ? c.split(/\s+/).includes(cls) : false
}

// Depth-first search for the first element (self included) matching `pred`.
export function findElement(node: ChildNode, pred: (el: Element) => boolean): Element | undefined {
  if (!isTag(node)) return undefined
  if (pred(node)) return node
  for (const c of node.children) {
    const found = findElement(c, pred)
    if (found) return found
  }
  return undefined
}

export function findElementInList(
  nodes: ChildNode[],
  pred: (el: Element) => boolean,
): Element | undefined {
  for (const n of nodes) {
    const found = findElement(n, pred)
    if (found) return found
  }
  return undefined
}
