import { READER_PALETTE_IDS, type ReaderPaletteId } from '@/config/readerPalettes'
import { bookPaletteCursorId, getCursor, setCursor } from '@/db/repositories/cursors'

type StoredOverride = { palette: ReaderPaletteId }

export function getBookPaletteOverride(bookId: string): ReaderPaletteId | undefined {
  const c = getCursor(bookPaletteCursorId(bookId))
  if (!c) return undefined
  try {
    const v = JSON.parse(c.position) as StoredOverride
    if (READER_PALETTE_IDS.includes(v.palette)) return v.palette
  } catch (err) {
    console.warn(`[bookPaletteOverride] parse failed for ${bookId}:`, err)
  }
  return undefined
}

export async function setBookPaletteOverride(
  bookId: string,
  palette: ReaderPaletteId,
): Promise<void> {
  await setCursor(bookPaletteCursorId(bookId), JSON.stringify({ palette }))
}

/** Soft-delete: write an empty payload so listing/parsing skips it. */
export async function clearBookPaletteOverride(bookId: string): Promise<void> {
  await setCursor(bookPaletteCursorId(bookId), '{}')
}
