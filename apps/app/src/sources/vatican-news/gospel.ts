import { Platform } from 'react-native'
import type { Primitive, ProseBlock, TextPrimitive } from '@/content/primitives'
import { emberLang, loadGospelOfDay } from '@/lib/mass-of/gospelOfDay'
import type { SourceFetchContext } from '../types'
import { fetchDay } from './fetchPage'
import { paragraphText, parseSection } from './parse'
import { type Lang, narrowLang } from './url'

// Split mass-of plain gospel text into prose paragraph blocks (blank line →
// new paragraph; single newline → line break within a paragraph).
function textToBlocks(text: string): ProseBlock[] {
  return text
    .split(/\n{2,}/)
    .map((para) => para.trim())
    .filter(Boolean)
    .map((para) => {
      const lines = para.split('\n')
      const inline = lines.flatMap((line, i) =>
        i === 0
          ? [{ kind: 'text' as const, text: line }]
          : [{ kind: 'break' as const }, { kind: 'text' as const, text: line }],
      )
      return { kind: 'paragraph' as const, inline }
    })
}

function gospelPrimitives(citation: string | undefined, body: ProseBlock[]): Primitive[] {
  const out: Primitive[] = []
  if (citation) out.push({ type: 'rubric', text: { primary: citation } })
  out.push({ type: 'prose', blocks: body })
  return out
}

// Offline / web fallback: the corpus-computed Gospel from the `mass-of`
// DataSource (the same reading Explore's Gospel of the Day shows).
async function fallback(ctx: SourceFetchContext, lang: Lang): Promise<Primitive[] | TextPrimitive> {
  const gospel = await loadGospelOfDay(ctx.date, emberLang(lang))
  if (!gospel) {
    const message =
      lang === 'pt-BR'
        ? 'O Evangelho de hoje não está disponível.'
        : "Today's Gospel is unavailable."
    return { type: 'text', text: { primary: message }, style: 'italic' }
  }
  return gospelPrimitives(gospel.citation, textToBlocks(gospel.text))
}

// A bare scripture reference like "3,16-18" / "3:16-18" — digits and citation
// punctuation only.
const isVerseRef = (text: string): boolean => text.length > 0 && /^[\d\s.,:;–-]+$/.test(text)

// The incipit is the first paragraph ("From the Gospel according to John" /
// "Proclamação … segundo João"). The verse reference may ride inline in that
// same paragraph (EN, via <br>) or sit in its own following paragraph (PT) —
// fold a trailing bare-reference paragraph into the citation either way, so it
// never leaks into the passage (and its trailing blank-line <br>s don't open a
// gap before the text).
export function splitCitation(blocks: ProseBlock[]): { citation?: string; body: ProseBlock[] } {
  if (blocks.length < 2) return { body: blocks }
  const parts = [paragraphText(blocks[0])]
  let bodyStart = 1
  while (bodyStart < blocks.length && isVerseRef(paragraphText(blocks[bodyStart]))) {
    parts.push(paragraphText(blocks[bodyStart]))
    bodyStart++
  }
  if (bodyStart >= blocks.length) return { body: blocks } // all reference, no passage
  return { citation: parts.filter(Boolean).join(' '), body: blocks.slice(bodyStart) }
}

// Compact "Book ref" (e.g. "João 3,16-18") from the full incipit, for card
// titles where the full "Proclamação do Evangelho … segundo João 3,16-18"
// reads too long. Falls back to the full string if the tail doesn't parse.
export function compactCitation(full: string | undefined): string | undefined {
  if (!full) return undefined
  const m = full.match(/(\S+)\s+(\d+[,:]\s?\d[\d\s.,:;–-]*)$/)
  return m ? `${m[1]} ${m[2].replace(/\s+/g, '')}` : full
}

// Today's Gospel as plain citation + text, for compact surfaces (the Explore
// "Evangelho do Dia" card). Native only — returns undefined on web or any
// fetch/parse failure so the caller can fall back to the offline mass-of
// Gospel, keeping the card consistent with the practice's Gospel tab.
export async function fetchVaticanGospelText(
  lang: Lang,
  date: Date,
): Promise<{ citation?: string; text: string } | undefined> {
  try {
    const html = await fetchDay(lang, date)
    const { citation, body } = splitCitation(parseSection(html, lang, 'gospel'))
    const text = body.map(paragraphText).join('\n').trim()
    return text ? { citation: compactCitation(citation), text } : undefined
  } catch {
    return undefined
  }
}

// Today's Gospel from vaticannews.va (native), falling back to the offline
// mass-of Gospel on web (CORS-blocked) or any fetch/parse failure — so the
// Gospel tab is always populated. `dateScoped` keys the cache per day.
export const gospelOfTheDaySource = {
  id: 'producer/gospel-of-the-day',
  // v2: citation/passage split now folds the standalone verse-reference
  // paragraph (PT) into the citation — bump to drop v1's cached payloads.
  version: '2',
  prefsDeps: ['lang' as const],
  dateScoped: true,
  async fetch(ctx: SourceFetchContext): Promise<Primitive[] | TextPrimitive> {
    const lang = narrowLang(ctx.prefs.lang)
    if (Platform.OS === 'web') return fallback(ctx, lang)

    try {
      const html = await fetchDay(lang, ctx.date)
      const { citation, body } = splitCitation(parseSection(html, lang, 'gospel'))
      return gospelPrimitives(citation, body)
    } catch {
      return fallback(ctx, lang)
    }
  },
}
