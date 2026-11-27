import { type CorrectionBody, describeService, type Service } from '@ember/api'
import type { Env } from '../../app'

// An email to the admin as each fix request comes in: the church, what is asked and how it
// stands now, the comment, the photos attached, and the way to the moderation desk where it is
// reviewed. Nothing here decides anything; the desk does.
//
// It goes to NOTIFY_TO (a secret, so no address sits in the repo) from NOTIFY_FROM, on a domain
// onboarded to Cloudflare Email Sending. Without NOTIFY_TO no mail is sent.

const desk = 'https://ember-admin.dpgu.workers.dev/'

const color = {
  page: '#f3ede3',
  card: '#fffdf9',
  ink: '#2c2418',
  soft: '#6b5d4f',
  muted: '#9a8d7f',
  rule: '#e5ddd2',
  burgundy: '#6b1d2a',
  was: '#b83a3a',
  now: '#2d6a4f',
}
const serif = "Georgia,'Times New Roman',serif"
const sans = "-apple-system,'Segoe UI',Helvetica,Arial,sans-serif"

const kindLabel: Record<CorrectionBody['kind'], string> = {
  edit_service: 'A change to a service',
  edit_church: 'A change to the church’s details',
  add_service: 'A service to add',
  flag_closed: 'Reported closed',
  note: 'A note',
}

const serviceKind: Record<string, string> = {
  mass: 'Mass',
  confession: 'Confession',
  adoration: 'Adoration',
}

const escaped = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

type ChurchRow = {
  name: string
  city: string | null
  region: string | null
  address: string | null
  services: string | null
}

// A line of what is asked: the field, how it stands, and what it would become.
type Line = { field: string; was?: string; now?: string }

const named = (service: Partial<Service>) =>
  `${serviceKind[service.kind ?? ''] ?? service.kind ?? 'Service'}, ${describeService(service as Service)}`

function asked(body: CorrectionBody, services: Service[]): { about?: string; lines: Line[] } {
  const service =
    'serviceId' in body && body.serviceId
      ? services.find((s) => s.id === body.serviceId)
      : undefined
  switch (body.kind) {
    case 'edit_service': {
      const changed = { ...service, ...body.changes } as Service
      const when =
        'rrule' in body.changes || 'startTime' in body.changes || 'endTime' in body.changes
      const lines: Line[] =
        when && service ? [{ field: 'When', was: named(service), now: named(changed) }] : []
      for (const [field, value] of Object.entries(body.changes)) {
        if (['rrule', 'startTime', 'endTime'].includes(field) && service) continue
        lines.push({
          field,
          was: service?.[field as keyof Service] as string | undefined,
          now: value,
        })
      }
      return { about: service ? named(service) : `service ${body.serviceId}`, lines }
    }
    case 'add_service':
      return { lines: [{ field: 'New', now: named(body.changes as Service) }] }
    case 'edit_church':
      return {
        lines: Object.entries(body.changes).map(([field, now]) => ({ field, now })),
      }
    case 'flag_closed':
    case 'note':
      return { about: service ? named(service) : undefined, lines: [] }
  }
}

