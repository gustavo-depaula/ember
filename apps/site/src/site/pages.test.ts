import { expect, test } from 'vitest'
import { listPages } from './pages'

test('every page has one path, and its alternates are pages', async () => {
  const pages = await listPages()
  const paths = new Set(pages.map((p) => p.path))
  expect(paths.size).toBe(pages.length)
  for (const page of pages) {
    expect(page.path.startsWith('/') && page.path.endsWith('/')).toBe(true)
    for (const alternate of Object.values(page.alternates)) expect(paths.has(alternate)).toBe(true)
    if (page.canonical) expect(paths.has(page.canonical)).toBe(true)
  }
}, 120_000)

test('content in one language is credited to that language', async () => {
  const pages = await listPages()
  const at = (path: string) => pages.find((p) => p.path === path)
  // In both languages: each page stands on its own and names the other.
  expect(at('/pt/oracoes/rosary/')).toMatchObject({
    canonical: undefined,
    alternates: { 'en-US': '/prayers/rosary/', 'pt-BR': '/pt/oracoes/rosary/' },
  })
  // English only: the Portuguese page exists for navigation and defers to the English one.
  expect(at('/pt/livros/catholic-encyclopedia/')).toMatchObject({
    canonical: '/books/catholic-encyclopedia/',
  })
  // Scripture is the Douay-Rheims: no Portuguese chapter pages at all.
  expect(at('/bible/john/20/')).toBeDefined()
  expect(pages.some((p) => p.path.startsWith('/pt/biblia/john'))).toBe(false)
}, 120_000)
