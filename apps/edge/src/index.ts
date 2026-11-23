// Serves the website and the Hearth corpus out of R2, answering the way GitHub
// Pages did so that installed apps and search engines notice no difference:
// `/x/` is `x/index.html`, `/x` redirects to `/x/` when that is a page, an
// unknown path gets the site's 404 page, and everything allows any origin.

type Env = { BUCKET: R2Bucket }

// A blob is named by the hash of its bytes, so a copy of it never goes stale.
const blobPath = /^hearth\/v2\/blobs\//
const forever = 'public, max-age=31536000, immutable'
// Short, because the point of this host is that a deploy shows up quickly.
const briefly = 'public, max-age=60'

function headersFor(object: R2Object, key: string) {
  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('etag', object.httpEtag)
  headers.set('access-control-allow-origin', '*')
  headers.set('accept-ranges', 'bytes')
  headers.set('cache-control', blobPath.test(key) ? forever : briefly)
  return headers
}

function respond(object: R2Object | R2ObjectBody, key: string, request: Request, status = 200) {
  const headers = headersFor(object, key)
  if (!('body' in object)) {
    // HEAD has no body by nature; a GET without one failed its precondition.
    if (request.method === 'HEAD') {
      headers.set('content-length', String(object.size))
      return new Response(null, { status, headers })
    }
    return new Response(null, { status: 304, headers })
  }
  const range = object.range as { offset: number; length: number } | undefined
  if (status === 200 && range && request.headers.has('range')) {
    const end = range.offset + range.length - 1
    headers.set('content-range', `bytes ${range.offset}-${end}/${object.size}`)
    return new Response(object.body, { status: 206, headers })
  }
  return new Response(object.body, { status, headers })
}

async function read(env: Env, key: string, request: Request) {
  if (request.method === 'HEAD') return env.BUCKET.head(key)
  return env.BUCKET.get(key, { onlyIf: request.headers, range: request.headers })
}

async function serve(request: Request, env: Env) {
  const url = new URL(request.url)
  const path = decodeURIComponent(url.pathname).replace(/^\/+/, '')
  const key = path === '' || path.endsWith('/') ? `${path}index.html` : path
  // The deploy's own bookkeeping shares the bucket and is not part of the site.
  const isPublic = !path.startsWith('_build/')

  const found = isPublic ? await read(env, key, request) : undefined
  if (found) return respond(found, key, request)

  if (
    isPublic &&
    path !== '' &&
    !path.endsWith('/') &&
    (await env.BUCKET.head(`${path}/index.html`))
  ) {
    url.pathname = `${url.pathname}/`
    return new Response(null, {
      status: 301,
      headers: {
        location: url.toString(),
        'access-control-allow-origin': '*',
        'cache-control': briefly,
      },
    })
  }

  const missing = await env.BUCKET.get('404.html')
  if (!missing) return new Response('Not found', { status: 404 })
  return respond(missing, '404.html', request, 404)
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'access-control-allow-origin': '*',
          'access-control-allow-methods': 'GET, HEAD, OPTIONS',
          'access-control-allow-headers': '*',
        },
      })
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', { status: 405, headers: { allow: 'GET, HEAD' } })
    }

    // Partial reads go straight to R2; whole files are kept at the edge.
    const cacheable = request.method === 'GET' && !request.headers.has('range')
    const cache = caches.default
    const cacheKey = new Request(new URL(request.url).toString(), { method: 'GET' })
    if (cacheable) {
      const hit = await cache.match(request.headers.has('if-none-match') ? request : cacheKey)
      if (hit) return hit
    }

    const response = await serve(request, env)
    if (cacheable && response.status === 200) ctx.waitUntil(cache.put(cacheKey, response.clone()))
    return response
  },
} satisfies ExportedHandler<Env>
