// Port of SetupString.pl::setupstring and friends: section selection +
// conditional processing per language file, per-section language layering
// (requested → fallback → Latin), whole-file @-preamble inheritance,
// @file:section:subs inclusion resolution with the Paschaltide commons
// redirect, and the missa→horas / Cist→M→Roman directory fallbacks.
// Translated control-flow-faithfully — data files depend on the exact order.

import type { RubricContext } from '../conditions/context'
import { processConditionalLines, vero } from '../conditions/evaluate'
import type { DoLoader } from '../loader'
import type { SectionedDoFile } from '../parser/sectioned'
import { splitRank } from '../rules'
import { isSectioned } from '../types'
import { applyInclusionSubstitutions } from './substitutions'

export type DoArea = 'horas' | 'missa'

// Flattened file: section name → processed text (newline-joined, trailing \n).
export type Sections = Record<string, string>

export type DoSession = {
  loader: DoLoader
  ctx: RubricContext
  area: DoArea
  // DO language dir of the user's content language ('Portugues', 'English', …).
  lang: string
  // DO's $main::langfb — the intermediate fallback before Latin.
  fallbackLang: string
  // Per-version+context caches (a session is scoped to one date+version+hora).
  sectionCache: Map<string, Promise<Sections | undefined>>
  latinNameCache: Map<string, string>
}

export function createSession(init: {
  loader: DoLoader
  ctx: RubricContext
  area: DoArea
  lang: string
  fallbackLang?: string
}): DoSession {
  return {
    loader: init.loader,
    ctx: init.ctx,
    area: init.area,
    lang: init.lang,
    fallbackLang: init.fallbackLang ?? 'English',
    sectionCache: new Map(),
    latinNameCache: new Map(),
  }
}

export type ResolveMode = 'none' | 'wholefile' | 'all'

// Port of $InclusionRegex, applied per line.
const inclusionLineRegex = /^\s*@([^\n:]+)?(?::([^\n:]+?))?[^\S\n\r]*(?::(.*))?$/

// Port of checklatinfile: when the Latin file is missing, redirect order-
// specific directories (Cist → M, M/OP → Roman) so vernacular lookups follow.
async function checkLatinFile(session: DoSession, fname: string): Promise<string> {
  const cached = session.latinNameCache.get(fname)
  if (cached !== undefined) return cached

  let result = fname
  const { loader } = session
  if (
    !(await loader.exists(`${session.area}/Latin/${fname}`)) &&
    !(await loader.exists(`horas/Latin/${fname}`))
  ) {
    const cist = fname.replace(/(Sancti|Tempora|Commune)(?:Cist)(.*)/, '$1M$2')
    if (cist !== fname && (await loader.exists(`${session.area}/Latin/${cist}`))) {
      result = cist
    } else {
      const roman = fname.replace(/(Sancti|Tempora|Commune)(?:M|OP)(.*)/, '$1$2')
      if (roman !== fname && (await loader.exists(`${session.area}/Latin/${roman}`))) {
        result = roman
      }
    }
  }
  session.latinNameCache.set(fname, result)
  return result
}

// Section selection + conditional processing for one parsed language file.
// Mirrors setupstring_parse_file: header conditions are evaluated in file
// order (last true section of a name wins via overwrite), @-lines get their
// file/section defaults filled, then the conditional scope machine runs and
// each section is flattened to newline-joined text with a trailing newline.
function flattenFile(file: SectionedDoFile, fname: string, ctx: RubricContext): Sections {
  const out: Sections = {}
  for (const section of file.sections) {
    if (section.condition && !vero(section.condition, ctx)) continue
    const normalized =
      section.name === '__preamble'
        ? section.lines
        : section.lines.map((line) => {
            if (!line.startsWith('@')) return line
            const m = inclusionLineRegex.exec(line)
            if (!m) return line
            return `@${m[1] || fname}:${m[2] || section.name}${m[3] ? `:${m[3]}` : ''}`
          })
    out[section.name] = `${[...processConditionalLines(normalized, ctx), ''].join('\n')}`
  }
  out.__preamble ??= ''
  return out
}

