// Which Latin is each Brazilian part's, on one day. A part is given the
// Latin only once it is checked: a psalm, a reading and a responsory by the
// numbers both editions print (Psalmus 92 (93) / Salmo 92(93), Act 10, 40-43
// / At 10,40-43); a text without them (an antiphon, the prayer) where the
// office it belongs to is the Latin day's, which on a memorial only a part with
// numbers the saint's and the weekday's offices differ in can tell. Then come
// the checks for iBreviary's own slips.

import type { Primitive } from '../../../apps/app/src/content/primitives'
import { citation } from './books'
import {
  baseOf,
  type FormSlots,
  isAntiphon,
  isPsalm,
  type LatinSection,
  latinTexts,
  lineCount,
  markMissing,
  missing,
  numbers,
  oneLatinEach,
  pairHymn,
  pairPart,
  plain,
  sameCitation,
  type SlotPrimitives,
  textsOf,
} from '../../../apps/app/src/sources/loth/pair'


const occurrenceOf = (slot: string) => Number(/~(\d+)$/.exec(slot)?.[1] ?? 1)


// Texts that are the same every day (the Gospel canticle among them): safe to
// pair on any day.
const ordinary = new Set(['intro', 'conclusion', 'canticle'])

const isAnchored = (slot: string) => /^(psalm-\d+|reading(-\d+)?|responsory-\d+)$/.test(slot)


