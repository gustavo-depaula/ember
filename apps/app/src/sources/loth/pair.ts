// The Latin of an hour set beside the Brazilian text, part by part. The two
// editions are cut differently below the part (the Brazilian psalter breaks a
// psalm into other strophes, numbers its verses, prints the Gloria inside the
// last strophe), so a part is paired line for line only where both sides have
// the same shape, and otherwise as one block beside one block.
//
// Which Latin is each part's is settled when the corpus is built
// (`scripts/loth/latin/`); here a part and its Latin are only laid side by side.

import type { Primitive, TextPrimitive, VersesPrimitive } from '@/content/primitives'

/**
 * A part of the Latin hour, cut by the titles the Latin edition prints: the
 * slot the Brazilian part it answers to has ('psalm-2', 'reading', 'prayer'…),
 * its title and name, and what is said under it.
 */
export interface LatinSection {
  slot: string
  // A psalm's title ("Psalmus 118 (119), 97-104"), a reading's citation.
  title?: string
  // A psalm's or canticle's own name, the second line of its title.
  subtitle?: string
  body: Primitive[]
}

// As the corpus keeps it: a text as a string, a versicle and its response as
// `v`, a red line as `r`.
export type StoredLine = string | { v: string[] } | { r: string }
export interface StoredLatin {
  slot: string
  title?: string
  subtitle?: string
  body: StoredLine[]
}
// The Latin of one bundle of parts, part for part (`null` where a part has no
// Latin original: a hymn of the Brazilian's own, a Brazilian saint's text).
export interface LatinBundle {
  id: string
  parts: (StoredLatin | null)[]
}

export function latinSection(stored: StoredLatin): LatinSection {
  return {
    ...stored,
    body: stored.body.map((line): Primitive => {
      if (typeof line === 'string') return { type: 'text', text: { primary: line } }
      if ('v' in line)
        return { type: 'verses', items: line.v.map((said) => ({ text: { primary: said } })) }
      return { type: 'rubric', text: { primary: line.r } }
    }),
  }
}

export function storedLatin(section: LatinSection): StoredLatin {
  return {
    slot: section.slot,
    ...(section.title ? { title: section.title } : {}),
    ...(section.subtitle ? { subtitle: section.subtitle } : {}),
    body: section.body.flatMap((p): StoredLine[] => {
      if (p.type === 'text') return [p.text.primary]
      if (p.type === 'verses') return [{ v: p.items.map((item) => item.text.primary) }]
      if (p.type === 'rubric') return [{ r: p.text.primary }]
      return []
    }),
  }
}

export interface SlotPrimitives {
  slot: string
  primitives: Primitive[]
  // Where the part is in the corpus, and each of its choices.
  ref?: string
  choiceRefs?: string[]
  // The Latin it was paired with: the part's, or each choice's.
  latin?: LatinSection
  latinChoices?: (LatinSection | undefined)[]
}

// A slot met twice in an hour is numbered by the corpus: 'ant-2~2'.
export const baseOf = (slot: string) => slot.replace(/~\d+$/, '')

export const isAntiphon = (slot: string) => /^(ant-\d+(-end)?|canticle-ant(-end)?)$/.test(slot)

export const isPsalm = (slot: string) => /^(psalm-\d+|canticle|te-deum)$/.test(slot)

// A citation as its numbers: "1.899" and "1899" are one number (the
// Brazilian sets a point in the thousands).
export const numbers = (text: string) =>
  (text.replace(/(\d)\.(\d{3})(?!\d)/g, '$1$2').match(/\d+/g) ?? []).map(Number).join('.')

// How much of a Portuguese text has a Latin word of the same root beside it:
// the two share their roots more than their spelling, so a word is matched to
// one that, both spelt alike (no accents, æ as e, ph as f, ti before a vowel
// as ci…), is close. Too weak to tell a translation from another text on its
// own; enough to tell which of two Latin texts a Portuguese one renders.
export const plain = (text: string) =>
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

