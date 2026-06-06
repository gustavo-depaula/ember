// In-memory pass-through for the post-session toast shown on the
// frontispiece. The reader records on unmount; the frontispiece consumes
// (read-and-clear) on mount. Sessions older than 10s are discarded to avoid
// stale toasts after deep navigation.

export type ReadingSession = {
  bookId: string
  minutes: number
  pages: number
  chaptersFinished: number
}

let pending: (ReadingSession & { at: number }) | undefined

export function recordReadingSession(session: ReadingSession): void {
  pending = { ...session, at: Date.now() }
}

export function consumeReadingSession(bookId: string): ReadingSession | undefined {
  if (!pending) return undefined
  if (pending.bookId !== bookId) return undefined
  if (Date.now() - pending.at > 10_000) {
    pending = undefined
    return undefined
  }
  const { at: _at, ...session } = pending
  pending = undefined
  return session
}
