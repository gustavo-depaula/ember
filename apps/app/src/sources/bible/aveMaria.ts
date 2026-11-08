import { portugueseSlug } from './books'
import { fetchOk, type Verse, type WebBible } from './types'

// The Claretians publish the Ave Maria; claretianos.com.br reads it from this API.
const baseUrl = 'https://biblia.parresia.com/wp-json/bible/v2'

type ApiVerse = { number: string; text: string }

// The text carries print furniture: soft hyphens, an asterisk where a footnote
// hangs, the synoptic parallels of a pericope ("(= Mt 3,1-17 = Mc 1,1-13)"),
// and the dialogue dash that opens the next verse's reply, left dangling here.
function cleanText(text: string): string {
  return text
    .replace(/­/g, '')
    .replace(/\*/g, '')
    .replace(/\(=[^)]*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s[–—-]$/, '')
}

// Some verses arrive inside the one before, their number left in the text
// ("…na aldeia”. 16 Jesus, porém, …" with no verse 16, Mt 14). The number
// missing from the sequence, standing alone before a word, is where it opens.
function splitRunOn(verses: Verse[]): Verse[] {
  const out: Verse[] = []
  for (const [i, v] of verses.entries()) {
    let current = v
    const next = verses[i + 1]?.verse
    for (let n = current.verse + 1; next !== undefined && n < next; n++) {
      const at = current.text.search(new RegExp(`\\s${n}\\s+(?=[\\p{L}“"‘(–—-])`, 'u'))
      if (at < 0) break
      out.push({ verse: current.verse, text: current.text.slice(0, at).trim() })
      current = {
        verse: n,
        text: current.text
          .slice(at)
          .trim()
          .replace(/^\d+\s+/, ''),
      }
    }
    out.push(current)
  }
  return out
}

export function parseAveMariaChapter(verses: ApiVerse[]): Verse[] {
  return splitRunOn(
    verses
      .map((v) => ({ verse: Number.parseInt(v.number, 10), text: cleanText(v.text) }))
      .filter((v) => !Number.isNaN(v.verse) && v.text)
      .sort((a, b) => a.verse - b.verse),
  )
}

export const aveMaria: WebBible = {
  // Hebrew chapter divisions here, though the Psalms keep the Vulgate numbers.
  chapters: { joel: 4, malachias: 3 },
  fetchChapter: async (book, chapter) => {
    const res = await fetchOk(`${baseUrl}/chapter/${portugueseSlug[book]}_${chapter}`, 'Ave Maria')
    return parseAveMariaChapter(await res.json())
  },
}
