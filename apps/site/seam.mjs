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

// What runs in a reader's browser: a browser that is one of an account's
// devices keeps the app's database in SQLite compiled to WebAssembly.
const browserAppModules = {
  'db/client': 'browser/dbClient.ts',
  'lib/backupFile': 'browser/backupFile.ts',
  'content/store': 'browser/store.ts',
  'lib/hearth': 'browser/hearth.ts',
  'stores/preferencesStore': 'browser/preferencesStore.ts',
  'lib/i18n/detectLanguage': 'browser/detectLanguage.ts',
}

const browserPackages = {
  'expo-crypto': 'browser/expoCrypto.ts',
  expo: 'browser/expo.ts',
  'expo-application': 'browser/expo.ts',
  'expo-device': 'browser/expo.ts',
}

const byPath = (modules) =>
  new Map(
    Object.entries(modules).map(([mod, file]) => [resolve(appSrc, mod), resolve(platform, file)]),
  )
const byAbsolutePath = byPath(replacedAppModules)
// Later entries win: a browser stand-in replaces the build's.
const inBrowserByAbsolutePath = new Map([...byAbsolutePath, ...byPath(browserAppModules)])

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
    resolveId(source, importer, options) {
      const browser = !options?.ssr
      const pkg = replacedPackages[source] ?? (browser ? browserPackages[source] : undefined)
      if (pkg) return resolve(platform, pkg)

      // `~/` is the site's own source root (tsconfig `paths` covers the type side).
      if (source.startsWith('~/')) return resolveAppPath(resolve(siteRoot, 'src', source.slice(2)))

      const base = source.startsWith('@/')
        ? resolve(appSrc, source.slice(2))
        : source.startsWith('.') && importer?.startsWith(appSrc)
          ? resolve(dirname(importer.replace(/\?.*$/, '')), source)
          : undefined
      if (!base) return undefined

      const replacements = browser ? inBrowserByAbsolutePath : byAbsolutePath
      const replaced =
        replacements.get(stripExtension(base)) ?? replacements.get(`${stripExtension(base)}/index`)
      if (replaced) return replaced
      // Only the `@/` alias needs resolving here; relative imports resolve natively.
      return source.startsWith('@/') ? resolveAppPath(base) : undefined
    },
  }
}

/** rrule's package entry is CommonJS, which gives Node's ESM loader no named exports; its ESM build is bundled instead. */
export const rruleEsm = resolve(repoRoot, 'node_modules/rrule/dist/esm/index.js')

/**
 * `astro dev` serves only the site. In production the corpus is published
 * beside it at /hearth/v2, so the dev server serves the local build of it there.
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
    },
  }
}
