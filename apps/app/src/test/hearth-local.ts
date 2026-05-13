/**
 * Fetch interceptor that serves Hearth requests from the local built corpus
 * (`_site/hearth/v2/` at the repo root, produced by `pnpm build:corpus`).
 * Pass-through for anything else.
 *
 * Hermetic, fast, no network. Same content the live site serves.
 */

import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

// __dirname here is apps/app/src/test → ../../../.. is the repo root.
const REPO_ROOT = resolve(__dirname, '../../../..')
const CORPUS_ROOT = resolve(REPO_ROOT, '_site/hearth/v2')

const HEARTH_HOSTS = [
  'https://ember.dpgu.me/hearth/v2',
  'http://localhost:4100',
  'http://127.0.0.1:4100',
]

function corpusPathFor(url: string): string | undefined {
  for (const host of HEARTH_HOSTS) {
    if (url.startsWith(`${host}/`)) {
      return resolve(CORPUS_ROOT, url.slice(host.length + 1))
    }
    if (url.startsWith(host)) {
      return resolve(CORPUS_ROOT, url.slice(host.length).replace(/^\/+/, ''))
    }
  }
  return undefined
}

const originalFetch = globalThis.fetch.bind(globalThis)

export const hearthFetch: typeof fetch = async (input, init) => {
  const url =
    typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
  const corpusPath = corpusPathFor(url)
  if (!corpusPath) return originalFetch(input as RequestInfo, init)

  try {
    const bytes = await readFile(corpusPath)
    const body = new Uint8Array(bytes)
    return new Response(body, {
      status: 200,
      headers: {
        'content-type': url.endsWith('.json') ? 'application/json' : 'application/octet-stream',
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return new Response(`not found: ${corpusPath} (${message})`, { status: 404 })
  }
}

export function installHearthFetch(): void {
  globalThis.fetch = hearthFetch as typeof fetch
}

export { CORPUS_ROOT }
