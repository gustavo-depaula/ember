// The Latin of an hour set beside the Brazilian text, part by part. The two
// editions are cut differently below the part (the Brazilian psalter breaks a
// psalm into other strophes, numbers its verses, prints the Gloria inside the
// last strophe), so a part is paired line for line only where both sides have
// the same shape, and otherwise as one block beside one block.
//
// What is paired is checked first. A psalm, a reading and a responsory carry
// numbers both editions print (Psalmus 92 (93) / Salmo 92(93), Act 10, 40-43
// / At 10,40-43); a text without them (an antiphon, the prayer) is the Latin
// day's only where the office it belongs to agrees with the Latin on every
// part that has them. On a memorial that tells the saint's office from the
// weekday's: they differ in the short reading.

import type { Primitive, TextPrimitive, VersesPrimitive } from '@/content/primitives'
import type { LatinSection } from './latin'

export interface SlotPrimitives {
  slot: string
  primitives: Primitive[]
}

// A slot met twice in an hour is numbered by the corpus: 'ant-2~2'.
const baseOf = (slot: string) => slot.replace(/~\d+$/, '')
const occurrenceOf = (slot: string) => Number(/~(\d+)$/.exec(slot)?.[1] ?? 1)

// Texts that are the same every day (the Gospel canticle among them): safe to
// pair on any day.
const ordinary = new Set(['intro', 'conclusion', 'canticle'])
const isAntiphon = (slot: string) => /^(ant-\d+(-end)?|canticle-ant(-end)?)$/.test(slot)
const isPsalm = (slot: string) => /^(psalm-\d+|canticle|te-deum)$/.test(slot)
const isAnchored = (slot: string) => /^(psalm-\d+|reading(-\d+)?|responsory-\d+)$/.test(slot)

// A citation as its numbers: "1.899" and "1899" are one number (the
// Brazilian sets a point in the thousands).
const numbers = (text: string) =>
  (text.replace(/(\d)\.(\d{3})(?!\d)/g, '$1$2').match(/\d+/g) ?? []).map(Number).join('.')

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

