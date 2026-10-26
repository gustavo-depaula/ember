// The directory's change log as HTML, from the structured changes `/changes` serves (the same
// lines its plain-text message is written from). Strings only, like view.ts: the change-log page
// and a church page's recent changes both draw with it in the browser.
import type { ChangedChurch, ChangeLine } from '@ember/api'
import type { Locale } from '~/lib/locale'

export type Change = { id: string; appliedAt: string; churches: ChangedChurch[]; message: string }
export type ChangesPage = { changes: Change[]; next?: string }

export const changesStrings = {
  'en-US': {
    title: 'Recent changes',
    intro:
      'Every correction the moderators have made to the Mass-times directory, newest first. Most begin with a suggestion from someone who attends the church.',
    added: 'new',
    removed: 'removed',
    newChurch: 'Newly listed',
    chapelOf: 'Chapel of',
    now: 'Schedule now',
    older: 'Show older changes',
    none: 'No changes yet.',
    error: 'Could not load the changes. Try again in a moment.',
    all: 'All changes in the directory',
    api: 'Also served by the API as GET /changes',
  },
  'pt-BR': {
    title: 'Mudanças recentes',
    intro:
      'Cada correção que os moderadores fizeram no diretório de horários de Missa, da mais recente à mais antiga. A maioria começa com a sugestão de alguém que frequenta a igreja.',
    added: 'novo',
    removed: 'removido',
    newChurch: 'Recém-incluída',
    chapelOf: 'Capela da paróquia',
    now: 'Horários atuais',
    older: 'Ver mudanças anteriores',
    none: 'Nenhuma mudança ainda.',
    error: 'Não foi possível carregar as mudanças. Tente de novo daqui a pouco.',
    all: 'Todas as mudanças do diretório',
    api: 'Também servidas pela API em GET /changes',
  },
} satisfies Record<Locale, Record<string, string>>

export type ChangesStrings = (typeof changesStrings)['en-US']

export type ChangesContext = {
  s: ChangesStrings
  locale: string
  churchHref: (id: string) => string
}

const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }
const esc = (text: string | undefined) => (text ?? '').replace(/[&<>"]/g, (c) => entities[c])

function lineHtml({ label, before, after }: ChangeLine, s: ChangesStrings): string {
  const what = (() => {
    if (before === undefined)
      return `<ins>${esc(after)}</ins><span class="mtc-tag">${esc(s.added)}</span>`
    if (after === undefined)
      return `<del>${esc(before)}</del><span class="mtc-tag">${esc(s.removed)}</span>`
    return `<del>${esc(before)}</del><span class="mtc-arrow" aria-hidden="true">→</span><ins>${esc(after)}</ins>`
  })()
  return `<li><span class="mtc-label">${esc(label)}</span><span class="mtc-what">${what}</span></li>`
}

function churchHtml(church: ChangedChurch, ctx: ChangesContext): string {
  const { s } = ctx
  const badge = church.isNew ? `<span class="mtc-badge">${esc(s.newChurch)}</span>` : ''
  const parish = church.parish
    ? `${esc(s.chapelOf)} <a href="${esc(ctx.churchHref(church.parish.id))}">${esc(church.parish.name)}</a> · `
    : ''
  const lines = church.changes.length
    ? `<ul class="mtc-lines">${church.changes.map((line) => lineHtml(line, s)).join('')}</ul>`
    : ''
  const schedule = church.schedule.length
    ? `<div class="mtc-now"><h4 class="t-kicker">${esc(s.now)}</h4><dl>${church.schedule
        .map(
          ({ label, times }) =>
            `<dt>${esc(label)}</dt><dd>${times.map((time) => `<span>${esc(time)}</span>`).join('')}</dd>`,
        )
        .join('')}</dl></div>`
    : ''
  return `<section class="mtc-church"><header><h3><a href="${esc(ctx.churchHref(church.id))}">${esc(church.name)}</a>${badge}</h3><p class="mtc-place">${parish}${esc(church.place)}</p></header><div class="mtc-body">${lines}${schedule}</div></section>`
}

/** One applied change: every church it touched, the one it was about first. */
export function changeHtml(change: Change, ctx: ChangesContext): string {
  return `<article class="mtc-entry" id="${esc(change.id)}">${change.churches.map((church) => churchHtml(church, ctx)).join('')}</article>`
}

// Changes under the day they were applied, in the reader's own time zone. `after` is the last
// change already drawn, so a further page continues its day instead of repeating the heading.
export function changesHtml(changes: Change[], ctx: ChangesContext, after?: Change): string {
  const day = (change: Change) =>
    new Date(change.appliedAt).toLocaleDateString(ctx.locale, { dateStyle: 'long' })
  let current = after && day(after)
  return changes
    .map((change) => {
      const heading =
        day(change) === current ? '' : `<h2 class="mtc-day t-kicker">${esc(day(change))}</h2>`
      current = day(change)
      return heading + changeHtml(change, ctx)
    })
    .join('')
}
