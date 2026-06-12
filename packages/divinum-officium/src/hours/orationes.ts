// Port of specials/orationes.pl: oratio() with the full Lauds/Vespers
// commemoration machinery (getcommemoratio, vigilia_commemoratio, getrefs),
// getsuffragium, and delconclusio. Non-GABC paths only.

import { nooctnat } from '../kalendar/occurrence'
import { officestring, sessionWithLang } from '../kalendar/officestring'
import { num, subdirname } from '../kalendar/state'
import { type Sections, setupstring } from '../references/resolve'
import { applyInclusionSubstitutions } from '../references/substitutions'
import { postprocessAnt, postprocessVr } from './helpers'
import { checksuffragium, getfrompsalterium, replaceNdot, setcomment, setup } from './proprium'
import { chompd, columnsel, communeOf, type HoursState, winnerOf } from './state'

// Port of papal_rule — [plural, class, name] when the rule carries an
// O/CPapa clause.
function papalRule(rule: string, commemoration = false): [string, string, string] | undefined {
  const classchar = commemoration ? 'C' : 'O'
  const m = new RegExp(`${classchar}Papa(e)?([CMD])=(.*?);`, 'i').exec(rule)
  if (!m) return undefined
  return [m[1] ?? '', m[2], m[3]]
}

// Port of papal_prayer (horas flavour: C4, num 91/9).
async function papalPrayer(
  state: HoursState,
  lang: string,
  plural: string,
  cls: string,
  name: string,
  type = 'Oratio',
): Promise<string> {
  const version = state.day.ctx.version
  const common = await setup(state, lang, `${subdirname('Commune', version)}C4`)
  const numSuffix = plural ? '91' : '9'
  let prayer = common[`${type}${numSuffix}`] ?? ''
  prayer = prayer.replace(/ N\.([a-z ]+N\.)*/, ` ${name}`)
  if (!/M/i.test(cls)) {
    prayer = prayer.replace(/\s*\((.|~[\s\n\r]*)*?\)/, '')
  } else {
    prayer = prayer.replace(/[()]/g, '')
  }
  return prayer
}

// Port of papal_antiphon_dum_esset.
export async function papalAntiphonDumEsset(state: HoursState, lang: string): Promise<string> {
  const version = state.day.ctx.version
  const common = await setup(state, lang, `${subdirname('Commune', version)}C4`)
  return common['Ant 3 summi Pontificis'] ?? ''
}

export { papalRule }

// Port of delconclusio — splits the trailing $Per/$Qui conclusion off an
// oration block.
function delconclusio(ostrIn: string, conclusioIn: string, version: string): [string, string] {
  let ostr = ostrIn
  let conclusio = conclusioIn
  if (/\$Per/.test(ostr) && /\$Qui/.test(ostr) && !/196/.test(version)) {
    let m = /([\s\S]*?)(\n\$Per [^\n\r]*?\s*)$/.exec(ostr)
    if (m) {
      conclusio = m[2]
      ostr = m[1].replace(/\$Qui [^\n\r]*\s*/, '')
    } else {
      m = /([\s\S]*?)(\n\$Qui [^\n\r]*?\s*)$/.exec(ostr)
      if (m) {
        conclusio = m[2]
        ostr = m[1].replace(/\$Per [^\n\r]*\s*/, '')
      }
    }
  } else {
    // Perl: s/^(\$(?!Oremus).*?(\n|$)((_|\s*)(\n|$))*)//m
    const m = /^(\$(?!Oremus).*?(\n|$)((_|[^\S\n]*)(\n|$))*)/m.exec(ostr)
    if (m) {
      conclusio = m[1]
      ostr = ostr.replace(m[1], '')
    }
  }
  return [ostr, conclusio]
}

// The shared commemoration-block normalization before splitting on '!!'.
function normalizeCommemo(c: string): string {
  let out = c
  out = out.replace(/\n!/g, '\n!!')
  out = out.replace(/!!Oratio/gi, '!Oratio')
  out = out.replace(/\$Oremus\s*\n(v\. )?/g, '$$Oremus\nv. ')
  return out
}

async function octavestring(state: HoursState, lang: string): Promise<string> {
  return `!.*?(O[ckt]t[aá]|${await state.texts.translate('Octava', lang)})`
}

async function sundaystring(state: HoursState, lang: string): Promise<string> {
  return `Dominic[aæ]|${await state.texts.translate('Dominica', lang)}`
}

