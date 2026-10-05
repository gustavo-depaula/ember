import { listPages, type PageEntry } from '~/site/pages'

/** A sitemap may hold 50,000 URLs; these stay well under, grouped so each file is one kind of page. */
const groups: Record<string, (entry: PageEntry) => boolean> = {
  pages: (e) =>
    !['chapter', 'bibleChapter', 'calendarDay', 'mass', 'latinMass', 'office', 'church'].includes(
      e.page.view,
    ),
  bible: (e) => e.page.view === 'bibleChapter',
  liturgy: (e) => ['calendarDay', 'mass', 'latinMass', 'office'].includes(e.page.view),
  churches: (e) => e.page.view === 'church',
}

// Client-rendered shells: nothing for a crawler to read.
const unlisted = new Set(['search', 'churchShell'])

const chapterChunk = 20_000

export type SitemapFile = { name: string; entries: PageEntry[] }

export async function sitemapFiles(): Promise<SitemapFile[]> {
  // A page that only mirrors another locale's content is left to that locale.
  const indexable = (await listPages()).filter((e) => !e.canonical && !unlisted.has(e.page.view))
  const files: SitemapFile[] = Object.entries(groups)
    .map(([name, belongs]) => ({ name, entries: indexable.filter(belongs) }))
    .filter((file) => file.entries.length)
  const chapters = indexable.filter((e) => e.page.view === 'chapter')
  for (let i = 0; i < chapters.length; i += chapterChunk) {
    files.push({
      name: `books-${i / chapterChunk + 1}`,
      entries: chapters.slice(i, i + chapterChunk),
    })
  }
  return files
}
