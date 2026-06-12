// Port of LanguageTextTools.pm (the subset the Mass needs): prayer(),
// rubric(), translate() — keyed lookups over Ordo/Prayers.txt,
// Psalterium/Common/Rubricae.txt, and Psalterium/Common/Translate.txt, with
// the lang → fallback → Latin chain applied per name (not per file, unlike
// setupstring's section layering — the Perl loads each language's file
// separately and falls through at lookup time).

import { sessionWithLang } from '../kalendar/officestring'
import { type DoSession, type Sections, setupstring } from '../references/resolve'

export type TextTables = {
  prayer(name: string, lang: string): Promise<string>
  rubric(name: string, lang: string): Promise<string>
  prex(name: string, lang: string): Promise<string>
  translate(name: string, lang: string): Promise<string>
}

export function createTextTables(session: DoSession, missa: boolean): TextTables {
  const fallback = session.fallbackLang
  const cache = new Map<string, Promise<Sections>>()

  function load(lang: string, fname: string): Promise<Sections> {
    const key = `${lang}|${fname}`
    let hit = cache.get(key)
    if (!hit) {
      // The Perl loads each language layer separately (resolve@ default ALL,
      // but these files have no inclusions to speak of); the per-name chain
      // below does the fallback.
      hit = setupstring(sessionWithLang(session, lang), fname).then((s) => s ?? {})
      cache.set(key, hit)
    }
    return hit
  }

  const prayersFile = missa ? 'Ordo/Prayers' : 'Psalterium/Common/Prayers'

  async function lookup(file: string, name: string, lang: string): Promise<string | undefined> {
    for (const l of [lang, fallback, 'Latin']) {
      const sections = await load(l, file)
      const hit = sections[name]
      if (hit) return hit
    }
    return undefined
  }

  return {
    async prayer(name, lang) {
      return (await lookup(prayersFile, name, lang)) ?? name
    },
    async rubric(name, lang) {
      return (await lookup('Psalterium/Common/Rubricae', name, lang)) ?? name
    },
    async prex(name, lang) {
      return (await lookup('Psalterium/Special/Preces', name, lang)) ?? name
    },
    async translate(name, lang) {
      // translate() strips trailing whitespace and has no version key.
      let prefix = ''
      let n = name
      const m = /^([$&])/.exec(n)
      if (m) {
        prefix = m[1]
        n = n.slice(1)
      }
      if (/Latin/.test(lang)) {
        const latin = (await load('Latin', 'Psalterium/Common/Translate'))[n]
        return prefix + (latin?.replace(/\s*$/, '') || n)
      }
      const own = (await load(lang, 'Psalterium/Common/Translate'))[n]
      const fb = own || (await load(fallback, 'Psalterium/Common/Translate'))[n]
      const latin = fb || (await load('Latin', 'Psalterium/Common/Translate'))[n]
      return (prefix + (latin || n)).replace(/\s*$/, '')
    },
  }
}
