// Port of horascommon.pl::occurrence() and its helpers (extract_common,
// climit1960, nooctnat, emberday, checklatinfile-with-existence). Translated
// statement-for-statement; upstream quirks are preserved and marked. The
// office strings carry the Perl-style '.txt' suffix so every regex from the
// original applies verbatim; the extension is stripped at the loader boundary.

import { type DoSession, setupstring } from '../references/resolve'
import { isSectioned } from '../types'
import { dayOfWeek, geteaster, getSday, getweek, leapyear, nextday } from './date'
import { officestring } from './officestring'
import { type KalendarState, num, subdirname } from './state'

// Port of checklatinfile (SetupString.pl) returning both the (possibly
// redirected) name and whether a Latin file exists — occurrence branches on
// the boolean. Names here are extension-less.
export async function checkLatinFileExists(
  session: DoSession,
  name: string,
): Promise<{ name: string; exists: boolean }> {
  const { loader, area } = session
  let file = name
  if (await loader.exists(`${area}/Latin/${file}`)) return { name: file, exists: true }
  if (await loader.exists(`horas/Latin/${file}`)) return { name: file, exists: true }
  const cist = file.replace(/(Sancti|Tempora|Commune)(?:Cist)(.*)/, '$1M$2')
  if (cist !== file) {
    file = cist
    if (await loader.exists(`${area}/Latin/${file}`)) return { name: file, exists: true }
  }
  const roman = file.replace(/(Sancti|Tempora|Commune)(?:M|OP)(.*)/, '$1$2')
  if (roman !== file && (await loader.exists(`${area}/Latin/${roman}`))) {
    return { name: roman, exists: true }
  }
  return { name: file, exists: false }
}

