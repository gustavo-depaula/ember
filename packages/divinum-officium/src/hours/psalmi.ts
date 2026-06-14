// Port of specials/psalmi.pl (psalmi_minor + psalmi_major + antetpsalm).
// psalmi_matutinum lives in matins.ts.

import { dayOfWeek } from '../kalendar/date'
import { emberday } from '../kalendar/occurrence'
import { num, subdirname } from '../kalendar/state'
import { alleluiaAnt, alleluiaRequired, gettempora, postprocessAnt } from './helpers'
import { checksuffragium, getanthoras, getproprium, setcomment, setup } from './proprium'
import { chompd, columnsel, type HoursState, winnerOf } from './state'

// Minor + major hours. Matutinum is routed to psalmiMatutinum (matins.ts) by
// the assembly walker — keeping the matins→psalmi import one-directional.
export async function psalmi(state: HoursState, lang: string): Promise<void> {
  state.psalmnum1 = 0
  state.psalmnum2 = 0
  let list: string[]
  let duplexf = /196/.test(state.day.ctx.version)
  if (/^(?:Laudes|Vespera)$/i.test(state.hora)) {
    list = await psalmiMajor(state, lang)
    duplexf ||= state.day.duplex > 2 && !/C12/.test(state.day.winner)
  } else {
    list = await psalmiMinor(state, lang)
  }
  await antetpsalm(state, list, duplexf, lang)
}

// Port of get_stThomas_feria — weekday of Dec 21; Sunday transfers to Feria II.
function getStThomasFeria(year: number): number {
  return dayOfWeek(21, 12, year) || 1
}

// Perl split drops trailing empty fields — psalmi_major indexes from the end
// ($psalmi[-1]), so the JS trailing '' must go.
export function splitPerl(text: string | undefined): string[] {
  const out = (text ?? '').split('\n')
  while (out.length > 0 && out[out.length - 1] === '') out.pop()
  return out
}

