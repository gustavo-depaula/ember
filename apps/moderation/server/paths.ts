import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const backendDir = path.resolve(appRoot, '../backend')
export const dataDir = path.join(appRoot, '.data')

// Church ids and attachment keys come from the database and, for keys, from whoever sent the
// correction. As a file name each must stay one path segment.
export function safeName(id: string): string {
  return encodeURIComponent(id).replace(/\./g, '%2E')
}
