// Port of specials/preces.pl: the feriales/dominicales decision and the
// Psalterium preces lookup.

import { emberday } from '../kalendar/occurrence'
import { num } from '../kalendar/state'
import { setup } from './proprium'
import type { HoursState } from './state'

// Port of checkcommemoratio (orationes.pl:7) — first '!'-line of the office's
// own Commemoratio section.
export function checkcommemoratio(sections: Record<string, string>): string {
  const text = sections['Commemoratio'] ?? sections['Commemoratio 2'] ?? ''
  const m = /^!(.*)/m.exec(text)
  return m ? m[1] : ''
}

// Port of preces($item) — returns true when the preces are to be said; sets
// state.precesferiales.
export async function preces(state: HoursState, item: string): Promise<boolean> {
  const ctx = state.day.ctx
  const { version, dayofweek } = ctx

  if (
    /C12/i.test(state.day.winner) ||
    /Omit.*? Preces/i.test(state.rule) ||
    state.day.duplex > 2 ||
    /Pasc[67]/i.test(ctx.dayname[0])
  ) {
    return false
  }

  state.precesferiales = false

  if (
    dayofweek &&
    !(dayofweek === 6 && /vespera/i.test(state.hora)) &&
    ((!/sancti/i.test(state.day.winner) &&
      (/Preces/i.test(state.rule) ||
        /Adv|Quad(?!p)/i.test(ctx.dayname[0]) ||
        emberday(state.day.state))) ||
      (!/1955|1960|Newcal/.test(version) &&
        /vigil/i.test(state.day.winnerSections.Rank ?? '') &&
        !/Epi|Pasc/i.test(ctx.dayname[1]))) &&
    (!/1955|1960|Newcal/.test(version) ||
      /[35]/.test(String(dayofweek)) ||
      emberday(state.day.state))
  ) {
    state.precesferiales = true
    return true
  }

  if (/Dominicales/i.test(item)) {
    let dominicales = true

    if (state.day.commemoratio) {
      const r = (state.day.commemoratioSections.Rank ?? '').split(';;')
      const ranklimit = /^Trident/.test(version) ? 7 : 3
      if (
        num(r[2]) >= ranklimit ||
        /Octav/i.test(state.day.commemoratioSections.Rank ?? '') ||
        /octav/i.test(checkcommemoratio(state.day.commemoratioSections))
      ) {
        dominicales = false
      } else {
        for (const commemo of state.day.commemoentries) {
          if (!commemo) continue
          const c = await setup(state, 'Latin', commemo)
          const cr = (c.Rank ?? '').split(';;')
          if (
            num(cr[2]) >= ranklimit ||
            /Octav/i.test(c.Rank ?? '') ||
            /octav/i.test(checkcommemoratio(c))
          ) {
            dominicales = false
          }
        }
      }
    }

    if (
      dominicales &&
      (!/octav/i.test(state.day.winnerSections.Rank ?? '') ||
        /post octav/i.test(state.day.winnerSections.Rank ?? '')) &&
      !/Octav/i.test(checkcommemoratio(state.day.winnerSections))
    ) {
      state.precesferiales = await preces(state, 'Feriales')
      return true
    }
  }

  return false
}

// Port of getpreces.
export async function getpreces(
  state: HoursState,
  lang: string,
  dominicalesFlag: boolean,
): Promise<string> {
  const hora = state.hora
  let src: string
  let key: string

  if (/^(?:Tertia|Sexta|Nona)$/.test(hora)) {
    src = 'Minor'
    key = 'Feriales'
  } else if (/^(?:Laudes|Vespera)$/.test(hora)) {
    src = 'Major'
    key = `feriales ${hora}`
  } else if (hora === 'Completorium') {
    src = 'Minor'
    key = 'Dominicales'
  } else if (dominicalesFlag) {
    // Perl: `state $precdomfer = $hora eq 'Prima'` — a per-process counter
    // initialized on first use; alternates the two Sunday-Prima schemes
    // across columns within one assembly.
    if (state.precdomfer === undefined) state.precdomfer = hora === 'Prima' ? 1 : 0
    src = 'Prima'
    key = `Dominicales Prima ${((state.precdomfer + 1) % (/^Monastic/.test(state.day.ctx.version) ? 1 : 2)) + 1}`
    state.precdomfer++
  } else {
    src = 'Prima'
    key = 'feriales Prima'
  }

  const brevis = await setup(state, lang, `Psalterium/Special/${src} Special`)
  return brevis[`Preces ${key}`] ?? ''
}