export async function notifyCorrection(
  env: Env,
  churchId: string,
  body: CorrectionBody,
): Promise<void> {
  if (!env.EMAIL || !env.NOTIFY_TO || !env.NOTIFY_FROM) return
  const church = await env.DB.prepare(
    'SELECT name, city, region, address, services FROM church WHERE id = ?',
  )
    .bind(churchId)
    .first<ChurchRow>()
  const services = church?.services ? (JSON.parse(church.services) as Service[]) : []
  const keys = body.attachmentKeys ?? []
  const photos = keys.length
    ? (
        await env.DB.prepare(
          'SELECT id, content_type AS type, data FROM attachment WHERE id IN (SELECT value FROM json_each(?))',
        )
          .bind(JSON.stringify(keys))
          .all<{ id: string; type: string; data: string }>()
      ).results
    : []

  const name = church?.name ?? churchId
  const place = [church?.city, church?.region].filter(Boolean).join(', ')
  const { about, lines } = asked(body, services)
  const link = `${desk}?church=${encodeURIComponent(churchId)}`
  const subject = `Mass times: ${kindLabel[body.kind].toLowerCase()} at ${name}${church?.city ? `, ${church.city}` : ''}`

  const lineHtml = lines
    .map(
      (l, i) => `<tr>
  <td style="padding:8px 12px 8px 0;${i ? `border-top:1px solid ${color.rule};` : ''}font:12px ${sans};color:${color.muted};vertical-align:top;white-space:nowrap">${escaped(l.field)}</td>
  <td style="padding:8px 0;${i ? `border-top:1px solid ${color.rule};` : ''}font:16px/1.4 ${serif};color:${color.ink}">${l.was ? `<span style="color:${color.was};text-decoration:line-through">${escaped(l.was)}</span><br>` : ''}${l.now ? `<span style="color:${l.was ? color.now : color.ink}">${escaped(l.now)}</span>` : ''}</td>
</tr>`,
    )
    .join('')

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escaped(subject)}</title></head>
<body style="margin:0;padding:0;background:${color.page}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escaped(body.comment ?? kindLabel[body.kind])}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${color.page}"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">
  <tr><td style="padding:0 8px 18px">
    <div style="font:600 12px ${sans};letter-spacing:.28em;color:${color.burgundy}">✠ EMBER · MASS TIMES</div>
    <div style="font:28px/1.2 ${serif};color:${color.ink};padding-top:8px">${escaped(name)}</div>
    <div style="font:14px/1.5 ${sans};color:${color.soft};padding-top:4px">${escaped([church?.address, place].filter(Boolean).join(' · '))}</div>
  </td></tr>
  <tr><td style="background:${color.card};border-radius:14px;padding:22px 24px">
    <div style="font:600 11px ${sans};letter-spacing:.12em;text-transform:uppercase;color:${color.burgundy}">${escaped(kindLabel[body.kind])}</div>
    ${about ? `<div style="font:16px/1.4 ${serif};color:${color.soft};padding-top:6px">${escaped(about)}</div>` : ''}
    ${lines.length ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:14px">${lineHtml}</table>` : ''}
    ${body.comment ? `<blockquote style="margin:16px 0 0;padding:4px 0 4px 14px;border-left:3px solid ${color.rule};font:italic 17px/1.5 ${serif};color:${color.ink}">${escaped(body.comment)}</blockquote>` : ''}
    ${photos.length ? `<div style="font:13px ${sans};color:${color.soft};padding-top:14px">${photos.length === 1 ? 'A photo is attached.' : `${photos.length} photos are attached.`}</div>` : ''}
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:20px"><tr><td style="background:${color.burgundy};border-radius:8px">
      <a href="${link}" style="display:inline-block;padding:11px 18px;font:600 14px ${sans};color:#fffdf9;text-decoration:none">Review on the desk</a>
    </td></tr></table>
  </td></tr>
  <tr><td style="padding:18px 8px 0;font:12px/1.6 ${sans};color:${color.muted}">
    Sent as each fix request reaches the Mass-times directory. Nothing changes until it is approved on <a href="${desk}" style="color:${color.soft}">the desk</a>.
  </td></tr>
</table>
</td></tr></table>
</body></html>`

  const text = [
    `${kindLabel[body.kind]} — ${name}${place ? `, ${place}` : ''}`,
    ...(about ? [about] : []),
    '',
    ...lines.map((l) => `${l.field}: ${l.was ? `${l.was} → ` : ''}${l.now ?? ''}`),
    ...(body.comment ? ['', `“${body.comment}”`] : []),
    ...(photos.length ? ['', `${photos.length} photo(s) attached.`] : []),
    '',
    `Review on the desk: ${link}`,
  ].join('\n')

  await env.EMAIL.send({
    to: env.NOTIFY_TO,
    from: { email: env.NOTIFY_FROM, name: 'Ember Mass times' },
    subject,
    html,
    text,
    attachments: photos.map((p, i) => ({
      filename: `photo-${i + 1}.${p.type.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg'}`,
      type: p.type,
      disposition: 'attachment' as const,
      content: Uint8Array.from(atob(p.data), (c) => c.charCodeAt(0)).buffer,
    })),
  })
}
