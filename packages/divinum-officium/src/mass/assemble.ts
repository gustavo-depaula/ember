// Port of missa/ordo.pl + propers.pl::specials — the Mass assembly walk.
// getordinarium reads the version's Ordo script; specials() fills sections
// and runs hooks; the expansion pass resolves $/& references (resolve_refs'
// semantic half — the HTML half is replaced by the block mapper).

import { officestring } from '../kalendar/officestring'
import { type DayResolution, resolveDay } from '../kalendar/precedence'
import type { DoLoader } from '../loader'
import type { Sections } from '../references/resolve'
import { isSectioned } from '../types'
import { hooks, replaceNpb, scriptFunctions, translateLabel } from './handlers'
import { type MassState, winnerOf } from './state'
import { createTextTables } from './texts'

async function readScript(state: MassState, lang: string): Promise<string[]> {
  // Port of missa getordinarium: Propers.txt for propers-only; Ordo.txt
  // otherwise (Ordo67/NewMass variants are out of scope for v1). The file is
  // read raw (no conditional processing — the Mass Ordo has none) with the
  // language fallback chain of checkfile().
  const fname = state.propers ? 'Ordo/Propers' : 'Ordo/Ordo'
  for (const l of [lang, state.session.fallbackLang, 'Latin']) {
    const file = await state.session.loader.load(`missa/${l}/${fname}`)
    if (file) {
      const lines = isSectioned(file) ? file.sections.flatMap((s) => s.lines) : file.lines
      return [...lines]
    }
  }
  throw new Error(`cannot load ${fname} for ${lang}`)
}

// Port of propers.pl::specials().
async function specials(state: MassState, script: string[], lang: string): Promise<string[]> {
  state.s = []
  state.t = [...script]
  state.tind = 0

  while (state.tind < state.t.length) {
    let item = state.t[state.tind]

    if (/&communicantes/.test(item) && /Communicantes/.test(state.rule)) {
      const w = winnerOf(state, lang)
      item = w.Communicantes ?? ''
      while (state.tind < state.t.length && !/!!!/.test(state.t[state.tind])) state.tind++
      state.tind--
    }
    if (/N\.p/.test(item)) item = replaceNpb(item, state.pope, lang, 'p', 'o')
    if (/N\.b/.test(item)) item = replaceNpb(item, state.bishop, lang, 'b', 'o')
    state.tind++

    // Hooks (!&name): run and drop the line.
    const hookMatch = /^\s*!&([a-z]+)\s*$/im.exec(item)
    if (hookMatch) {
      const hook = hooks[hookMatch[1] as keyof typeof hooks]
      if (!hook) throw new Error(`unknown mass hook: ${hookMatch[1]}`)
      await hook(state)
      continue
    }

    // Conditional skip directives (!*…): skip to the next blank line.
    if (/^\s*!\*/.test(item)) {
      let skipflag = false
      // Perl items carry a trailing newline (getordinarium appends one), so
      // its `\s` matched at end-of-line; accept end-of-string too.
      const evalMatch = /!\*(&[a-z]+)(?:\s|$)/i.exec(item)
      if (evalMatch) {
        const hook = hooks[evalMatch[1].slice(1) as keyof typeof hooks]
        if (!hook) throw new Error(`unknown mass hook: ${evalMatch[1]}`)
        skipflag = Boolean(await hook(state))
      }
      if (/!\*[A-Z]*nD/.test(item) && /Defunct|C9/i.test(state.votive)) skipflag = true
      if (/!\*S/.test(item) && !state.solemn) skipflag = true
      if (/!\*R/.test(item) && state.solemn) skipflag = true
      if (/!\*D/.test(item) && !/Defunct|C9/i.test(state.votive)) skipflag = true

      if (skipflag) {
        while (state.tind < state.t.length && !/^\s*$/.test(state.t[state.tind])) state.tind++
        if (state.tind < state.t.length) continue
        break
      }
      continue
    }

    const sectionRegex = /^\s*#\s*(.*)/
    const sectionMatch = sectionRegex.exec(item)
    if (sectionMatch) {
      state.label = sectionMatch[1]
      if (
        new RegExp(`omit.*\\b${state.label}\\b`, 'i').test(state.rule) ||
        (/1570/.test(state.day.ctx.version) && /( Leo| Leó| Лева)/i.test(item))
      ) {
        // Skip omitted section.
        state.tind++
        while (state.tind < state.t.length && !sectionRegex.test(state.t[state.tind])) {
          state.tind++
        }
        // Perl increments before testing; our loop above starts after one
        // increment already — mirror by stepping back when we overshot to a
        // new section header (the while loop in Perl post-increments).
        // (Perl: `$tind++ while (...)` — identical net effect.)
      } else if (/^\s*Evangelium\s*$/.test(state.label) && /^\s*Passio\s*$/m.test(state.rule)) {
        state.s.push(`#${await translateLabel(state, state.label, lang)}`, '&evangelium')
        while (state.tind < state.t.length && !/^\s*$/.test(state.t[state.tind])) state.tind++
      } else {
        state.s.push(`#${await translateLabel(state, state.label, lang)}`)
      }
      continue
    }

    // Rubric lines pass through (rubrics always on in the engine).
    // Inline parens stay as rubric markers.
    state.s.push(item)
  }
  return state.s
}