// Port of extract_common().
// NOTE: Perl returns a two-element list even when nothing matches, and the
// callers' list assignment is always true — so the winner branch ALWAYS
// overwrites communetype/commune (clearing them on plain offices). This
// matters when concurrence runs occurrence() twice in one resolution.
export async function extractCommon(
  state: KalendarState,
  commonField: string,
  officeRank: number,
  paschalTide: boolean,
): Promise<{ communetype: string; commune: string }> {
  const { version } = state.ctx
  const { loader, area } = state.session
  let communetype = ''
  let commune = ''

  let m = /^(ex|vide)\s*(?!Sancti)((?:[a-z\s]*\/)?C[0-9]+[a-z]*-*[123]*)/i.exec(commonField)
  if (m) {
    communetype = m[1]
    commune = m[2]
    if (/Trident/i.test(version) && officeRank >= 2) communetype = 'ex'
    if (paschalTide) {
      const effArea = /C\d(?![3-9])[a-z]?/.test(commune) ? 'horas' : area
      const paschalName = `${effArea}/Latin/${subdirname('Commune', version)}${commune}p`
      const tempName = paschalName.replace(/Cist/, 'M')
      if ((await loader.exists(paschalName)) || (await loader.exists(tempName))) {
        commune += 'p'
      }
    }
    if (commune) commune = `${subdirname('Commune', version)}${commune}.txt`
    return { communetype, commune }
  }

  m = /(ex|vide)\s*Sancti(?:M|OP|Cist)?\/(.*)\s*$/i.exec(commonField)
  if (m) {
    communetype = m[1]
    commune = `${subdirname('Sancti', version)}${m[2]}.txt`
    if (/Trident/i.test(version)) communetype = 'ex'
    return { communetype, commune }
  }

  m = /(ex|vide)\s*(.*)\s*$/i.exec(commonField)
  if (m) {
    communetype = m[1]
    const name = m[2].replace(/Tempora(?:M|OP|Cist)?\//i, '')
    commune = /Sancti|Commune/i.test(name)
      ? `${name}.txt`
      : `${subdirname('Tempora', version)}${name}.txt`
    if (/Trident/i.test(version)) communetype = 'ex'
    return { communetype, commune }
  }
  return { communetype: '', commune: '' }
}

// Port of nooctnat().
export function nooctnat(state: KalendarState): boolean {
  const { version, month, day } = state.ctx
  return /19(?:55|6)/.test(version) && (month < 12 || day < 25)
}

// Port of climit1960().
export async function climit1960(state: KalendarState, c: string): Promise<number> {
  if (!c) return 0
  const { version, hora } = state.ctx
  if (!/196/.test(version) || !/sancti/i.test(c)) return 1
  if (/7-16/.test(c) && /C10/.test(state.winner)) return 0
  const w = (await setupstring(state.session, state.winner.replace(/\.txt$/, ''))) ?? {}
  if (!/tempora|C10/i.test(state.winner)) return 1
  const cs = (await setupstring(state.session, c.replace(/\.txt$/, ''))) ?? {}
  const r = (cs.Rank ?? '').split(';;')

  if (/Dominica/i.test(w.Rank ?? '')) {
    if ((!/(Vespera|Completorium)/i.test(hora) && num(r[2]) >= 5) || num(r[2]) >= 6) return 1
    if (/Laudes/i.test(hora) && num(r[2]) >= 5 && state.rank < 6) return 1
  } else if (num(r[2]) >= 6) {
    return 1
  } else if (num(r[2]) > 1) {
    return 2
  }
  return 0
}

// Port of emberday().
export function emberday(state: KalendarState): boolean {
  const { day, month, year } = state.ctx
  const dow = dayOfWeek(day, month, year)
  if (dow < 3 || dow === 4) return false
  if (/Adv3|Quad1|Pasc7/i.test(state.ctx.dayname[0])) return true
  if (month !== 9) return false
  return (
    /Quat[t]*uor/i.test(state.winnerSections.Rank ?? '') ||
    /Quat[t]*uor/i.test(state.commemoratioSections.Rank ?? '') ||
    /Quat[t]*uor/i.test(state.scripturaSections.Rank ?? '')
  )
}

// Stub of specmatins.pl::initiarule — only affects the "Scriptura ut in"
// headline decoration; ported with Matins (M7). Returning '' selects the
// plain "Tempora:"/"Scriptura:" headline forms.
function initiarule(_month: number, _day: number, _year: number): string {
  return ''
}

async function getdialogCommunes(state: KalendarState): Promise<Record<string, string>> {
  const dialog = await state.session.loader.load('horas/horas.dialog')
  if (!dialog || !isSectioned(dialog)) return {}
  const section = dialog.sections.find((s) => s.name === 'communes')
  if (!section) return {}
  const flat = section.lines.join('').split(',')
  const map: Record<string, string> = {}
  for (let i = 0; i + 1 < flat.length; i += 2) map[flat[i]] = flat[i + 1]
  return map
}

async function loadSetup(state: KalendarState, nameWithExt: string) {
  return (await setupstring(state.session, nameWithExt.replace(/\.txt$/, ''))) ?? {}
}

// Port of occurrence($day, $month, $year, $version, $dioecesis, $tomorrow).
export async function occurrence(state: KalendarState, tomorrow: boolean): Promise<void> {
  const ctx = state.ctx
  const { version, year, month, day } = ctx
  const { directorium, session } = state

  state.transfervigil = ''

  let trankStr = ''
  let srankStr = ''
  let transfer = ''
  let permTransfer = ''
  let tempTransfer = ''
  let transferedAway = ''

  let sday = ''
  let weekname = ''
  let dayofweek: number

  if (tomorrow) {
    sday = nextday(month, day, year)
    weekname = getweek(day, month, year, true)
    state.tomorrowname[0] = weekname
    dayofweek = (dayOfWeek(day, month, year) + 1) % 7
  } else {
    sday = getSday(month, day, year)
    weekname = ctx.dayname[0]
    dayofweek = dayOfWeek(day, month, year)
  }
  ctx.dayofweek = dayofweek

  const officename: [string, string, string] = [weekname, '', '']

  // Permanent transfers assigned to the day of the year.
  permTransfer = (await directorium.getFromDirectorium('tempora', version, sday, 0)).replace(
    /;;.*/,
    '',
  )
  const litdomMatch = /::([a-g])/.exec(permTransfer)
  if (litdomMatch) {
    permTransfer = permTransfer.replace(/::([a-g])/, '')
    const litdom = litdomMatch[1]
    const e = geteaster(year)
    const easter = e.month * 100 + e.day
    const letter = (((easter - 319 + (e.month === 4 ? 1 : 0)) % 7) + 7) % 7
    const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
    if (leapyear(year) && /^(?:01|02-[01]|02-2[01239])/.test(sday)) {
      if (!letters[(letter + 1) % 7].includes(litdom)) permTransfer = ''
    } else {
      if (!letters[letter].includes(litdom)) permTransfer = ''
    }
  }
  let permTransfers = permTransfer.split('~').filter((x) => x !== '')
  permTransfers = permTransfers.map((pt) => {
    if (!pt) return pt
    if (!/tempora/i.test(pt)) return `${subdirname('Sancti', version)}${pt}`
    if (/monastic/i.test(version)) {
      return `${subdirname('Tempora', version)}${pt.replace(/Tempora[^/]\//, '')}`
    }
    return pt
  })
  permTransfer = permTransfers.shift() ?? ''

  // Annual transfers depending on the day of Easter.
  let transfersStr = await directorium.getFromDirectorium('transfer', version, sday, year)
  const transferSourceMatch = /;;(.*)/.exec(transfersStr)
  transfersStr = transfersStr.replace(/;;(.*)/, '')
  const transferSource = transferSourceMatch?.[1] ?? ''
  let transfers = transfersStr.split('~').filter((x) => x !== '')

  if (transfersStr) {
    transfers = transfers.map((tr) => {
      if (!tr) return tr
      if (!/tempora/i.test(tr)) return `${subdirname('Sancti', version)}${tr}`
      return `${subdirname('Tempora', version)}${tr.replace(/Tempora\//, '')}`
    })

    if (transferSource) {
      permTransfer = ''
      permTransfers = []
    }

    // A transferred vigil without its own "mm-ddv" file.
    if (
      transfers[0] &&
      /v$/.test(transfers[0]) &&
      !(await session.loader.exists(`horas/Latin/${transfers[0]}`))
    ) {
      if (!(leapyear(year) && /02-23v/.test(transfers[0]))) {
        state.transfervigil = (transfers.shift() ?? '').replace(/v$/, '.txt')
      }
      transfer = ''
    } else {
      transfer = transfers.shift() ?? ''
    }
  }

  // --- Temporal ---
  let tfile = ''
  {
    const tday = `${subdirname('Tempora', version)}${weekname}${!/Nat/i.test(weekname) ? `-${dayofweek}` : ''}`

    tempTransfer = (
      (await directorium.getFromDirectorium('transfer', version, tday, year)) ||
      (await directorium.getFromDirectorium('tempora', version, tday, 0))
    ).replace(/;;.*/, '')

    if (tempTransfer.includes('~')) {
      const tr = tempTransfer.split('~')
      tempTransfer = tr.shift() ?? ''
      // Upstream `@transfers = @transfers || @tr` collapses a non-empty list
      // to its count (Perl scalar-context quirk); we port the evident intent.
      if (transfers.length === 0) transfers = tr
    }

    tfile = /Tempora/i.test(tempTransfer) ? tempTransfer : tday

    if (
      permTransfer &&
      /tempora/i.test(permTransfer) &&
      !(await directorium.transfered(permTransfer, year, version))
    ) {
      tfile = permTransfer
    } else if (/tempora/i.test(transfer)) {
      tfile = transfer
      transfer = transfers.shift() ?? ''
    } else if (await directorium.transfered(tfile, year, version)) {
      transferedAway = tfile
      tfile = ''
    }

    let tExists = false
    if (tfile) {
      const checked = await checkLatinFileExists(session, tfile)
      tfile = checked.name
      tExists = checked.exists
    }

    if (tfile && (tExists || /Epi0/i.test(weekname))) {
      state.tname = `${tfile}.txt`
      if (tomorrow) {
        state.tvesp = 1
        state.tempora = (await officestring(state, 'Latin', state.tname, true)) ?? {}
        trankStr = state.tempora.Rank ?? ''
      } else {
        state.tvesp = /(Vespera|Completorium)/i.test(ctx.hora) ? 3 : 2
        state.tempora = (await officestring(state, 'Latin', state.tname)) ?? {}
        trankStr = state.tempora.Rank ?? ''
        state.initia = /!.*? 1:1-/.test(state.tempora.Lectio1 ?? '')
      }
      state.trank = trankStr.split(';;')
    } else {
      trankStr = ''
      state.tempora = {}
      state.tname = ''
      state.trank = []
    }
  }

  // --- Sanctoral ---
  {
    const kalentries = await directorium.getFromDirectorium('kalendar', version, sday, 0)
    state.commemoentries = kalentries.split('~').filter((x) => x !== '')
    state.commemoentries = state.commemoentries.map((k) => {
      if (!k) return k
      if (!/tempora/i.test(k)) return `${subdirname('Sancti', version)}${k}`
      return `${subdirname('Tempora', version)}${k.replace(/Tempora\//, '')}`
    })

    let sfile = state.commemoentries.shift() ?? ''

    if (
      permTransfer &&
      /Sancti/.test(permTransfer) &&
      !(await directorium.transfered(permTransfer, year, version))
    ) {
      sfile = permTransfer
      state.commemoentries = permTransfers
    } else if (/Sancti/.test(transfer)) {
      sfile = transfer
      state.commemoentries = transfers
    } else if (sfile && (await directorium.transfered(sfile, year, version))) {
      transferedAway = sfile
      sfile = ''
    }

    // Prevent duplicate vigil of St. Mathias in leap years.
    if ((day === 23 || day === 22) && month === 2 && leapyear(year)) {
      sfile = /02-23o/.test(sfile)
        ? ''
        : /02-23/.test(sfile)
          ? `${subdirname('Sancti', version)}02-23r`
          : sfile
      state.commemoentries = state.commemoentries.filter((x) => !/02-23o/.test(x))
    }

    let sExists = false
    if (sfile) {
      const checked = await checkLatinFileExists(session, sfile)
      sfile = checked.name
      sExists = checked.exists
    }

    if ((sfile && sExists) || !/Tempora/.test(tempTransfer)) {
      if (sfile) {
        state.sname = `${sfile}.txt`
        if (state.caller && /(Matutinum|Laudes)/i.test(ctx.hora)) {
          state.sname = state.sname.replace(/11-02t/, '11-02')
        }
        state.saint = await loadSetup(state, state.sname)
        srankStr = state.saint.Rank ?? ''
        state.srank = srankStr.split(';;')
      } else {
        state.saint = {}
        srankStr = ''
        state.srank = []
      }

      // Remove octaves during Quadragesima.
      if (/in.*octava/i.test(state.srank[0] ?? '') && /Quad\d|Quadp3-[3-6]/.test(state.tname)) {
        let next = state.commemoentries.shift() ?? ''
        const checked = await checkLatinFileExists(session, next)
        next = checked.name
        if (checked.exists) {
          state.sname = `${next}.txt`
          state.saint = await loadSetup(state, state.sname)
          srankStr = state.saint.Rank ?? ''
          state.srank = srankStr.split(';;')
        } else {
          srankStr = ''
          state.saint = {}
          state.srank = []
        }
      }

      // A sanctoral feast assigned per the temporal cycle (e.g. Spineæ Coronæ).
      if (tempTransfer && !/Tempora/.test(tempTransfer)) {
        let tt = `${subdirname('Sancti', version)}${tempTransfer}`
        const checked = await checkLatinFileExists(session, tt)
        tt = checked.name
        if (checked.exists) {
          const ttSections = await loadSetup(state, `${tt}.txt`)
          const tTrankStr = ttSections.Rank ?? ''
          const tTrank = tTrankStr.split(';;')
          if (num(tTrank[2]) >= num(state.srank[2])) {
            state.commemoentries.unshift(sfile)
            state.sname = `${tt}.txt`
            state.saint = ttSections
            srankStr = tTrankStr
            state.srank = tTrank
          } else {
            state.commemoentries.unshift(tt)
          }
        }
      }

      if (tomorrow) {
        state.svesp = 1
        if (
          !/196|Trident/.test(version) &&
          /Completorium/i.test(ctx.hora) &&
          month === 11 &&
          ((day === 1 && dayofweek !== 0) || (day === 2 && dayofweek === 1))
        ) {
          state.srank[2] = '7'
          srankStr = srankStr.replace(/;;[0-9]/, ';;7')
        } else if (/196/.test(version) && month === 11 && day === 1) {
          state.srank[2] = '1'
          srankStr = ''
        } else if (
          !/196/.test(version) &&
          srankStr &&
          (/Quadp3-3/i.test(state.tname) || /Quad6-[1-3]/i.test(state.tname))
        ) {
          state.srank[2] = '1.1' // Feria privilegiata: commemorated only
        } else if (month === 12 && day === 23) {
          srankStr = ''
          state.saint = {}
          state.sname = ''
          state.srank = []
        }
      } else if (/(Vespera|Completorium)/i.test(ctx.hora)) {
        state.svesp = 3
        if (
          (/No secunda Vespera/i.test(state.saint.Rule ?? '') && !/196/.test(version)) ||
          (/vigilia/i.test(srankStr) && (!/196/.test(version) || !/08-09/.test(state.sname))) ||
          (!/1960|Trident/.test(version) &&
            /Completorium/i.test(ctx.hora) &&
            month === 11 &&
            day === 1 &&
            dayofweek !== 6) ||
          (num(state.srank[2]) < 2 && trankStr !== '' && !(month === 1 && day > 6 && day < 13)) ||
          (/1955|Monastic.*Divino|1963/.test(version) &&
            num(state.srank[2]) >= 2.2 &&
            num(state.srank[2]) < 2.9 &&
            /Semiduplex/i.test(state.srank[1] ?? ''))
        ) {
          srankStr = ''
          state.saint = {}
          state.sname = ''
          state.srank = []
        } else if (
          (!/196/.test(version) || dayofweek === 6) &&
          month === 11 &&
          /Omnium Fidelium defunctorum/i.test(srankStr) &&
          !state.caller
        ) {
          state.srank[2] = '1'
          srankStr = ''
        }
      } else {
        state.svesp = 2
      }

      if (
        (num(state.trank[2]) >= (/19(?:55|6)/i.test(version) ? 6 : 7) && num(state.srank[2]) < 6) ||
        (!/Dominica(?!.*Trinitatis)|Feria|Sabbato|In Octava/i.test(trankStr) &&
          ((num(state.trank[2]) >= 6 && num(state.srank[2]) < 2.1) ||
            (num(state.trank[2]) >= 5 &&
              num(state.srank[2]) === 2 &&
              // Upstream tests the rank NUMBER against this text regex (likely
              // meant $srank[0]); always false — kept for fidelity.
              /infra octavam|post Octavam Asc|Vigilia Pent/i.test(state.srank[2] ?? '')))) ||
        (/19(?:55|6)/i.test(version) &&
          ((/vigil/i.test(srankStr) && dayofweek === 0 && month < 12) ||
            (/(infra octavam|in octava)/i.test(srankStr) && nooctnat(state)))) ||
        (/1960/.test(version) &&
          dayofweek === 0 &&
          ((num(state.trank[2]) >= 6 && num(state.srank[2]) < 6) ||
            (num(state.trank[2]) >= 5 && num(state.srank[2]) < 5)))
      ) {
        srankStr = ''
        state.saint = {}
        state.sname = ''
        state.srank = []
        state.commemoentries = []
      } else if (
        /196/.test(version) &&
        ((num(state.srank[2]) >= 6 &&
          num(state.trank[2]) < 6 &&
          !(
            num(state.trank[2]) === 2.1 ||
            num(state.trank[2]) === 3.9 ||
            num(state.trank[2]) === 4.9 ||
            /Dominica/i.test(state.trank[0] ?? '')
          )) ||
          (/Dominica/i.test(state.trank[0] ?? '') &&
            !/Nat1/i.test(ctx.dayname[0]) &&
            num(state.trank[2]) <= 5 &&
            num(state.srank[2]) >= 5 &&
            /Festum Domini/i.test(state.saint.Rule ?? '')))
      ) {
        state.tname = ''
        trankStr = ''
        state.trank = []
        state.tempora = {}
      } else if (
        /1955|Monastic.*Divino|1963/.test(version) &&
        num(state.srank[2]) >= 2.2 &&
        num(state.srank[2]) < 2.9 &&
        /Semiduplex/i.test(state.srank[1] ?? '')
      ) {
        state.srank[2] = /Monastic/i.test(version) ? '1.1' : '1.2'
      }
    } else {
      srankStr = ''
      state.saint = {}
      state.sname = ''
      state.srank = []
    }
  }

  // In Festo Sanctæ Mariæ Sabbato. (Upstream also tests `!$tommorow || 196` —
  // $tommorow is a typo for $tomorrow, never set, so the clause is always
  // true; replicated by omission.)
  if (
    dayofweek === 6 &&
    num(state.trank[2]) < 1.4 &&
    num(state.srank[2]) < 1.4 &&
    !state.transfervigil
  ) {
    if (!tomorrow) state.scriptura = state.tname
    if (num(state.trank[2]) === 1.15) {
      state.tname = state.tname.replace(/\.txt$/, '')
      state.commemoentries.unshift(state.tname)
      state.commemoratio = state.tname
      state.comrank = num(state.trank[2])
    }
    trankStr = `Sanctæ Mariæ Sabbato;;Simplex;;1.3;;vide ${state.C10}`
    state.tempora.Rank = trankStr
    state.tname = `${subdirname('Commune', version)}${state.C10}.txt`
    state.trank = trankStr.split(';;')
  }

  if (
    /Trid/i.test(version) &&
    ((num(state.trank[2]) < 5.1 &&
      num(state.trank[2]) > 4.2 &&
      /Dominica/i.test(state.trank[0] ?? '') &&
      !/altovadensis/i.test(version)) ||
      (/infra octavam Corp/i.test(state.trank[0] ?? '') && !/Cist/i.test(version)))
  ) {
    state.trank[2] = '2.9'
  } else if (
    /divino|altovadensis/i.test(version) &&
    num(state.trank[2]) < 5.1 &&
    /Dominica/i.test(state.trank[0] ?? '')
  ) {
    state.trank[2] = /divino/i.test(version) ? '4.9' : '3.9'
  } else if (/196/.test(version) && /Nat1/i.test(state.tname) && day > 28) {
    state.sname = `${subdirname('Tempora', version)}Nat${day}`
    state.saint = await loadSetup(state, state.sname)
    srankStr = state.saint.Rank ?? ''
    state.srank = srankStr.split(';;')
  } else if (
    /Adv|Quad/.test(ctx.dayname[0]) &&
    num(state.srank[2]) > 6 &&
    !/12-24/.test(state.sname) &&
    !/Patronus/.test(state.saint.Rule ?? '')
  ) {
    state.srank[2] = '6.01'
  }

  if (/Epi1-0/i.test(state.tname) && num(state.srank[2]) === 5.6) {
    state.srank[2] = '2.9'
  }

  // Sort out occurrence between the sanctoral and temporal cycles.
  if (
    !num(state.srank[2]) ||
    (/19(?:55|6)|Monastic.*Divino/i.test(version) && num(state.srank[2]) <= 1.1) ||
    /Sanctæ Mariaæ Sabbato/i.test(state.trank[0] ?? '')
  ) {
    state.sanctoraloffice = false
  } else if (num(state.srank[2]) > num(state.trank[2])) {
    state.sanctoraloffice = true
  } else if (/Dominica/i.test(state.trank[0] ?? '') && !/Nat1/i.test(ctx.dayname[0])) {
    if (/196/.test(version)) {
      if (
        num(state.trank[2]) <= 5 &&
        (num(state.srank[2]) >= 6 ||
          (num(state.srank[2]) >= 5 && /Festum Domini/i.test(state.saint.Rule ?? '')))
      ) {
        state.sanctoraloffice = true
      } else if (/Conceptione Immaculata/.test(state.srank[0] ?? '')) {
        state.sanctoraloffice = true
      } else {
        state.sanctoraloffice = false
      }
    } else if (
      /Festum Domini/i.test(state.saint.Rule ?? '') &&
      num(state.srank[2]) >= 2 &&
      num(state.trank[2]) <= 5
    ) {
      state.sanctoraloffice = true
      state.srank[2] = String(4.9 + num(state.srank[2]) / 100)
    } else {
      state.sanctoraloffice = false
    }
  } else if (
    ctx.missa &&
    (state.srank[1] ?? '') === 'Vigilia' &&
    /Advent/.test(state.trank[0] ?? '') &&
    !/Quatt?uor/.test(state.trank[0] ?? '')
  ) {
    state.sanctoraloffice = true
  } else {
    state.sanctoraloffice = false
  }

  if (state.sanctoraloffice) {
    state.rank = num(state.srank[2])
    officename[1] = `${state.srank[0] ?? ''} ${state.srank[1] ?? ''}`
    state.winner = state.sname
    state.vespera = state.svesp

    const common = await extractCommon(
      state,
      state.srank[3] ?? '',
      state.rank,
      /Pasc/.test(ctx.dayname[0]),
    )
    if (common) {
      state.communetype = common.communetype
      state.commune = common.commune
    }

    if (/^(ex|vide)\s*(C[0-9]+[a-z]*)/i.test(state.srank[3] ?? '')) {
      const communesname = await getdialogCommunes(state)
      const cm = /^.*(C\d.*)\.txt/.exec(state.commune)
      officename[1] += ` ${state.communetype} ${(cm && communesname[cm[1]]) ?? ''} [${state.commune}]`
    }

    if (/01-12t/.test(state.winner) && /laudes/i.test(ctx.hora)) {
      state.commemoentries.unshift('Sancti/01-06.txt')
      state.commemoratio = 'Sancti/01-06.txt'
      state.comrank = 5.6
    } else if (
      num(state.srank[2]) < 7 &&
      !/01-01/.test(state.sname) &&
      (num(state.trank[2]) >= (num(state.srank[2]) >= 5 ? 2.1 : 1.5) ||
        (/cist/i.test(version) && num(state.trank[2]) === 1.15)) &&
      !(/Sangu/i.test(state.srank[0] ?? '') && /Cor[dp]/i.test(state.trank[0] ?? ''))
    ) {
      state.commemoentries.unshift(state.tname)
      state.commemoratio = state.tname
      state.comrank = num(state.trank[2])
      state.cvespera = state.tvesp
      officename[2] = `Commemoratio: ${state.trank[0] ?? ''}`
      if (/Pasc5-[13]/i.test(tfile)) {
        officename[2] = officename[2].replace(':', ' ad Laudes & Matutinum:')
      }
      if (/Quattuor.*Sept/.test(state.trank[0] ?? '')) {
        officename[2] = officename[2].replace(':', ' ad Laudes tantum:')
      }
    } else if (state.commemoentries[0]) {
      const transferedC = state.commemoentries[0]
      state.commemoratio = `${transferedC}.txt`
      const tc = await loadSetup(state, state.commemoratio)
      const cr = (tc.Rank ?? '').split(';;')
      if (!(!/196/.test(version) && state.svesp === 3 && num(cr[2]) < 2)) {
        state.comrank = num(cr[2])
        state.cvespera = state.svesp
        officename[2] = `Commemoratio: ${cr[0] ?? ''}`
        if (/196/i.test(version)) {
          if (num(cr[2]) < 6) officename[2] = officename[2].replace(':', ' ad Laudes tantum:')
        } else if (!/trident/i.test(version) && num(state.srank[2]) >= 6) {
          if (
            num(cr[2]) < 4.2 &&
            num(cr[2]) !== 2.1 &&
            !/infra octavam|post Octavam Asc|Vigilia Pent/i.test(state.srank[0] ?? '')
          ) {
            officename[2] = officename[2].replace(':', ' ad Laudes tantum:')
          }
        } else if (
          num(state.srank[2]) >= 6 &&
          !/in.*octava|post Octavam Asc|Vigilia Pent/i.test(state.srank[0] ?? '') &&
          num(cr[2]) < 3.1 &&
          num(cr[2]) !== 2.999
        ) {
          state.commemoratio = ''
          state.comrank = 0
          state.commemoentries = []
          officename[2] = ''
        } else if (
          num(state.srank[2]) >= 5 &&
          num(cr[2]) < 2 &&
          !/infra octavam|post Octavam Asc|Vigilia Pent/i.test(state.srank[0] ?? '')
        ) {
          officename[2] = officename[2].replace(':', ' ad Laudes & Matutinum:')
        }
      }
    } else if (transferedAway) {
      if (!/Vespera|Completorium/i.test(ctx.hora)) {
        const t = await officestring(state, 'Latin', `${transferedAway}.txt`)
        if (t && Object.keys(t).length > 0) {
          const tr = (t.Rank ?? '').split(';;')
          officename[2] = `Transfer: ${tr[0] ?? ''}`
        } else {
          officename[2] = 'Transfer: file not found'
        }
      }
      state.commemoratio = ''
      state.comrank = 0
    } else {
      state.comrank = 0
      state.commemoratio = ''
    }

    if (!officename[2] && state.transfervigil) {
      const vw = await loadSetup(state, state.transfervigil)
      const o = vw['Oratio Vigilia'] ?? ''
      const vm = /!.*?(Vigilia .*)/.exec(o)
      if (vm) officename[2] = `Commemoratio: ${vm[1]}`
    }

    if (!officename[2] && (state.saint['Commemoratio 2'] || state.saint.Commemoratio)) {
      let line = (state.saint['Commemoratio 2'] || state.saint.Commemoratio || '').split('\n')[0]
      const am = /@([a-z0-9/-]+?):/is.exec(line)
      if (am) {
        const s = await loadSetup(state, `${am[1]}.txt`)
        line = `!Commemoratio ${s.Officium ?? ''}`
      }
      if (line.startsWith('!Commemoratio ')) {
        officename[2] = `Commemoratio: ${line.replace(/^!Commemoratio /, '')}`
      }
      if ((num(state.srank[2]) >= 5 && state.saint['Commemoratio 2']) || /196/.test(version)) {
        officename[2] = officename[2].replace(':', ' ad Laudes tantum:')
      }
    }

    if (
      (/matutinum/i.test(ctx.hora) ||
        (!officename[2] && !/Vespera|Completorium/i.test(ctx.hora))) &&
      state.rank < 7 &&
      (state.trank[0] ?? '') !== '' &&
      !ctx.missa
    ) {
      const scrip = (await officestring(state, 'Latin', state.tname)) ?? {}
      if (
        !(
          state.saint.Lectio1 !== undefined &&
          (!/Lectio1 Quad/i.test(state.saint.Rule ?? '') || /Quad(\d|p3-[3456])/i.test(state.tname))
        ) &&
        scrip.Lectio1 !== undefined &&
        !/evangelii/i.test(scrip.Lectio1) &&
        (!/;;ex /.test(state.saint.Rank ?? '') ||
          (/trident/i.test(version) && !/;;(vide|ex) /i.test(state.saint.Rank ?? '')) ||
          /Lectio1 temp/i.test(state.saint.Rule ?? ''))
      ) {
        const ittable = initiarule(month, day, year)
        if (ittable && !/~[A]$/.test(ittable)) {
          // Ported with Matins (M7); unreachable while initiarule is stubbed.
          officename[2] = `Tempora: ${state.trank[0] ?? ''}`
        } else if (!/monastic/i.test(version) || !/(?:Pasc|Pent)/.test(state.tname) || month > 10) {
          officename[2] = `Tempora: ${state.trank[0] ?? ''}`
        } else {
          officename[2] = `Scriptura: ${state.trank[0] ?? ''}`
        }
      } else {
        officename[2] = `Tempora: ${state.trank[0] ?? ''}`
      }
      state.scriptura = state.tname
    } else if (ctx.missa) {
      state.scriptura = state.tname
    }
  } else {
    // Winner is Tempora.
    if (
      !/Vespera/i.test(ctx.hora) &&
      num(state.trank[2]) < (/cist/i.test(version) ? 1.25 : 1.5) &&
      state.transfervigil
    ) {
      // Upstream assigns the hashref to a hash (`my %w = setupstring(...)`),
      // so the vigil becomes the office but its Rank is lost. Replicated.
      const w = await loadSetup(state, state.transfervigil)
      if (Object.keys(w).length > 0) {
        state.tname = state.transfervigil
        trankStr = ''
        state.trank = []
      }
    }

    state.rank = num(state.trank[2])
    officename[1] = `${state.trank[0] ?? ''}\t${state.trank[1] ?? ''}`
    state.winner = state.tname
    state.vespera = state.tvesp

    const common = await extractCommon(
      state,
      state.trank[3] ?? '',
      state.rank,
      /Pasc/.test(ctx.dayname[0]),
    )
    if (common) {
      state.communetype = common.communetype
      state.commune = common.commune
    }

    if (/^(ex|vide)\s*(C[0-9]+[a-z]*)/i.test(state.trank[3] ?? '')) {
      const communesname = await getdialogCommunes(state)
      officename[1] += ` ${state.communetype} ${communesname[state.commune] ?? ''} [${state.commune}]`
    }

    if (/1960/.test(version) && state.vespera === 1 && state.rank >= 6 && state.comrank < 5) {
      state.commemoratio = ''
      state.srank[2] = '0'
      state.commemoentries = []
    }

    let climit = await climit1960(state, state.sname)

    if (/vigil/i.test(state.srank[0] ?? '') && !/Epiph/i.test(state.srank[0] ?? '')) {
      state.laudesonly =
        /(Adv|Quad[0-6])/i.test(ctx.dayname[0]) ||
        (/Quadp3/i.test(ctx.dayname[0]) && dayofweek >= 4) ||
        (/Quadp/i.test(ctx.dayname[0]) && /Monastic.*Divino/i.test(version)) ||
        /Quattuor Temporum Sept/.test(state.trank[0] ?? '')
          ? ' ad Missam tantum'
          : ' ad Laudes tantum'
    } else {
      state.laudesonly = ctx.missa ? '' : climit === 2 ? ' ad Laudes tantum' : ''
    }

    if (
      (/Epi1-0a/.test(state.winner) ||
        (/Epi1-0/.test(state.winner) && /altovadensis/i.test(version))) &&
      (/laudes/i.test(ctx.hora) || (state.vespera === 3 && day !== 12))
    ) {
      state.commemoentries.unshift('Sancti/01-06.txt')
      state.commemoratio = 'Sancti/01-06.txt'
      state.comrank = 5.6
    } else if (
      num(state.srank[2]) !== 0 &&
      climit !== 0 &&
      !/omit.*? commemoratio/i.test(state.tempora.Rule ?? '') &&
      !/No commemoratio/i.test(state.tempora.Rule ?? '')
    ) {
      if (/laudes/i.test(ctx.hora) || ctx.missa || climit === 1) {
        state.commemoentries.unshift(state.sname)
        state.commemoratio = state.sname
        state.comrank = num(state.srank[2])
        state.cvespera = state.svesp
      }
      const comm = /^In Commemoratione/.test(state.srank[0] ?? '') ? '' : 'Commemoratio:'
      officename[2] = `${comm} ${state.srank[0] ?? ''}`
      if (/196/i.test(version)) {
        if ((num(state.trank[2]) >= 5 && num(state.srank[2]) < 2) || climit === 2) {
          officename[2] = officename[2].replace(':', ` ${state.laudesonly}:`)
        }
      } else if (!/trident/i.test(version) && num(state.trank[2]) >= 6) {
        if (
          num(state.srank[2]) < 4.2 &&
          num(state.srank[2]) !== 2.1 &&
          !/infra octavam|Vigilia Pent|cinerum|majoris hebd|in Octava|Albis|Quattuor Temporum Pentecostes/i.test(
            state.trank[0] ?? '',
          ) &&
          !/Adv|Quad/i.test(state.tname)
        ) {
          officename[2] = officename[2].replace(':', ' ad Laudes tantum:')
        }
      } else if (state.laudesonly) {
        officename[2] = officename[2].replace(':', ` ${state.laudesonly}:`)
      } else if (
        num(state.trank[2]) >= 5 &&
        num(state.srank[2]) < 2 &&
        !/infra octavam|Vigilia Pent|cinerum|majoris hebd|in Octava|Albis/i.test(
          state.trank[0] ?? '',
        ) &&
        !/Adv|Quad/i.test(state.tname)
      ) {
        officename[2] = officename[2].replace(':', ' ad Laudes & Matutinum:')
      }
      if (/196/i.test(version) && /Januarii/i.test(officename[2])) officename[2] = ''
    } else if (
      state.commemoentries[0] &&
      !/omit.*? commemoratio/i.test(state.tempora.Rule ?? '') &&
      !/No commemoratio/i.test(state.tempora.Rule ?? '')
    ) {
      const transferedC = state.commemoentries[0]
      state.commemoratio = `${transferedC}.txt`
      climit = await climit1960(state, state.commemoratio)
      if (climit !== 0) {
        state.laudesonly = ctx.missa ? '' : climit === 2 ? ' ad Laudes tantum' : ''
        const tc = await loadSetup(state, state.commemoratio)
        const cr = (tc.Rank ?? '').split(';;')
        state.comrank = num(cr[2])
        state.cvespera = state.svesp
        officename[2] = `Commemoratio: ${cr[0] ?? ''}`
        if (/196/i.test(version)) {
          if ((num(state.trank[2]) >= 5 && num(cr[2]) < 2) || climit === 2) {
            officename[2] = officename[2].replace(':', ` ${state.laudesonly}:`)
          }
        } else if (!/trident/i.test(version) && num(state.trank[2]) >= 6) {
          if (
            num(cr[2]) < 4.2 &&
            num(cr[2]) !== 2.1 &&
            !/infra octavam|Vigilia Pent|cinerum|majoris hebd/i.test(state.trank[0] ?? '')
          ) {
            officename[2] = officename[2].replace(':', ' ad Laudes tantum:')
          }
        } else if (state.laudesonly) {
          officename[2] = officename[2].replace(':', ` ${state.laudesonly}:`)
        } else if (
          num(state.trank[2]) >= 5 &&
          num(cr[2]) < 2 &&
          !/infra octavam|Vigilia Pent|cinerum|majoris hebd/i.test(state.trank[0] ?? '')
        ) {
          officename[2] = officename[2].replace(':', ' ad Laudes & Matutinum:')
        }
      } else {
        state.commemoratio = ''
        state.commemoentries = []
      }
    } else if (transferedAway) {
      if (!/Vespera|Completorium/i.test(ctx.hora)) {
        const t = await officestring(state, 'Latin', `${transferedAway}.txt`)
        if (t && Object.keys(t).length > 0) {
          const tr = (t.Rank ?? '').split(';;')
          officename[2] = `Transfer: ${tr[0] ?? ''}`
        } else {
          officename[2] = `Transfer: ${transferedAway} file not found`
        }
      }
      state.commemoratio = ''
      state.comrank = 0
    } else {
      state.commemoratio = ''
      state.comrank = 0
    }

    if (!state.commemoratio && state.sname) {
      const sn = state.sname.replace(/v\./, '.')
      const s = await loadSetup(state, sn)
      if (
        /Vigil/i.test(s.Rank ?? '') &&
        (s.Commemoratio !== undefined || s['Commemoratio 2'] !== undefined)
      ) {
        state.commemorated = sn
      }
    }

    if (!(officename[2] || ctx.missa)) {
      const ittable = initiarule(month, day, year)
      if (ittable && !/~[A]$/.test(ittable)) {
        // Ported with Matins (M7); unreachable while initiarule is stubbed.
      }
    }
  }

  state.trankStr = trankStr
  state.srankStr = srankStr

  if (month === 1 && day < 14 && !/Epi/i.test(officename[0])) {
    officename[0] = `Nat${day}`
  }

  if (tomorrow) {
    state.tomorrowname = officename
  } else {
    ctx.dayname = officename
  }

  if (/trident/i.test(version) && /ex/i.test(state.communetype) && state.rank < 1.5) {
    state.communetype = 'vide'
  }
}