// Port of psalmi_major — collects psalms/antiphons for Lauds and Vespers.
async function psalmiMajor(state: HoursState, lang: string): Promise<string[]> {
  const ctx = state.day.ctx
  const { version, dayofweek, day, month, year } = ctx
  const hora = state.hora
  const rule = state.rule
  const communeRule = state.day.communeSections.Rule ?? ''

  if (/monastic/i.test(version) && hora === 'Laudes' && !/matutinum romanum/i.test(rule)) {
    state.psalmnum1 = -1
    state.psalmnum2 = -1
  }

  const psalmiFile = await setup(state, lang, 'Psalterium/Psalmi/Psalmi major')
  let name = hora
  if (hora === 'Laudes') name += String(state.day.laudes)

  let psalmi: string[]

  if (/Monastic/.test(version) && !(hora === 'Laudes' && /Matutinum romanum/i.test(rule))) {
    let head = 'Monastic'
    if (hora === 'Laudes') {
      if (
        /Psalmi Dominica/.test(rule) ||
        (!/Psalmi Feria/i.test(rule) &&
          /Sancti/i.test(state.day.winner) &&
          state.day.rank >= 4 &&
          !/vigil/i.test(ctx.dayname[1]))
      ) {
        head = 'DaymF'
      } else if (dayofweek === 0 && /Pasc/i.test(ctx.dayname[0])) {
        head = 'DaymP'
      }
    }
    psalmi = splitPerl(psalmiFile[`${head} ${hora}`])

    if (hora === 'Laudes' && /Monastic/.test(head)) {
      if (
        !(
          dayofweek === 0 ||
          /Trident/.test(version) ||
          (/Adv|Quadp/.test(ctx.dayname[0]) &&
            state.day.duplex < 3 &&
            !/C10/.test(state.day.commune)) ||
          (/Quad\d/.test(ctx.dayname[0]) && /Feria/.test(ctx.dayname[1])) ||
          /Quattuor Temporum Septembris/.test(ctx.dayname[1]) ||
          (/Pent/.test(ctx.dayname[0]) && /Vigil/.test(ctx.dayname[1]))
        )
      ) {
        if (dayofweek === 6) {
          psalmi = splitPerl(psalmiFile['Daym6F Laudes'])
        } else {
          const canticles = splitPerl(psalmiFile['DaymF Canticles'])
          psalmi[psalmi.length - 2] = canticles[dayofweek] ?? ''
        }
      }
    }
  } else if (/trident/i.test(version)) {
    const dow =
      hora === 'Laudes' && /Pasc/i.test(ctx.dayname[0])
        ? 'P'
        : hora === 'Laudes' &&
            (/Sancti/.test(state.day.winner) ||
              winnerOf(state, lang)['Ant Laudes'] !== undefined) &&
            !/Feria/i.test(rule)
          ? 'C'
          : String(dayofweek)
    psalmi = splitPerl(psalmiFile[`Daya${dow} ${name}`])
  } else {
    psalmi = splitPerl(psalmiFile[`Day${dayofweek} ${name}`])
  }

  let comment = 0
  let prefix = `${await state.texts.translate('Psalmi et antiphonae', lang)} `

  let antiphones: string[] = []

  // Greater-Advent ferial antiphons (Dec 17–23).
  if (
    (hora === 'Laudes' || (hora === 'Vespera' && /1963/.test(version))) &&
    month === 12 &&
    day > 16 &&
    day < 24 &&
    dayofweek > 0
  ) {
    antiphones = splitPerl(psalmiFile[`Day${dayofweek} Laudes3`])

    if (dayofweek === 6 && /Trident|Monastic/.test(version)) {
      const expectetur = antiphones[3] ?? ''

      if (/trident|monastic.*divino/i.test(version)) {
        antiphones = splitPerl(psalmiFile[`Day${getStThomasFeria(year)} Laudes3`])
        if (day === 23 && !/divino/i.test(version)) {
          const w = await setup(state, lang, `${subdirname('Tempora', version)}Adv4-0`)
          antiphones = splitPerl(w['Ant Laudes'])
        }
      }

      if (/Monastic/.test(version)) {
        antiphones[2] = expectetur
        antiphones[3] = ''
      } else {
        antiphones[3] = expectetur
      }
    }
  }

  // De tempore / Sancti antiphon override.
  let w = ''
  let c = 0
  const wsec = winnerOf(state, lang)

  if (hora === 'Vespera' && state.day.vespera === 3) {
    if (wsec['Ant Vespera 3'] !== undefined) {
      w = wsec['Ant Vespera 3'] ?? ''
      c = /Tempora/.test(state.day.winner) ? 2 : 3
    } else if (
      wsec['Ant Vespera'] === undefined &&
      (/ex/.test(state.day.communetype) ||
        (/Trident/i.test(version) && /Sancti/i.test(state.day.winner)))
    ) {
      ;[w, c] = await getproprium(state, 'Ant Vespera 3', lang, true)
    }
  }

  if (!w && wsec[`Ant ${hora}`] !== undefined) {
    w = wsec[`Ant ${hora}`] ?? ''
    c = /Tempora/.test(state.day.winner) ? 2 : 3
  }

  const antecapitulum = state.day.state.antecapitulum
  if (antecapitulum) {
    w = columnsel(state, lang) ? antecapitulum : state.day.state.antecapitulum2
    c = 3
  } else if (w) {
    // antiphons from the winner — comment already set
  } else if (
    (state.day.communetype && /ex/.test(state.day.communetype)) ||
    (/Trident/i.test(version) && hora === 'Laudes' && /Sancti/.test(state.day.winner))
  ) {
    ;[w, c] = await getproprium(state, `Ant ${hora}`, lang, true)
  }
  if (w) {
    antiphones = splitPerl(w)
    comment = c
  }

  // Psalmi de dominica.
  let p: string[]
  if (
    (/Psalmi Dominica/i.test(rule) || (communeRule && /Psalmi Dominica/i.test(communeRule))) &&
    !/;;\s*[0-9]+/.test(antiphones[0] ?? '') &&
    !/Psalmi Feria/i.test(rule)
  ) {
    prefix = `${await state.texts.translate('Psalmi, antiphonae', lang)} `
    let h: string = hora
    if (hora === 'Laudes' && !/Monastic/.test(version)) h += '1'
    p = splitPerl(psalmiFile[`Day0 ${h}`])

    if (/Monastic/.test(version) && hora === 'Laudes') {
      p = splitPerl(psalmiFile['DaymF Laudes'])
    } else if (/Trident/.test(version) && hora === 'Laudes') {
      p = splitPerl(psalmiFile['DayaC Laudes'])
    }
  } else {
    p = psalmi
    // Sunday psalms when a 'Psalmi Feria' rule is used (e.g. Sundays in
    // octaves) — the Perl comments say Cist but tests plain /monastic/i.
    if (
      dayofweek === 0 &&
      /Psalmi Feria/i.test(rule) &&
      /monastic/i.test(version) &&
      hora === 'Laudes'
    ) {
      p = splitPerl(psalmiFile['DayaC Laudes2'])
      p[2] = ';;62'
    }
  }

  let lim = 5

  if (
    /Monastic/.test(version) &&
    hora === 'Vespera' &&
    !/C9/.test(state.day.winner) &&
    (!/C12/.test(state.day.winner) || /cist/i.test(version)) &&
    !/C9/.test(state.day.commune) &&
    (!/Quad6/.test(ctx.dayname[0]) || dayofweek < 4)
  ) {
    lim = 4
    // Ex 5 Antiphonæ et Psalmi fiunt 4.
    if (antiphones[4]) {
      if (month === 12 && day >= 25 && day < 31) {
        if (!/2[579]/.test(String(day))) antiphones[3] = antiphones[4]
      } else {
        const p1 = (antiphones[3] ?? '').split(';;')[1] ?? ''
        const a2 = (antiphones[4] ?? '').split(';;')[0] ?? ''
        antiphones[3] = `${a2};;${p1}`
      }
    }
  }

  if (antiphones.length > 0 && antiphones.some((a) => a !== '')) {
    for (let i = 0; i < lim; i++) {
      let aflag = false
      const pm = /;;([\s\S]*)/.exec(p[i] ?? '')
      let pp = pm ? pm[1] : 'missing'

      // Psalm5 Vespera substitution rules for the 5th Vespers psalm.
      if (i === 4 && hora === 'Vespera' && !/no Psalm5/i.test(rule)) {
        let n: string | undefined
        let cond = false
        if (!antecapitulum) {
          if (state.day.vespera === 3) {
            let m = /Psalm5 Vespera3=([0-9]+)/i.exec(rule)
            if (m) {
              n = m[1]
              cond = true
            } else {
              m = /Psalm5 Vespera3=([0-9]+)/i.exec(communeRule)
              if (m) {
                n = m[1]
                if (c === 4) cond = true
              }
            }
          }
          if (!cond) {
            let m = /Psalm5 Vespera=([0-9]+)/i.exec(rule)
            if (m) {
              n = m[1]
              cond = true
            } else {
              m = /Psalm5 Vespera=([0-9]+)/i.exec(communeRule)
              if (m) {
                n = m[1]
                if (c === 4) cond = true
              }
            }
          }
        } else {
          const m = /Psalm5 VesperaAnte=([0-9]+)/i.exec(antecapitulum)
          if (m) {
            n = m[1]
            cond = true
          }
        }
        if (cond && n !== undefined) {
          pp = n
          aflag = true
        }
      }

      const ant = antiphones[i] ?? ''
      const cutm = /([\s\S]*?);;/.exec(ant)
      psalmi[i] =
        /;;[0-9;\n]+/.test(ant) && !aflag ? ant : cutm ? `${cutm[1]};;${pp}` : `${ant};;${pp}`
    }
  }

  // Paschaltide: psalms under a single (or doubled) Alleluia antiphon.
  if (
    alleluiaRequired(ctx.dayname[0], state.votive) &&
    (wsec[`Ant ${hora}`] === undefined || /C10/.test(state.day.commune)) &&
    !antecapitulum &&
    !/ex/i.test(state.day.communetype) &&
    (!/Trident/.test(version) || hora === 'Vespera') &&
    (!/Monastic/.test(version) || hora !== 'Laudes' || !/Dominica/i.test(wsec.Rank ?? ''))
  ) {
    const allel = await alleluiaAnt(state, lang)
    const strip = (s: string | undefined, repl: string) => (s ?? '').replace(/.*(?=;;)/, repl)
    psalmi[0] = strip(psalmi[0], allel)
    psalmi[1] = strip(psalmi[1], '')
    psalmi[2] = strip(psalmi[2], '')
    psalmi[psalmi.length - 1] = strip(psalmi[psalmi.length - 1], '')

    if (/Monastic(?! Cist)/.test(version) && hora === 'Laudes') {
      psalmi[psalmi.length - 1] = strip(psalmi[psalmi.length - 1], allel)
    } else {
      psalmi[3] = strip(psalmi[3], '')
    }
  }

  if (
    (/Adv|Quad/.test(ctx.dayname[0]) || emberday(state.day.state)) &&
    hora === 'Laudes' &&
    !/Trident/.test(version)
  ) {
    prefix = `Laudes:${state.day.laudes} ${prefix}`
  }
  await setcomment(state, state.label, 'Source', comment, lang, prefix)

  return psalmi
}

