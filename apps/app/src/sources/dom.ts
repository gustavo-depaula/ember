// Tiny htmlparser2 DOM-walk helpers shared by the HTML-scraping sources
// (vatican-news, ibreviary). Each source still owns its parse logic — these
// are just the generic tree predicates every walker needs.

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
