import { useBibleStore } from '@/stores/bibleStore'
import { usePreferencesStore } from '@/stores/preferencesStore'

import { carryPlace } from './versification'

/**
 * Changes the edition the reader shows, keeping the reader on the same text:
 * the Septuagint's Jeremiah 32 is the Vulgate's Jeremiah 25. The place is
 * carried before the edition changes, so the page never shows the wrong
 * chapter in between.
 */
export async function switchTranslation(code: string) {
  const from = usePreferencesStore.getState().translation
  const { bookId, chapter, setPosition } = useBibleStore.getState()
  const place = await carryPlace(from, code, bookId, chapter)
  if (place.bookId !== bookId || place.chapter !== chapter) setPosition(place.bookId, place.chapter)
  usePreferencesStore.getState().setTranslation(code)
}