// Port of setupstring()'s layered load (without @-resolution): requested
// language sections over fallback over Latin, with the Rank/Officium merge
// safeguard. Returns undefined when nothing exists in any language.
async function loadLayered(
  session: DoSession,
  lang: string,
  fname: string,
): Promise<Sections | undefined> {
  let area = session.area
  let effLang = lang

  // Monastic Evangelium lookups pass '../missa/<Lang>'.
  const missaIdx = effLang.indexOf('../missa')
  if (missaIdx >= 0) {
    effLang = effLang.slice(missaIdx + 9)
    area = 'missa'
  }

  const effFname = await checkLatinFile(session, fname)

  // missa reads comments and Commune files from the horas tree, and falls back
  // to horas when the missa file doesn't exist anywhere.
  let effArea = area
  if (
    area === 'missa' &&
    (/Comment$|C\d/.test(effFname) ||
      (!(await session.loader.exists(`${area}/${effLang}/${effFname}`)) &&
        (await session.loader.exists(`horas/${effLang}/${effFname}`))))
  ) {
    effArea = 'horas'
  }

  const cacheKey = `${session.ctx.version}|${effArea}|${effLang}|${effFname}`
  const cached = session.sectionCache.get(cacheKey)
  if (cached) return cached

  const promise = (async (): Promise<Sections | undefined> => {
    let base: Sections = { __preamble: '' }
    if (effLang === session.fallbackLang) {
      base = (await loadLayered(
        session,
        lang.includes('../missa') ? '../missa/Latin' : 'Latin',
        fname,
      )) ?? {
        __preamble: '',
      }
    } else if (effLang.includes('-')) {
      base = (await loadLayered(session, effLang.replace(/-[^-]+$/, ''), fname)) ?? {
        __preamble: '',
      }
    } else if (effLang && effLang !== 'Latin') {
      const fb = lang.includes('../missa')
        ? `../missa/${session.fallbackLang}`
        : session.fallbackLang
      base = (await loadLayered(session, fb, fname)) ?? { __preamble: '' }
    }

    const parsed = await session.loader.load(`${effArea}/${effLang}/${effFname}`)
    let merged: Sections
    if (parsed && isSectioned(parsed) && parsed.sections.length > 0) {
      merged = flattenFile(parsed, effFname, session.ctx)

      // Pre-Urban hymn fill: vernacular Hymnus also serves as HymnusM.
      if (!/^Latin(?:-gabc)?$/.test(effLang)) {
        for (const key of Object.keys(merged)) {
          const m = /^Hymnus (.*)/.exec(key)
          if (m && merged[`HymnusM ${m[1]}`] === undefined) {
            merged[`HymnusM ${m[1]}`] = merged[key]
          }
        }
      }

      if (merged.__preamble !== (base.__preamble ?? '')) {
        merged.__preamble = `${merged.__preamble}\n${base.__preamble ?? ''}`
      }
      for (const key of Object.keys(base)) {
        if (!merged[key]) merged[key] = base[key]
      }

      // Rank consistency: ranking always comes from Latin; vernacular may
      // override the office title via [Officium].
      const baseRank = splitRank(base.Rank)
      if (baseRank.length > 0) {
        const newRank = splitRank(merged.Rank)
        const office = (merged.Officium ?? '').replace(/\s+$/, '')
        baseRank[0] = office || newRank[0] || ''
        merged.Rank = baseRank.join(';;')
      } else if (merged.Officium !== undefined) {
        const newRank = splitRank(merged.Rank)
        newRank[0] = merged.Officium.replace(/\s+$/, '')
        merged.Rank = newRank.join(';;')
      }
    } else {
      merged = base
    }

    const hasContent = Object.keys(merged).some((k) => k !== '__preamble' || merged[k])
    if (!hasContent) return undefined
    return merged
  })()

  session.sectionCache.set(cacheKey, promise)
  return promise
}

// Port of get_loadtime_inclusion.
async function loadtimeInclusion(
  session: DoSession,
  sections: Sections,
  ftitle: string,
  sectionName: string,
  substitutions: string,
  callerFname: string,
): Promise<string> {
  let file = ftitle

  // Offices of apostles & martyrs in Paschaltide use the special common
  // (C1p/C2p…), except the sections partially copied from outside Paschaltide
  // (guard against infinite loops, upstream #525).
  if (
    session.ctx.dayname[0].includes('Pasc') &&
    !session.ctx.missa &&
    !/C[123]/.test(callerFname) &&
    !/Hymnus|Oratio|Lectio|Secreta|Postcommunio|Versum/i.test(sectionName)
  ) {
    file = file.replace(/(C[123][abcd]*)(?![p\d])/g, '$1p')
  }

  const inclFile = file ? await setupstring(session, file, { resolve: 'wholefile' }) : sections
  let text = inclFile?.[sectionName]
  if (text !== undefined) text = text.replace(/\n+$/, '\n')
  if (text) return applyInclusionSubstitutions(text, substitutions)
  return `${file}:${sectionName} is missing!`
}

