import type { Primitive, TextPrimitive, VersesPrimitive } from '@/content/primitives'
import type { IbLang } from './config'

// Bilingual pairing: attach a second edition's text as `secondary` on the
// primary edition's primitives, so BilingualBlock's side-by-side and
// tap-to-switch modes work on the office.
//
// The editions chunk the same office into incompatible HTML, so alignment
// never looks at markup — it walks the liturgy's own skeleton, which is
// invariant across languages: sections (hymn, psalmody, reading, …) are
// recognized from each edition's label rubrics, runs inside a section are
// tagged by the rubric that introduces them (antiphon, psalm body), and only
// confidently matched runs are paired. Anything that doesn't align — edition-
// only inserts like EN Psalm Prayers, stage directions, alternative prayers —
// simply stays primary-only. Wrong-pairing is the only failure mode this
// design forbids; missing-pairing is always acceptable.

// — section recognition —

// First-line prefixes of the rubrics that open each canonical section, per
// edition. Unrecognized rubrics never switch sections, so editions with
// fewer labels (PT has no INVITATORY/DISMISSAL headers) stay aligned on the
// sections they do share. EN TE DEUM maps to 'hymn' because PT/LA introduce
// the Te Deum with their plain hymn label, keeping the OOR sequence aligned.
const sectionPrefixes: [string, Record<IbLang, string[]>][] = [
  ['opening', { en: ['INTRODUCTION'], pt: [], la: [] }],
  ['invitatory', { en: ['INVITATORY'], pt: [], la: ['AD INVITATORIUM'] }],
  ['hymn', { en: ['HYMN', 'TE DEUM'], pt: ['HINO'], la: ['HYMNUS'] }],
  ['psalmody', { en: ['PSALMODY'], pt: ['SALMODIA'], la: ['PSALMODIA'] }],
  ['readings', { en: ['READINGS'], pt: [], la: ['LECTIONES'] }],
  ['first-reading', { en: ['FIRST READING'], pt: ['PRIMEIRA LEITURA'], la: ['LECTIO PRIOR'] }],
  ['second-reading', { en: ['SECOND READING'], pt: ['SEGUNDA LEITURA'], la: ['LECTIO ALTERA'] }],
  ['reading', { en: ['READING'], pt: ['LEITURA BREVE'], la: ['LECTIO BREVIS'] }],
  ['responsory', { en: ['RESPONSORY'], pt: ['RESPONSÓRIO'], la: ['RESPONSORIUM'] }],
  [
    'gospel-canticle',
    { en: ['GOSPEL CANTICLE'], pt: ['CÂNTICO EVANGÉLICO'], la: ['CANTICUM EVANGELICUM'] },
  ],
  ['intercessions', { en: ['INTERCESSIONS'], pt: ['PRECES'], la: ['PRECES'] }],
  ['pater', { en: ['THE LORD’S PRAYER'], pt: [], la: ['PATER NOSTER'] }],
  ['oration', { en: ['CONCLUDING PRAYER'], pt: ['ORAÇÃO'], la: ['ORATIO'] }],
  ['dismissal', { en: ['DISMISSAL', 'ACCLAMATION'], pt: [], la: [] }],
  [
    'marian-anthem',
    { en: ['ANTIPHON IN HONOR'], pt: ['ANTÍFONA DE NOSSA SENHORA'], la: ['ANTIPHONÆ FINALES'] },
  ],
]

function sectionOf(label: string, ibLang: IbLang): string | undefined {
  const upper = label.toUpperCase()
  // Longest prefix wins so READINGS isn't swallowed by READING.
  let best: { id: string; len: number } | undefined
  for (const [id, prefixes] of sectionPrefixes) {
    for (const prefix of prefixes[ibLang]) {
      if (upper.startsWith(prefix) && (!best || prefix.length > best.len)) {
        best = { id, len: prefix.length }
      }
    }
  }
  return best?.id
}

// — run tagging —

// A run is the pairable content following one rubric. Only structurally
// parallel tags pair across editions; 'skip' marks edition-only inserts and
// stage directions whose cross-edition order is not trustworthy.
type RunTag = 'lead' | 'ant' | 'title' | 'skip'

