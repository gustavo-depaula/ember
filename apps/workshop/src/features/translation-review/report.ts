import { loc } from '@/lib/localize'
import type { BookManifest } from '@/types/content'
import { chapterTitleMap, leafChapterIds } from './tocUtils'
import { type Issue, type IssueType, issueTypeLabels } from './types'

const reportOrder: IssueType[] = [
  'completeness',
  'diacritics',
  'references',
  'typos',
  'formatting',
  'other',
  'note',
]

function escapeCell(text: string): string {
  return text.replace(/\|/g, '\\|').replace(/\n+/g, ' ').trim()
}

function filePathFor(libraryId: string, bookId: string, lang: string, chapterId: string): string {
  return `content/libraries/${libraryId}/books/${bookId}/${lang}/${chapterId}.md`
}

export function buildReport(libraryId: string, book: BookManifest, issues: Issue[]): string {
  const order = leafChapterIds(book.toc)
  const titles = chapterTitleMap(book.toc)
  const orderIdx = new Map(order.map((id, idx) => [id, idx]))

  const sorted = [...issues].sort((a, b) => {
    const oa = orderIdx.get(a.chapterId) ?? Number.POSITIVE_INFINITY
    const ob = orderIdx.get(b.chapterId) ?? Number.POSITIVE_INFINITY
    if (oa !== ob) return oa - ob
    return a.createdAt - b.createdAt
  })

  const byType = new Map<IssueType, Issue[]>()
  for (const i of sorted) {
    const arr = byType.get(i.type) ?? []
    arr.push(i)
    byType.set(i.type, arr)
  }

  const bookName = loc(book.name) || book.id
  const langs = book.languages.join(', ')
  const chaptersTouched = new Set(sorted.map((i) => i.chapterId)).size

  const lines: string[] = []
  lines.push(`# Translation Review — ${bookName}`)
  lines.push('')
  lines.push(`- Library: \`${libraryId}\``)
  lines.push(`- Book: \`${book.id}\``)
  lines.push(`- Languages: ${langs}`)
  lines.push(`- Issues: ${sorted.length} across ${chaptersTouched} chapter(s)`)
  lines.push('')

  if (sorted.length === 0) {
    lines.push('_No issues flagged._')
    return lines.join('\n')
  }

  for (const type of reportOrder) {
    const items = byType.get(type)
    if (!items || items.length === 0) continue

    lines.push(`## ${issueTypeLabels[type]} (${items.length})`)
    lines.push('')
    lines.push('| Chapter | File(s) | Languages | Quote | Note |')
    lines.push('|---|---|---|---|---|')

    for (const issue of items) {
      const chapter = titles.get(issue.chapterId) ?? issue.chapterId
      const langsForFiles = issue.languages.length > 0 ? issue.languages : book.languages
      const files = langsForFiles
        .map((lang) => `\`${filePathFor(libraryId, book.id, lang, issue.chapterId)}\``)
        .join('<br>')
      const quote = issue.quote
        ? `"${escapeCell(issue.quote.slice(0, 200))}${issue.quote.length > 200 ? '…' : ''}"`
        : ''
      const note = escapeCell(issue.note)
      const langCell = issue.languages.join(', ')
      lines.push(`| ${escapeCell(chapter)} | ${files} | ${langCell} | ${quote} | ${note} |`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
