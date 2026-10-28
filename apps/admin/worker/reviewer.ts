import { Container, getContainer, type OutboundHandler } from '@cloudflare/containers'
import { createDesk, message } from './desk'
import type { Env } from './env'

// The box that runs the Claude Code CLI (reviewer/: a small queue in front of `claude -p`). A
// Worker cannot run a command-line program, so reviews happen here.
//
// What a review reads was written by anonymous strangers and by whatever web pages it opens, so
// the box is given nothing worth stealing. It has no database: it reports and searches by calling
// http://desk.internal, which never leaves this Worker (`outboundByHost` below). And it has no
// credential: its calls to Anthropic carry a placeholder, and the real token is put on them here,
// on their way out.

// What the desk hands the reviewer for one review.
export type ReviewJob = {
  id: string
  churchId: string
  // The case folder's contents. Claude reads these, and nothing else of the box's disk.
  files: Array<{ name: string; text?: string; base64?: string }>
  prompt: string
  // Used instead of `prompt` when the box still holds the session that wrote the last proposal.
  resume?: { sessionId: string; prompt: string }
  schema: unknown
  model?: string
}

const deskHost = 'desk.internal'
const anthropicHost = 'api.anthropic.com'

export class Reviewer extends Container<Env> {
  defaultPort = 8080
  // Counted from the last request the Worker sent it. Long enough for the reviews one request
  // queues to finish with nobody watching; the page's polling keeps it awake past that.
  sleepAfter = '20m'
  interceptHttps = true
  envVars = {
    DESK_URL: `http://${deskHost}`,
    // Claude Code only needs to find a token to send; the Worker replaces it (see below).
    CLAUDE_CODE_OAUTH_TOKEN: 'sk-ant-oat01-held-by-the-worker',
    // The certificate the Worker answers intercepted HTTPS with, made when the container starts.
    NODE_EXTRA_CA_CERTS: '/etc/cloudflare/certs/cloudflare-containers-ca.crt',
    CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: '1',
    DISABLE_AUTOUPDATER: '1',
  }
}

export function reviewer(env: Env) {
  return getContainer(env.REVIEWER, 'desk')
}

const json = (data: unknown, status = 200) => Response.json(data, { status })

// The reviewer's three calls home: what a run is doing, how it ended, and a directory search.
const desk: OutboundHandler<Env> = async (request, env) => {
  const match = /^\/runs\/([^/]+)\/(activity|done|search)$/.exec(new URL(request.url).pathname)
  if (request.method !== 'POST' || !match) return json({ error: 'No such route.' }, 404)
  const [, id, what] = match
  try {
    const body = (await request.json()) as Record<string, unknown>
    const api = createDesk(env, 'remote')
    if (what === 'activity') {
      const wanted = await api.report(id, (body.lines as string[] | undefined) ?? [])
      return wanted ? json({ ok: true }) : json({ error: 'This review was stopped.' }, 410)
    }
    if (what === 'done') {
      await api.finish(id, body)
      return json({ ok: true })
    }
    return json({ matches: await api.searchFor(id, String(body.query ?? '')) })
  } catch (error) {
    return json({ error: message(error) }, 500)
  }
}

const anthropic: OutboundHandler<Env> = (request, env) => {
  if (!env.CLAUDE_CODE_OAUTH_TOKEN) {
    return json(
      {
        type: 'error',
        error: {
          type: 'authentication_error',
          message:
            'The admin Worker has no CLAUDE_CODE_OAUTH_TOKEN secret. Make one with `claude setup-token` and store it with `wrangler secret put CLAUDE_CODE_OAUTH_TOKEN`.',
        },
      },
      401,
    )
  }
  const authorized = new Request(request)
  authorized.headers.set('Authorization', `Bearer ${env.CLAUDE_CODE_OAUTH_TOKEN}`)
  authorized.headers.delete('x-api-key')
  return fetch(authorized)
}

Reviewer.outboundByHost = { [deskHost]: desk, [anthropicHost]: anthropic }
