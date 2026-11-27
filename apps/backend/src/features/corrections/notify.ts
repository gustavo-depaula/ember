import { type CorrectionBody, describeService, type Service } from '@ember/api'
import type { Env } from '../../app'

// A short email to the admin as each fix request comes in: which church, what is asked in a line,
// the comment, and the link that opens the church on the moderation desk, where the rest is.
//
// It goes to NOTIFY_TO (a secret, so no address sits in the repo) from NOTIFY_FROM, on a domain
// onboarded to Cloudflare Email Sending. Without NOTIFY_TO no mail is sent.

const desk = 'https://ember-admin.dpgu.workers.dev/'

const escaped = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const serviceKind: Record<string, string> = {
  mass: 'Mass',
  confession: 'Confession',
  adoration: 'Adoration',
}

const named = (service: Partial<Service>) =>
  `${serviceKind[service.kind ?? ''] ?? 'Service'} ${describeService(service as Service)}`

// What is asked, in a line.
function asked(body: CorrectionBody, services: Service[]): string {
  const service =
    'serviceId' in body && body.serviceId
      ? services.find((s) => s.id === body.serviceId)
      : undefined
  switch (body.kind) {
    case 'edit_service':
      return service
        ? `${named(service)} → ${named({ ...service, ...body.changes })}`
        : 'A change to a service'
    case 'add_service':
      return `Add: ${named(body.changes as Service)}`
    case 'edit_church':
      return `Change: ${Object.keys(body.changes).join(', ')}`
    case 'flag_closed':
      return service ? `Closed: ${named(service)}` : 'Reported closed'
    case 'note':
      return service ? `A note on ${named(service)}` : 'A note'
  }
}

export async function notifyCorrection(
  env: Env,
  churchId: string,
  body: CorrectionBody,
): Promise<void> {
  if (!env.EMAIL || !env.NOTIFY_TO || !env.NOTIFY_FROM) return
  const church = await env.DB.prepare('SELECT name, city, services FROM church WHERE id = ?')
    .bind(churchId)
    .first<{ name: string; city: string | null; services: string | null }>()
  const services = church?.services ? (JSON.parse(church.services) as Service[]) : []
  const name = [church?.name ?? churchId, church?.city].filter(Boolean).join(', ')
  const what = asked(body, services)
  const photos = body.attachmentKeys?.length ?? 0
  const link = `${desk}?church=${encodeURIComponent(churchId)}`

  const html = `<div style="font:16px/1.5 Georgia,serif;color:#2c2418;max-width:560px">
<p style="margin:0 0 8px">${escaped(what)}</p>
${body.comment ? `<p style="margin:0 0 8px;color:#6b5d4f">“${escaped(body.comment)}”</p>` : ''}
${photos ? `<p style="margin:0 0 8px;font:13px sans-serif;color:#9a8d7f">${photos === 1 ? 'With a photo' : `With ${photos} photos`}</p>` : ''}
<p style="margin:12px 0 0"><a href="${link}" style="color:#6b1d2a">Review on the desk</a></p>
</div>`
  const text = [
    what,
    ...(body.comment ? [`“${body.comment}”`] : []),
    ...(photos ? [photos === 1 ? 'With a photo' : `With ${photos} photos`] : []),
    '',
    link,
  ].join('\n')

  await env.EMAIL.send({
    to: env.NOTIFY_TO,
    from: { email: env.NOTIFY_FROM, name: 'Ember Mass times' },
    subject: `Fix request: ${name}`,
    html,
    text,
  })
}