// Port of psalmi_minor.
async function psalmiMinor(state: HoursState, lang: string): Promise<string[]> {
  const ctx = state.day.ctx
  const { version, dayofweek, day } = ctx
  const hora = state.hora
  const psalmiFile = await setup(state, lang, 'Psalterium/Psalmi/Psalmi minor')

  let ant = ''
  let psalms = ''
  let prefix: string | undefined

  if (/Monastic/.test(version)) {
    const lines = (psalmiFile.Monastic ?? '').split('\n')
    let i =
      hora === 'Prima'
        ? dayofweek
        : hora === 'Tertia'
          ? 8
          : hora === 'Sexta'
            ? 11
            : hora === 'Nona'
              ? 14
              : 17
    if (!/^(?:Prima|Completorium)$/.test(hora)) {
      if (dayofweek > 0) i++
      if (dayofweek > 1) i++
    }
    const line = (lines[i] ?? '').replace(/=/, ';;')
    const a = line.split(';;')
    ant = chompd(a[1])
    psalms = chompd(a[2])
  } else if (/trident/i.test(version)) {
    const entries: Record<string, string> = {}
    for (const part of (psalmiFile.Tridentinum ?? '').split(/\n|=/).reduce<string[]>((acc, x) => {
      acc.push(x)
      return acc
    }, [])) {
      void part
    }
    // Perl: %psalmlines = split(/\n|=/, …) — alternate key/value pairs.
    const flat = (psalmiFile.Tridentinum ?? '').split(/\n|=/)
    for (let i = 0; i + 1 < flat.length; i += 2) entries[flat[i]] = flat[i + 1]

    let psalmkey: string
    if (hora === 'Prima') {
      const days = [
        'Dominica',
        'Feria II',
        'Feria III',
        'Feria IV',
        'Feria V',
        'Feria VI',
        'Sabbato',
      ]
      psalmkey = `Prima ${
        (/Sancti/i.test(state.day.winner) && !/Vigil/i.test(state.day.winnerSections.Rank ?? '')) ||
        /Pasc|Quad6-[45]|Nat1-0/i.test(state.day.winner)
          ? 'Festis'
          : days[dayofweek]
      }`
      if (dayofweek === 0 && /Quad/i.test(ctx.dayname[0])) psalmkey += ' SQP'
    } else {
      psalmkey =
        hora === 'Completorium' ? 'Completorium' : `${hora} ${dayofweek ? 'Feria' : 'Dominica'}`
    }
    const a = (entries[psalmkey] ?? '').split(';;')
    ant = chompd(a[0])
    psalms = chompd(a[1])
  } else {
    const lines = (psalmiFile[hora] ?? '').split('\n')
    let i = 2 * dayofweek
    if (
      hora === 'Completorium' &&
      dayofweek === 6 &&
      /Dominica/i.test(state.day.winnerSections.Rank ?? '') &&
      !/Nat/.test(ctx.dayname[0])
    ) {
      i = 12
    }
    if (
      /Psalmi\s*(minores)*\s*Dominica/i.test(state.rule) ||
      (/Psalmi\s*(minores)*\s*Dominica/i.test(state.communerule) &&
        !/Psalmi\s*(?:minores)*\s*ex Psalterio/i.test(state.rule))
    ) {
      i = 0
    }
    if (
      /19(?:55|60|62)/.test(version) &&
      (/horas1960 feria/i.test(state.rule) ||
        (/Sancti/i.test(state.day.winner) && state.day.rank < 5) ||
        ((/sancti/i.test(state.day.winner) || /Nat[23]/i.test(state.day.winner)) &&
          state.day.rank < 6 &&
          hora !== 'Completorium'))
    ) {
      i = 2 * dayofweek
    }
    if (
      hora === 'Completorium' &&
      dayofweek === 6 &&
      /Dominica/i.test(state.day.winnerSections.Rank ?? '') &&
      !/Nat/.test(ctx.dayname[0])
    ) {
      i = 12
    }
    ant = chompd(lines[i])
    psalms = chompd(lines[i + 1])
    if (
      (/196/.test(version) && /117/.test(psalms) && state.day.laudes === 2) ||
      /Prima=53/i.test(state.rule)
    ) {
      psalms = psalms.replace(/117/, '53')
    }
  }

  let comment = 0

  if (hora === 'Completorium' && !/Trident|Monastic/.test(version)) {
    if (
      /tempora/i.test(state.day.winner) &&
      dayofweek > 0 &&
      /Dominica/i.test(state.day.winnerSections.Rank ?? '') &&
      state.day.rank < 6
    ) {
      // keep ferial psalms
    } else if (
      (/Psalmi\s*(minores)*\s*Dominica/i.test(state.rule) ||
        /Psalmi\s*(minores)*\s*Dominica/i.test(state.communerule)) &&
      (!/1960/.test(version) || state.day.rank >= 6)
    ) {
      const lines = (psalmiFile.Completorium ?? '').split('\n')
      ant = chompd(lines[0])
      psalms = chompd(lines[1])
      prefix = ''
      comment = 6
    }
    const w = winnerOf(state, lang)
    ant = w[`Ant Completorium${state.day.vespera || ''}`] || ant
  }

  // Seasonal antiphon override (Advent / Paschaltide …).
  if (/tempora/i.test(state.day.winner) || /pasc/i.test(ctx.dayname[0])) {
    let ind =
      hora === 'Prima' ? 0 : hora === 'Tertia' ? 1 : hora === 'Sexta' ? 2 : hora === 'Nona' ? 4 : -1
    let name = gettempora(state, 'Psalmi minor')

    if (name === 'Adv') {
      name = ctx.dayname[0]
      if (day > 16 && day < 24 && dayofweek) {
        name = `Adv4${dayofweek + 1}`
      }
    }
    if (name === 'Pasch' && (!/Pasc7/i.test(ctx.dayname[0]) || /Completorium/i.test(hora))) {
      ind = 0
    }

    if (name && ind >= 0) {
      const ants = (psalmiFile[name] ?? '').split('\n')
      let seasonal = chompd(ants[ind])
      if (/trident|monastic/i.test(version) && name === 'Pasch') {
        seasonal = seasonal.replace(/(\S+)\.$/, '$1, $1.')
      }
      if (seasonal) {
        ant = seasonal
        comment = 1
      }
    }
  }

  ant = ant.replace(/^.*?=\s*/, '')
  let feastflag = 0

  if (hora !== 'Completorium') {
    let [w, c] = await getproprium(state, `Ant ${hora}`, lang, false)
    if (
      !w &&
      !/Psalmi\s*(?:minores)*\s*ex Psalterio/i.test(state.rule) &&
      !(/1955|1960/.test(version) && state.day.rank < 6 && dayofweek > 0)
    ) {
      ;[w, c] = await getanthoras(state, lang)
    }
    if (w) {
      ant = chompd(w)
      comment = c
    }

    if (
      (/Psalmi\s*(?:minores)*\s*Dominica/i.test(state.rule) ||
        /Psalmi\s*(?:minores)*\s*Dominica/i.test(state.communerule)) &&
      !/Psalmi\s*(?:minores)*\s*ex Psalterio/i.test(state.rule) &&
      !(/1955|196/.test(version) && state.day.rank < 6 && dayofweek > 0)
    ) {
      feastflag = !/Trident|Monastic/i.test(version) ? 1 : 2
    }
    if (/1955|1960/.test(version) && state.day.rank < 6) feastflag = 0
    if (
      /Dominica/i.test(state.day.winnerSections.Rank ?? '') &&
      !/Nat|Pasc6/i.test(ctx.dayname[0])
    ) {
      feastflag = 0
    }

    if (feastflag === 1) {
      prefix = `${await state.texts.translate('Psalmi Dominica, antiphonae', lang)} `
    } else if (feastflag === 2) {
      prefix = `${await state.texts.translate('Antiphona', lang)} `
    }
  } else if (/^Monastic/.test(version)) {
    ant = ''
  }

  if (hora === 'Completorium' && /^(?:Trident|Monastic)/.test(version)) comment = -1
  await setcomment(state, state.label, 'Source', comment, lang, prefix)

  if (
    /Minores sine Antiphona/i.test(winnerOf(state, lang).Rule ?? '') ||
    (hora === 'Completorium' && /^Monastic/.test(version))
  ) {
    ant = ''
  }

  const cut = /(.*?);;/s.exec(ant)
  if (cut) ant = cut[1]

  if (hora === 'Prima') {
    psalms =
      state.day.laudes !== 2 || /1960/.test(version)
        ? psalms.replace(/,?\[\d+\]/g, '')
        : psalms.replace(/[[\]]/g, '')
  }

  const psalmList = psalms.split(',').filter((x) => x !== '')

  if (!/Trident|Monastic/.test(version)) {
    if (hora === 'Prima' && feastflag) {
      psalmList[0] = '53'
    }
    if (
      hora === 'Prima' &&
      state.day.laudes === 2 &&
      /Dominica/i.test(ctx.dayname[1]) &&
      !/196/.test(version)
    ) {
      psalmList[0] = '99'
      psalmList.unshift('92')
    }
  }

  // Quicumque (Athanasian creed).
  if (
    (!/1955|196/.test(version) || /Pent01/i.test(ctx.dayname[0])) &&
    hora === 'Prima' &&
    (/(Epi|Pent)/i.test(ctx.dayname[0]) || !/Divino/i.test(version)) &&
    dayofweek === 0 &&
    !/Non dicitur Quicumque/i.test(state.rule) &&
    (/(Adv|Pent01|Pasc1)/i.test(ctx.dayname[0]) ||
      (await checksuffragium(state)) ||
      (/Epi[2-6]|Quad|Pasc[1-5]|Pent0[3-9]|Pent[12]/i.test(ctx.dayname[0]) &&
        /trident/i.test(version)) ||
      (/Adv|Epi[2-6]|Quad|Pasc[1-5]|Pent/i.test(ctx.dayname[0]) && /cist/i.test(version))) &&
    (/Tempora/i.test(state.day.winner) || !/cist/i.test(version))
  ) {
    psalmList.push('234')
  }

  return [`${ant};;${psalmList.join(';')}`]
}

