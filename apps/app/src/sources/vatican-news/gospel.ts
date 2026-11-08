import type { Lang as MissalLang } from '@ember/missal'
import type { Primitive, ProseBlock, TextPrimitive } from '@/content/primitives'
import { loadGospelOfDay } from '@/lib/missal/gospelOfDay'
import type { SourceFetchContext } from '../types'
import { fetchDay } from './fetchPage'
import { paragraphText, parseSection } from './parse'
import { type Lang, narrowLang } from './url'

// Split the corpus's plain gospel text into prose paragraph blocks (blank line →
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

// Offline fallback: the corpus-computed Gospel of the day's Mass
// (the same reading Explore's Gospel of the Day shows).
async function fallback(ctx: SourceFetchContext, lang: Lang): Promise<Primitive[] | TextPrimitive> {
  const gospel = await loadGospelOfDay(ctx.date, lang as MissalLang, ctx.prefs.jurisdiction)
  if (!gospel) {
    const message =
      lang === 'pt-BR'
        ? 'O Evangelho de hoje não está disponível.'
        : "Today's Gospel is unavailable."
    return { type: 'text', text: { primary: message }, style: 'italic' }
  }
  return gospelPrimitives(gospel.citation, textToBlocks(gospel.text))
}

// A verse number may carry a part letter ("9,43b-45", "5,1-2a"), which the
// lectionary uses for half-verses, and a range may cross chapters on a dash
// ("15:26—16:4a").
const verseRef = String.raw`\d+[a-e]?(?:[\s.,:;–—-]+\d+[a-e]?)*`

// A reference as Vatican News prints it under the incipit: bare ("3,16-18",
// "3:16-18"), after the book abbreviated ("Lc 1,39-56"), in brackets
// ("(2,41-51)", "(Mt 5,1-12a)"), sometimes closed by a full stop ("11,19-27.").
const reference = String.raw`\(?(?:(?<!\p{L})(\p{L}{1,4})\.?\s+)?(\d+[,:]\s?${verseRef})\)?\.?`
const wholeReference = new RegExp(`^${reference}$`, 'u')
const leadingReference = new RegExp(`^(${reference})\\s+(\\S.*)$`, 'su')
const closingReference = new RegExp(`\\s${reference}$`, 'u')
const incipit = /segundo|according to/i

/**
 * The incipit opens the block ("From the Gospel according to John" /
 * "Proclamação … segundo João") and the reference follows it: on the same
 * line, after a <br>, in a paragraph of its own, or opening the passage's own
 * first line ("6,35-40 Naquele tempo, …", PT, some days). The citation is
 * everything up to and including the reference, wherever the boundaries
 * fall, so the reference never leaks into the passage (and the blank-line
 * <br>s after it don't open a gap before the text).
 */
export function splitCitation(blocks: ProseBlock[]): { citation?: string; body: ProseBlock[] } {
  // The reference stands within the first few paragraphs, or the block has none.
  for (let b = 0; b < Math.min(blocks.length, 3); b++) {
    const block = blocks[b]
    if (block.kind !== 'paragraph') return { body: blocks }
    for (let i = 0; i < block.inline.length; i++) {
      const item = block.inline[i]
      if (item.kind !== 'text') continue
      const text = item.text.trim()
      const whole = wholeReference.test(text) || closingReference.test(text)
      const lead = whole ? undefined : leadingReference.exec(text)
      if (!whole && !lead) continue
      const citation = [
        ...blocks.slice(0, b).map(paragraphText),
        paragraphText({
          kind: 'paragraph',
          inline: [...block.inline.slice(0, i), { kind: 'text', text: lead ? lead[1] : text }],
        }),
      ]
        .filter(Boolean)
        .join(' ')
      const after = [
        ...(lead ? [{ kind: 'text' as const, text: lead[4] }] : []),
        ...block.inline.slice(i + 1),
      ]
      const passageAt = after.findIndex((x) => x.kind !== 'break')
      const body = [
        ...(passageAt >= 0 ? [{ kind: 'paragraph' as const, inline: after.slice(passageAt) }] : []),
        ...blocks.slice(b + 1),
      ]
      return body.length ? { citation, body } : { body: blocks }
    }
  }
  // No reference printed: the incipit alone is the citation.
  const [first, ...rest] = blocks
  return first && rest.length && incipit.test(paragraphText(first))
    ? { citation: paragraphText(first), body: rest }
    : { body: blocks }
}