/** What a part's numbers are, as the Brazilian edition prints them. */
function anchorOfPart(slot: string, primitives: Primitive[]): string | undefined {
  if (slot.startsWith('psalm-')) {
    const title = primitives.find(
      (p) => p.type === 'rubric' && /^(Salmo|C[âa]ntico|Sl)\b/i.test(p.text.primary),
    )
    return title ? numbers(firstLineOf(title)) : undefined
  }
  if (slot === 'reading-2') {
    const source = primitives.find((p) => p.type === 'rubric' && /^\(/.test(p.text.primary))
    if (source) return numbers(firstLineOf(source))
  }
  if (slot.startsWith('reading-')) {
    // The chapter and verses, set red after the book's name: "/:19,1-9a.11-21:/".
    const chapterAndVerses = /\/:\s*(\d+\s*,[^:]*):\//
    const title = primitives.find((p) => p.type === 'text' && chapterAndVerses.test(p.text.primary))
    const cite = title?.type === 'text' ? chapterAndVerses.exec(title.text.primary)?.[1] : undefined
    if (cite) return numbers(cite)
  }
  // "Leitura breve Rm 12,1-2", "Responsório Cf. Sl 71(72),6.19".
  const heading = primitives.find((p) => p.type === 'heading')
  if (heading?.type === 'heading' && heading.note && /\d+\s*,\s*\d/.test(heading.note.primary))
    return numbers(heading.note.primary)
  return undefined
}


function firstLineOf(p: Primitive): string {
  return p.type === 'rubric' || p.type === 'heading' || p.type === 'text'
    ? p.text.primary.split('\n')[0]
    : ''
}


const anchorOfLatin = (section: LatinSection) =>
  section.title ? numbers(section.title) : undefined


/**
 * The Latin section a part of the hour answers to. Where the Latin offers
 * more than one (a memorial's Commons, "[Doctores]" and "[Pastores]"; the two
 * hymns of a little hour), the one with the part's numbers, else the one
 * plainly nearest its words; none where neither tells.
 */
function latinOf(
  slot: string,
  primitives: Primitive[],
  latin: LatinSection[],
  // The office's other parts, by which one of them may be told.
  office: SlotPrimitives[] = [],
): LatinSection | undefined {
  const base = baseOf(slot)
  const all = latin.filter((section) => section.slot === base)
  // The prayer of the Office of Readings comes after every reading's.
  if (base === 'prayer') return all[all.length - 1]
  if (all.length <= 1) return all[0]
  // A Common's responsory is the one after its reading.
  if (base === 'responsory') {
    const ours = office.find((s) => s.slot === 'reading')
    const reading = ours && latinOf('reading', ours.primitives, latin)
    const after = reading && latin[latin.indexOf(reading) + 1]
    if (after?.slot === 'responsory') return after
  }
  const ours = isAnchored(base) ? anchorOfPart(base, primitives) : undefined
  if (ours)
    return all.find((section) => anchorOfLatin(section) === ours) ?? all[occurrenceOf(slot) - 1]
  if (base === 'hymn') {
    const lines = lineCount(textsOf(primitives))
    const alike = all.filter((section) => lineCount(latinTexts(section.body)) === lines)
    return alike.length === 1 ? alike[0] : nearest(primitives, alike)
  }
  return nearest(primitives, all)
}


function nearest(primitives: Primitive[], candidates: LatinSection[]): LatinSection | undefined {
  const ours = textsOf(primitives).join(' ')
  const scored = candidates
    .map((section) => ({ section, score: affinity(ours, latinTexts(section.body).join(' ')) }))
    .sort((a, b) => b.score - a.score)
  const [best, next] = scored
  return best && (!next || best.score - next.score >= 0.1) ? best.section : undefined
}

const latinRoot = (w: string) =>
  w
    .replace(/^h/, '')
    .replace(/ae/g, 'e')
    .replace(/ph/g, 'f')
    .replace(/th/g, 't')
    .replace(/ch/g, 'c')
    .replace(/y/g, 'i')
    .replace(/ti(?=[aeiou])/g, 'ci')
    .replace(/ct/g, 't')
    .replace(/([bcdfgklmnprstv])\1/g, '$1')

const ptRoot = (w: string) =>
  w
    .replace(/^h/, '')
    // espírito, estrela: spiritus, stella.
    .replace(/^e(?=s[bcdfgklmnpqrtv])/, '')
    .replace(/j/g, 'i')
    .replace(/[cl]h/g, (m) => m[0])
    .replace(/nh/g, 'n')
    .replace(/([bcdfgklmnprstv])\1/g, '$1')


function distance(a: string, b: string): number {
  let row = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    const next = [i]
    for (let j = 1; j <= b.length; j++)
      next[j] = Math.min(row[j] + 1, next[j - 1] + 1, row[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    row = next
  }
  return row[b.length]
}


function affinity(portuguese: string, latin: string): number {
  const theirs = plain(latin).map(latinRoot)
  const ours = plain(portuguese).map(ptRoot)
  if (ours.length === 0) return 0
  const near = (w: string) =>
    theirs.some(
      (l) => l === w || (l[0] === w[0] && distance(w, l) / Math.max(w.length, l.length) <= 0.4),
    )
  return ours.filter(near).length / ours.length
}


type Verdict = 'agrees' | 'differs' | 'unknown'


function anchored(
  slot: string,
  primitives: Primitive[],
  section: LatinSection | undefined,
): Verdict {
  if (!isAnchored(baseOf(slot))) return 'unknown'
  const ours = anchorOfPart(baseOf(slot), primitives)
  if (!ours || !section) return 'unknown'
  const theirs = anchorOfLatin(section)
  if (!theirs) return 'unknown'
  if (!sameCitation(ours, theirs, baseOf(slot))) return 'differs'
  // A short reading's book too, where both name one: Romans 1,16-17 is not
  // Deuteronomy 1,16-17.
  if (baseOf(slot) === 'reading') {
    const heading = primitives.find((p) => p.type === 'heading')
    const ourBook = heading?.type === 'heading' && heading.note ? citation(heading.note.primary, 'brazilian') : undefined
    const theirBook = section.title ? citation(section.title, 'latin') : undefined
    if (ourBook && theirBook && ourBook.split(' ')[0] !== theirBook.split(' ')[0]) return 'differs'
  }
  return 'agrees'
}


/**
 * A hymn the book leaves to choice (a little hour's two, Night Prayer's):
 * each beside the Latin hymn it renders, if one does.
 */
function pairHymnChoices(
  primitives: Primitive[],
  latin: LatinSection[],
): { primitives: Primitive[]; sections: (LatinSection | undefined)[] } | undefined {
  const hymns = latin.filter((section) => section.slot === 'hymn')
  const sections: (LatinSection | undefined)[] = []
  const out = primitives.map((p): Primitive => {
    if (p.type !== 'container' || p.behavior.kind !== 'options') return p
    return {
      ...p,
      behavior: {
        ...p.behavior,
        options: p.behavior.options.map((option) => {
          const section = latinOf('hymn', option.children, hymns)
          const paired = section && pairHymn(option.children, section)
          sections.push(paired ? section : undefined)
          return { ...option, children: paired ?? markMissing(option.children) }
        }),
      },
    }
  })
  return sections.some(Boolean) ? { primitives: out, sections } : undefined
}


// A Latin prayer naming its saint ("beáti Bonaventúræ") is not a weekday's,
// whatever else agrees.
// A saint named by his name; the Holy Spirit, Our Lady, the Father ("sancte
// Pater") and the Church are named so in prayers of every season.
const namesASaint = (latin: string) =>
  /(beát[iaeæ]|beatórum|sanct[iaeæ]|sanctórum)\s+(?!Spírit|Mar[íi]|Vírgin|Dei\b|Pat[re]|Ecclési|Trínit|Cruc|Sion|Ierúsalem|Evangéli|Nóm|Famíli)[A-ZÆ]/u.test(
    latin.replace(/Spírit\w*\s+Sanct\w*/g, ''),
  )

// How much of an antiphon is words of its psalm, in one language.
function drawnFrom(antiphon: string, psalm: string): number {
  const words = new Set(plain(psalm))
  const own = plain(antiphon)
  return own.length === 0 ? 0 : own.filter((w) => words.has(w)).length / own.length
}


/**
 * An antiphon is most often a line of its psalm. Where the Brazilian's is
 * drawn from its psalm and the Latin's not from the Latin psalm, the two are
 * not one antiphon (iBreviary may print the day before's).
 */
function antiphonsAgree(
  base: string,
  primitives: Primitive[],
  section: LatinSection,
  office: SlotPrimitives[],
  latin: LatinSection[],
): boolean {
  if (!/^ant-\d+/.test(base)) return true
  // Against the hour's whole psalmody: the editions divide a psalm in
  // different places, and an antiphon may be from the division after.
  const ourPsalms = office.filter((s) => /^psalm-\d+/.test(s.slot))
  const theirPsalms = latin.filter((s) => /^psalm-\d+/.test(s.slot))
  if (ourPsalms.length === 0 || theirPsalms.length === 0) return true
  const ours = drawnFrom(
    textsOf(primitives).join(' '),
    ourPsalms.flatMap((s) => textsOf(s.primitives)).join(' '),
  )
  const theirs = drawnFrom(
    latinTexts(section.body).join(' '),
    theirPsalms.flatMap((s) => latinTexts(s.body)).join(' '),
  )
  return !(ours >= 0.6 && theirs < 0.3)
}


function sameSaint(portuguese: string, latin: string): boolean {
  const theirs = [...latin.matchAll(/\b(?:beát[iaeæ]|sanct[iaeæ])\s+([A-ZÆ][\p{L}]+)/gu)].map((m) =>
    latinRoot(plain(m[1])[0] ?? ''),
  )
  const ours = [
    ...portuguese.matchAll(/\b(?:São|Santo|Santa|Beat[oa])\s+([A-ZÁÉÍÓÚ][\p{L}]+)/gu),
  ].map((m) => ptRoot(plain(m[1])[0] ?? ''))
  return theirs.some(
    (l) =>
      l.length >= 4 &&
      ours.some(
        (w) =>
          w.length >= 4 && l[0] === w[0] && distance(w, l) / Math.max(w.length, l.length) <= 0.35,
      ),
  )
}

const ptNamesASaint = (text: string) =>
  /(São|Santo|Santa|Santos|Santas|Beat[oa]|Bem-aventurad[oa])\s+(?!Espírito|Maria\b|Virgem|Pai\b|Mãe\b|Igreja|Trindade|Cruz|Sião|Jerusalém|Evangelho|Nome\b|Família)\p{Lu}/u.test(text)


const said = (primitives: Primitive[]) => JSON.stringify(primitives)


/**
 * Whether the Latin day is this office: every part with numbers agrees. The
 * psalms and the readings tell the day; a responsory the two editions cite
 * differently is that responsory's own matter.
 */
function agreesWith(office: FormSlots, latin: LatinSection[]): boolean {
  const verdicts = office.slots
    .filter((s) => !baseOf(s.slot).startsWith('responsory'))
    .map((s) => anchored(s.slot, s.primitives, latinOf(s.slot, s.primitives, latin, office.slots)))
  return verdicts.includes('agrees') && !verdicts.includes('differs')
}


/**
 * Every office of the hour (the weekday's, the saint's…) with the Latin of
 * the parts the Latin day shares with it. A part the Latin has but that could
 * not be paired is marked as missing its Latin.
 */
export function pairForms<F extends string>(
  forms: FormSlots<F>[],
  latin: LatinSection[],
  {
    penitential = false,
    onlyOrdinary = false,
    weekday,
  }: {
    // Hours whose own texts iBreviary does not print (Night Prayer of the
    // Triduum, which it gives the weekday's): only what every day says.
    onlyOrdinary?: boolean
    // Advent, Lent and Holy Week, whose brief responsories the Brazilian
    // edition mostly has otherwise than the Latin.
    penitential?: boolean
    // The weekday's office, where the Latin says the hour of the weekday
    // though the Brazilian gives it to the saint (a memorial's little hours).
    weekday?: FormSlots<F>
  } = {},
): { forms: FormSlots<F>[]; latinOffice?: F } {
  // The offices to tell apart: those shown, and the weekday's where the
  // Brazilian shows only the saint's.
  const offices: FormSlots<F>[] = weekday ? [...forms, weekday] : forms
  const agrees = offices.map((f) => agreesWith(f, latin))
  const textOf = (f: FormSlots<F>, slot: string) => {
    const part = f.slots.find((s) => s.slot === slot)
    return part ? said(part.primitives) : undefined
  }
  // A part every office has alike is the Latin day's wherever any office is.
  const shared = (slot: string) => {
    const texts = offices.map((f) => textOf(f, slot))
    return texts.every((t) => t !== undefined && t === texts[0])
  }
  // Which office the Latin day is, the saint's or the weekday's, only the
  // parts with numbers in which they differ can tell: on a memorial they
  // share their psalms and often a reading.
  const reference = ((): FormSlots<F> | undefined => {
    if (offices.length === 1) return agrees[0] ? offices[0] : undefined
    const telling = offices.map((f, i) => {
      if (!agrees[i]) return false
      return f.slots.some(
        (s) =>
          !shared(s.slot) &&
          !baseOf(s.slot).startsWith('responsory') &&
          anchored(s.slot, s.primitives, latinOf(s.slot, s.primitives, latin, f.slots)) ===
            'agrees',
      )
    })
    const at = (form: string) => offices.find((f, i) => f.form === form && telling[i])
    return (
      at('celebration') ??
      at('season') ??
      offices.find((f, i) => f.form !== 'celebration-of-the-weekday' && telling[i])
    )
  })()
  const proper = (slot: string, primitives: Primitive[]) => {
    if (shared(slot) && agrees.some(Boolean)) return true
    const theirs = reference?.slots.find((s) => s.slot === slot)
    return theirs !== undefined && said(theirs.primitives) === said(primitives)
  }

  const doubted = new Set(
    forms.filter((f) =>
      f.slots.some(({ slot, primitives }) => {
        const section = /^ant-/.test(baseOf(slot)) && latinOf(slot, primitives, latin, f.slots)
        return section && !antiphonsAgree(baseOf(slot), primitives, section, f.slots, latin)
      }),
    ),
  )
  const paired = forms.map((f) => ({
    form: f.form,
    slots: f.slots.map((part) => {
      const { slot, primitives } = part
      if (
        baseOf(slot) === 'hymn' &&
        primitives.some((p) => p.type === 'container' && p.behavior.kind === 'options')
      ) {
        const choices = proper(slot, primitives) ? pairHymnChoices(primitives, latin) : undefined
        return choices
          ? { ...part, primitives: choices.primitives, latinChoices: choices.sections }
          : { ...part, primitives: markMissing(primitives) }
      }
      const section = latinOf(slot, primitives, latin, f.slots)
      if (!section) {
        const offered = latin.some((l) => l.slot === baseOf(slot))
        return {
          ...part,
          primitives: offered && missing(baseOf(slot)) ? markMissing(primitives) : primitives,
        }
      }
      const verdict = anchored(slot, primitives, section)
      const base = baseOf(slot)
      // The psalmody's antiphons are a set: one found not the Latin's puts
      // them all in doubt.
      if (/^ant-/.test(base) && doubted.has(f)) return { ...part, primitives: markMissing(primitives) }
      const allowed =
        ordinary.has(base) ||
        (!onlyOrdinary && verdict === 'agrees') ||
        (!onlyOrdinary && verdict === 'unknown' && proper(slot, primitives))

      const latinPrayer = base === 'prayer' ? latinTexts(section.body).join(' ') : ''
      const ourPrayer = base === 'prayer' ? textsOf(primitives).join(' ') : ''
      const saintly = base === 'prayer' && namesASaint(latinPrayer) !== ptNamesASaint(ourPrayer)
      // A saint's own prayer names him in both: his, whatever Common the two
      // editions took the rest from.
      const his = base === 'prayer' && sameSaint(ourPrayer, latinPrayer)
      // There a brief responsory is the Latin's only where its words plainly are.
      const unlike =
        penitential &&
        base === 'responsory' &&
        affinity(textsOf(primitives).join(' '), latinTexts(section.body).join(' ')) < 0.3
      const paired =
        (allowed && !saintly && !unlike) || (his && !onlyOrdinary)
          ? pairPart(slot, primitives, section)
          : undefined
      if (paired) return { ...part, primitives: paired, latin: section }
      return { ...part, primitives: missing(base) ? markMissing(primitives) : primitives }
    }),
  }))
  return { forms: paired.map(oneLatinEach), latinOffice: reference?.form }
}

// What an hour is made of, to find it on another day of the Latin: the hour,
// its first psalm, the citation of its reading. Where the Latin keeps a feast
// on another day (Epiphany, Corpus Christi, the Assumption), or a weekday of
// Christmas falls otherwise, the same office is there under another date.
const keyOf = (hour: string, psalm: string | undefined, reading: string | undefined) =>
  psalm && reading ? `${hour}|${psalm.split('.')[0]}|${reading.split('.').slice(0, 2).join('.')}` : undefined

const readingSlot = /^reading(-1)?$/

/** The keys of an hour of the Latin, one for each reading it offers. */
export function latinKeys(hour: string, sections: LatinSection[]): string[] {
  const psalm = sections.find((s) => /^psalm-\d+$/.test(s.slot) && anchorOfLatin(s))
  return sections
    .filter((s) => readingSlot.test(s.slot))
    .map((s) => keyOf(hour, psalm && anchorOfLatin(psalm), anchorOfLatin(s)))
    .filter((key): key is string => key !== undefined)
}

/** The keys of the Brazilian hour's offices. */
export function officeKeys(hour: string, forms: FormSlots[]): string[] {
  return forms.flatMap((f) => {
    const psalm = f.slots.find((s) => /^psalm-\d+$/.test(s.slot) && anchorOfPart(s.slot, s.primitives))
    const reading = f.slots.find((s) => readingSlot.test(s.slot))
    const key = keyOf(
      hour,
      psalm && anchorOfPart(psalm.slot, psalm.primitives),
      reading && anchorOfPart(reading.slot, reading.primitives),
    )
    return key ? [key] : []
  })
}