const titleRe =
  /^(PSALM|SALMO|PSALMUS|CANTICLE|CÂNTICO|CANTICUM|BENEDICTUS|MAGNIFICAT|NUNC|[IVX]+\.?$)/

function runTagOf(label: string): RunTag {
  const upper = label.toUpperCase()
  // Edition-only inserts — checked before the title regex, which would
  // otherwise claim "PSALM PRAYER" via its ^PSALM prefix and shift every
  // following run's alignment.
  if (/^PSALM PRAYER/.test(upper) || upper.startsWith('[ET]')) return 'skip'
  if (/^ANT\b/.test(upper)) return 'ant'
  if (titleRe.test(upper)) return 'title'
  return 'skip'
}

type Run = { tag: RunTag; prims: (TextPrimitive | VersesPrimitive)[] }
type Section = { id: string; runs: Run[] }

const isPairable = (p: Primitive): p is TextPrimitive | VersesPrimitive =>
  p.type === 'text' || p.type === 'verses'

export function segment(primitives: Primitive[], ibLang: IbLang): Section[] {
  const sections: Section[] = [{ id: 'opening', runs: [] }]
  let tag: RunTag = 'lead'
  let run: Run | undefined
  for (const p of primitives) {
    if (p.type === 'rubric') {
      const label = p.text.primary.split('\n')[0]
      const sectionId = sectionOf(label, ibLang)
      run = undefined
      if (sectionId) {
        sections.push({ id: sectionId, runs: [] })
        tag = 'lead'
      } else {
        tag = runTagOf(label)
      }
      continue
    }
    if (!isPairable(p)) {
      run = undefined
      continue
    }
    if (!run) {
      run = { tag, prims: [] }
      sections[sections.length - 1].runs.push(run)
    }
    run.prims.push(p)
  }
  return sections
}

// — within-run pairing —

// Every psalm verse carries exactly one mediant star, in every edition — the
// one layout invariant that survives the editions' different stanza chunking
// and flexa placement. A verse unit starts at a star-bearing line, or at an
// unindented flexa line (EN/LA open flexed verses with "…; †" before the
// star — PT instead indents flexa continuations, which attach backward).
// Everything star-less and unindented-†-less attaches to the current unit.
const hasStar = (line: string) => line.includes('*')
const opensFlexedVerse = (line: string) => /†\s*$/.test(line) && !line.startsWith('  ')

function verseUnits(lines: string[]): string[][] {
  const units: string[][] = []
  let unit: string[] = []
  for (const line of lines) {
    if (unit.some(hasStar) && (hasStar(line) || opensFlexedVerse(line))) {
      units.push(unit)
      unit = []
    }
    unit.push(line)
  }
  if (unit.length > 0) units.push(unit)
  return units
}

// Editions disagree on printing the Gloria Patri inside psalm bodies (LA
// always, EN as its own stanza, PT not at all) — split it off and pair it
// separately so it never throws off the verse counts.
const gloriaRe = /^\s*(glória patri|glory to the father|glória ao pai)/i

function splitGloria(units: string[][]): { body: string[][]; gloria: string[][] } {
  // The gloria opens at most two units from the end (its "Sicut erat…"
  // second half is a unit of its own and doesn't match the regex).
  for (let i = units.length - 1; i >= 0 && i >= units.length - 2; i--) {
    if (gloriaRe.test(units[i][0])) return { body: units.slice(0, i), gloria: units.slice(i) }
  }
  return { body: units, gloria: [] }
}

function setSecondary(p: TextPrimitive, secondary: string) {
  p.text.secondary = secondary
}

const isGloriaStanza = (p: TextPrimitive) => gloriaRe.test(p.text.primary)