// How much of a Portuguese text has a Latin word of the same root beside it:
// the two share their roots more than their spelling, so a word is matched to
// one that, both spelt alike (no accents, æ as e, ph as f, ti before a vowel
// as ci…), is close. Too weak to tell a translation from another text on its
// own; enough to tell which of two Latin texts a Portuguese one renders.
const plain = (text: string) =>
  text
    .replace(/\/:.*?:\//g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/æ/g, 'e')
    .replace(/œ/g, 'e')
    .replace(/[^a-z]+/g, ' ')
    .trim()
    .split(' ')
    .filter((w) => w.length >= 4)
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

function textsOf(primitives: Primitive[]): string[] {
  return primitives.flatMap((p): string[] =>
    p.type === 'text'
      ? [p.text.primary]
      : p.type === 'verses'
        ? p.items.map((item) => item.text.primary)
        : p.type === 'container'
          ? textsOf(p.type === 'container' && 'children' in p ? (p.children ?? []) : [])
          : [],
  )
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
  return sameCitation(ours, theirs, baseOf(slot)) ? 'agrees' : 'differs'
}

// Two citations of one text: the editions differ in the verses they list
// between (Cf. Ap 19, 1-2. 5-7 / Ap 19,1-7), never in where it begins and ends.
// A Father's text is cited by the edition it is read in, whose pages the two
// count a page apart; its work, book and chapter are what tell it.
function sameCitation(ours: string, theirs: string, slot = ''): boolean {
  if (ours === theirs) return true
  const a = ours.split('.')
  const b = theirs.split('.')
  if (slot === 'reading-2')
    return a.length > 3 && a.slice(0, 3).join('.') === b.slice(0, 3).join('.')
  return a[0] === b[0] && a[1] === b[1] && a[a.length - 1] === b[b.length - 1]
}

// The Latin's text, as lines of what is said: what the edition prints in red
// between (rubrics, "Orémus.") is not, and an "Amen." standing alone closes
// the text before it.
function latinTexts(primitives: Primitive[]): string[] {
  const out: string[] = []
  for (const p of primitives) {
    if (p.type === 'text') {
      if (/^Or[ée]mus\.?$/.test(p.text.primary.trim())) continue
      out.push(p.text.primary.trim())
    } else if (p.type === 'verses') {
      for (const item of p.items) {
        // iBreviary leaves the point of a red "℟." before some responses.
        const said = item.text.primary.trim().replace(/^[.\s]+/, '')
        if (/^Amen\.?$/.test(said) && out.length > 0) out[out.length - 1] += ' Amen.'
        else out.push(said)
      }
    }
  }
  return out
}

const withSecondary = (text: TextPrimitive['text'], secondary: string) => ({ ...text, secondary })

/** Each of the part's texts and versicles given the Latin line in its place. */
// A line that is only the citation of what it follows ("Dn 3,56.52").
const isCitation = (p: Primitive) =>
  p.type === 'text' &&
  /^\s*(Cf\.\s*)?(\d\s*)?[A-Z][a-zç]{0,3}\.?\s*\d+\s*[,.]\s*\d[\d,.;\s–-]*[a-z]?\s*$/.test(
    p.text.primary.replace(/\/:(.*?):\//g, '$1'),
  )

function zip(primitives: Primitive[], latin: string[]): Primitive[] | undefined {
  const units = primitives.reduce(
    (n, p) =>
      n + (isCitation(p) ? 0 : p.type === 'text' ? 1 : p.type === 'verses' ? p.items.length : 0),
    0,
  )
  if (units === 0 || units !== latin.length) return undefined
  let i = 0
  return primitives.map((p): Primitive => {
    if (isCitation(p)) return p
    if (p.type === 'text') return { ...p, text: withSecondary(p.text, latin[i++]) }
    if (p.type === 'verses')
      return {
        ...p,
        items: p.items.map((item) => ({ ...item, text: withSecondary(item.text, latin[i++]) })),
      }
    return p
  })
}

const stars = (text: string) => (text.match(/\*/g) ?? []).length
// The Gloria closing a psalm is one verse in the Brazilian edition and two in
// the Latin's; every other strophe has as many verses in both.
const isGloria = (text: string) => /^[–—=-]?\s*Gl[óo]ria (ao Pai|Patri)/.test(text.trim())
const sameVerses = (ours: string, theirs: string) =>
  isGloria(theirs) || stars(ours) === stars(theirs)

/**
 * A psalm's strophes beside the Latin's: one for one where both have as many
 * and each pair as many verses (an asterisk to a verse), else the whole psalm
 * as one block beside the whole Latin.
 */
function strophes(texts: TextPrimitive[], latin: string[]): Primitive[] {
  if (
    texts.length === latin.length &&
    texts.every((t, i) => sameVerses(t.text.primary, latin[i]))
  ) {
    return texts.map((t, i) => ({ ...t, text: withSecondary(t.text, latin[i]) }))
  }
  const [first] = texts
  return [
    {
      ...first,
      text: {
        primary: texts.map((t) => t.text.primary).join('\n\n'),
        secondary: latin.join('\n\n'),
      },
    },
  ]
}

const isBold = (p: Primitive) => p.type === 'text' && /^\*\*[^*].*\*\*$/.test(p.text.primary.trim())
const isItalicLead = (p: Primitive) =>
  p.type === 'text' && /^\*[^*]/.test(p.text.primary.trim()) && !p.text.primary.includes('\n')
// A strophe is lines pointed with the asterisk at the half-verse; the
// asterisks of italics stand against a word.
const isStrophe = (p: Primitive): p is TextPrimitive =>
  p.type === 'text' && p.text.primary.includes('\n') && /[*†][ \t]*(\n|$)/.test(p.text.primary)
const isPsalmTitle = (p: Primitive | undefined) =>
  p?.type === 'rubric' && /^(Salmo|C[âa]ntico|Sl)\b|^[IVX]+$/i.test(p.text.primary.trim())

// "Regnavit Dominus … ei (Ap 19, 6. 7)." set as the Brazilian prints it: the
// sentence in italics, the citation upright.
function epigraph(text: string): string {
  const match = /^(.*?)\s*(\([^)]*\))\.?$/.exec(text)
  return match ? `*${match[1]}* ${match[2]}.` : `*${text}*`
}

/** A psalm or canticle: its name, the sentence over it, its strophes. */
function pairPsalm(primitives: Primitive[], section: LatinSection): Primitive[] {
  const body = latinTexts(section.body)
  // The sentence over the psalm (the New Testament's, a Father's) has no
  // pointing and ends in its citation; the two editions do not always choose
  // the same one.
  const lead = body.find((t) => !t.includes('*') && /\([^)]*\d[^)]*\)\.?$/.test(t))
  const cited = (text: string) => numbers(/\(([^)]*\d[^)]*)\)[.*\s]*$/.exec(text)?.[1] ?? '')
  const verses = body.filter((t) => t.includes('*'))
  // A division's number ("VIII (Heth)") is not the psalm's name.
  const subtitle =
    section.subtitle && !/^[IVXL]+\b/.test(section.subtitle) ? section.subtitle : undefined
  const out: Primitive[] = []
  let run: TextPrimitive[] = []
  const flush = () => {
    if (run.length > 0) out.push(...strophes(run, verses))
    run = []
  }
  primitives.forEach((p, i) => {
    if (p.type === 'container' && p.behavior.kind === 'options') {
      flush()
      out.push({
        ...p,
        behavior: {
          ...p.behavior,
          options: p.behavior.options.map((option) => ({
            ...option,
            children: pairPsalm(option.children, section),
          })),
        },
      })
    } else if (
      p.type === 'text' &&
      isBold(p) &&
      subtitle &&
      (i === 0 || isPsalmTitle(primitives[i - 1]))
    ) {
      out.push({ ...p, text: withSecondary(p.text, `**${subtitle}**`) })
    } else if (
      p.type === 'text' &&
      isItalicLead(p) &&
      lead &&
      run.length === 0 &&
      sameCitation(cited(p.text.primary), cited(lead))
    ) {
      out.push({ ...p, text: withSecondary(p.text, epigraph(lead)) })
    } else if (isStrophe(p)) {
      run.push(p)
    } else {
      flush()
      out.push(p)
    }
  })
  flush()
  return out
}

