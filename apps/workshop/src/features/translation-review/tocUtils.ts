import { loc } from '@/lib/localize'
import type { TocNode } from '@/types/content'

export type FlatTocNode = { id: string; title: string; depth: number; isLeaf: boolean }

export function flattenToc(nodes: TocNode[], depth = 0, out: FlatTocNode[] = []): FlatTocNode[] {
  for (const node of nodes) {
    const isLeaf = !node.children || node.children.length === 0
    out.push({ id: node.id, title: loc(node.title) || node.id, depth, isLeaf })
    if (node.children) flattenToc(node.children, depth + 1, out)
  }
  return out
}

export function leafChapterIds(toc: TocNode[]): string[] {
  return flattenToc(toc)
    .filter((n) => n.isLeaf)
    .map((n) => n.id)
}

export function chapterTitleMap(toc: TocNode[]): Map<string, string> {
  const m = new Map<string, string>()
  for (const node of flattenToc(toc)) m.set(node.id, node.title)
  return m
}
