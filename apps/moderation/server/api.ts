import { createReadStream } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { resolutionSchema } from '@ember/api/src/moderation'
import type { Plugin } from 'vite'
import { type DeskApi, issues, message } from './desk'

// The desk's HTTP surface, mounted on the Vite dev server under /api. Local only: the server
// listens on 127.0.0.1.

type Handler = (context: {
  params: string[]
  body: unknown
  res: ServerResponse
}) => Promise<unknown> | unknown

function send(res: ServerResponse, status: number, data: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  const text = Buffer.concat(chunks).toString()
  return text ? JSON.parse(text) : {}
}

export function deskApi(desk: DeskApi): Plugin {
  const routes: Array<[method: string, path: RegExp, handler: Handler]> = [
    ['GET', /^\/desk$/, () => (desk.isLoaded() ? desk.snapshot() : desk.load())],
    ['POST', /^\/refresh$/, () => desk.load()],
    [
      'GET',
      /^\/events$/,
      ({ res }) => {
        res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' })
        const unsubscribe = desk.subscribe((event) =>
          res.write(`data: ${JSON.stringify(event)}\n\n`),
        )
        res.on('close', unsubscribe)
        return res
      },
    ],
    [
      'GET',
      /^\/photos\/([^/]+)\/([^/]+)$/,
      async ({ params: [churchId, key], res }) => {
        const photo = await desk.photo(churchId, key)
        if (!photo) throw new Error('That photo is not in the database.')
        res.writeHead(200, { 'Content-Type': photo.contentType, 'Cache-Control': 'max-age=3600' })
        createReadStream(photo.file).pipe(res)
        return res
      },
    ],
    [
      'POST',
      /^\/cases\/([^/]+)\/review$/,
      ({ params: [churchId], body }) => {
        const instruction = (body as { instruction?: string }).instruction?.trim()
        desk.review(churchId, instruction || undefined)
        return { ok: true }
      },
    ],
    [
      'POST',
      /^\/review-all$/,
      () => {
        desk.reviewAll()
        return { ok: true }
      },
    ],
    [
      'POST',
      /^\/cases\/([^/]+)\/stop$/,
      ({ params: [churchId] }) => {
        desk.stop(churchId)
        return { ok: true }
      },
    ],
    [
      'POST',
      /^\/cases\/([^/]+)\/apply$/,
      ({ params: [churchId], body }) => {
        const parsed = resolutionSchema.safeParse(body)
        if (!parsed.success) throw new Error(issues(parsed.error))
        return desk.apply(churchId, parsed.data)
      },
    ],
    ['POST', /^\/history\/([^/]+)\/undo$/, ({ params: [id] }) => desk.undo(id)],
    [
      'POST',
      /^\/history\/([^/]+)\/shared$/,
      ({ params: [id], body }) =>
        desk.markShared(id, (body as { shared?: boolean }).shared === true),
    ],
  ]

  async function handle(req: IncomingMessage, res: ServerResponse) {
    const url = new URL(req.url ?? '/', 'http://localhost')
    for (const [method, pattern, handler] of routes) {
      const match = req.method === method ? pattern.exec(url.pathname) : undefined
      if (!match) continue
      // A page on another origin can post text to localhost but cannot send JSON without a
      // preflight this server never answers, so insisting on JSON keeps other sites from writing.
      if (method === 'POST' && !req.headers['content-type']?.startsWith('application/json')) {
        return send(res, 415, { error: 'Send JSON.' })
      }
      const body = method === 'POST' ? await readJson(req) : undefined
      const result = await handler({ params: match.slice(1).map(decodeURIComponent), body, res })
      if (result !== res) send(res, 200, result)
      return
    }
    send(res, 404, { error: `No route for ${req.method} ${url.pathname}` })
  }

  return {
    name: 'ember-desk-api',
    configureServer(server) {
      server.middlewares.use('/api', (req, res) => {
        handle(req, res).catch((error) => {
          if (res.headersSent) res.end()
          else send(res, 500, { error: message(error) })
        })
      })
    },
  }
}
