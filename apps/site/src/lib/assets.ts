import { blobUrl } from '~/platform/store'

/**
 * The app addresses corpus images as `corpus://<hash>.<ext>` and resolves them
 * to a cached file; on the web the same hash is a Hearth blob URL.
 */
export function assetUrl(src: string): string {
  const match = /^corpus:\/\/([0-9a-f]{64})/.exec(src)
  return match ? blobUrl(match[1]) : src
}