// Port of $InclusionRegex applied to whole section text: with /m the leading
// \s* may consume preceding blank lines, and the trailing \n? eats the
// @-line's newline, so the resolved text glues directly to what follows.
const inclusionTextRegex = /^\s*@([^\n:]+)?(?::([^\n:]+?))?[^\S\n\r]*(?::(.*))?$\n?/gm

async function replaceAsync(
  text: string,
  regex: RegExp,
  fn: (m: RegExpExecArray) => Promise<string>,
): Promise<string> {
  let result = ''
  let last = 0
  for (const m of text.matchAll(regex)) {
    result += text.slice(last, m.index) + (await fn(m as unknown as RegExpExecArray))
    last = m.index + m[0].length
  }
  return result + text.slice(last)
}

async function resolveInclusionsInText(
  session: DoSession,
  sections: Sections,
  key: string,
  fname: string,
): Promise<void> {
  let passes = 0
  while (sections[key].includes('@')) {
    let changed = false
    sections[key] = await replaceAsync(sections[key], inclusionTextRegex, async (m) => {
      changed = true
      return loadtimeInclusion(session, sections, m[1] ?? '', m[2] || key, m[3] ?? '', fname)
    })
    if (!changed) break
    if (passes++ > 6) {
      // Perl surfaces this in the rendered text; we keep the same behavior so
      // data errors are visible, not swallowed.
      sections[key] = 'Cannot resolve too deeply nested Hashes'
      break
    }
  }
}

export type SetupstringOptions = { resolve?: ResolveMode }

// Port of setupstring(): the public entry. fname is area-relative without
// extension ('Sancti/01-25', 'Psalterium/Common/Prayers'). Returns the
// flattened, layered, (optionally) inclusion-resolved sections.
export async function setupstring(
  session: DoSession,
  fname: string,
  opts: SetupstringOptions = {},
): Promise<Sections | undefined> {
  const resolve = opts.resolve ?? 'all'
  const loaded = await loadLayered(session, session.lang, fname)
  if (!loaded) return undefined

  const sections: Sections = { ...loaded }

  if (resolve !== 'none') {
    // Whole-file inclusions from the preamble (daisy-chained for Monastic).
    let guard = 0
    while (sections.__preamble?.includes('@') && guard++ < 20) {
      const match = sections.__preamble
        .split('\n')
        .map((l) => inclusionLineRegex.exec(l))
        .find((m) => m !== null)
      if (!match) break
      const inclFname = match[1] ?? ''
      sections.__preamble = sections.__preamble.replace(match[0], '')
      // Perl's cyclic check compares '<incl>.txt' against the full path —
      // the extension keeps 'C2' from false-matching inside 'C2a'.
      if (!inclFname || `${fname}.txt`.includes(`${inclFname}.txt`)) continue
      const incl = await setupstring(session, inclFname, { resolve: 'wholefile' })
      if (incl) {
        for (const key of Object.keys(incl)) {
          if (!sections[key]) sections[key] = incl[key]
        }
      }
    }
    delete sections.__preamble
  }

  if (resolve === 'all') {
    const keys = Object.keys(sections)
    const ordered = sections.Rule !== undefined ? ['Rule', ...keys] : keys
    for (const key of ordered) {
      if (sections[key] === undefined) continue
      const guardOk =
        (!key.includes('Commemoratio') &&
          (!(key.includes('LectioE') || key.includes('Evangelium')) ||
            sections[key].includes('Commune'))) ||
        session.ctx.missa ||
        session.area === 'missa'
      if (guardOk) {
        await resolveInclusionsInText(session, sections, key, fname)
      }
    }
  }

  // Safeguard [Rank]: changing Rank while inheriting Officium via inclusions.
  if (sections.Officium !== undefined) {
    sections.Officium = sections.Officium.replace(/\s+$/, '')
    if (sections.Rank !== undefined) {
      sections.Rank = sections.Rank.replace(/^.*?;;/, `${sections.Officium};;`)
    }
  }

  return sections
}
