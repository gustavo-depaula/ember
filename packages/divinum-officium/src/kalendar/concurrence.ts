// Port of horascommon.pl::concurrence() — resolves the office for Vespers and
// Compline against the following day's office. Translated statement-for-
// statement; upstream quirks preserved and marked. Mutates the same
// KalendarState the two embedded occurrence() runs use, exactly like the Perl
// mutates its globals.

import type { Sections } from '../references/resolve'
import { occurrence } from './occurrence'
import { officestring } from './officestring'
import { type KalendarState, num } from './state'

async function loadCommemo(
  state: KalendarState,
  name: string,
  flag: boolean,
): Promise<{ name: string; sections: Sections }> {
  // Perl: appends '.txt' when the bare name has no Latin file. Our loader is
  // extension-agnostic, so only the name normalization matters.
  const withExt = /txt$/i.test(name) ? name : `${name}.txt`
  const sections = (await officestring(state, 'Latin', withExt, flag)) ?? {}
  return { name: withExt, sections }
}

export async function concurrence(state: KalendarState, lang2?: string): Promise<void> {
  const ctx = state.ctx
  const { version } = ctx

  await occurrence(state, true) // get next day's office
  const cwinner0 = state.winner
  let crank = state.rank
  let ccomrank = state.comrank
  const ccommune = state.commune
  const ccommunetype = state.communetype
  const ctrank = [...state.trank]
  const csrank = [...state.srank]
  state.ccommemoentries = [...state.commemoentries]
  const csanctoraloffice = state.sanctoraloffice
  const ctempora = { ...state.tempora }
  const csaint = { ...state.saint }
  let cwinnerH: Sections = csanctoraloffice ? csaint : ctempora
  let cwrank: string[] = csanctoraloffice ? [...csrank] : [...ctrank]
  state.cwinner = cwinner0

  await occurrence(state, false) // get today's office
  let winnerH: Sections = state.sanctoraloffice ? state.saint : state.tempora
  let wrank: string[] = state.sanctoraloffice ? [...state.srank] : [...state.trank]
  const dayofweek = ctx.dayofweek

  if (/No secunda Vespera/i.test(winnerH.Rule ?? '') && !/196[03]/i.test(version)) {
    wrank = []
    winnerH = {}
    state.winner = ''
    state.rank = 0
  } else if (/Quadp3/.test(ctx.dayname[0]) && dayofweek === 3 && !/1960|1955/.test(version)) {
    // before 1955, Ash Wednesday gave way at 2nd Vespers in concurrence to a Duplex
    state.rank = 2.99
    wrank[2] = '2.99'
  } else if (
    /Quad[0-5]|Quadp|Adv|Pasc1/.test(ctx.dayname[0]) &&
    dayofweek === 0 &&
    /trident(?!.*altovadensis)/i.test(version)
  ) {
    state.rank = 2.99
    wrank[2] = '2.99'
  } else if (
    /Quad[0-5]|Quadp|Adv|Pasc1/.test(ctx.dayname[0]) &&
    dayofweek === 0 &&
    /divino|cist/i.test(version)
  ) {
    state.rank = /divino/i.test(version) ? 4.9 : 3.9
    wrank[2] = String(state.rank)
  } else if (
    /(?<!Albis )In Octava/i.test(wrank[0] ?? '') &&
    (state.rank > 5 || /Asc|Nat|Cord/i.test(wrank[0] ?? ''))
  ) {
    // Dies Octavae privilegiatae give way at 2nd Vespers to Duplex I/II cl only
    if (!/Cist/i.test(version)) {
      state.rank = 4.99
      wrank[2] = '4.99'
    }
  }

  if (
    /Dominica/i.test(cwrank[0] ?? '') &&
    !/infra octavam/i.test(cwrank[0] ?? '') &&
    /semiduplex/i.test(cwrank[1] ?? '') &&
    !/1955|196/.test(version)
  ) {
    // before 1955, even Major Sundays gave way at I Vespers to a Duplex
    crank = /altovadensis/i.test(version) ? 3.9 : /trident/i.test(version) ? 2.9 : 4.9
    cwrank[2] = String(crank)
  }

  if (
    (/Dominica/i.test(cwrank[0] ?? '') && /in.*octava/i.test(state.trank[0] ?? '')) ||
    (/infra.*octav/i.test(cwrank[0] ?? '') && /Trident/.test(version))
  ) {
    // Commemoration of Octave on Saturday from 2nd Vespers
    if (!/196/.test(version)) state.octvespera = 3
    if (/cist/i.test(version) && dayofweek === 6) state.octvespera = 1
  } else if (
    /in.*octava|Vigilia Pent/i.test(cwrank[0] ?? '') &&
    // Perl: `$wrank !~ /in.*octava/i` reads the never-assigned SCALAR $wrank
    // (empty), so the subclause reduces to the Sancti test.
    (/Dominica/i.test(wrank[0] ?? '') || /Sancti/.test(state.winner)) &&
    /divino/i.test(version)
  ) {
    // Commemoration of resumed Octave on Sunday from 1st Vespers (Divino only)
    state.octvespera = 1
  }

  if (
    /(?<!De )Dominica|Trinitatis/i.test(ctrank[0] ?? '') &&
    !(/19(?:55|6)|altovadensis/i.test(version) && /Dominica Resurrectionis/i.test(ctrank[0] ?? ''))
  ) {
    // if tomorrow is a Sunday, get rid of today's tempora completely
    if (state.sanctoraloffice && !/infra octavam Nativitatis$/i.test(state.srank[0] ?? '')) {
      if (/tempora/i.test(state.commemoentries[0] ?? '')) {
        state.commemoentries.shift()

        if (state.commemoentries.length > 0) {
          state.commemoratio = state.commemoentries[0]
          const tc = (await officestring(state, 'Latin', state.commemoratio)) ?? {}
          const cr = (tc.Rank ?? '').split(';;')
          state.comrank = num(cr[2])
        } else {
          state.commemoratio = ''
          state.comrank = 0
        }
      }
    } else {
      winnerH = {}
      state.winner = ''
      state.rank = 0
    }
    state.tempora = {}
    state.trank = ['']
    state.tname = ''
  }

  if (
    /No prima vespera/i.test(cwinnerH.Rule ?? '') ||
    // Reduced 1955: no 1st Vespers except for Duplex I/II cl & Dominica
    (/1955/.test(version) && num(cwrank[2]) < 5) ||
    // 1960: II cl feasts have I Vespers iff feasts of the Lord on a Sunday
    (/196/.test(version) &&
      !/Barroux/.test(version) &&
      num(cwrank[2]) <
        (/Dominica/i.test(cwrank[0] ?? '') ||
        (/Festum Domini/i.test(cwinnerH.Rule ?? '') && dayofweek === 6)
          ? 5
          : 6)) ||
    (/Barroux/.test(version) && num(cwrank[2]) < 5 && !/C10/.test(cwinnerH.Rank ?? '')) ||
    // no Ferias, Vigils and infra-Oct days
    (/Feria|Sabbato|Vigilia|Quat[t]*uor/i.test(cwinnerH.Rank ?? '') &&
      !/in Vigilia Epi|in octava|infra octavam|Dominica|C10/i.test(cwinnerH.Rank ?? '')) ||
    (/infra octavam|Vigilia Pent/i.test(cwinnerH.Rank ?? '') &&
      !/Dominica/i.test(cwinnerH.Rank ?? '') &&
      (/trident/i.test(version) || state.sanctoraloffice === csanctoraloffice) &&
      /infra octavam|post Octavam Asc|Quat.*Pent|Dominica (Resurrectionis|Pentecostes)/i.test(
        winnerH.Rank ?? '',
      )) ||
    // Perl tests the package global $weekname here (`$weekname =~ /Pasc[07]/`),
    // which is never assigned (occurrence's is lexical) — always false; omitted.
    // no commemoration of the Octave of S. Stephen after DA
    (/01-01/.test(state.winner) && !/trident/i.test(version)) ||
    // sort out BVM concurrent with BMV
    (/C10/i.test(cwinnerH.Rank ?? '') && /C1[01]/i.test(winnerH.Rank ?? '')) ||
    (/19(?:55|6)/.test(version) &&
      /octav/i.test(cwinnerH.Rank ?? '') &&
      !/dominica|cum Octava/i.test(cwinnerH.Rank ?? '') &&
      num(cwrank[2]) < 6)
  ) {
    if (
      ccomrank >=
        (state.rank >= (/trident/i.test(version) ? 6 : 5) &&
        !/feria|sabbato|octava/i.test(cwrank[0] ?? '')
          ? 2.1
          : !/cist/i.test(version)
            ? 1.1
            : 1) &&
      // Perl: `$ccomrank !~ 1.5` — a regex match of the number against /1.5/.
      !/1.5/.test(String(ccomrank)) &&
      !/1955|196/.test(version)
    ) {
      state.vespera = 3
      ctx.dayname[2] = `${state.tomorrowname[2]}<br/>Vespera de Officio occurente, Commemoratio Sanctorum crastinorum tantum`
      cwinnerH = {}
      cwrank = []
      state.cwinner = ''
      crank = 0
      state.cvespera = 0
    } else if (
      ((csanctoraloffice && !/infra octavam Epi/i.test(cwrank[0] ?? '')) ||
        /Nat2-0/i.test(state.cwinner)) &&
      !/1955|196/.test(version)
    ) {
      state.vespera = 3
      ctx.dayname[2] += state.sanctoraloffice
        ? '<br/>Vespera de Officio occurente; nihil de sequenti'
        : '<br/>Vespera de Tempore occurente; nihil de sequenti'
      cwinnerH = {}
      cwrank = []
      state.cwinner = ''
      crank = 0
      state.cvespera = 0
      state.ccommemoentries = []
    } else {
      state.vespera = 3
      if (
        !(
          /Dominica|Advent|Quadr|Pass|Asc/i.test(ctx.dayname[2]) ||
          (state.comrank >= 2.1 && !/ad Laudes|Rogatio/i.test(ctx.dayname[2]))
        )
      ) {
        ctx.dayname[2] = ''
      }
      if (!/1955|196/.test(version)) {
        ctx.dayname[2] += state.sanctoraloffice
          ? '<br/>Vespera de Officio occurente'
          : '<br/>Vespera de Tempore occurente'
      }
      cwinnerH = {}
      cwrank = []
      state.cwinner = ''
      crank = 0
      state.cvespera = 0
      state.ccommemoentries = []
    }
  } else if (!state.sanctoraloffice && !csanctoraloffice && !/C10/.test(state.cwinner)) {
    // two "concurrent" Tempora
    if (crank >= state.rank || /No secunda vespera/i.test(state.tempora.Rule ?? '')) {
      state.vespera = 1
      state.tvesp = 1
      state.cvespera = 0
      state.winner = state.cwinner

      if (
        crank < 7 &&
        crank !== 6.5 &&
        crank !== 6 &&
        state.comrank > 2 &&
        !/no commemoratio/i.test(cwinnerH.Rule ?? '')
      ) {
        // Unless a genuine Duplex I cl feast follows, Semiduplex saints get commemorated
        const hodie = state.comrank >= ccomrank ? 'hodiernorum tantum' : 'tantum'
        ctx.dayname[2] += `<br/>Vespera de sequenti; Commemoratio Sanctorum ${hodie}`
        state.tomorrowname[2] = ctx.dayname[2]
      } else {
        state.tomorrowname[2] += '<br/>Vespera de sequenti.'
        state.commemoentries = []
        state.commemoratio = ''
      }
      ctx.dayname = [...state.tomorrowname]
      state.rank = crank
      state.commune = ccommune
      state.communetype = ccommunetype
      state.cwinner = ''
      cwinnerH = {}
    } else {
      state.vespera = 3
      state.tvesp = 3
      ctx.dayname[2] += '<br/>Vespera de Tempore præcedenti; nihil de sequenti'
      cwinnerH = {}
      cwrank = []
      state.cwinner = ''
      crank = 0
      state.cvespera = 0
    }
  } else {
    // before DA, more Semiduplex and Duplex were treated as "A capitulo"
    const flrank =
      /cist/i.test(version) && /Dominica/i.test(cwinnerH.Rank ?? '')
        ? state.rank <
          (/Adv1|Quad[156]/.test(state.tomorrowname[0])
            ? 4.9
            : /altovadensis/i.test(version)
              ? 3.9
              : 2.9)
          ? 2
          : state.rank
        : /trident/i.test(version)
          ? state.rank < 2.9 && !(state.rank === 2.1 && !/infra Octavam/i.test(winnerH.Rank ?? ''))
            ? 2
            : ((state.rank >= 3 && state.rank < 3.9) || (state.rank >= 4.1 && state.rank < 4.9)) &&
                state.rank !== 3.9 &&
                state.rank !== 3.2
              ? 3
              : state.rank
          : state.rank
    let flcrank =
      /cist/i.test(version) && /Dominica/i.test(cwinnerH.Rank ?? '')
        ? 2
        : /trident/i.test(version)
          ? crank < 2.91
            ? crank > 2
              ? 2
              : crank
            : /Dominica/i.test(cwinnerH.Rank ?? '')
              ? 2.99
              : crank < 3.9 || (crank >= 4.1 && crank < 4.9)
                ? 3
                : crank
          : /divino/i.test(version) && /Dominica/i.test(cwinnerH.Rank ?? '')
            ? 4.9
            : crank
    let flrankAdj = flrank

    // in 1906, infra 8vam equals Sunday in precedence but not sequence
    if (/1906/.test(version) && /infra Octavam/i.test(winnerH.Rank ?? '') && crank === 2.2) {
      flcrank = 2.2
    } else if (
      /1906/.test(version) &&
      /infra Octavam/i.test(cwinnerH.Rank ?? '') &&
      state.rank === 2.2
    ) {
      flrankAdj = 2.2
    }

    if (
      // On Saturday, 1st Vespers gets commemorated in Festis I cl
      (state.rank >= (/19(?:55|6)/.test(version) && dayofweek < 6 ? 6 : 7) && crank < 6) ||
      // 1960: on a II cl Sunday nothing at 1st Vespers in concurrence with a Feast of the Lord
      (/196/.test(version) &&
        /Dominica/i.test(cwinnerH.Rank ?? '') &&
        !/Nat1/i.test(ctx.dayname[0]) &&
        crank <= 5 &&
        state.rank >= 5 &&
        /Festum Domini/i.test(winnerH.Rule ?? '')) ||
      // Trid Duplex I cl / DA II cl: no commemoration of following Simplex and Common Octaves
      (state.rank >= (/cist/i.test(version) ? 7 : /trident/i.test(version) ? 6 : 5) &&
        !/feria|in.*octava/i.test(state.winner) &&
        crank < 2.1) ||
      // no commemoration of Precious Blood on the Feast of the Sacred Heart
      (/Pent02-5/.test(state.winner) && /07-01\./.test(state.cwinner))
    ) {
      ctx.dayname[2] += '<br/>Vespera de præcedenti; nihil de sequenti'
      state.cwinner = ''
      cwinnerH = {}
      state.vespera = 3
      crank = 0
      state.cvespera = 0
      state.ccommemoentries = []
      ccomrank = 0
    } else if (
      // No 2nd Vespers of a Simplex
      (state.rank < 2 && !(state.rank === 1.15 && /tempora/i.test(state.winner))) ||
      // 1960: on any Sunday / 1st Vespers of a Feast of the Lord, nothing of a preceding III cl feast
      (/196/.test(version) &&
        (/Dominica/i.test(cwrank[0] ?? '') || /Festum Domini/i.test(cwinnerH.Rule ?? '')) &&
        (state.rank < (crank >= 6 ? 6 : 5) ||
          /Dominica/i.test(wrank[0] ?? '') ||
          /Festum Domini/i.test(winnerH.Rule ?? ''))) ||
      // in 1st Vespers of Duplex I cl only commemoration of privileged offices
      (crank >= 6 &&
        !(
          state.rank === 1.15 ||
          state.rank === 2.1 ||
          state.rank === 2.99 ||
          state.rank === 3.9 ||
          state.rank >= 4.2
        ) &&
        !/cist/i.test(version) &&
        !/Dominica|feria|in.*octava/i.test(cwrank[0] ?? '')) ||
      // on Christmas Eve and New Year's Eve, nothing of a preceding Sunday
      (/12-25|01-01/.test(state.cwinner) && !/cist/i.test(version)) ||
      (/12-25/.test(state.cwinner) && /cist/i.test(version)) ||
      // in 1st Vespers of Duplex II cl also commemoration of any Duplex
      (crank >= 5 &&
        !(state.rank === 1.15 || state.rank === 2.1 || state.rank >= 2.99) &&
        !/Dominica|feria|in.*octava/i.test(cwrank[0] ?? ''))
    ) {
      ctx.dayname = [...state.tomorrowname]
      state.vespera = 1
      state.cvespera = 3

      if (
        (state.comrank === 1.15 ||
          state.comrank === 2.1 ||
          state.comrank === 2.99 ||
          state.comrank === 3.9) &&
        !/12-25|01-01/.test(state.cwinner) &&
        !(/07-01/.test(state.cwinner) && /Sangu|Cor[dp]/.test(state.trank[0] ?? ''))
      ) {
        // privileged Feria, Dominica, or infra 8vam only
        ctx.dayname[2] += '<br/>Vespera de sequenti; commemoratio de off. priv. tantum'
      } else {
        ctx.dayname[2] += '<br/>Vespera de sequenti; nihil de præcedenti'
        state.commemoratio = ''
        state.comrank = 0
        state.commemoentries = []
      }
      state.rank = crank
      state.commune = ccommune
      state.communetype = ccommunetype
      state.winner = state.cwinner
      state.cwinner = ''
      cwinnerH = {}
    } else if (
      !/196/.test(version) &&
      /Dominica/i.test(winnerH.Rank ?? '') &&
      !/Nat1/i.test(ctx.dayname[0]) &&
      state.rank <= 5 &&
      crank > 2.1 &&
      /Festum Domini/i.test(cwinnerH.Rule ?? '')
    ) {
      // Pre-1960, feasts of the Lord of nine lessons take precedence over a lesser Sunday
      state.vespera = 1
      state.cvespera = 3
      state.commemoratio = state.winner
      state.tomorrowname[2] = `Commemoratio: ${wrank[0] ?? ''}`
      state.winner = state.cwinner
      state.cwinner = state.commemoratio
      ctx.dayname = [...state.tomorrowname]
      ctx.dayname[2] += '<br/>Vespera de sequenti; commemoratio de præcedenti Dominica'
      state.rank = crank
      state.commune = ccommune
      state.communetype = ccommunetype
    } else if (
      (!/196/.test(version) &&
        /Dominica/i.test(cwinnerH.Rank ?? '') &&
        !/Nat1/i.test(ctx.dayname[0]) &&
        crank <= 5 &&
        state.rank > 2.1 &&
        /Festum Domini/i.test(winnerH.Rule ?? '')) ||
      // In 1960, in concurrence of days of equal rank, the preceding takes precedence
      (/196/.test(version) && state.rank >= crank)
    ) {
      state.vespera = 3
      state.cvespera = 1
      state.commemoratio = state.cwinner
      ctx.dayname[2] = `Commemoratio: ${cwrank[0] ?? ''}`
      ctx.dayname[2] += '<br/>Vespera de præcedenti; commemoratio de sequenti'
      if (/Dominica/i.test(cwinnerH.Rank ?? '')) ctx.dayname[2] += ' Dominica'
    } else if (flcrank === flrankAdj) {
      // "flattened ranks" are equal => a capitulo
      state.commemoratio = state.winner
      const communeH: Sections =
        (/trident/i.test(version) || flrankAdj >= 5) && state.commune
          ? ((await officestring(state, 'Latin', state.commune, false)) ?? {})
          : {}
      // Perl assigns the global %commune here; it survives unless precedence()
      // reloads it (i.e. unless tomorrow's office carries its own commune).
      state.communeSections = communeH
      state.tomorrowname[2] = `Commemoratio: ${wrank[0] ?? ''}`
      state.antecapitulum =
        winnerH['Ant Vespera 3'] ??
        winnerH['Ant Vespera'] ??
        communeH['Ant Vespera 3'] ??
        communeH['Ant Vespera'] ??
        ''

      if (state.antecapitulum) {
        const l2 = lang2 ?? 'Latin'
        const winner2 = (await officestring(state, l2, state.winner, false)) ?? {}
        const commune2 = state.commune
          ? ((await officestring(state, l2, state.commune, false)) ?? {})
          : {}
        state.antecapitulum2 =
          winner2['Ant Vespera 3'] ??
          winner2['Ant Vespera'] ??
          commune2['Ant Vespera 3'] ??
          commune2['Ant Vespera'] ??
          ''

        if (!/no Psalm5/i.test(winnerH.Rule ?? '') && !/monastic/i.test(version)) {
          const m =
            /Psalm5 Vespera3=([0-9]+)/i.exec(winnerH.Rule ?? '') ||
            /Psalm5 Vespera3=([0-9]+)/i.exec(communeH.Rule ?? '') ||
            /Psalm5 Vespera=([0-9]+)/i.exec(winnerH.Rule ?? '') ||
            /Psalm5 Vespera=([0-9]+)/i.exec(communeH.Rule ?? '')
          if (m) {
            // Hi-jacking an "unused" 6th line to pass Psalm5 Vespera info to psalmi
            state.antecapitulum += `\nPsalm5 VesperaAnte=${m[1]}`
          }
        }
      }
      state.vespera = 1
      state.cvespera = 3
      state.winner = state.cwinner
      state.cwinner = state.commemoratio
      ctx.dayname = [...state.tomorrowname]
      state.rank = crank
      state.commune = ccommune
      state.communetype = ccommunetype
      ctx.dayname[2] += '<br/>A capitulo de sequenti; commemoratio de præcedenti'
    } else if (crank > state.rank) {
      // tomorrow is outranking today
      state.vespera = 1
      state.commemoratio = state.winner
      state.cvespera = 3
      state.tomorrowname[2] = `Commemoratio: ${wrank[0] ?? ''}`
      state.winner = state.cwinner
      state.cwinner = state.commemoratio
      ctx.dayname = [...state.tomorrowname]
      state.rank = crank
      state.commune = ccommune
      state.communetype = ccommunetype
      ctx.dayname[2] += '<br/>Vespera de sequenti; commemoratio de præcedenti'
    } else {
      // today is outranking tomorrow
      state.commemoratio = state.cwinner
      ctx.dayname[2] = `Commemoratio: ${cwrank[0] ?? ''}`
      state.vespera = 3
      state.cvespera = 1
      ctx.dayname[2] += '<br/>Vespera de præcedenti; commemoratio de sequenti'

      if (
        /infra octavam|post Octavam Asc|Vigilia Pent/i.test(cwinnerH.Rank ?? '') ||
        /infra octavam|post Octavam Asc|Vigilia Pent/i.test(state.ccommemoentries[0] ?? '')
      ) {
        const comentries: string[] = []
        for (const commemoIn of state.commemoentries) {
          const { sections: cstr } = await loadCommemo(state, commemoIn, false)
          if (
            !(
              Object.keys(cstr).length === 0 ||
              (/infra octavam|post Octavam Asc|Vigilia Pent/i.test(cstr.Rank ?? '') &&
                !/Dominica/i.test(cstr.Rank ?? ''))
            )
          ) {
            comentries.push(commemoIn)
          }
        }
        state.commemoentries = comentries
      }
    }
  }

  if (/completorium/i.test(ctx.hora)) {
    ctx.dayname[2] = ''
  }

  state.crank = crank

  // Restrict commemoration according to the respective rubrics.
  if (state.vespera === 3) {
    // We have 2nd Vespers. In concurrence (tomorrow):
    let ranklimit =
      state.rank >= (/trident/i.test(version) ? 6 : 5) &&
      !/Dominica|feria|in.*octava/i.test(wrank[0] ?? '')
        ? 2.1
        : 1.1
    if (/cist/i.test(version)) ranklimit = 1

    let comentries: string[] = []
    for (const commemoIn of state.ccommemoentries) {
      const { name: commemo, sections: cstr } = await loadCommemo(state, commemoIn, true)
      if (
        (/tempora/i.test(commemo) ||
          /infra octavam|post Octavam Asc|Vigilia Pent/i.test(cstr.Rank ?? '')) &&
        !/Dominica/i.test(cstr.Rank ?? '')
      ) {
        continue // no superseded Tempora or day within octave has 1st Vespers unless a Sunday
      }
      if (Object.keys(cstr).length > 0) {
        const cr = (cstr.Rank ?? '').split(';;')
        if (
          !(
            num(cr[2]) < ranklimit ||
            /No prima vespera/i.test(cstr.Rule ?? '') ||
            /1955|196/.test(version)
          )
        ) {
          comentries.push(commemo)
        }
      }
    }
    state.ccommemoentries = comentries

    // In occurrence (today): Simplex end after None.
    ranklimit =
      /Dominica|feria|in.*octava/i.test(wrank[0] ?? '') || /cist/i.test(version)
        ? 2
        : state.rank >= 6
          ? !/trident/i.test(version)
            ? 4.2
            : 3.1
          : state.rank >= 5
            ? 2.1
            : 2
    comentries = []

    for (const commemoIn of state.commemoentries) {
      if (
        /tempora/i.test(commemoIn) &&
        ((num(state.trank[2]) < 2 && num(state.trank[2]) !== 1.15) ||
          /Rogatio|Quattuor.*Sept/i.test(state.trank[0] ?? ''))
      ) {
        continue // Feria minor, Rogation days, QT in Sept, Vigils have no Vespers if superseded
      }
      const { name: commemo, sections: cstr } = await loadCommemo(state, commemoIn, false)
      if (Object.keys(cstr).length > 0) {
        const cr = (cstr.Rank ?? '').split(';;')
        if (
          !(
            (num(cr[2]) < ranklimit &&
              !(
                num(cr[2]) === 1.15 ||
                num(cr[2]) === 2.1 ||
                num(cr[2]) === 2.99 ||
                num(cr[2]) === 3.9
              )) ||
            /No secunda vespera/i.test(cstr.Rule ?? '')
          )
        ) {
          comentries.push(commemo)
        }
      }
    }
    state.commemoentries = comentries
  } else {
    // We have 1st Vespers. In concurrence (today):
    let ranklimit =
      state.rank >= 6 && !/Dominica|feria|in.*octava/i.test(cwrank[0] ?? '')
        ? 4.2
        : state.rank >= 5 && !/Dominica|feria|in.*octava/i.test(cwrank[0] ?? '')
          ? 2.99
          : 2
    if (
      state.rank >= 5 &&
      !/Dominica|feria|in.*octava/i.test(cwrank[0] ?? '') &&
      /cist/i.test(version)
    ) {
      ranklimit = 2.1
    }

    let comentries: string[] = []
    for (const commemoIn of state.commemoentries) {
      if (
        /tempora/i.test(commemoIn) &&
        num(state.trank[2]) !== 1.15 &&
        (num(state.trank[2]) < 2 ||
          /Rogatio|Quattuor.*Sept/i.test(state.trank[0] ?? '') ||
          (() => {
            const a = /infra Octavam (.*)/i.exec(state.trank[0] ?? '')
            const b = /in Octava (.*)/i.exec(ctrank[0] ?? '')
            return a !== null && b !== null && a[1] === b[1]
          })())
      ) {
        continue // Feria minor / Vigils / dies infra 8vam preceding Die in 8va have no Vespers
      }
      const { name: commemo, sections: cstr } = await loadCommemo(state, commemoIn, false)
      if (Object.keys(cstr).length > 0) {
        const cr = (cstr.Rank ?? '').split(';;')
        if (
          !(
            (num(cr[2]) < ranklimit &&
              !(
                num(cr[2]) === 1.15 ||
                num(cr[2]) === 2.1 ||
                num(cr[2]) === 2.99 ||
                num(cr[2]) === 3.9
              )) ||
            /No secunda vespera/i.test(cstr.Rule ?? '') ||
            /De VII di|Die VII infra/i.test(cr[0] ?? '')
          )
        ) {
          comentries.push(commemo)
        }
      }
    }
    state.commemoentries = comentries

    // In occurrence (tomorrow):
    ranklimit = /Dominica|feria|in.*octava/i.test(cwrank[0] ?? '')
      ? !/cist/i.test(version)
        ? 1.1
        : 1
      : state.rank >= 6
        ? !/trident/i.test(version)
          ? 4.2
          : !/cist/i.test(version)
            ? 3.1
            : 2.2
        : state.rank >= 5
          ? 2.2
          : !/cist/i.test(version)
            ? 1.1
            : 1
    comentries = []

    for (const commemoIn of state.ccommemoentries) {
      const { name: commemo, sections: cstr } = await loadCommemo(state, commemoIn, true)
      if (
        (/tempora/i.test(commemo) || /infra octavam/i.test(cstr.Rank ?? '')) &&
        !/Dominica/i.test(cstr.Rank ?? '')
      ) {
        continue
      }
      if (Object.keys(cstr).length > 0) {
        const cr = (cstr.Rank ?? '').split(';;')
        if (
          !(
            num(cr[2]) < ranklimit ||
            /No prima vespera/i.test(cstr.Rule ?? '') ||
            (/1955|196/.test(version) && !/Dominica/i.test(cstr.Rank ?? '')) ||
            (/Feria|Sabbato|Vigilia|Quat[t]*uor Temp/i.test(cstr.Rank ?? '') &&
              !/in Vigilia Epi|in octava|Dominica/i.test(cstr.Rank ?? ''))
          )
        ) {
          comentries.push(commemo)
        }
      }
    }
    state.ccommemoentries = comentries
  }
}
