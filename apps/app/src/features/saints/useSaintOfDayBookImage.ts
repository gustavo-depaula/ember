import { useQuery } from '@tanstack/react-query'
import type { ImageSource } from 'expo-image'

import { getEntry, getRememberedManifest } from '@/content/contentIndex'
import type { BookEntry } from '@/content/manifestTypes'
import { blobUri, getJson } from '@/content/store'
import { useCatalogVersion } from '@/content/useCatalogVersion'

/**
 * Resolves the per-day saint portrait from Pictorial Lives of the Saints to an
 * expo-image source. The book ships one webp per chapter id (`apr-01-hugh.webp`),
 * so the chapter id from {@link saintOfDay} maps 1:1 to a manifest image. Returns
 * undefined while the catalog warms or for chapters whose image hasn't been
 * published yet.
 */
export function useSaintOfDayBookImage(chapter: string | undefined): ImageSource | undefined {
  const catalogVersion = useCatalogVersion()
  const { data } = useQuery({
    queryKey: ['saint-of-day-book-image', catalogVersion, chapter],
    enabled: !!chapter,
    queryFn: async () => {
      const entry = getEntry('book/pictorial-lives-of-saints')
      if (!entry) return undefined
      const manifest =
        getRememberedManifest<BookEntry>(entry.hash) ?? (await getJson<BookEntry>(entry.hash))
      const rel = `${chapter}.webp`
      const image = manifest.images?.find((i) => i.rel === rel)
      if (!image) return undefined
      const uri = await blobUri(image.hash, image.mime)
      return { uri } satisfies ImageSource
    },
  })
  return data ?? undefined
}