// Port of antetpsalm — emits 'Ant. x' + &psalm(n) lines + the closing full
// antiphon into state.s.
export async function antetpsalm(
  state: HoursState,
  psalmiList: string[],
  duplexf: boolean,
  lang: string,
): Promise<void> {
  let lastant = ''

  for (const entry of psalmiList) {
    const sep = entry.indexOf(';;')
    let ant = sep >= 0 ? entry.slice(0, sep) : entry
    const psalms = sep >= 0 ? entry.slice(sep + 2) : ''

    if (ant) {
      if (lastant) {
        state.s.pop()
        state.s.push(`Ant. ${lastant}`, '\n')
      }
      ant = ant.replace(/~?\n/g, ' ')
      ant = await postprocessAnt(state, ant, lang)
      let antp = ant
      if (!(duplexf && true)) {
        antp = antp.replace(/\s+\*.*/, '')
        antp = antp.replace(/,$/, '.')
      }
      state.s.push(`Ant. ${antp}`)
      lastant = ant.replace(/\* /, '')
    }

    const p = psalms.split(';').filter((x) => x !== '')
    for (let i = 0; i < p.length; i++) {
      let arg = p[i]
      arg = arg.replace(/(\(.*?-.*?\))(.*')$/, '$2$1')
      arg = arg.replace(/[(-]/g, ',')
      arg = arg.replace(/\)/, '')
      if (i < p.length - 1) arg = `-${arg}`
      arg = arg.replace(/-'/, "'-")
      state.s.push(`&psalm(${arg})`, '\n')
    }
  }

  if (lastant) state.s[state.s.length - 1] = `Ant. ${lastant}`
}
