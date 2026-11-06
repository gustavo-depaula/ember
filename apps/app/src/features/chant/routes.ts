import { bareId } from '@/content/contentIndex'

// The chant library's screens, by the catalog ids they open.

export function chantHref(chant: string) {
  return { pathname: '/browse/chant/[chantId]', params: { chantId: bareId(chant) } } as const
}

export function chantBookHref(book: string) {
  return { pathname: '/browse/chant/book/[bookId]', params: { bookId: bareId(book) } } as const
}

export function chantPageHref(book: string, section: string) {
  return {
    pathname: '/browse/chant/book/[bookId]/[sectionId]',
    params: { bookId: bareId(book), sectionId: section },
  } as const
}

export function chantListHref(params: Record<string, string>) {
  return { pathname: '/browse/chant/list', params } as const
}
