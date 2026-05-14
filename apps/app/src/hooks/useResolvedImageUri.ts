import { useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { blobUri } from '@/content/store'
import { idbReadBinary } from '@/lib/idb-fs'

function mimeForPath(path: string): string {
  const lowerPath = path.toLowerCase()
  if (lowerPath.endsWith('.png')) return 'image/png'
  if (lowerPath.endsWith('.gif')) return 'image/gif'
  if (lowerPath.endsWith('.svg')) return 'image/svg+xml'
  if (lowerPath.endsWith('.webp')) return 'image/webp'
  return 'image/jpeg'
}

function idbPathFromUri(uri: string): string {
  return uri.replace(/^idb:\/\//, '')
}

function parseCorpusUri(uri: string): { hash: string; mime: string } {
  const path = uri.replace(/^corpus:\/\//, '')
  const dot = path.indexOf('.')
  const hash = dot === -1 ? path : path.slice(0, dot)
  return { hash, mime: mimeForPath(path) }
}

export function useResolvedImageUri(uri: string): string {
  const [resolvedUri, setResolvedUri] = useState(uri)

  useEffect(() => {
    setResolvedUri(uri)

    let cancelled = false
    let objectUrl: string | undefined
    const cleanup = () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }

    if (uri.startsWith('corpus://')) {
      const { hash, mime } = parseCorpusUri(uri)
      blobUri(hash, mime)
        .then((resolved) => {
          if (cancelled) {
            if (Platform.OS === 'web' && resolved.startsWith('blob:')) {
              URL.revokeObjectURL(resolved)
            }
            return
          }
          if (Platform.OS === 'web' && resolved.startsWith('blob:')) {
            objectUrl = resolved
          }
          setResolvedUri(resolved)
        })
        .catch((err) => {
          console.warn(`[useResolvedImageUri] failed to resolve ${hash.slice(0, 8)}:`, err)
        })
      return cleanup
    }

    if (Platform.OS !== 'web' || !uri.startsWith('idb://')) {
      return
    }

    const resolve = async () => {
      const bytes = await idbReadBinary(idbPathFromUri(uri))
      if (!bytes || cancelled) return

      const blob = new Blob([bytes.slice()], { type: mimeForPath(uri) })
      objectUrl = URL.createObjectURL(blob)

      if (!cancelled) {
        setResolvedUri(objectUrl)
      }
    }

    resolve()

    return cleanup
  }, [uri])

  return resolvedUri
}
