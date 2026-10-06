import type { ChildNode, Element } from 'domhandler'
import { isTag } from '../dom'

export function findAll(nodes: ChildNode[], pred: (el: Element) => boolean): Element[] {
  return nodes.flatMap((n) => {
    if (!isTag(n)) return []
    return pred(n) ? [n] : findAll(n.children, pred)
  })
}

/** Text of an element, a space for each `<br>`, skipping any element `skip` matches. */
export function textOf(el: Element, skip: (el: Element) => boolean = () => false): string {
  return el.children
    .map((c) => {
      if (c.type === 'text') return c.data
      if (!isTag(c) || skip(c)) return ''
      return c.name === 'br' ? ' ' : textOf(c, skip)
    })
    .join('')
}

export const collapseWs = (s: string): string => s.replace(/\s+/g, ' ').trim()
