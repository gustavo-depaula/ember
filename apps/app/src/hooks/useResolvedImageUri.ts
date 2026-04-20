import { useEffect, useState } from 'react'
import { Platform } from 'react-native'
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

export function useResolvedImageUri(uri: string): string {
  const [resolvedUri, setResolvedUri] = useState(uri)

  useEffect(() => {
    setResolvedUri(uri)

    if (Platform.OS !== 'web' || !uri.startsWith('idb://')) {
      return
    }

    let cancelled = false
    let objectUrl: string | undefined

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

    return () => {
      cancelled = true
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [uri])

  return resolvedUri
}