// Expansion pass — the semantic half of resolve_refs: replace $/& lines by
// their expansions, recursively. Text-level transformations (fonts, br tags)
// are left to the block mapper.
async function expandItems(state: MassState, items: string[], lang: string): Promise<string[]> {
  const out: string[] = []
  for (const item of items) {
    out.push(await expandText(state, item, lang))
  }
  return out
}

async function expandText(state: MassState, text: string, lang: string): Promise<string> {
  const lines = text.split('\n')
  const out: string[] = []
  for (const raw of lines) {
    let line = raw.replace(/\s+$/, '')
    if (/^\s*[$&]/.test(line.trimStart()) && !/(callpopup|rubrics)/i.test(line)) {
      // resolve_refs strips dots from reference lines before expanding
      // ('$Per Dominum.' → the 'Per Dominum' prayer).
      line = line.replace(/\./g, '')
      const expanded = await expandLine(state, line.trim(), lang)
      if (/^\s*$/.test(expanded)) continue
      out.push(await expandText(state, expanded.replace(/\n$/, ''), lang))
    } else {
      out.push(line)
    }
  }
  return out.join('\n')
}

// Port of webdia.pl::expand for the missa context ($expand = 'all').
async function expandLine(state: MassState, lineIn: string, lang: string): Promise<string> {
  let line = lineIn
  const sigilMatch = /^([&$](?:rubrica |Preces )?)/.exec(line)
  if (!sigilMatch) return line
  const sigil = sigilMatch[1]
  line = line.slice(sigil.length)

  if (sigil === '&') {
    // Perl strips dots before dispatch.
    line = line.replace(/\./g, '')
    const m = /(.*?)(?:[(](.*)[)])?$/.exec(line)
    const name = m?.[1] ?? line
    const argString = m?.[2]
    const args: (string | number)[] = []
    if (argString !== undefined) {
      for (const part of argString.split(/,(?=(?:[^']|'[^']*')*$)/)) {
        const am = /'(.*)'|(-?\d+)/.exec(part)
        if (am) args.push(am[1] ?? Number(am[2]))
      }
    }
    const fn = scriptFunctions[name]
    if (!fn) throw new Error(`unknown mass script function: &${name}`)
    return await fn(state, lang, ...args)
  }
  if (sigil === '$rubrica ') {
    return `!${await state.texts.rubric(line, lang)}`
  }
  if (sigil === '$Preces ') {
    return line // Preces are an hours concern; not used by the Mass Ordo.
  }
  return state.texts.prayer(line, lang)
}

export type AssembledMass = {
  day: DayResolution
  // Expanded script items per column: '#Label' section heads + text chunks
  // ('!' rubric lines, 'V./R./S./M.' versicles, '(…)' inline rubrics, '_'
  // separators), in Ordo order.
  latin: string[]
  vernacular?: string[]
}

export async function assembleMass(opts: {
  loader: DoLoader
  day: number
  month: number
  year: number
  version: string
  lang2?: string // DO dir name ('English', 'Portugues'); omit for Latin-only
  solemn?: boolean
  propers?: boolean
}): Promise<AssembledMass> {
  const day = await resolveDay({
    loader: opts.loader,
    day: opts.day,
    month: opts.month,
    year: opts.year,
    version: opts.version,
    hora: '',
    missa: true,
    lang1: 'Latin',
  })

  const texts = createTextTables(day.state.session, true)
  const lang2 = opts.lang2 ?? 'Latin'

  // Runtime defaults from missa.setup ($pope='Leone,Leo', bishop placeholder).
  const setupDefaults: Record<string, string> = {}
  const setupFile = await opts.loader.load('missa/missa.setup')
  if (setupFile && isSectioned(setupFile)) {
    const params = setupFile.sections.find((s) => s.name === 'parameters')
    for (const line of params?.lines ?? []) {
      const m = /^\$(\w+)='(.*?)';;/.exec(line)
      if (m) setupDefaults[m[1]] = m[2]
    }
  }

  const state: MassState = {
    day,
    session: day.state.session,
    directorium: day.state.directorium,
    texts,
    lang1: 'Latin',
    lang2,
    only: lang2 === 'Latin',
    rubrics: true,
    solemn: opts.solemn ?? false,
    propers: opts.propers ?? false,
    votive: /Defunctorum/.test(day.winnerSections.Rank ?? '') ? 'Defunct' : '',
    pope: setupDefaults.pope ?? '',
    bishop: setupDefaults.bishop ?? '',
    column: 1,
    rule: day.rule,
    communerule: day.communerule,
    winner2: {},
    commemoratio2: {},
    commune2: {},
    scriptura2: {},
    cc: new Map(),
    ccind: 0,
    ctotalnum: 0,
    addconclusio: '',
    oremusflag: '',
    s: [],
    t: [],
    tind: 0,
    label: '',
  }

  // setsecondcol port: load the vernacular column's section hashes.
  if (!state.only) {
    if (day.winner) {
      state.winner2 =
        (await officestring(
          day.state,
          lang2,
          day.winner,
          /tempora/i.test(day.winner) && day.vespera === 1,
        )) ?? {}
    }
    if (day.commemoratio) {
      state.commemoratio2 =
        (await officestring(
          day.state,
          lang2,
          day.commemoratio,
          /tempora/i.test(day.commemoratio) && day.cvespera === 1,
        )) ?? {}
    }
    if (day.commune) {
      state.commune2 = (await officestring(day.state, lang2, day.commune)) ?? {}
    }
    if (day.scriptura) {
      state.scriptura2 = (await officestring(day.state, lang2, day.scriptura)) ?? {}
    }
  }

  // Perl order: specials → Prelude/Post-Missam splicing → resolve_refs
  // (expansion) at print time.
  state.column = 1
  const script1 = await readScript(state, 'Latin')
  let items1 = await specials(state, script1, 'Latin')
  applyPreludeRules(state, winnerOf(state, 'Latin'), items1)
  items1 = await renderFinish(state, await expandItems(state, items1, 'Latin'), 'Latin')

  let items2: string[] | undefined
  if (!state.only) {
    state.column = 2
    const script2 = await readScript(state, lang2)
    items2 = await specials(state, script2, lang2)
    applyPreludeRules(state, state.winner2, items2)
    items2 = await renderFinish(state, await expandItems(state, items2, lang2), lang2)
  }

  return { day, latin: items1, vernacular: items2 }
}

// Port of horascommon.pl::spell_var — version-dependent Latin orthography.
function spellVar(text: string, version: string): string {
  if (/196/.test(version)) {
    return text
      .replace(/[Jj]/g, (c) => (c === 'J' ? 'I' : 'i'))
      .replace(/H-Iesu/g, 'H-Jesu')
      .replace(/er eúmdem/g, 'er eúndem')
  }
  return text
    .replace(/Génetrix/g, 'Génitrix')
    .replace(/Genetrí/g, 'Genitrí')
    .replace(/\bco(t[ií]d[ií])/g, 'quo$1')
}

// Render-time text fixes from webdia.pl::setcell that carry meaning (the
// purely-typographic ones stay in the app's block mapper).
async function renderFinish(state: MassState, items: string[], lang: string): Promise<string[]> {
  const { ctx } = state.day
  let alleluiaRegex: RegExp | undefined
  if (/Quadp|Quad[1-5]|Quad6-[0-5]/i.test(ctx.dayname[0])) {
    const langs = ['Latin', state.lang1, state.lang2, state.session.fallbackLang]
    const texts = await Promise.all(langs.map((l) => state.texts.prayer('Alleluia', l)))
    const words = new Set<string>()
    for (const text of texts) {
      const word = text.replace(/^v\. (.*?)\..*/s, '$1')
      if (word) words.add(word.toLowerCase())
    }
    alleluiaRegex = new RegExp(`[,.]?\\s*(?:${[...words].join('|')}|allel[uú][ij]a)`, 'gi')
  }

  return items.map((itemIn) => {
    let item = itemIn
    if (alleluiaRegex) item = item.replace(alleluiaRegex, '')
    if (/Latin/.test(lang)) item = spellVar(item, ctx.version)
    item = item.replace(/wait[0-9]+/gi, '')
    item = item.replace(/\{:[\s\S]*?:\}/g, '')
    item = item.replace(/`/g, '')
    return item
  })
}

// Port of the Prelude / Post Missam rule handling in ordo().
function applyPreludeRules(state: MassState, w: Sections, items: string[]): void {
  let rule = state.rule
  if (/Full text/i.test(rule)) {
    items.length = 0
    rule = 'Prelude'
  }
  if (/prelude/i.test(rule)) {
    items.unshift(...(w.Prelude ?? '').split('_'), '')
  }
  if (/Post Missam/i.test(rule)) {
    items.push(...(w['Post Missam'] ?? '').split('_'))
  }
}
