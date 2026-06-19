/**
 * Runtime registration of the Catechism of the Catholic Church and its
 * Compendium as *external* books — present in the catalog and read with the
 * standard book reader, but scraped live from vatican.va rather than stored in
 * Hearth. Mirrors the Escrivá integration (see escrivaCatalog.ts):
 *
 *  - `registerCccCatalog()` (sync, no network) seeds the catalog entries and
 *    installs the manifest resolver so a book builds on demand. The TOC is
 *    static, so both books appear (with full table of contents) instantly and
 *    offline; only chapter bodies need the network on first open.
 *  - `warmCccBooks()` remembers the assembled manifests so synchronous readers
 *    (cross-reference navigation) see them.
 *  - `loadCccChapterHtml()` is the on-demand chapter loader used by the reader's
 *    external-ref branch (cache-or-fetch), dispatching CCC vs Compendium.
 */

import { getCccChapterHtml, putCccChapterHtml } from '@/db/repositories/cccContent'
import { fetchCccChapterHtml } from '@/sources/ccc/fetchChapterHtml'
import {
  buildCccAnchors,
  cccHomepage,
  cccLeaves,
  cccToc,
  ptUrlForChapter,
} from '@/sources/ccc/structure'
import {
  buildAnchorIndex as buildCompendiumAnchors,
  chapterOrder as compendiumChapterOrder,
  sourceHomepage as compendiumHomepage,
  sourceUrl as compendiumSourceUrl,
} from '@/sources/ccc-compendium/chapters'
import { fetchPage as fetchCompendiumPage } from '@/sources/ccc-compendium/fetchPage'
import { parseChapter as parseCompendiumChapter } from '@/sources/ccc-compendium/parse'
import type { ChapterId as CompendiumChapterId, Lang } from '@/sources/ccc-compendium/types'
import { registerLocalEntries, rememberManifestBody, setManifestBodyResolver } from './contentIndex'
import type { BookEntry, CatalogEntry, TocNode } from './manifestTypes'
import type { LocalizedText } from './types'

export const cccBookProducerId = 'producer/ccc-book'
const cccBookHashPrefix = 'ccc:book:'

const t = (en: string, pt: string): LocalizedText => ({ 'en-US': en, 'pt-BR': pt })

const vaticanAuthor = t('Catholic Church', 'Igreja Católica')

const cccName = t('Catechism of the Catholic Church', 'Catecismo da Igreja Católica')
const cccDescription = t(
  'The full Catechism — the Church’s teaching in four pillars: the Creed, the Sacraments, the moral life, and prayer. Read live from vatican.va.',
  'O Catecismo completo — o ensinamento da Igreja em quatro pilares: o Credo, os Sacramentos, a vida moral e a oração. Lido ao vivo de vatican.va.',
)

const compendiumName = t('Compendium of the Catechism', 'Compêndio do Catecismo')
const compendiumDescription = t(
  'The Catechism in 598 questions and answers — a concise synthesis of the faith. Read live from vatican.va.',
  'O Catecismo em 598 perguntas e respostas — uma síntese concisa da fé. Lido ao vivo de vatican.va.',
)

// Compendium chapter titles (chapterOrder lives in ccc-compendium/chapters).
const compendiumTitles: Record<CompendiumChapterId, LocalizedText> = {
  'motu-proprio': t('Motu Proprio', 'Motu Proprio'),
  introduction: t('Introduction', 'Introdução'),
  'part-1': t('Part One: The Profession of Faith', 'Primeira Parte: A Profissão da Fé'),
  'part-2': t(
    'Part Two: The Celebration of the Christian Mystery',
    'Segunda Parte: A Celebração do Mistério Cristão',
  ),
  'part-3': t('Part Three: Life in Christ', 'Terceira Parte: A Vida em Cristo'),
  'part-4': t('Part Four: Christian Prayer', 'Quarta Parte: A Oração Cristã'),
  'appendix-a': t('Appendix: Common Prayers', 'Apêndice: Orações Comuns'),
  'appendix-b': t(
    'Appendix: Formulas of Catholic Doctrine',
    'Apêndice: Fórmulas da Doutrina Católica',
  ),
}

function narrowLang(lang: string): Lang {
  return lang === 'pt-BR' ? 'pt-BR' : 'en-US'
}

