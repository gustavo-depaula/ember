// `@/lib/backupFile` in the browser: a backup is downloaded as a `.pray` file.
import { strToU8, zipSync } from 'fflate'

export async function saveBackup(log: string): Promise<void> {
  const file = zipSync({ 'ember.json': strToU8(log) })
  const url = URL.createObjectURL(
    new Blob([file as BlobPart], { type: 'application/octet-stream' }),
  )
  const name = `ember-${new Date().toISOString().slice(0, 19).replaceAll(':', '-')}.pray`
  Object.assign(document.createElement('a'), { href: url, download: name }).click()
  URL.revokeObjectURL(url)
}