/** An antiphon: the one text of the part beside the Latin's one. */
const onlyAlleluia = (text: string) => /^(\s*(Aleluia|Allelúia)[,.!]?)+\s*$/i.test(text)

function pairAntiphon(primitives: Primitive[], section: LatinSection): Primitive[] | undefined {
  const latin = latinTexts(section.body).join('\n')
  if (!latin) return undefined
  // iBreviary keeps Night Prayer's ordinary antiphons where a season has its
  // own (the Triduum's "Christus factus est", Easter time's alleluias).
  const ours = textsOf(primitives)
    .join(' ')
    .replace(/\/:.*?:\//g, '')
  if (/^Salva nos, Dómine/.test(latin) && !/^Salvai-nos/.test(ours.trim())) return undefined
  if (onlyAlleluia(ours) !== onlyAlleluia(latin)) return undefined
  const at = primitives.findIndex((p) => p.type === 'verses' || p.type === 'text')
  if (at === -1) return undefined
  const said = primitives[at]
  const paired: Primitive =
    said.type === 'verses'
      ? {
          ...said,
          items: said.items.map((item, i) =>
            i === 0 ? { ...item, text: withSecondary(item.text, latin) } : item,
          ),
        }
      : said.type === 'text'
        ? { ...said, text: withSecondary(said.text, latin) }
        : said
  return primitives.map((p, i) => (i === at ? paired : p))
}

/** The first text of the part (the prayer, the reading's first) beside the Latin's. */
function pairFirst(
  primitives: Primitive[],
  latin: string[],
  is: (p: Primitive) => boolean = (p) => p.type === 'text',
): Primitive[] | undefined {
  const at = primitives.findIndex(is)
  if (at === -1 || latin.length === 0) return undefined
  return primitives.map((p, i) =>
    i === at && p.type === 'text' ? { ...p, text: withSecondary(p.text, latin.join('\n')) } : p,
  )
}

/**
 * A reading: its title, then its paragraphs (and, in a little hour, the
 * versicle after it). The Latin sets the reading's own words in a line of its
 * own after the title, where the Brazilian prints them in red.
 */
function pairReading(primitives: Primitive[], section: LatinSection): Primitive[] | undefined {
  const latinParagraphs = latinTexts(section.body.filter((p) => p.type === 'text'))
  const latinVerses = latinTexts(section.body.filter((p) => p.type === 'verses'))
  const texts = primitives.filter((p): p is TextPrimitive => p.type === 'text')
  if (texts.length === 0) return undefined
  // The Office of Readings' reading opens with the book or the author
  // ("Do Primeiro Livro dos Reis 19,1-9"), and the Latin then sets the
  // reading's own words in a line of their own, where the Brazilian has them
  // in red.
  const titled = /^D[oa]s?\b/.test(texts[0].text.primary)
  const hasTheme = primitives.some((p) => p.type === 'rubric')
  const [title, ...afterTitle] = titled ? latinParagraphs : ['', ...latinParagraphs]
  const paragraphs =
    titled && hasTheme && afterTitle[0] && !/[.;:!?»"]$/.test(afterTitle[0])
      ? afterTitle.slice(1)
      : afterTitle
  const body = titled ? texts.slice(1) : texts
  if (body.length === 0 || paragraphs.length === 0) return undefined
  // The reading beside the Latin: paragraph for paragraph, or as one block.
  const read = strophes(body, paragraphs)
  const versicles = primitives.filter((p): p is VersesPrimitive => p.type === 'verses')
  const answered = versicles.length > 0 ? zip(versicles, latinVerses) : undefined
  return primitives.flatMap((p): Primitive[] => {
    if (p === texts[0] && titled) return [{ ...p, text: withSecondary(p.text, title) }]
    const at = body.indexOf(p as TextPrimitive)
    if (at !== -1) return read.length === body.length ? [read[at]] : at === 0 ? read : []
    const v = versicles.indexOf(p as VersesPrimitive)
    if (v !== -1 && answered) return [answered[v]]
    return [p]
  })
}

/** The intercessions: the invitation, the people's response, each petition. */
function pairIntercessions(
  primitives: Primitive[],
  section: LatinSection,
): Primitive[] | undefined {
  const [invitation, response, ...petitions] = latinTexts(section.body)
  if (!response) return undefined
  const ours = primitives.filter(
    (p): p is TextPrimitive => p.type === 'text' && !/^Pai nosso/.test(p.text.primary),
  )
  const [lead, ...asked] = ours
  // The invitation comes before the first response; the petitions are one
  // for one, or the two are not laid side by side at all.
  const firstResponse = primitives.findIndex((p) => p.type === 'verses')
  if (!lead || primitives.indexOf(lead) > firstResponse || asked.length !== petitions.length)
    return undefined
  return primitives.map((p): Primitive => {
    if (p === lead) return { ...p, text: withSecondary(lead.text, invitation) }
    if (p.type === 'verses')
      return {
        ...p,
        items: p.items.map((item) => ({ ...item, text: withSecondary(item.text, response) })),
      }
    const i = asked.indexOf(p as TextPrimitive)
    if (i !== -1 && p.type === 'text') return { ...p, text: withSecondary(p.text, petitions[i]) }
    return p
  })
}

/** The opening versicle and the Gloria after it. */
function pairIntro(primitives: Primitive[], section: LatinSection): Primitive[] | undefined {
  const verses = section.body.find((p): p is VersesPrimitive => p.type === 'verses')
  const gloria = section.body.find((p): p is TextPrimitive => p.type === 'text')
  const at = primitives.findIndex((p) => p.type === 'verses')
  if (!verses || at === -1) return undefined
  const ours = primitives[at] as VersesPrimitive
  if (ours.items.length !== verses.items.length) return undefined
  const next = primitives.findIndex((p, i) => i > at && p.type === 'text')
  return primitives.map((p, i): Primitive => {
    if (i === at)
      return {
        ...ours,
        items: ours.items.map((item, k) => ({
          ...item,
          text: withSecondary(item.text, verses.items[k].text.primary.replace(/^\+\s*/, '')),
        })),
      }
    if (i === next && gloria && p.type === 'text')
      return { ...p, text: withSecondary(p.text, gloria.text.primary) }
    return p
  })
}

/** A responsory, versicle for versicle where both have as many. */
function pairResponsory(primitives: Primitive[], section: LatinSection): Primitive[] | undefined {
  // The Latin prints the response said twice as two lines of one versicle,
  // and a versicle's closing response ("* Allelúia") on a line of its own.
  const said = section.body.flatMap((p): string[] => {
    if (p.type === 'text') return [p.text.primary.trim()]
    if (p.type !== 'verses') return []
    return p.items.flatMap((item) =>
      item.text.primary
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .reduce<string[]>((lines, line) => {
          // A response repeated is its own line; the end of one is not.
          const before = lines[lines.length - 1]
          const ends =
            before !== undefined &&
            line !== before &&
            (line.startsWith('*') || before.endsWith('*'))
          if (ends) lines[lines.length - 1] = `${before} ${line}`
          else lines.push(line)
          return lines
        }, []),
    )
  })
  return zip(primitives, said) ?? asOne(primitives, said)
}

// The Latin beside the part's first line, whole, where the two are not cut alike.
function asOne(primitives: Primitive[], latin: string[]): Primitive[] | undefined {
  const at = primitives.findIndex(
    (p) => (p.type === 'verses' || p.type === 'text') && !isCitation(p),
  )
  if (at === -1 || latin.length === 0) return undefined
  const joined = latin.join('\n')
  return primitives.map((p, i): Primitive => {
    if (i !== at) return p
    if (p.type === 'text') return { ...p, text: withSecondary(p.text, joined) }
    if (p.type === 'verses')
      return {
        ...p,
        items: p.items.map((item, k) =>
          k === 0 ? { ...item, text: withSecondary(item.text, joined) } : item,
        ),
      }
    return p
  })
}

/** The Latin of one part, or nothing where the two cannot be laid side by side. */
function pairPart(
  slot: string,
  primitives: Primitive[],
  section: LatinSection,
): Primitive[] | undefined {
  const base = baseOf(slot)
  if (base === 'intro') return pairIntro(primitives, section)
  if (base === 'conclusion' || base === 'verse') return zip(primitives, latinTexts(section.body))
  if (isAntiphon(base)) return pairAntiphon(primitives, section)
  if (isPsalm(base)) return pairPsalm(primitives, section)
  if (base === 'reading' || /^reading-\d+$/.test(base)) return pairReading(primitives, section)
  if (base === 'responsory' || /^responsory-\d+$/.test(base))
    return pairResponsory(primitives, section)
  if (base === 'intercessions') return pairIntercessions(primitives, section)
  if (base === 'prayer') return pairFirst(primitives, latinTexts(section.body).slice(0, 1))
  if (base === 'hymn') return pairHymn(primitives, section)
  return undefined
}

/**
 * A hymn the book leaves to choice (a little hour's two, Night Prayer's):
 * each beside the Latin hymn it renders, if one does.
 */
function pairHymnChoices(primitives: Primitive[], latin: LatinSection[]): Primitive[] | undefined {
  const hymns = latin.filter((section) => section.slot === 'hymn')
  let any = false
  const out = primitives.map((p): Primitive => {
    if (p.type !== 'container' || p.behavior.kind !== 'options') return p
    return {
      ...p,
      behavior: {
        ...p.behavior,
        options: p.behavior.options.map((option) => {
          const section = latinOf('hymn', option.children, hymns)
          const paired = section && pairHymn(option.children, section)
          if (paired) any = true
          return { ...option, children: paired ?? markMissing(option.children) }
        }),
      },
    }
  })
  return any ? out : undefined
}

const lineCount = (texts: string[]) =>
  texts.flatMap((t) => t.split('\n')).filter((l) => l.trim()).length

/**
 * A hymn, only where it is the Latin's in translation, and then stanza by
 * stanza: the Brazilian edition wrote some of its own, and its translations
 * keep the Latin's lines one for one, if not always its stanzas.
 */
function pairHymn(primitives: Primitive[], section: LatinSection): Primitive[] | undefined {
  const latin = latinTexts(section.body)
  const stanzas = primitives.filter((p): p is TextPrimitive => p.type === 'text')
  if (stanzas.length === 0 || lineCount(stanzas.map((s) => s.text.primary)) !== lineCount(latin))
    return undefined
  const lines = latin.flatMap((t) => t.split('\n')).filter((l) => l.trim())
  let at = 0
  return primitives.map((p): Primitive => {
    if (p.type !== 'text') return p
    const n = lineCount([p.text.primary])
    const own = lines.slice(at, at + n).join('\n')
    at += n
    return { ...p, text: withSecondary(p.text, own) }
  })
}

// A Latin prayer naming its saint ("beáti Bonaventúræ") is not a weekday's,
// whatever else agrees.
const namesASaint = (latin: string) =>
  /\b(beát[iaeæ]|beatórum|sanct[iaeæ]|sanctórum)\s+[A-ZÆ]/.test(
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
 * not one antiphon (iBreviary has been seen to keep the day before's).
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
  /\b(São|Santo|Santa|Santos|Santas|Beat[oa]|Nossa Senhora|Virgem)\b/.test(text)

export interface FormSlots<F extends string = string> {
  form: F
  slots: SlotPrimitives[]
}

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
    slots: f.slots.map(({ slot, primitives }) => {
      if (
        baseOf(slot) === 'hymn' &&
        primitives.some((p) => p.type === 'container' && p.behavior.kind === 'options')
      ) {
        const choices = proper(slot, primitives) ? pairHymnChoices(primitives, latin) : undefined
        return { slot, primitives: choices ?? markMissing(primitives) }
      }
      const section = latinOf(slot, primitives, latin, f.slots)
      if (!section) {
        const offered = latin.some((l) => l.slot === baseOf(slot))
        return {
          slot,
          primitives: offered && missing(baseOf(slot)) ? markMissing(primitives) : primitives,
        }
      }
      const verdict = anchored(slot, primitives, section)
      const base = baseOf(slot)
      // The psalmody's antiphons are a set: one found not the Latin's puts
      // them all in doubt.
      if (/^ant-/.test(base) && doubted.has(f)) return { slot, primitives: markMissing(primitives) }
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
      if (paired) return { slot, primitives: paired }
      return { slot, primitives: missing(base) ? markMissing(primitives) : primitives }
    }),
  }))
  return { forms: paired.map(oneLatinEach), latinOffice: reference?.form }
}