function pairTexts(primary: TextPrimitive[], secondary: TextPrimitive[]) {
  // The editions even versify psalms differently (PT counts 5 mediants in
  // Ps 93 where LA counts 6), but they break stanzas at the same sense
  // units — so stanza-count equality, with the Gloria Patri stanza split
  // off (LA always prints it, PT never), is the strongest signal.
  const pGloria = primary.length > 0 && isGloriaStanza(primary[primary.length - 1])
  const sGloria = secondary.length > 0 && isGloriaStanza(secondary[secondary.length - 1])
  const pBody = pGloria ? primary.slice(0, -1) : primary
  const sBody = sGloria ? secondary.slice(0, -1) : secondary
  if (pGloria && sGloria) {
    setSecondary(primary[primary.length - 1], secondary[secondary.length - 1].text.primary)
  }
  if (pBody.length === sBody.length) {
    for (let i = 0; i < pBody.length; i++) {
      setSecondary(pBody[i], sBody[i].text.primary)
    }
    return
  }
  // Stanza chunking differs — regroup the secondary's verse units to match
  // the primary's per-stanza counts. Bail (no pairing) unless body totals
  // agree: a wrong pairing is worse than none.
  const sSplit = splitGloria(verseUnits(sBody.flatMap((s) => s.text.primary.split('\n'))))
  const perStanza = pBody.map((p) => verseUnits(p.text.primary.split('\n')).length)
  if (perStanza.reduce((a, b) => a + b, 0) !== sSplit.body.length) return
  let next = 0
  for (let i = 0; i < pBody.length; i++) {
    const group = sSplit.body.slice(next, next + perStanza[i])
    next += perStanza[i]
    setSecondary(pBody[i], group.flat().join('\n'))
  }
}

function pairVerses(primary: VersesPrimitive[], secondary: VersesPrimitive[]) {
  if (primary.length !== secondary.length) return
  for (let i = 0; i < primary.length; i++) {
    const p = primary[i]
    const s = secondary[i]
    if (p.items.length !== s.items.length) continue
    for (let j = 0; j < p.items.length; j++) {
      p.items[j].text.secondary = s.items[j].text.primary
    }
  }
}

function pairRun(primary: Run, secondary: Run) {
  const pItalic = primary.prims.filter((p) => p.type === 'text' && p.style === 'italic')
  const sItalic = secondary.prims.filter((p) => p.type === 'text' && p.style === 'italic')
  if (pItalic.length === 1 && sItalic.length === 1) {
    setSecondary(pItalic[0] as TextPrimitive, (sItalic[0] as TextPrimitive).text.primary)
  }
  pairTexts(
    primary.prims.filter((p): p is TextPrimitive => p.type === 'text' && p.style !== 'italic'),
    secondary.prims.filter((p): p is TextPrimitive => p.type === 'text' && p.style !== 'italic'),
  )
  pairVerses(
    primary.prims.filter((p): p is VersesPrimitive => p.type === 'verses'),
    secondary.prims.filter((p): p is VersesPrimitive => p.type === 'verses'),
  )
}

// — alignment —

const pairableTags = new Set<RunTag>(['lead', 'ant', 'title'])

function pairSection(primary: Section, secondary: Section) {
  const pRuns = primary.runs.filter((r) => pairableTags.has(r.tag))
  const sRuns = secondary.runs.filter((r) => pairableTags.has(r.tag))
  let j = 0
  for (const run of pRuns) {
    // In-order: find this tag's next occurrence on the secondary side. Runs
    // the secondary doesn't have stay primary-only; secondary-only runs are
    // skipped over.
    const match = sRuns.findIndex((s, k) => k >= j && s.tag === run.tag)
    if (match === -1) continue
    pairRun(run, sRuns[match])
    j = match + 1
  }
}

// Mutates `primary` in place (sets `secondary` on its bilingual texts) and
// returns it.
export function pairEditions(
  primary: Primitive[],
  secondary: Primitive[],
  primaryLang: IbLang,
  secondaryLang: IbLang,
): Primitive[] {
  const pSections = segment(primary, primaryLang)
  const sSections = segment(secondary, secondaryLang)
  let j = 0
  for (const section of pSections) {
    const match = sSections.findIndex((s, k) => k >= j && s.id === section.id)
    if (match === -1) continue
    pairSection(section, sSections[match])
    j = match + 1
  }
  return primary
}
