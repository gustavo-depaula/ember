import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import * as api from '@/fs/contentFs'
import { iconMap } from '@/lib/icons'
import { loc } from '@/lib/localize'
import type {
  BookManifest,
  ChapterManifest,
  CollectionBlock,
  CollectionManifest,
  CollectionSection,
  CorpusKind,
  PracticeManifest,
  PrayerAsset,
} from '@/types/content'

export const kindIcon: Record<CorpusKind, string> = {
  practice: '📿',
  prayer: '🙏',
  book: '📖',
  chapter: '📄',
  collection: '🗂️',
}

export const kindLabel: Record<CorpusKind, string> = {
  practice: 'Practices',
  prayer: 'Prayers',
  book: 'Books',
  chapter: 'Chapters',
  collection: 'Collections',
}

// Item kinds that can be referenced from a collection.
export const collectableKinds: CorpusKind[] = ['practice', 'prayer', 'book', 'chapter']

/** Walk a collection's section tree and return every leaf item ref in document order. */
export function collectionRefs(collection: CollectionManifest): string[] {
  const out: string[] = []
  function walk(blocks: CollectionBlock[] | undefined): void {
    if (!blocks) return
    for (const b of blocks) {
      if (b.kind === 'item') out.push(b.ref)
      else if (b.kind === 'section') walk(b.blocks)
    }
  }
  for (const s of collection.sections ?? []) walk(s.blocks)
  return out
}

/** Walk a collection and yield all sections (top-level + nested), depth-first. */
export function walkSections(
  sections: CollectionSection[] | undefined,
  depth = 0,
): { section: CollectionSection; depth: number }[] {
  const out: { section: CollectionSection; depth: number }[] = []
  for (const s of sections ?? []) {
    out.push({ section: s, depth })
    for (const b of s.blocks) {
      if (b.kind === 'section') out.push(...walkSections([b], depth + 1))
    }
  }
  return out
}

export type CorpusItem = {
  ref: string
  kind: CorpusKind
  id: string
  label: string
  icon: string
}

export type LoadedCorpus = {
  practices: PracticeManifest[]
  prayers: PrayerAsset[]
  books: BookManifest[]
  chapters: ChapterManifest[]
  collections: CollectionManifest[]
}

export function parseRef(ref: string): { kind: CorpusKind; id: string } | undefined {
  const slash = ref.indexOf('/')
  if (slash < 0) return undefined
  const kind = ref.slice(0, slash) as CorpusKind
  const id = ref.slice(slash + 1)
  return { kind, id }
}

export function useCorpus(): { data: LoadedCorpus; isLoading: boolean } {
  const practices = useQuery({ queryKey: ['practices'], queryFn: api.listPractices })
  const prayers = useQuery({ queryKey: ['prayers'], queryFn: api.listPrayers })
  const books = useQuery({ queryKey: ['books'], queryFn: api.listBooks })
  const chapters = useQuery({ queryKey: ['chapters'], queryFn: api.listChapters })
  const collections = useQuery({ queryKey: ['collections'], queryFn: api.listCollections })

  return {
    data: {
      practices: practices.data ?? [],
      prayers: prayers.data ?? [],
      books: books.data ?? [],
      chapters: chapters.data ?? [],
      collections: collections.data ?? [],
    },
    isLoading:
      practices.isLoading ||
      prayers.isLoading ||
      books.isLoading ||
      chapters.isLoading ||
      collections.isLoading,
  }
}

export function useCorpusRefMap(): Map<string, CorpusItem> {
  const { data } = useCorpus()
  return useMemo(() => buildCorpusRefMap(data), [data])
}

export function buildCorpusRefMap(corpus: LoadedCorpus): Map<string, CorpusItem> {
  const m = new Map<string, CorpusItem>()
  for (const p of corpus.practices) {
    m.set(`practice/${p.id}`, {
      ref: `practice/${p.id}`,
      kind: 'practice',
      id: p.id,
      label: loc(p.name) || p.id,
      icon: p.icon ? (iconMap[p.icon] ?? kindIcon.practice) : kindIcon.practice,
    })
  }
  for (const p of corpus.prayers) {
    if (!p.id) continue
    m.set(`prayer/${p.id}`, {
      ref: `prayer/${p.id}`,
      kind: 'prayer',
      id: p.id,
      label: loc(p.title) || p.id,
      icon: kindIcon.prayer,
    })
  }
  for (const b of corpus.books) {
    m.set(`book/${b.id}`, {
      ref: `book/${b.id}`,
      kind: 'book',
      id: b.id,
      label: loc(b.name) || b.id,
      icon: kindIcon.book,
    })
  }
  for (const c of corpus.chapters) {
    m.set(`chapter/${c.id}`, {
      ref: `chapter/${c.id}`,
      kind: 'chapter',
      id: c.id,
      label: loc(c.title) || c.id,
      icon: kindIcon.chapter,
    })
  }
  return m
}
