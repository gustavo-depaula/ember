import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { corpusRoot, hearthBase } from './paths'

export async function initHearth(): Promise<void> {}

export function isLocalHearth(): boolean {
  return true
}

export function hearthUrl(path: string): string {
  return `${hearthBase}/${path.replace(/^\//, '')}`
}

export function hearthAssetUrl(path: string): string {
  return hearthUrl(path)
}

const cache = new Map<string, Promise<unknown>>()

export function fetchHearth<T>(path: string): Promise<T> {
  let pending = cache.get(path)
  if (!pending) {
    pending = readFile(resolve(corpusRoot, path), 'utf-8').then((text) => JSON.parse(text))
    cache.set(path, pending)
  }
  return pending as Promise<T>
}
