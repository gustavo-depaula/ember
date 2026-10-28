/**
 * Search over the catalog's practices, collections, books and chants. The index holds
 * every searchable field localized, normalized and split into words once, so a
 * keystroke only compares words rather than normalizing ~1,000 titles and
 * descriptions.
 */

import { getEntriesByKind, getRememberedManifest } from '@/content/contentIndex'
import type { BookEntry } from '@/content/manifestTypes'
import { getAllManifests, isAlternateForm } from '@/content/resolver'
import { localizeContent } from '@/lib/i18n'
import { normalizeForSearch, searchWords } from '@/lib/search'
import type { IndexEntry, Phrase } from './searchScore'

export {
  type IndexEntry,
  type SearchGroup,
  type SearchHit,
  type SearchKind,
  type SearchResult,
  searchGroups,
  searchIndex,
} from './searchScore'

function words(text: string): string[] {
  return searchWords(normalizeForSearch(text))
}

function titleFields(title: string) {
  const titleWords = words(title)
  return { title: titleWords.join(' '), titleWords }
}

type Localized<T> = Partial<Record<string, T>>

// The app's two languages and Latin: a manifest may also name itself in a
// dozen others, which no reader of this app types.
const searchedLanguages = ['en-US', 'pt-BR', 'la']

/** One phrase per distinct wording, the language being read first. */
function phrases(texts: (string | undefined)[], shown?: string): Phrase[] {
  const seen = new Set(shown === undefined ? [] : [words(shown).join(' ')])
  const out: Phrase[] = []
  for (const text of texts) {
    if (!text) continue
    const phrase = { text, words: words(text) }
    const key = phrase.words.join(' ')
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(phrase)
  }
  return out
}

function otherNames(name: Localized<string> | undefined, shown: string) {
  if (!name) return undefined
  const names = phrases(
    searchedLanguages.map((lang) => name[lang]),
    shown,
  )
  return names.length > 0 ? names : undefined
}

function localizedPhrases(byLanguage: Localized<string[]> | undefined): Phrase[] | undefined {
  if (!byLanguage) return undefined
  // Asked of localizeContent rather than i18n, so the website's per-locale
  // build gets its own answer.
  const reading = localizeContent({ 'en-US': 'en-US', 'pt-BR': 'pt-BR' })
  const order = [reading, ...searchedLanguages.filter((lang) => lang !== reading)]
  return phrases(order.flatMap((lang) => byLanguage[lang] ?? []))
}

function bareId(corpusId: string): string {
  const slash = corpusId.indexOf('/')
  return slash === -1 ? corpusId : corpusId.slice(slash + 1)
}

export function buildSearchIndex(): IndexEntry[] {
  const entries: IndexEntry[] = []

  for (const m of getAllManifests()) {
    if (isAlternateForm(m)) continue
    const title = localizeContent(m.name)
    entries.push({
      result: { kind: 'practice', id: m.id, title },
      ...titleFields(title),
      otherNames: otherNames(m.name, title),
      tags: m.tags?.flatMap(words),
      keywords: localizedPhrases(m.search?.keywords),
      lines: localizedPhrases(m.search?.lines),
      description: m.description ? words(localizeContent(m.description)) : undefined,
    })
  }

  for (const [id, entry] of getEntriesByKind('collection')) {
    const title = entry.name ? localizeContent(entry.name) : bareId(id)
    entries.push({
      result: { kind: 'collection', id: bareId(id), title },
      ...titleFields(title),
      otherNames: otherNames(entry.name, title),
    })
  }

  for (const [id, entry] of getEntriesByKind('book')) {
    const body = getRememberedManifest<BookEntry>(entry.hash)
    const nameSrc = body?.name ?? entry.name
    if (!nameSrc) continue
    const title = localizeContent(nameSrc as Record<string, string>)
    const authorSrc = body?.author ?? entry.author
    const author = authorSrc ? localizeContent(authorSrc as Record<string, string>) : ''
    entries.push({
      result: { kind: 'book', id: bareId(id), title, subtitle: author || undefined },
      ...titleFields(title),
      otherNames: otherNames(nameSrc as Record<string, string>, title),
      author: author ? words(author) : undefined,
    })
  }

  for (const [id, entry] of getEntriesByKind('chant')) {
    if (!entry.name) continue
    const title = localizeContent(entry.name)
    const subtitle = entry.subtitle && localizeContent(entry.subtitle)
    entries.push({
      result: { kind: 'chant', id: bareId(id), title, subtitle },
      // A chant is asked for by either name: "Kyrie IX" or "Cum jubilo".
      ...titleFields(subtitle ? `${title} ${subtitle}` : title),
    })
  }

  return entries
}