export async function oratio(
  state: HoursState,
  lang: string,
  params: { special?: boolean } = {},
): Promise<void> {
  const ctx = state.day.ctx
  const { version, dayofweek, month, day } = ctx
  const hora = state.hora
  state.collectcount = 1
  let addconclusio = ''

  let wSections: Sections = winnerOf(state, lang)
  const ind = hora === 'Vespera' ? state.day.vespera : 2

  await setcomment(
    state,
    state.label,
    params.special ? 'Preces' : 'Source',
    params.special ? 2 : (/Sancti/.test(state.day.winner) ? 1 : 0) + 2,
    lang,
  )

  let rule = state.rule
  if (
    /Epi1/i.test(ctx.dayname[0]) &&
    /Infra octavam Epiphaniæ Domini/i.test(rule) &&
    /1955|196/.test(version)
  ) {
    rule += 'Oratio Dominica\n'
  }

  if (
    (/Oratio Dominica/i.test(rule) &&
      (state.day.winnerSections.Oratio === undefined || hora === 'Vespera')) ||
    (/Quattuor/i.test(state.day.winnerSections.Rank ?? '') &&
      !/Pasc7/i.test(ctx.dayname[0]) &&
      !/196|cist/i.test(version) &&
      hora === 'Vespera')
  ) {
    let name = `${ctx.dayname[0]}-0`
    if (/(?:Epi1|Nat)/i.test(name) && version !== 'Monastic - 1930') name = 'Epi1-0a'
    wSections =
      (await setupstring(
        sessionWithLang(state.session, lang),
        `${subdirname('Tempora', version)}${name}`,
      )) ?? {}
  }

  let w: string | undefined
  if (dayofweek > 0 && state.day.winnerSections.OratioW !== undefined && state.day.rank < 5) {
    w = wSections.OratioW
  } else {
    w = wSections.Oratio
  }

  if (hora === 'Matutinum' && state.day.winnerSections['Oratio Matutinum'] !== undefined) {
    w = wSections['Oratio Matutinum']
  } else if (!w || state.day.winnerSections[`Oratio ${ind}`] !== undefined) {
    w = wSections[`Oratio ${ind}`]
  }

  if (!w) {
    const c = communeOf(state, lang)
    let i = ind
    w = c[`Oratio ${i}`]
    if (!w) {
      i = 4 - i
      w = c[`Oratio ${i}`]
    }
    if (!w) w = c.Oratio
  }

  if (!w) {
    let i = ind
    if (i === 2) {
      i = 3
      w = wSections[`Oratio ${i}`]
    } else {
      w = wSections['Oratio 2']
    }
    if (!w) {
      i = 4 - i
      w = wSections[`Oratio ${i}`]
    }
  }

  // Special processing for Common of Supreme Pontiffs.
  if (!/Trident/i.test(version)) {
    const pr = papalRule(wSections.Rule ?? '')
    if (pr) w = await papalPrayer(state, lang, pr[0], pr[1], pr[2])
  }

  if (!w && state.day.commune) {
    const com = communeOf(state, lang)
    w = com.Oratio ?? com[`Oratio ${ind}`]
  }

  if (/Tempora/.test(state.day.winner) && !w) {
    const name = `${ctx.dayname[0]}-0`
    const sunday =
      (await officestring(state.day.state, lang, `${subdirname('Tempora', version)}${name}.txt`)) ??
      {}
    w = sunday.Oratio ?? sunday['Oratio 2']
  }

  if (w && /N\./.test(w)) {
    let name = wSections.Name
    if (!name) {
      const pr = papalRule(wSections.Rule ?? '')
      if (pr) name = pr[2]
    }
    if (name) w = replaceNdot(state, w, lang, name)
  }

  // Delete an appended commemoratio (kept at Lauds/Vespers, except the
  // 'precedenti/sequenti' trim at Lauds).
  if (w) {
    const comm = await state.texts.translate('Commemoratio', lang)
    const commRegex = new RegExp(`!(${comm}|Commemoratio)`, 'i')
    const preludeRegex = new RegExp(`([\\s\\S]*?)!(?:${comm}|Commemoratio)`, 'i')
    if (!/(laudes|vespera)/i.test(hora)) {
      const m = preludeRegex.exec(w)
      if (m) w = m[1].replace(/\s*_\s*/, '')
    } else if (hora === 'Laudes' && commRegex.test(w)) {
      const m = /([\s\S]*?)(precedenti|sequenti)/i.exec(w)
      if (m) w = m[1].replace(/\s*_\s*/, '')
    }
  }
  if (!w) w = 'Oratio missing'

  const horamajor = hora === 'Laudes' || hora === 'Vespera'

  if (!/Limit.*?Oratio/i.test(rule)) {
    // No Dominus vobiscum after Te decet.
    if (!/^Monastic/.test(version) || hora !== 'Matutinum' || !/12 lectiones/.test(rule)) {
      if (/Monastic/.test(version) && (!/C12/.test(state.day.winner) || !/cist/i.test(version))) {
        if (horamajor) {
          state.s.push('$Kyrie')
          if (!/C12/.test(state.day.winner)) state.s.push('$Pater noster Et', '_')
        } else {
          state.s.push('$Kyrie', '$pater secreto', '_')
        }
      } else if (/C12/.test(state.day.winner) && !/19[56]|cist/i.test(version)) {
        state.s.push('$Kyrie')
      }

      if (state.priest) {
        state.s.push('&Dominus_vobiscum')
      } else if (!state.precesferiales) {
        state.s.push('&Dominus_vobiscum')
      } else {
        const text = (await state.texts.prayer('Dominus', lang)).split('\n')
        state.s.push(text[4] ?? '')
        state.precesferiales = false
      }
    }

    const oremus = await state.texts.translate('Oremus', lang)
    state.s.push(`v. ${oremus}`)
  }

  // Sub unica conclusione: hold back / drop the conclusion.
  if (horamajor && /Sub unica conc/i.test(state.day.winnerSections.Rule ?? '')) {
    if (!/196/.test(version)) {
      let m = /([\s\S]*?)(\n\$Per [^\n\r]*?\s*)$/.exec(w)
      if (m) {
        addconclusio = m[2]
        w = m[1]
      }
      m = /([\s\S]*?)(\n\$Qui [^\n\r]*?\s*)$/.exec(w)
      if (m) {
        addconclusio = m[2]
        w = m[1]
      }
    } else {
      w = w.replace(/\$(Per|Qui) .*?\n/, '')
    }
  }

  // Ensure the large red initial.
  if (!/^[$&#/!{]/.test(w)) {
    w = w.replace(/^(?:v\. )?/, 'v. ')
  }

  state.s.push(w)
  if (/omit .*? commemoratio/i.test(rule)) return

  // *** SET COMMEMORATIONS ***
  const cc: Record<string, string> = {}
  let ccind = 0
  state.octavcount = 0
  const octRe = await octavestring(state, lang)
  const sunRe = await sundaystring(state, lang)
  const octRegex = new RegExp(octRe, 'i')
  const sunBangRegex = new RegExp(`${octRe}|!.*?(?:${sunRe})`, 'i')
  const sunRegex = new RegExp(sunRe, 'i')

  // Prevent "contamination" from the Oratio Dominica override.
  const wsec = winnerOf(state, lang)
  const kal = state.day.state
  const cwinner = kal.cwinner
  const octvespera = kal.octvespera
  const vespera = state.day.vespera

  const splitCommemos = (cIn: string): string[] => normalizeCommemo(cIn).split('!!')

  if (horamajor && state.day.rank < 7) {
    let cvesp = [2] // assume Lauds unless otherwise

    // Add commemorated from winner.
    if (
      !(
        (state.day.rank >= (!/cist/i.test(version) ? 6 : 7) &&
          !/Pasc[07]|Pent01/.test(ctx.dayname[0])) ||
        (/196/.test(version) && /nocomm1960/i.test(state.day.winnerSections.Rule ?? ''))
      )
    ) {
      let c = ''
      if (wsec[`Commemoratio ${vespera}`] !== undefined) {
        c = await getrefs(
          state,
          wsec[`Commemoratio ${vespera}`] ?? '',
          lang,
          vespera,
          wsec.Rule ?? '',
        )
      } else if (
        wsec.Commemoratio !== undefined &&
        (vespera !== 3 ||
          /Tempora|C12/i.test(state.day.winner) ||
          /!.*O[ckt]ta/i.test(wsec.Commemoratio ?? ''))
      ) {
        c = await getrefs(state, wsec.Commemoratio ?? '', lang, vespera, wsec.Rule ?? '')
      }

      if (c && octvespera && octRegex.test(c)) {
        state.octavam = ''
        if (wsec[`Commemoratio ${octvespera}`] !== undefined) {
          c = await getrefs(
            state,
            wsec[`Commemoratio ${octvespera}`] ?? '',
            lang,
            octvespera,
            wsec.Rule ?? '',
          )
        } else if (wsec[`Commemoratio ${4 - octvespera}`] !== undefined) {
          c = await getrefs(
            state,
            wsec[`Commemoratio ${4 - octvespera}`] ?? '',
            lang,
            octvespera,
            wsec.Rule ?? '',
          )
        } else if (wsec.Commemoratio !== undefined) {
          c = await getrefs(state, wsec.Commemoratio ?? '', lang, octvespera, wsec.Rule ?? '')
        }
      }

      if (c) {
        for (let ic of splitCommemos(c)) {
          if (
            !ic ||
            /^\s*$/.test(ic) ||
            (sunBangRegex.test(ic) && nooctnat(kal)) ||
            (/19(?:55|6)/.test(version) &&
              /!.*?Vigil/i.test(ic) &&
              /Sancti/i.test(state.day.winner) &&
              !/08-14|06-23|06-28|08-09/.test(state.day.winner))
          ) {
            continue
          }
          if (!ic.startsWith('!')) ic = `!${ic}`
          ccind++
          const key = sunRegex.test(ic.replace(/^!/, '!'))
            ? !/trident/i.test(version)
              ? 3000
              : !/altovadensis/i.test(version)
                ? 7100
                : 6100
            : octRegex.test(ic)
              ? !cwinner && octvespera && /divino|1906/i.test(version)
                ? 1000
                : ccind + 7900
              : ccind + 9900
          cc[String(key)] = ic
        }
      }

      if (state.day.transfervigil) {
        let tv = state.day.transfervigil
        if (!(await state.session.loader.exists(`horas/${lang}/${tv.replace(/\.txt$/, '')}`))) {
          tv = tv.replace(/v\.txt/, '.txt')
        }
        const cv = await vigiliaCommemoratio(state, tv, lang)
        if (cv) {
          ccind++
          cc[String(ccind + 8500)] = cv
        }
      }
    }

    if (hora === 'Vespera') {
      // Add the concurrent office.
      if (cwinner) {
        let key = 0
        let cwname = cwinner
        if (
          !(await state.session.loader.exists(`horas/${lang}/${cwname.replace(/\.txt$/, '')}`)) &&
          !/txt$/i.test(cwname)
        ) {
          cwname += '.txt'
        }
        let c = await getcommemoratio(state, cwname, kal.cvespera, lang)
        let cSec =
          (await officestring(kal, lang, cwname, kal.cvespera === 1 && /tempora/i.test(cwname))) ??
          {}

        if (c && octvespera && octvespera !== kal.cvespera && octRegex.test(c)) {
          c = await getcommemoratio(state, cwname, octvespera, lang)
          cSec =
            (await officestring(kal, lang, cwname, octvespera === 1 && /tempora/i.test(cwname))) ??
            {}
        }

        if (c) {
          const cr = (cSec.Rank ?? '').split(';;')
          if (/trident/i.test(version) && !/1906/.test(version)) {
            key =
              sunRegex.test(cr[0] ?? '') || /01-05\.txt/.test(cwname)
                ? /altovadensis/i.test(version)
                  ? 3900
                  : 2900
                : num(cr[2]) * 1000
          } else {
            key = /infra Octavam Epi/i.test(cSec.Rule ?? '') ? 5600 : 9000
          }
          key = 10000 - key
          ccind++
          cc[String(key)] = c
        }

        // Add commemorated from cwinner.
        if (
          !(
            (state.day.rank >= (!/cist/i.test(version) ? 6 : 7) &&
              !/Pasc[07]|Nat0?6/.test(ctx.dayname[0])) ||
            /no commemoratio/i.test(rule) ||
            (/196/.test(version) && /nocomm1960/i.test(cSec.Rule ?? ''))
          )
        ) {
          let c2 = ''
          if (cSec[`Commemoratio ${kal.cvespera}`] !== undefined) {
            c2 = await getrefs(
              state,
              cSec[`Commemoratio ${kal.cvespera}`] ?? '',
              lang,
              kal.cvespera,
              cSec.Rule ?? '',
            )
          } else if (octvespera && cSec[`Commemoratio ${octvespera}`] !== undefined) {
            c2 = await getrefs(
              state,
              cSec[`Commemoratio ${octvespera}`] ?? '',
              lang,
              octvespera,
              cSec.Rule ?? '',
            )
          } else if (
            cSec.Commemoratio !== undefined &&
            (kal.cvespera !== 3 ||
              /Tempora/i.test(cwname) ||
              /!.*O[ckt]ta/i.test(cSec.Commemoratio ?? ''))
          ) {
            c2 = await getrefs(state, cSec.Commemoratio ?? '', lang, kal.cvespera, cSec.Rule ?? '')
          }

          if (c2 && octvespera && octRegex.test(c2)) {
            state.octavam = ''
            if (cSec[`Commemoratio ${octvespera}`] !== undefined) {
              c2 = await getrefs(
                state,
                cSec[`Commemoratio ${octvespera}`] ?? '',
                lang,
                octvespera,
                cSec.Rule ?? '',
              )
            } else if (cSec[`Commemoratio ${4 - octvespera}`] !== undefined) {
              c2 = await getrefs(
                state,
                cSec[`Commemoratio ${4 - octvespera}`] ?? '',
                lang,
                octvespera,
                cSec.Rule ?? '',
              )
            } else if (cSec.Commemoratio !== undefined) {
              c2 = await getrefs(state, cSec.Commemoratio ?? '', lang, octvespera, cSec.Rule ?? '')
            }
          }

          for (let ic of splitCommemos(c2)) {
            if (
              !ic ||
              /^\s*$/.test(ic) ||
              (sunBangRegex.test(ic) && nooctnat(kal)) ||
              (/19(?:55|6)/.test(version) &&
                /!.*?Vigil/i.test(ic) &&
                /Sancti/i.test(cwname) &&
                !/08-14|06-23|06-28|08-09/.test(cwname))
            ) {
              continue
            }
            if (!ic.startsWith('!')) ic = `!${ic}`
            ccind++
            const key2 = sunRegex.test(ic)
              ? !/Trident/i.test(version)
                ? 3000
                : !/altovadensis/i.test(version)
                  ? 7100
                  : 6100
              : ccind + 9900
            cc[String(key2)] = ic
          }
        }
      }
      cvesp = [1, 3]
    }

    // Add commemorated offices of (tomorrow and) today.
    for (const cv of cvesp) {
      const centries = cv === 1 ? kal.ccommemoentries : state.day.commemoentries
      for (const commemoEntry of centries) {
        if (!commemoEntry) continue
        let commemo = commemoEntry
        let key = 0
        if (
          !(await state.session.loader.exists(`horas/${lang}/${commemo.replace(/\.txt$/, '')}`)) &&
          !/txt$/i.test(commemo)
        ) {
          commemo += '.txt'
        }
        let cSec = (await officestring(kal, 'Latin', commemo, false)) ?? {}

        let c: string
        if (/in.*octavam|post Octavam Asc/i.test(cSec.Rank ?? '') && octvespera) {
          c = await getcommemoratio(state, commemo, octvespera, lang)
        } else {
          c = await getcommemoratio(state, commemo, cv, lang)
        }
        const c2vig = cv === 2 ? await vigiliaCommemoratio(state, commemo, lang) : ''
        c ||= c2vig
        if (lang !== 'Latin') {
          cSec = (await officestring(kal, lang, commemo, false)) ?? {}
        }

        if (c) {
          const cr = (cSec.Rank ?? '').split(';;')
          if (sunRegex.test(cr[0] ?? '') || /01-05\.txt/.test(commemo)) {
            key =
              !/trident/i.test(version) || (/1906/.test(version) && num(cr[2]) > 5)
                ? 7000
                : /altovadensis/i.test(version)
                  ? 3900
                  : 2900
          } else {
            key = num(cr[2]) * 1000
          }
          ccind++
          key = 10000 - key + ccind
          cc[String(key)] = c
        } else {
          continue
        }

        // Add commemorated from commemo.
        if (
          !(
            (state.day.rank >= (!/cist/i.test(version) ? 6 : 7) &&
              !/Pasc[07]/.test(ctx.dayname[0])) ||
            /no commemoratio/i.test(rule) ||
            (/196/.test(version) && /nocomm1960/i.test(cSec.Rule ?? ''))
          )
        ) {
          let c3 = ''
          if (cSec[`Commemoratio ${cv}`] !== undefined) {
            c3 = await getrefs(state, cSec[`Commemoratio ${cv}`] ?? '', lang, cv, cSec.Rule ?? '')
          } else if (
            cSec.Commemoratio !== undefined &&
            (cv !== 3 || /Tempora/i.test(commemo) || octRegex.test(cSec.Commemoratio ?? ''))
          ) {
            c3 = await getrefs(state, cSec.Commemoratio ?? '', lang, cv, cSec.Rule ?? '')
          }

          if (c3 && octvespera && new RegExp(octRe).test(c3)) {
            if (cSec[`Commemoratio ${octvespera}`] !== undefined) {
              c3 = await getrefs(
                state,
                cSec[`Commemoratio ${octvespera}`] ?? '',
                lang,
                octvespera,
                cSec.Rule ?? '',
              )
            } else if (cSec[`Commemoratio ${4 - octvespera}`] !== undefined) {
              c3 = await getrefs(
                state,
                cSec[`Commemoratio ${4 - octvespera}`] ?? '',
                lang,
                octvespera,
                cSec.Rule ?? '',
              )
            } else if (cSec.Commemoratio !== undefined) {
              c3 = await getrefs(state, cSec.Commemoratio ?? '', lang, octvespera, cSec.Rule ?? '')
            }
          }

          if (c3) {
            for (let ic of splitCommemos(c3)) {
              if (
                !ic ||
                /^\s*$/.test(ic) ||
                (sunBangRegex.test(ic) && nooctnat(kal)) ||
                (/19(?:55|6)/.test(version) &&
                  /!.*?Vigil/i.test(ic) &&
                  /Sancti/i.test(commemo) &&
                  !/08-14|06-23|06-28|08-09/.test(commemo)) ||
                (state.day.rank >= 5 &&
                  octRegex.test(ic) &&
                  (month !== 12 || day < 18) &&
                  /trident/i.test(version) &&
                  !/cist/i.test(version) &&
                  !/Pent02-0/.test(commemo))
              ) {
                continue
              }
              if (!ic.startsWith('!')) ic = `!${ic}`
              ccind++
              const key3 = sunRegex.test(ic)
                ? !/trident/i.test(version)
                  ? 3000
                  : !/altovadensis/i.test(version)
                    ? 7100
                    : 6100
                : octRegex.test(ic)
                  ? ccind + 7900
                  : ccind + 9900
              cc[String(key3)] = ic
            }
          }
        }

        if (dayofweek !== 0 && cv === 2 && cSec['Oratio Vigilia'] !== undefined) {
          const cvg = await vigiliaCommemoratio(state, commemo, lang)
          if (cvg) {
            ccind++
            cc[String(ccind + (!/cist/i.test(version) ? 8500 : 8750))] = cvg
          }
        }
      }
    }

    // 1960: at most one commemoration on II. cl and higher days.
    const rankArr = (state.day.winnerSections.Rank ?? '').split(';;')
    if (
      /1960/.test(version) &&
      (num(rankArr[2]) >= 5 || (/Feria/i.test(ctx.dayname[1]) && num(rankArr[2]) >= 4)) &&
      ccind > 1
    ) {
      const keys = Object.keys(cc).sort()
      const first = keys[0]
      const kept = cc[first]
      for (const k of keys) delete cc[k]
      cc[first] = kept
      ccind = 1
    }
  }

  for (const key of Object.keys(cc).sort()) {
    if ((state.s[state.s.length - 1] ?? '').length > 3) state.s.push('_')
    if (Number(key) >= 900) {
      const [ostr, ac] = delconclusio(cc[key], addconclusio, version)
      addconclusio = ac
      state.s.push(ostr)
      state.collectcount++
    }
  }

  if (
    (!(await checksuffragium(state)) ||
      /Quad5|Quad6/i.test(ctx.dayname[0]) ||
      /1955|196/.test(version)) &&
    addconclusio
  ) {
    state.s.push(addconclusio)
  }
}

// Port of getcommemoratio — the commemoration (title + Ant + Versum + Oratio)
// of an office file at Lauds/Vespers.
export async function getcommemoratio(
  state: HoursState,
  wday: string,
  ind: number,
  lang: string,
): Promise<string> {
  const ctx = state.day.ctx
  const { version, month, day } = ctx
  const hora = state.hora
  const kal = state.day.state
  const w = (await officestring(kal, lang, wday, ind === 1)) ?? {}

  const noCommMatch = /no\s+(\w+)?\s*commemoratio/i.exec(state.rule)
  if (
    noCommMatch &&
    (!noCommMatch[1] || new RegExp(noCommMatch[1], 'i').test(wday)) &&
    !(hora === 'Vespera' && state.day.vespera === 3 && ind === 1)
  ) {
    return ''
  }

  if (
    /1960/.test(version) &&
    hora === 'Vespera' &&
    ind === 3 &&
    state.day.rank >= 6 &&
    !/Adv|Quad|Passio|Epi|Corp|Nat|Cord|Asc|Dominica|;;6/i.test(w.Rank ?? '')
  ) {
    return ''
  }

  const r = (w.Rank ?? '').split(';;')
  if (
    num(r[2]) < 2.1 &&
    num(r[2]) !== 1.15 &&
    (/Feria/.test(r[1] ?? '') ||
      (/Infra Octav/i.test(r[0] ?? '') &&
        state.day.rank >= 5 &&
        /Sancti/i.test(state.day.winner) &&
        (wday !== kal.cwinner || !/Trident/.test(version))))
  ) {
    return ''
  }

  // ex/vide commune backing sections.
  let c: Sections = {}
  const exvide = /(ex|vide)\s+(.*)\s*$/i.exec(r[3] ?? '')
  if (exvide) {
    let file = exvide[2]
    const comex = /Comex=(.*?);/i.exec(w.Rule ?? '')
    if (comex && state.day.rank < 5) file = comex[1]
    if (/^C[1-3](?![v\d])/.test(file) && /Pasc/i.test(ctx.dayname[0])) {
      file = file.replace(/p?$/, 'p')
    }
    let fname = `${file}.txt`
    if (fname.startsWith('C')) fname = `${subdirname('Commune', version)}${fname}`
    c = (await setupstring(sessionWithLang(state.session, lang), fname.replace(/\.txt$/, ''))) ?? {}
    if (/C10/.test(kal.cwinner) && /C6/.test(fname)) c['Versum 3'] = c['Versum 1']

    const exvide2 = /;;(ex|vide)\s+(.*)\s*$/i.exec(c.Rank ?? '')
    if (exvide2) {
      // Daisy-chained Commune references to the second level.
      let file2 = exvide2[2]
      if (/^C[1-3](?![v\d])/.test(file2) && /Pasc/i.test(ctx.dayname[0])) {
        file2 = file2.replace(/p?$/, 'p')
      }
      let fname2 = `${file2}.txt`
      if (fname2.startsWith('C')) fname2 = `${subdirname('Commune', version)}${fname2}`
      const c2 =
        (await setupstring(sessionWithLang(state.session, lang), fname2.replace(/\.txt$/, ''))) ??
        {}
      c.Oratio ||= c2.Oratio
      for (const i of [1, 2, 3]) {
        c[`Ant ${i}`] ||= c2[`Ant ${i}`]
        c[`Versum ${i}`] ||= c2[`Versum ${i}`]
      }
      if (/C10/.test(kal.cwinner) && /C6/.test(fname2)) c['Versum 3'] = c['Versum 1']
    }
  }

  if (!state.day.rank) r[0] = w.Officium ?? ''

  let o = w.Oratio ?? ''
  if (/N\./.test(o) && w.Name) o = replaceNdot(state, o, lang, w.Name)

  if (!o && /Oratio Dominica/i.test(w.Rule ?? '')) {
    let sunfile = wday.replace(/-[0-9]/, '-0')
    sunfile = sunfile.replace(/Epi1-0/, 'Epi1-0a')
    const w1 = (await officestring(kal, lang, sunfile, false)) ?? {}
    o = w1.OratioW ?? w1.Oratio ?? ''
  }

  o ||= w[`Oratio ${ind}`] || w[`Oratio ${4 - ind}`] || c.Oratio || ''

  // Special processing for Common of Supreme Pontiffs.
  let popeclass = ''
  if (!/Trident/i.test(version)) {
    const pr = papalRule(w.Rule ?? '')
    if (pr) {
      popeclass = pr[1]
      o = await papalPrayer(state, lang, pr[0], pr[1], pr[2])
    } else if (/N\./.test(o) && w.Name) {
      o = replaceNdot(state, o, lang, w.Name)
    }
  } else if (/N\./.test(o) && w.Name) {
    o = replaceNdot(state, o, lang, w.Name)
  }
  if (!o) return ''

  // Ensure the large red initial.
  if (!/^[$&/!{#]/.test(o)) o = o.replace(/^(?:v\. )?/, 'v. ')

  let a = w[`Ant ${ind}`] ?? ''
  if (
    !a ||
    (/Epi1-0a|01-12t/.test(state.day.winner) && hora === 'Vespera' && state.day.vespera === 3)
  ) {
    if (!/Epi[2-6]-0/.test(wday)) {
      a = w[`Ant ${4 - ind}`] ?? ''
    } else {
      // Sundays in Epiphanytide commemorated with the ferial antiphon.
      const v = await setup(state, lang, 'Psalterium/Special/Major Special')
      a = v['Feria Ant 3'] ?? ''
    }
  }
  if (!a) a = c[`Ant ${ind}`] ?? ''
  a = replaceNdot(state, a, lang, w.Name)
  if (popeclass && /C/.test(popeclass) && ind === 3) {
    a = await papalAntiphonDumEsset(state, lang)
  }

  if (/tempora/i.test(wday)) {
    if (
      month === 12 &&
      ((hora === 'Vespera' && day >= 17 && day <= 23) ||
        (hora === 'Laudes' && (day === 21 || day === 23)))
    ) {
      const v = await setup(state, lang, 'Psalterium/Special/Major Special')
      a = (hora === 'Vespera' ? v[`Adv Ant ${day}`] : v[`Adv Ant ${day}L`]) ?? ''
    }
  }
  if (!a) return ''
  a = await postprocessAnt(state, a, lang)

  let v = w[`Versum ${ind}`] ?? ''
  if (/Epi1-0a|01-12t/.test(state.day.winner)) {
    v = (state.day.vespera === 1 && day === 10 ? c['Versum 2'] : c['Versum Tertia']) ?? ''
  }
  v ||=
    w[`Versum ${4 - ind}`] ||
    c[`Versum ${ind}`] ||
    c[`Versum ${4 - ind}`] ||
    (await getfrompsalterium(state, 'Versum', ind, lang)) ||
    'versus missing'
  v = await postprocessVr(state, v, lang)

  let title = `!${await state.texts.translate('Commemoratio', lang)}`
  if (!/Monastic/i.test(version)) a = a.replace(/\s*\*\s*/, ' ')
  title += ` ${r[0] ?? ''}\nAnt. ${a}\n_\n${v}\n_\n$Oremus\n${o}\n`
  return title
}

// Port of vigilia_commemoratio.
export async function vigiliaCommemoratio(
  state: HoursState,
  fnameIn: string,
  lang: string,
): Promise<string> {
  const ctx = state.day.ctx
  const { version, month, day, dayofweek } = ctx
  const kal = state.day.state

  if (/1955|1960/.test(version)) {
    const dt = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    if (!/(08-14|06-23|06-28|08-09)/.test(dt)) return ''
  } else if (
    /Adv|Quad[0-6]/i.test(ctx.dayname[0]) ||
    (/Quadp3/i.test(ctx.dayname[0]) && dayofweek >= 4) ||
    (/Quadp/i.test(ctx.dayname[0]) && /Monastic.*Divino/i.test(version)) ||
    /Quattuor Temporum Sept/.test(kal.trank[0] ?? '')
  ) {
    return ''
  }

  let fname = fnameIn
  if (!/\.txt$/.test(fname)) fname += '.txt'
  if (!/(Tempora|Sancti)/i.test(fname)) fname = `Sancti/${fname}`
  const w =
    (await setupstring(sessionWithLang(state.session, lang), fname.replace(/\.txt$/, ''))) ?? {}
  const wrank = (w.Rank ?? '').split(';;')

  const vigilString = await state.texts.translate('Vigil', lang)
  const vigilRegex = new RegExp(vigilString, 'i')

  let text = ''
  if (vigilRegex.test(w.Rank ?? '')) {
    text = w.Oratio ?? ''
    if (!text && /(?:ex|vide) C1v/.test(w.Rank ?? '')) {
      const com = await setup(state, lang, `${subdirname('Commune', version)}C1v`)
      text = com.Oratio ?? ''
      text = replaceNdot(state, text, lang, w.Name)
    }
  } else if (w['Oratio Vigilia'] !== undefined) {
    text = w['Oratio Vigilia'] ?? ''
  }
  if (!text) return ''

  let c = `!${await state.texts.translate('Commemoratio', lang)}: ${await state.texts.translate('Vigilia', lang)}\n`
  if (vigilRegex.test(w.Rank ?? '')) c = c.replace(/:[\s\S]*/, `: ${wrank[0]}`)
  const m = /(!.*?\n)([\s\S]*)/.exec(text)
  if (m) {
    c = m[1]
    text = m[2]
  }
  const p = await setup(state, lang, 'Psalterium/Special/Major Special')
  let a = p['Feria Ant 2'] ?? ''
  const v = p['Feria Versum 2'] ?? ''
  a = a.replace(/\s*\*\s*/, ' ')
  return `${c}Ant. ${a}_\n${v}_\n$Oremus\nv. ${text}`
}

// Port of getrefs — expands @file:item references inside Commemoratio blocks.
export async function getrefs(
  state: HoursState,
  wIn: string,
  lang: string,
  ind: number,
  rule: string,
): Promise<string> {
  const ctx = state.day.ctx
  const { version, dayofweek } = ctx
  let w = wIn

  const refRegex = /([\s\S]*?)@([a-z0-9/-]+?):([a-z0-9 ]*)(?::([\s\S]*))?([\s\S]*)/i

  for (;;) {
    const m = refRegex.exec(w)
    if (!m) break
    const before = m[1]
    let file = m[2]
    const item = (m[3] ?? '').replace(/\s*$/, '')
    const substitutions = m[4] ?? ''
    let after = m[5] ?? ''

    if (/^feria$/i.test(file)) {
      // Perl reads 'Psalterium/Major Special.txt' — a path that does not
      // exist (the real file is under Special/) — so the lookups all miss.
      const s: Sections = {}
      let a = chompd(s[`Day${dayofweek} Ant ${ind}`])
      if (!a) a = `Day${dayofweek} Ant ${ind} missing`
      const v = chompd(s[`Day${dayofweek} Versum ${ind}`])
      if (!v) a = `Day${dayofweek} Versus ${ind} missing`
      a = a.replace(/\s*\*\s*/, ' ')
      w = `${before}_\nAnt. ${a}_\n${v}_\n${after}`
      continue
    }

    if (/Pasc/i.test(ctx.dayname[0])) file = file.replace(/(C[23])/g, '$1p')
    const s = (await setupstring(sessionWithLang(state.session, lang), file)) ?? {}

    const commemOct = /(commemoratio|Octava)/i.exec(item)
    if (commemOct) {
      const ita = commemOct[1]
      let a = s[ita]
      if (!a) a = s[`${ita} ${ind}`]
      if (!a) a = s[`${ita} ${ind === 2 ? 1 : 2}`]
      if (!a) a = `${file} ${item} ${ind} missing\n`
      let flag = true

      const octMatch = /!.*?(octava|commemoratio)(.*?)\n/i.exec(a)
      if (octMatch) {
        const oct = octMatch[2]
        if (state.octavam !== undefined && oct && state.octavam.includes(oct)) {
          flag = false
        } else {
          state.octavam = (state.octavam ?? '') + oct
        }
      }

      if (flag) {
        a = applyInclusionSubstitutions(a, substitutions)
        a = `${a}_\n`
      } else {
        a = ''
      }
      w = `${before}${a}${after}`
      continue
    }

    if (/oratio/i.test(item)) {
      let c: Sections = {}
      const exvide = /;;(ex|vide)\s+(.*)\s*$/i.exec(s.Rank ?? '')
      if (exvide) {
        let cfile = exvide[2]
        if (/^C[1-3]a?$/.test(cfile) && /Pasc/i.test(ctx.dayname[0])) cfile += 'p'
        let fname = `${cfile}.txt`
        if (fname.startsWith('C')) fname = `${subdirname('Commune', version)}${fname}`
        c =
          (await setupstring(sessionWithLang(state.session, lang), fname.replace(/\.txt$/, ''))) ??
          {}

        const exvide2 = /;;(ex|vide)\s+(.*)\s*$/i.exec(c.Rank ?? '')
        if (exvide2) {
          let cfile2 = exvide2[2]
          if (/^C[1-3]a?$/.test(cfile2) && /Pasc/i.test(ctx.dayname[0])) cfile2 += 'p'
          let fname2 = `${cfile2}.txt`
          if (fname2.startsWith('C')) fname2 = `${subdirname('Commune', version)}${fname2}`
          const c2 =
            (await setupstring(
              sessionWithLang(state.session, lang),
              fname2.replace(/\.txt$/, ''),
            )) ?? {}
          c.Oratio ||= c2.Oratio
          for (const i of [1, 2, 3]) {
            c[`Ant ${i}`] ||= c2[`Ant ${i}`]
            c[`Versum ${i}`] ||= c2[`Versum ${i}`]
          }
        }
      }

      let a = chompd(s[`Ant ${ind}`]) || chompd(c[`Ant ${ind}`])
      if (!a) {
        if (/tempora/i.test(file)) a = await getfrompsalterium(state, 'Ant', ind, lang)
        a ||= `${file} Ant ${ind} missing\n`
      }
      a = await postprocessAnt(state, a, lang)
      let v = chompd(s[`Versum ${ind}`]) || chompd(c[`Versum ${ind}`])
      if (!v) {
        if (/tempora/i.test(file)) v = await getfrompsalterium(state, 'Versum', ind, lang)
        v ||= `${file} Versus ${ind} missing\n`
      }
      v = await postprocessVr(state, v, lang)

      let o = ''
      if (!/proper/.test(item)) {
        const i = item.replace(/\sgregem[\s\S]*/i, '')
        o = s[i] || c[i] || ''
        if (!o) {
          o = `${file}:${item} missing\n`
        } else if (!/\$Oremus/i.test(o)) {
          o = `$Oremus\n${o}`
        }
      }

      // Special processing for Common of Supreme Pontiffs.
      const pr = papalRule(rule, true)
      if (pr) {
        const name = pr[2]
        if (!/Trident/i.test(version)) {
          if (/Gregem/i.test(item)) {
            o = await papalPrayer(state, lang, pr[0], pr[1], name)
            const am = /(!Commem[\s\S]*)/i.exec(after)
            after = am ? am[1] : ''
            o = `$Oremus\n${o}`
          }
          // ($popeclass is an unset global in the Perl here — its papal
          // antiphon branch can never fire.)
        } else if (/N\./.test(o)) {
          o = replaceNdot(state, o, lang, name)
        }
      } else if (/N\./.test(o) && s.Name) {
        o = replaceNdot(state, o, lang, s.Name)
      }
      a = applyInclusionSubstitutions(a, substitutions)
      v = applyInclusionSubstitutions(v, substitutions)
      o = applyInclusionSubstitutions(o, substitutions)
      a = a.replace(/\s*\*\s*/, ' ')

      const title =
        before || `!${await state.texts.translate('Commemoratio', lang)} ${s.Officium ?? ''}`
      w = `${title}\nAnt. ${a}\n_\n${v}_\n${o}_\n${after}`
      continue
    }

    let a = s[item] ?? ''
    let afterStr = after
    let beforeStr = before
    if (afterStr && !/^\s*$/.test(afterStr)) afterStr = `_\n${afterStr}`
    if (beforeStr && !/^\s*$/.test(beforeStr)) beforeStr += '_\n'
    if (!a) a = `${file} ${item} missing\n`
    a = applyInclusionSubstitutions(a, substitutions)
    w = `${beforeStr}${a}${afterStr}`
  }
  w = w.replace(/_\n_/g, '_')
  return w
}

// Port of getsuffragium.
export async function getsuffragium(state: HoursState, lang: string): Promise<[string, number]> {
  const ctx = state.day.ctx
  const { version } = ctx
  const hora = state.hora
  const kal = state.day.state

  // Sancta Maria in Sabbato commemorated on Friday Vespers — Perl mutates the
  // global $commune here; the only later reader on our paths is none, so the
  // assignment is tracked but not propagated.
  let commune = state.day.commune
  if (/C1[012]/.test(kal.cwinnerSections.Rank ?? '') && hora === 'Vespera') commune = 'C10'
  void commune

  const comment = /altovadensis/i.test(version)
    ? 5
    : /cisterciensis/i.test(version)
      ? 4
      : /trident/i.test(version)
        ? 3
        : /pasc/i.test(ctx.dayname[0])
          ? 2
          : 1

  let key = 'Suffragium'
  if (comment === 2) {
    key += ' Paschale'
    if (/Monastic/.test(version) && hora === 'Vespera') key += 'V'
  } else if (comment > 2) {
    key += ` ${hora}`
  }

  const suffrFile = await setup(state, lang, 'Psalterium/Special/Major Special')
  const suffr = suffrFile[key] ?? ''
  return [suffr, comment]
}
