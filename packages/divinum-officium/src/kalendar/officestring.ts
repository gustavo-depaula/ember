// Port of SetupString.pl::officestring — setupstring plus the August–December
// scripture-week augmentation: for post-Pentecost/Epiphany Tempora files the
// month-week file (e.g. Tempora/081-1) overlays the seasonal one and the Rank
// title gains the week/month designation. Also sets ctx.monthday, which the
// tempus-id and several handlers consult (exactly like the Perl global).

import { type DoSession, type Sections, setupstring } from '../references/resolve'
import { monthday } from './date'
import type { KalendarState } from './state'
import { subdirname } from './state'

export function sessionWithLang(session: DoSession, lang: string): DoSession {
  return lang === session.lang ? session : { ...session, lang }
}

export async function officestring(
  state: KalendarState,
  lang: string,
  fnameWithExt: string,
  flag = false,
): Promise<Sections | undefined> {
  const { ctx, session } = state
  const fname = fnameWithExt.replace(/\.txt$/, '')
  const langSession = sessionWithLang(session, lang)

  if (!/^Tempora[^/]*\/(?:Pent|Epi)/.test(fname) || /^Tempora[^/]*\/Pent0[1-5]/.test(fname)) {
    const s = await setupstring(langSession, fname)
    if (!s) return undefined
    if (/196/.test(ctx.version) && /Feria.*?(III|IV) Adv/i.test(s.Rank ?? '') && ctx.day > 16) {
      s.Rank = (s.Rank ?? '').replace(/;;2\.1/, ';;4.9')
    } else if (
      /cist/i.test(ctx.version) &&
      /Feria.*?(III|IV) Adv/i.test(s.Rank ?? '') &&
      ctx.day > 16
    ) {
      s.Rank = (s.Rank ?? '').replace(/;;1\.15/, ';;2.1')
    }
    return s
  }

  ctx.monthday = monthday(ctx.day, ctx.month, ctx.year, /196/.test(ctx.version), flag)
  if (!ctx.monthday) return setupstring(langSession, fname)

  const s = await setupstring(langSession, fname)
  if (!s) return undefined

  const rank = (s.Rank ?? '').split(';;')
  let m = 0
  let w = 0
  const md = /([0-9][0-9])([0-9])-[0-9]/.exec(ctx.monthday)
  if (md) {
    m = Number(md[1])
    w = Number(md[2])
  }
  const weeks = ['I.', 'II.', 'III.', 'IV.', 'V.']
  let mStr: string | number = m
  let wStr: string | number = w
  if (m) {
    const comment = await setupstring(langSession, 'Psalterium/Comment')
    const months = (comment?.Menses ?? '').split('\n')
    mStr = months[m - 8] ?? ''
  }
  if (w) wStr = weeks[w - 1] ?? ''
  rank[0] = `${rank[0] ?? ''} ${wStr} ${mStr}`
  s.Rank = rank.join(';;')

  const overlay = await setupstring(
    langSession,
    `${subdirname('Tempora', ctx.version)}${ctx.monthday}`,
  )
  if (!overlay) return s
  for (const key of Object.keys(overlay)) {
    // Perl guards this with `$version =~ //i && $key =~ /Rank/i`; the empty
    // pattern's last-successful-match semantics make the guard false in
    // practice, so every key — including Rank — is overlaid. (That's how
    // September Ember days get their 'Feria major;;4.9' rank from 093-*.)
    s[key] = overlay[key]
  }
  return s
}
