// Port of specials/psalmi.pl for the minor hours (psalmi_minor + antetpsalm).
// psalmi_major (Lauds/Vespers) and psalmi_matutinum come with M6/M7.

import { num } from '../kalendar/state'
import { alleluiaRequired, gettempora, postprocessAnt } from './helpers'
import { checksuffragium, getanthoras, getproprium, setcomment, setup } from './proprium'
import { chompd, columnsel, type HoursState, winnerOf } from './state'

export async function psalmi(state: HoursState, lang: string): Promise<void> {
  state.psalmnum1 = 0
  state.psalmnum2 = 0
  if (state.hora === 'Matutinum') {
    throw new Error('psalmi_matutinum is not ported yet — M7')
  }
  if (/^(?:Laudes|Vespera)$/i.test(state.hora)) {
    throw new Error('psalmi_major is not ported yet — M6')
  }
  const list = await psalmiMinor(state, lang)
  const duplexf = /196/.test(state.day.ctx.version)
  await antetpsalm(state, list, duplexf, lang)
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
    (/(Adv|Pent01|Pasc1)/i.test(ctx.dayname[0]) || (await checksuffragium(state))) &&
    true
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