const evangelists = {
  'pt-BR': ['Mateus', 'Marcos', 'Lucas', 'João'],
  'en-US': ['Matthew', 'Mark', 'Luke', 'John'],
} as const

/** Which of the four a name or its abbreviation is ("Joã", "Lc", "Jn"), or undefined. */
function evangelistOf(word: string): 0 | 1 | 2 | 3 | undefined {
  const w = word.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
  if (/^(mt|mat)/.test(w)) return 0
  if (/^(mc|mk|mar)/.test(w)) return 1
  if (/^(lc|lk|lu)/.test(w)) return 2
  if (/^(jo|jn)/.test(w)) return 3
  return undefined
}

// The incipit's language, or, with none ("(Mt 5,1-12a)" alone), the
// reference's: Portuguese writes chapter and verse with a comma.
function languageOf(full: string, verses: string): 'pt-BR' | 'en-US' {
  if (/segundo|Evangelho/i.test(full)) return 'pt-BR'
  if (/according to|Gospel/i.test(full)) return 'en-US'
  return /^\d+,/.test(verses) ? 'pt-BR' : 'en-US'
}

/**
 * Compact "Book ref" (e.g. "João 3,16-18") from the full incipit, for card
 * titles where the full "Proclamação do Evangelho … segundo João 3,16-18"
 * reads too long. The evangelist is the one the incipit names, or else the
 * reference's abbreviation. Falls back to the full string if neither parses.
 */
export function compactCitation(full: string | undefined): string | undefined {
  if (!full) return undefined
  const ref = new RegExp(`${reference}$`, 'u').exec(full.trim())
  if (!ref) return full
  const named =
    /(?:segundo|according to|escrito por)\s+(?:S[ãa]o\s+|San\s+|Saint\s+|St\.?\s+)?(\p{L}+)/iu.exec(
      full,
    )?.[1] ?? /(\p{L}+)\s*$/u.exec(full.slice(0, ref.index))?.[1]
  const which = evangelistOf(ref[1] ?? named ?? '') ?? evangelistOf(named ?? '')
  if (which === undefined) return full
  // "12, 1 8" (2026-07-17) is 12,1-8 with its dash lost.
  const verses = ref[2]
    .replace(/([,:])\s+/g, '$1')
    .replace(/(\d)\s+(\d)/g, '$1-$2')
    .replace(/\s+/g, '')
  return `${evangelists[languageOf(full, ref[2])][which]} ${verses}`
}

// Today's Gospel as plain citation + text, for compact surfaces (the Explore
// "Evangelho do Dia" card). Returns undefined on any fetch/parse failure so the caller can fall back to the offline mass-of
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

// Today's Gospel from vaticannews.va, falling back to the offline
// mass-of Gospel on any fetch/parse failure — so the
// Gospel tab is always populated. `dateScoped` keys the cache per day.
export const gospelOfTheDaySource = {
  id: 'producer/gospel-of-the-day',
  version: '4',
  prefsDeps: ['lang' as const],
  dateScoped: true,
  async fetch(ctx: SourceFetchContext): Promise<Primitive[] | TextPrimitive> {
    const lang = narrowLang(ctx.prefs.lang)

    try {
      const html = await fetchDay(lang, ctx.date)
      const { citation, body } = splitCitation(parseSection(html, lang, 'gospel'))
      return gospelPrimitives(citation, body)
    } catch {
      return fallback(ctx, lang)
    }
  },
}
