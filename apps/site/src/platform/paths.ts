import { resolve } from 'node:path'

// Astro runs builds and the dev server from apps/site.
export const repoRoot = resolve(process.cwd(), '../..')

/** The built corpus (`pnpm build:corpus`), the same tree Hearth serves to the app. */
export const corpusRoot = process.env.EMBER_CORPUS_DIR ?? resolve(repoRoot, '_site/hearth/v2')

/** Where the browser finds that tree: the site is published beside it. */
export const hearthBase = (process.env.EMBER_HEARTH_BASE ?? '/hearth/v2').replace(/\/$/, '')
