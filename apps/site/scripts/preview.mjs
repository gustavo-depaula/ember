// Serves the built site the way it is published: `dist/` at the root with the
// corpus (`_site/hearth/v2`) beside it. `astro preview` cannot do this, since
// the corpus is not part of the site build.
import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const siteRoot = resolve(fileURLToPath(import.meta.url), '../..')
const dist = resolve(siteRoot, 'dist')
const corpus = process.env.EMBER_CORPUS_DIR ?? resolve(siteRoot, '../../_site/hearth/v2')
const port = Number(process.env.PORT ?? 4321)

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
}

function fileFor(pathname) {
  const hearth = '/hearth/v2/'
  const [root, rel] = pathname.startsWith(hearth)
    ? [corpus, pathname.slice(hearth.length)]
    : [dist, pathname]
  const path = join(root, normalize(decodeURIComponent(rel)))
  if (!path.startsWith(root)) return undefined
  if (existsSync(path) && statSync(path).isFile()) return path
  const index = join(path, 'index.html')
  return existsSync(index) ? index : undefined
}

// Until the API's CORS change is deployed, a local build can reach it through here:
//   PUBLIC_MASS_TIMES_URL=/mass-times-api pnpm build
const massTimesApi = 'https://ember-mass-times.dpgu.workers.dev'

createServer(async (req, res) => {
  const { pathname, search } = new URL(req.url ?? '/', 'http://localhost')
  if (pathname.startsWith('/mass-times-api/')) {
    const upstream = await fetch(`${massTimesApi}${pathname.slice('/mass-times-api'.length)}${search}`)
    res.writeHead(upstream.status, { 'content-type': 'application/json' })
    res.end(await upstream.text())
    return
  }
  const file = fileFor(pathname) ?? resolve(dist, '404.html')
  if (!existsSync(file)) {
    res.writeHead(404).end('Not found')
    return
  }
  res.writeHead(fileFor(pathname) ? 200 : 404, {
    'content-type': types[extname(file)] ?? 'application/octet-stream',
  })
  createReadStream(file).pipe(res)
}).listen(port, () => console.log(`Ember site on http://localhost:${port}`))