/**
 * An antiphon said twice in an office (before and after its psalm) is one
 * text: where the Latin set beside the two differs, iBreviary has printed
 * another antiphon for one of them, and neither is trusted.
 */
function oneLatinEach<F extends string>(office: FormSlots<F>): FormSlots<F> {
  // One antiphon however the edition points it the second time.
  const key = (text: string) => plain(text).join(' ')
  const latinOf = new Map<string, Set<string>>()
  for (const { slot, primitives } of office.slots) {
    if (!isAntiphon(baseOf(slot))) continue
    for (const p of primitives) {
      const text = p.type === 'verses' ? p.items[0]?.text : undefined
      if (text?.secondary)
        latinOf.set(
          key(text.primary),
          (latinOf.get(key(text.primary)) ?? new Set()).add(key(text.secondary)),
        )
    }
  }
  const conflicting = new Set([...latinOf].filter(([, l]) => l.size > 1).map(([pt]) => pt))
  if (conflicting.size === 0) return office
  return {
    ...office,
    slots: office.slots.map(({ slot, primitives }) => ({
      slot,
      primitives: primitives.map(
        (p): Primitive =>
          p.type === 'verses' && conflicting.has(key(p.items[0]?.text.primary ?? ''))
            ? {
                ...p,
                items: p.items.map((item) => ({
                  ...item,
                  text: { primary: item.text.primary, secondaryMissing: true },
                })),
              }
            : p,
      ),
    })),
  }
}

