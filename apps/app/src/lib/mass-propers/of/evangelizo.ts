import type { ProperDay } from '../types'

const baseUrl = 'https://feed.evangelizo.org/v2/reader.php'

export async function fetchEvangelizo(date: Date): Promise<string> {
  const dateStr =
    String(date.getFullYear()) +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0')

  const res = await fetch(`${baseUrl}?date=${dateStr}&lang=AM&type=all`)
  if (!res.ok) throw new Error(`Evangelizo API error: ${res.status}`)

  return res.text()
}

// Sections are separated by 3+ consecutive <br /> tags.
// Double <br /> within a section separates strophes (e.g. psalm verses).
const sectionSplitter = /(?:<br\s*\/?>\s*){3,}/i

// The day name is separated from the first reading by only 2 <br /> tags,
// so it ends up merged with the first reading section. We detect the reading
// header by the <font> tag that contains the scripture reference.
const readingHeaderPattern = /^(.*?)<font[^>]*>(.*?)<\/font>/is

export function normalizeEvangelizo(html: string): ProperDay {
  const rawSections = html.split(sectionSplitter).filter((s) => s.trim())

  const readings: { citation: string; text: string }[] = []

  for (const raw of rawSections) {
    const headerMatch = raw.match(readingHeaderPattern)
    if (!headerMatch) continue

    // The preamble before <font> may contain a day name (e.g. "Monday of Easter week\n\n")
    // followed by the book name on the last line. Take only the last line.
    const preamble = stripHtml(headerMatch[1]).trim()
    const bookName = preamble.split('\n').pop()?.trim() ?? preamble
    const ref = stripHtml(headerMatch[2]).trim()
    const citation = `${bookName} ${ref}`.trim()

    const afterHeader = raw.slice(headerMatch[0].length)
    const text = stripHtml(afterHeader.replace(/^\s*<br\s*\/?>\s*/i, '')).trim()

    if (text) readings.push({ citation, text })
  }

  const propers: ProperDay = {}

  for (const reading of readings) {
    const slot = detectSlot(reading.citation, propers)
    if (slot) {
      propers[slot] = { text: reading.text, citation: reading.citation || undefined }
    }
  }

  return propers
}

function detectSlot(citation: string, existing: ProperDay): string | undefined {
  const lower = citation.toLowerCase()

  if (lower.includes('psalm')) return 'responsorial-psalm'
  if (lower.includes('gospel')) return 'gospel'

  if (!existing['first-reading']) return 'first-reading'
  if (!existing['second-reading']) return 'second-reading'

  return undefined
}

function stripHtml(html: string): string {
  return (
    html
      // Normalize \r\n to \n
      .replace(/\r\n?/g, '\n')
      // <br /> followed by a newline is just one line break, not two
      .replace(/<br\s*\/?>\s*\n/gi, '\n')
      // Remaining <br /> (e.g. standalone) become a newline
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      // Collapse 3+ newlines to 2 (paragraph break)
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  )
}
