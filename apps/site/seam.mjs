// The site is another platform target of the app's content layer: it imports
// the app's own resolver, flow preprocessor, Mass/Office sources and book
// pipeline from apps/app/src, and swaps only the modules that touch the device
// (file system, SQLite, Expo, React Native) for Node equivalents in
// src/platform/. A new device-bound import in shared app code fails the site
// build loudly rather than rendering wrong.
import { createReadStream, existsSync, statSync } from 'node:fs'
import { dirname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const siteRoot = dirname(fileURLToPath(import.meta.url))
export const repoRoot = resolve(siteRoot, '../..')
const appSrc = resolve(repoRoot, 'apps/app/src')
const platform = resolve(siteRoot, 'src/platform')

// app module (relative to apps/app/src, no extension) → replacement in src/platform
const replacedAppModules = {
  'content/store': 'store.ts',
  'content/manifestSnapshot': 'manifestSnapshot.ts',
  'lib/hearth': 'hearth.ts',
  'lib/i18n/detectLanguage': 'detectLanguage.ts',
  'lib/liturgical/index': 'liturgical.ts',
  'db/repositories/cache': 'cache.ts',
  'db/repositories/externalContent': 'externalContent.ts',
  'sources/registry': 'sourceRegistry.ts',
  'stores/preferencesStore': 'preferencesStore.ts',
}

const replacedPackages = {
  'react-native': 'reactNative.ts',
  'react-i18next': 'reactI18next.ts',
}

const byAbsolutePath = new Map(
  Object.entries(replacedAppModules).map(([mod, file]) => [
    resolve(appSrc, mod),
    resolve(platform, file),
  ]),
)

function stripExtension(path) {
  return path.replace(/\?.*$/, '').replace(/\.(ts|tsx|js|mjs)$/, '')
}

function resolveAppPath(base) {
  for (const candidate of [
    `${base}.ts`,
    `${base}.tsx`,
    `${base}/index.ts`,
    `${base}/index.tsx`,
    base,
  ]) {
    if (existsSync(candidate) && !candidate.endsWith('/')) return candidate
  }
  return undefined
}

export function platformSeam() {
  return {
    name: 'ember-platform-seam',
    enforce: 'pre',
    resolveId(source, importer) {
      const pkg = replacedPackages[source]
      if (pkg) return resolve(platform, pkg)

      // `~/` is the site's own source root (tsconfig `paths` covers the type side).
      if (source.startsWith('~/')) return resolveAppPath(resolve(siteRoot, 'src', source.slice(2)))

      const base = source.startsWith('@/')
        ? resolve(appSrc, source.slice(2))
        : source.startsWith('.') && importer?.startsWith(appSrc)
          ? resolve(dirname(importer.replace(/\?.*$/, '')), source)
          : undefined
      if (!base) return undefined

      const replaced =
        byAbsolutePath.get(stripExtension(base)) ?? byAbsolutePath.get(`${stripExtension(base)}/index`)
      if (replaced) return replaced
      // Only the `@/` alias needs resolving here; relative imports resolve natively.
      return source.startsWith('@/') ? resolveAppPath(base) : undefined
    },
  }
}

/** rrule's package entry is CommonJS, which gives Node's ESM loader no named exports; its ESM build is bundled instead. */
export const rruleEsm = resolve(repoRoot, 'node_modules/rrule/dist/esm/index.js')

const massTimesApi = 'https://ember-mass-times.dpgu.workers.dev'

/**
 * `astro dev` serves only the site. In production the corpus is published
 * beside it at /hearth/v2, so the dev server serves the local build of it
 * there, and relays /mass-times-api to the live API (which a page on
 * localhost may not call directly until its CORS headers are deployed).
 */
export function devCorpus() {
  const corpus = process.env.EMBER_CORPUS_DIR ?? resolve(repoRoot, '_site/hearth/v2')
  return {
    name: 'ember-dev-corpus',
    configureServer(server) {
      server.middlewares.use('/hearth/v2', (req, res, next) => {
        const file = join(corpus, normalize(decodeURIComponent((req.url ?? '/').split('?')[0])))
        if (!file.startsWith(corpus) || !existsSync(file) || !statSync(file).isFile()) return next()
        createReadStream(file).pipe(res)
      })
      server.middlewares.use('/mass-times-api', async (req, res) => {
        const upstream = await fetch(`${massTimesApi}${req.url ?? '/'}`)
        res.writeHead(upstream.status, { 'content-type': 'application/json' })
        res.end(await upstream.text())
      })
    },
  }
}
