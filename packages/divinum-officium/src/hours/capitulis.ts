// Port of specials/capitulis.pl (minor-hour parts), specprima.pl and
// monastic.pl: capitulum_minor + minor_reponsory, capitulum_prima,
// lectio_brevis_prima, regula.

import { leapyear } from '../kalendar/date'
import { isSectioned } from '../types'
import { gettempora, postprocessShortResp } from './helpers'
import { getproprium, setcomment, setup } from './proprium'
import { chompd, columnsel, type HoursState, winnerOf } from './state'

// Port of minor_reponsory.
async function minorResponsory(state: HoursState, lang: string): Promise<string> {
  const { version } = state.day.ctx
  const hora = state.hora
  const capit = await setup(state, lang, 'Psalterium/Special/Minor Special')
  let name = `${gettempora(state, 'Capitulum minor')} ${hora}`
  if (hora === 'Completorium') name = 'Completorium'
  if (/Monastic/.test(version)) name += 'M'

  let resp = ''
  const direct = capit[`Responsory ${name}`]
  if (direct) {
    resp = direct.replace(/\s*$/, '')
  } else {
    const breve = capit[`Responsory breve ${name}`]
    const vers = capit[`Versum ${name}`]
    if (breve && vers) {
      resp = breve.replace(/\s*$/, `\n_\n${vers.replace(/\s*$/, '')}`)
    }
  }

  if (hora === 'Completorium') {
    if (resp) resp += '\n_\n'
    resp += capit['Versum 4'] ?? ''
  } else {
    let key = `Responsory ${hora}`
    if (/Monastic/.test(version)) key += 'M'
    let [wr] = await getproprium(state, key, lang, true)

    if (!wr) {
      let replace: Record<string, string> = {
        Tertia: 'Nocturn 1 Versum',
        Sexta: 'Nocturn 2 Versum',
        Nona: 'Nocturn 3 Versum',
      }
      if (!/Monastic/.test(version)) {
        replace = {
          Tertia: 'Versum Tertia',
          Sexta: 'Versum Sexta',
          Nona: 'Versum Nona',
        }
        const [breve] = await getproprium(state, `Responsory Breve ${hora}`, lang, true)
        if (breve) wr = breve.replace(/\s*$/, '\n_\n')
      }
      const [vers] = await getproprium(state, replace[hora] ?? '', lang, true)
      wr += vers
    }
    resp = wr || resp
  }

  const lines = await postprocessShortResp(state, resp.split('\n'), lang)
  return lines.join('\n')
}

// Port of capitulum_minor (Tertia/Sexta/Nona/Completorium).
export async function capitulumMinor(state: HoursState, lang: string): Promise<string> {
  const hora = state.hora
  const capitFile = await setup(state, lang, 'Psalterium/Special/Minor Special')
  let name = `${gettempora(state, 'Capitulum minor')} ${hora}`
  if (hora === 'Completorium') name = 'Completorium'
  const capit = (capitFile[name] ?? '').replace(/\s*$/, '')

  const comment = /Dominica|Feria/.test(name) ? 5 : 1

  let propriumName = `Capitulum ${hora}`
  if (hora === 'Tertia' && !/C12/.test(state.votive)) {
    propriumName = propriumName.replace(/Tertia/, 'Laudes')
  }
  const [w, c] = await getproprium(state, propriumName, lang, true)

  if (hora !== 'Completorium') {
    await setcomment(state, state.label, 'Source', w ? c : comment, lang)
  }

  return `${w || capit}\n_\n${await minorResponsory(state, lang)}`
}

// Port of get_prima_responsory.
async function getPrimaResponsory(state: HoursState, lang: string): Promise<string> {
  const ctx = state.day.ctx
  const { version, month, day } = ctx
  let key = gettempora(state, 'Prima responsory')

  const dox =
    /Doxology=(Nat|Epi|Pasch|Asc|Corp|Heart)/i.exec(state.rule) ??
    /Doxology=(Nat|Epi|Pasch|Asc|Corp|Heart)/i.exec(state.day.commemoratioSections.Rule ?? '')
  if (dox) {
    key = dox[1]
  } else if (!/196/.test(version) && month === 8 && day > 15 && day < 23) {
    key = 'Nat'
  }
  if (/196/.test(version) && month === 12 && day > 8 && day < 16 && day !== 12) {
    key = 'Adv'
  }
  if (/196/.test(version) && /Corp|Heart/.test(key)) key = ''
  if (!key) return ''

  const t = await setup(state, lang, 'Psalterium/Special/Prima Special')
  return t[`Responsory ${key}`] ?? ''
}