export function textsOf(primitives: Primitive[]): string[] {
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

// Two citations of one text: the editions differ in the verses they list
// between (Cf. Ap 19, 1-2. 5-7 / Ap 19,1-7), never in where it begins and ends.
// A Father's text is cited by the edition it is read in, whose pages the two
// count a page apart; its work, book and chapter are what tell it.
export function sameCitation(ours: string, theirs: string, slot = ''): boolean {
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
export function latinTexts(primitives: Primitive[]): string[] {
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

export const isBold = (p: Primitive) =>
  p.type === 'text' && /^\*\*[^*].*\*\*$/.test(p.text.primary.trim())

export const isItalicLead = (p: Primitive) =>
  p.type === 'text' && /^\*[^*]/.test(p.text.primary.trim()) && !p.text.primary.includes('\n')

// A strophe is lines pointed with the asterisk at the half-verse; the
// asterisks of italics stand against a word.
const isStrophe = (p: Primitive): p is TextPrimitive =>
  p.type === 'text' &&
  p.text.primary.includes('\n') &&
  /[*†][ \t]*(\n|$)/.test(p.text.primary.replace(/\/:(.*?):\//g, '$1'))

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
  const [invitation, response, ...lines] = latinTexts(section.body)
  if (!response) return undefined
  // iBreviary may print the response again after each petition, and may set
  // a petition's second half ("— virtútem et patiéntiam concéde.") apart
  // from its first.
  const petitions = lines
    .filter((line) => line !== response)
    .reduce<string[]>(
      (all, line) =>
        /^[—–-]/.test(line) && all.length && !all[all.length - 1].includes('\n')
          ? [...all.slice(0, -1), `${all[all.length - 1]}\n${line}`]
          : [...all, line],
      [],
    )
  const ours = primitives.filter(
    (p): p is TextPrimitive => p.type === 'text' && !/^Pai nosso/.test(p.text.primary),
  )
  const [lead, ...asked] = ours
  // The invitation comes before the first response; the petitions are one
  // for one, or half for half where the Brazilian sets each half apart, or
  // the two are not laid side by side at all.
  const firstResponse = primitives.findIndex((p) => p.type === 'verses')
  const halves = petitions.flatMap((petition) => petition.split('\n'))
  const theirs = [petitions, halves].find((list) => list.length === asked.length)
  if (!lead || primitives.indexOf(lead) > firstResponse || !theirs) return undefined
  return primitives.map((p): Primitive => {
    if (p === lead) return { ...p, text: withSecondary(lead.text, invitation) }
    if (p.type === 'verses')
      return {
        ...p,
        items: p.items.map((item) => ({ ...item, text: withSecondary(item.text, response) })),
      }
    const i = asked.indexOf(p as TextPrimitive)
    if (i !== -1 && p.type === 'text') return { ...p, text: withSecondary(p.text, theirs[i]) }
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
export function pairPart(
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

export const lineCount = (texts: string[]) =>
  texts.flatMap((t) => t.split('\n')).filter((l) => l.trim()).length

/**
 * A hymn, only where it is the Latin's in translation, and then stanza by
 * stanza: the Brazilian edition wrote some of its own, and its translations
 * keep the Latin's lines one for one, if not always its stanzas.
 */
export function pairHymn(primitives: Primitive[], section: LatinSection): Primitive[] | undefined {
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

export interface FormSlots<F extends string = string> {
  form: F
  slots: SlotPrimitives[]
}

/**
 * An antiphon said twice in an office (before and after its psalm) is one
 * text: where the Latin set beside the two differs, iBreviary has printed
 * another antiphon for one of them, and neither is trusted.
 */
export function oneLatinEach<F extends string>(office: FormSlots<F>): FormSlots<F> {
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
  antiphon = true,
): Primitive[] {
  // Where the Brazilian offers its antiphon in two forms, the psalm is in each,
  // a strophe at a time: the strophes are laid beside the Latin's together.
  const strophes: TextPrimitive[] = []
  const gather = (list: Primitive[]) => {
    for (const p of list) {
      if (isStrophe(p) && !/^Demos glória/.test(p.text.primary.trim()) && !strophes.includes(p))
        strophes.push(p)
      if (p.type === 'container') {
        if (p.behavior.kind === 'options' || p.behavior.kind === 'select')
          for (const o of p.behavior.options) gather(o.children)
        else gather(p.children ?? [])
      }
    }
  }
  gather(primitives)
  return pairedIn(primitives, (children) =>
    pairInvitatoryHere(children, section, antiphon, strophes),
  )
}

function pairedIn(
  primitives: Primitive[],
  pair: (children: Primitive[]) => Primitive[],
): Primitive[] {
  return pair(primitives).map((p): Primitive => {
    if (p.type !== 'container') return p
    if (p.behavior.kind === 'options' || p.behavior.kind === 'select')
      return {
        ...p,
        behavior: {
          ...p.behavior,
          options: p.behavior.options.map((o) => ({ ...o, children: pairedIn(o.children, pair) })),
        },
      } as Primitive
    return p.children ? { ...p, children: pairedIn(p.children, pair) } : p
  })
}

function pairInvitatoryHere(
  primitives: Primitive[],
  section: LatinSection,
  antiphon: boolean,
  ourStrophes: TextPrimitive[],
): Primitive[] {
  const body = section.body
  const versicle = body.find((p): p is VersesPrimitive => p.type === 'verses')
  const afterAnt = body.findIndex(
    (p) => p.type === 'rubric' && /^Ant\.?$/.test(p.text.primary.trim()),
  )
  const latinAntiphon =
    afterAnt === -1 ? undefined : body.slice(afterAnt + 1).find((p) => p.type === 'text')
  const title = body.find((p) => p.type === 'rubric' && /^Psalmus \d/.test(p.text.primary))
  const subtitle = title?.type === 'rubric' ? title.text.primary.split('\n')[1]?.trim() : undefined
  const texts = body.filter((p): p is TextPrimitive => p.type === 'text' && p !== latinAntiphon)
  const lead = texts.find(
    (t) => !t.text.primary.includes('*') && /\(.*\d.*\)\.?$/.test(t.text.primary),
  )
  const latinStrophes = texts.filter((t) => t.text.primary.includes('*')).map((t) => t.text.primary)
  const strophesAgree =
    ourStrophes.length === latinStrophes.length &&
    ourStrophes.every((t, i) => sameVerses(t.text.primary, latinStrophes[i]))
  const beside = strophesAgree
    ? latinStrophes
    : byVerse(
        ourStrophes.map((t) => t.text.primary),
        latinStrophes,
      )
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
    if (at !== -1 && beside) return { ...p, text: withSecondary(p.text, beside[at]) }
    return p
  })
}

/**
 * The Latin psalm cut as the Brazilian's strophes are. The two point a verse
 * differently (three lines in the one, two half-verses in the other), but both
 * end a verse with a full stop: where each Brazilian strophe is one verse, a
 * Latin sentence goes beside each; where a strophe holds more, the sentences
 * go beside it that carry as many half-verses (an asterisk to each).
 */
function byVerse(ours: string[], latin: string[]): string[] | undefined {
  const gloria = latin.filter(isGloria).join('\n')
  const sentences = latin
    .filter((t) => !isGloria(t))
    .join('\n')
    .split(/(?<=[.!?»][»"]?)\n/)
    .map((v) => v.trim())
    .filter(Boolean)
  const said = ours.filter((t) => !isGloria(t))
  const groups: string[][] = []
  if (sentences.length === said.length) groups.push(...sentences.map((v) => [v]))
  else {
    let at = 0
    for (const strophe of said) {
      const group: string[] = []
      while (at < sentences.length && group.reduce((n, v) => n + stars(v), 0) < stars(strophe))
        group.push(sentences[at++])
      if (group.reduce((n, v) => n + stars(v), 0) !== stars(strophe)) return undefined
      groups.push(group)
    }
    if (at !== sentences.length) return undefined
  }
  let next = 0
  return ours.map((t) => (isGloria(t) ? gloria : groups[next++].join('\n')))
}

// Parts every Latin hour has and the reader would look for: where they are
// left unpaired, they say so. A psalm-prayer has no Latin in the typical
// edition, and is not marked.
export const missing = (base: string) =>
  isAntiphon(base) ||
  isPsalm(base) ||
  ['hymn', 'reading', 'responsory', 'intercessions', 'prayer'].includes(base) ||
  /^(reading|responsory)-\d+$/.test(base)

export function markMissing(primitives: Primitive[]): Primitive[] {
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