function buildCccBookEntry(): BookEntry {
  const chapters: BookEntry['chapters'] = {}
  for (const leaf of cccLeaves) {
    chapters[leaf.id] = {
      'en-US': { type: 'external', url: cccHomepage },
      'pt-BR': { type: 'external', url: ptUrlForChapter(leaf.id) ?? cccHomepage },
    }
  }
  return {
    id: 'ccc',
    name: cccName,
    author: vaticanAuthor,
    description: cccDescription,
    composed: 1992,
    languages: ['en-US', 'pt-BR'],
    toc: cccToc,
    chapters,
    source: { type: 'external', producer: cccBookProducerId, homepage: cccHomepage },
    anchors: buildCccAnchors(),
  }
}

function buildCompendiumBookEntry(): BookEntry {
  const toc: TocNode[] = compendiumChapterOrder.map((id) => ({ id, title: compendiumTitles[id] }))
  const chapters: BookEntry['chapters'] = {}
  for (const id of compendiumChapterOrder) {
    chapters[id] = {
      'en-US': { type: 'external', url: compendiumSourceUrl('en-US') },
      'pt-BR': { type: 'external', url: compendiumSourceUrl('pt-BR') },
    }
  }
  return {
    id: 'compendium',
    name: compendiumName,
    author: vaticanAuthor,
    description: compendiumDescription,
    composed: 2005,
    languages: ['en-US', 'pt-BR'],
    toc,
    chapters,
    source: { type: 'external', producer: cccBookProducerId, homepage: compendiumHomepage },
    anchors: buildCompendiumAnchors(),
  }
}

// Manifests are static (TOC + anchors over §1–2865 / Q1–598), so build each once
// and share between the boot warm-up and the on-demand resolver.
const builtEntries = new Map<string, BookEntry>()

function buildBookEntry(bookId: string): BookEntry | undefined {
  const cached = builtEntries.get(bookId)
  if (cached) return cached
  const entry =
    bookId === 'ccc'
      ? buildCccBookEntry()
      : bookId === 'compendium'
        ? buildCompendiumBookEntry()
        : undefined
  if (entry) builtEntries.set(bookId, entry)
  return entry
}

function entry(bookId: string, name: LocalizedText, description: LocalizedText): CatalogEntry {
  return {
    kind: 'book',
    hash: `${cccBookHashPrefix}${bookId}`,
    size: 0,
    langs: ['en-US', 'pt-BR'],
    name,
    author: vaticanAuthor,
    description,
  }
}

/** Seed catalog entries (sync) + install the on-demand manifest resolver. */
export function registerCccCatalog(): void {
  registerLocalEntries({
    'book/ccc': entry('ccc', cccName, cccDescription),
    'book/compendium': entry('compendium', compendiumName, compendiumDescription),
  })
  setManifestBodyResolver(async (hash) => {
    if (!hash.startsWith(cccBookHashPrefix)) return undefined
    return buildBookEntry(hash.slice(cccBookHashPrefix.length))
  })
}

/** Remember the assembled manifests so synchronous readers see them (anchors). */
export async function warmCccBooks(): Promise<void> {
  for (const bookId of ['ccc', 'compendium']) {
    const built = buildBookEntry(bookId)
    if (built) rememberManifestBody(`${cccBookHashPrefix}${bookId}`, built)
  }
}

// Minimal styling for the scraped paragraph-number markers. External books carry
// no Hearth stylesheet, so the reader renders these with WebView defaults.
const cccStyles =
  '<style>.ccc-n{font-weight:700;opacity:.55;margin-right:.4em;font-size:.85em}' +
  ' .ccc-refs{opacity:.7;font-size:.9em}</style>\n'

/** Cache-or-fetch a chapter's body HTML for the reader's external-ref branch. */
export async function loadCccChapterHtml(
  bookId: string,
  chapterId: string,
  lang: string,
  _url: string,
): Promise<string> {
  const cached = await getCccChapterHtml(bookId, chapterId, lang)
  if (cached !== undefined) return cached

  let body: string
  if (bookId === 'compendium') {
    const l = narrowLang(lang)
    body = parseCompendiumChapter(
      await fetchCompendiumPage(l),
      chapterId as CompendiumChapterId,
      l,
    ).html
  } else {
    body = await fetchCccChapterHtml(chapterId, lang)
  }
  const html = cccStyles + body
  await putCccChapterHtml(bookId, chapterId, lang, html)
  return html
}