/**
 * The Invitatory with Psalm 94(95), the one the Latin edition prints: its
 * versicle and its strophes, which are every day's, and its antiphon, which
 * is the day's and is paired only where the Latin day is this office.
 */
export function pairInvitatory(
  primitives: Primitive[],
  section: LatinSection,
  antiphon: boolean,
): Primitive[] {
  const body = section.body
  const versicle = body.find((p): p is VersesPrimitive => p.type === 'verses')
  const afterAnt = body.findIndex(
    (p) => p.type === 'rubric' && /^Ant\.?$/.test(p.text.primary.trim()),
  )
  const latinAntiphon =
    afterAnt === -1 ? undefined : body.slice(afterAnt + 1).find((p) => p.type === 'text')
  const title = body.find((p) => p.type === 'rubric' && /^Psalmus 94/.test(p.text.primary))
  const subtitle = title?.type === 'rubric' ? title.text.primary.split('\n')[1]?.trim() : undefined
  const texts = body.filter((p): p is TextPrimitive => p.type === 'text' && p !== latinAntiphon)
  const lead = texts.find(
    (t) => !t.text.primary.includes('*') && /\(.*\d.*\)\.?$/.test(t.text.primary),
  )
  const latinStrophes = texts.filter((t) => t.text.primary.includes('*')).map((t) => t.text.primary)
  const ourStrophes = primitives.filter(isStrophe)
  const strophesAgree =
    ourStrophes.length === latinStrophes.length &&
    ourStrophes.every((t, i) => sameVerses(t.text.primary, latinStrophes[i]))
  const antiphonText = latinAntiphon?.type === 'text' ? latinAntiphon.text.primary : undefined
  return primitives.map((p, i): Primitive => {
    if (p.type === 'verses' && p.items.length === 2 && versicle?.items.length === 2)
      return {
        ...p,
        items: p.items.map((item, k) => ({
          ...item,
          text: withSecondary(item.text, versicle.items[k].text.primary),
        })),
      }
    if (p.type === 'verses' && p.items.length === 1 && antiphon && antiphonText)
      return {
        ...p,
        items: [{ ...p.items[0], text: withSecondary(p.items[0].text, antiphonText) }],
      }
    if (p.type !== 'text') return p
    if (isBold(p) && subtitle && isPsalmTitle(primitives[i - 1]))
      return { ...p, text: withSecondary(p.text, `**${subtitle}**`) }
    if (isItalicLead(p) && lead)
      return { ...p, text: withSecondary(p.text, epigraph(lead.text.primary)) }
    const at = ourStrophes.indexOf(p)
    if (at !== -1 && strophesAgree) return { ...p, text: withSecondary(p.text, latinStrophes[at]) }
    return p
  })
}

// Parts every Latin hour has and the reader would look for: where they are
// left unpaired, they say so. A psalm-prayer has no Latin in the typical
// edition, and is not marked.
const missing = (base: string) =>
  isAntiphon(base) ||
  isPsalm(base) ||
  ['hymn', 'reading', 'responsory', 'intercessions', 'prayer'].includes(base) ||
  /^(reading|responsory)-\d+$/.test(base)

function markMissing(primitives: Primitive[]): Primitive[] {
  return primitives.map((p): Primitive => {
    if (p.type === 'container' && p.behavior.kind === 'options')
      return {
        ...p,
        behavior: {
          ...p.behavior,
          options: p.behavior.options.map((o) => ({ ...o, children: markMissing(o.children) })),
        },
      }
    if (p.type === 'text' && !p.text.secondary)
      return { ...p, text: { ...p.text, secondaryMissing: true } }
    if (p.type === 'verses')
      return {
        ...p,
        items: p.items.map((item) =>
          item.text.secondary ? item : { ...item, text: { ...item.text, secondaryMissing: true } },
        ),
      }
    return p
  })
}
