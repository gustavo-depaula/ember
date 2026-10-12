// SQLite refuses a write while something else holds the database ("database is
// locked"). That clears within moments, so a write is tried again before it fails.
const retryDelaysMs = [150, 500]

export async function withRetry<T>(write: () => Promise<T>): Promise<T> {
  for (const delay of retryDelaysMs) {
    try {
      return await write()
    } catch {
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
  return write()
}