// Port of capitulum_prima.
export async function capitulumPrima(
  state: HoursState,
  lang: string,
  withResponsory: boolean,
): Promise<string> {
  const ctx = state.day.ctx
  const { version, dayofweek } = ctx
  const brevis = await setup(state, lang, 'Psalterium/Special/Prima Special')

  const key =
    dayofweek > 0 &&
    !/196[03]/.test(version) &&
    /Feria|Vigilia/i.test(state.day.winnerSections.Rank ?? '') &&
    !/Vigilia Epi/i.test(state.day.winnerSections.Rank ?? '') &&
    (!state.day.commune || !/C10/.test(state.day.commune)) &&
    (state.day.rank < 3 || /Quad6/.test(ctx.dayname[0]) || /Quadp3-3/.test(state.day.winner)) &&
    !/Pasc/i.test(ctx.dayname[0])
      ? 'Feria'
      : 'Dominica'

  const capit = `${brevis[key] ?? ''}\n$Deo gratias\n_\n`

  if (/1963/.test(version)) {
    state.s.push(state.label)
  } else {
    await setcomment(state, state.label, 'Source', key === 'Feria' ? 1 : 0, lang)
  }

  let resp: string[] = []
  if (withResponsory) {
    resp = (brevis.Responsory ?? '').split('\n')
    let primaResponsory = await getPrimaResponsory(state, lang)
    const wpr = winnerOf(state, lang)
    if (wpr['Versum Prima'] !== undefined) primaResponsory = wpr['Versum Prima']
    if (primaResponsory) resp[2] = `V. ${chompd(primaResponsory)}`
    resp.push('_')
  }
  resp.push(...(brevis.Versum ?? '').split('\n'))
  resp = await postprocessShortResp(state, resp, lang)

  return capit + resp.join('\n')
}

// do_read on a Regula chapter with the checkfile language chain.
async function readRegulaLines(state: HoursState, lang: string, fname: string): Promise<string[]> {
  const { loader } = state.session
  for (const l of [lang, state.session.fallbackLang, 'Latin']) {
    const file = await loader.load(`horas/${l}/Regula/${fname}`)
    if (file && !isSectioned(file)) return [...file.lines]
  }
  return []
}

// Port of monastic.pl::regula — the daily chapter of the Rule of St. Benedict
// read at Monastic Prima. (The Ordo Praedicatorum path is out of v1 scope.)
export async function regula(state: HoursState, lang: string): Promise<string> {
  const { day, month, year } = state.day.ctx
  let t = `${await state.texts.prayer('benedictio Prima', lang)}\n`
  let d = day
  const leap = leapyear(year)
  if (month === 2 && day >= 24 && !leap) d += 1
  let fname = `${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  if (!(await state.session.loader.exists(`horas/Latin/Regula/${fname}`))) {
    // The Rule is read thrice a year; Regulatable maps the later readings to
    // the file of the first.
    const table = await state.session.loader.load('horas/Latin/Regula/Regulatable')
    const lines = table && !isSectioned(table) ? table.lines : []
    const hit = lines.find((x) => x.includes(fname))
    if (!hit) return t
    fname = hit.slice(0, 5)
  }

  const a = await readRegulaLines(state, lang, fname)
  const title = (a.shift() ?? '').replace(/.*#/, 'v. ')
  const body = a.map((x) => (x === '' ? '_' : x))
  body.unshift(title)
  t += body.join('\n')

  if (month === 2 && day === 23 && !leap) {
    const b = await readRegulaLines(state, lang, '02-24')
    b.shift()
    t += b.map((x) => (x === '' ? '_' : x)).join('\n')
  }

  t += '\n$Tu autem'
  t += '\n_\n$rubrica Regula\n'
  return t
}

// Port of lectio_brevis_prima.
export async function lectioBrevisPrima(
  state: HoursState,
  lang: string,
): Promise<[string, number]> {
  const { version } = state.day.ctx
  const brevisFile = await setup(state, lang, 'Psalterium/Special/Prima Special')
  const name = gettempora(state, 'Lectio brevis Prima')
  let brevis = brevisFile[name] ?? ''
  let comment = /per annum/i.test(name) ? 5 : 1

  if (!/1955|196|cist/i.test(version)) {
    const w = winnerOf(state, lang)
    const com = columnsel(state, lang) ? state.day.communeSections : state.commune2
    if (state.day.winnerSections['Lectio Prima'] !== undefined) {
      brevis = w['Lectio Prima'] ?? brevis
      comment = 3
    } else if (state.day.communeSections['Lectio Prima'] !== undefined) {
      brevis = com['Lectio Prima'] ?? brevis
      comment = 4
    }
  }

  if (!/^Monastic/.test(version)) brevis = `$benedictio Prima\n${brevis}`
  brevis += '\n$Tu autem'
  return [brevis, comment]
}
