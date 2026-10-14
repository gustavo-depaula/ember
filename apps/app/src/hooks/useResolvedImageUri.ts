import { useEffect, useState } from 'react'
import { blobUri } from '@/content/store'

function corpusHash(uri: string): string {
  const path = uri.replace(/^corpus:\/\//, '')
  const dot = path.indexOf('.')
  return dot === -1 ? path : path.slice(0, dot)
}

export function useResolvedImageUri(uri: string): string {
  const [resolvedUri, setResolvedUri] = useState(uri)

  useEffect(() => {
    setResolvedUri(uri)
    if (!uri.startsWith('corpus://')) return

    let cancelled = false
    const hash = corpusHash(uri)
    blobUri(hash)
      .then((resolved) => {
        if (!cancelled) setResolvedUri(resolved)
      })
      .catch((err) => {
        console.warn(`[useResolvedImageUri] failed to resolve ${hash.slice(0, 8)}:`, err)
      })
    return () => {
      cancelled = true
    }
  }, [uri])

  return resolvedUri
}
