import { Platform } from 'react-native'

/**
 * Keeps `log` — a whole event log, as `exportLog` writes it — as a file outside
 * the database, so replacing what the database holds is never the end of it.
 * On a phone it goes to the app's documents under `backups/`; a browser
 * downloads it.
 */
export async function saveBackup(log: string): Promise<void> {
  const name = `ember-${new Date().toISOString().slice(0, 19).replaceAll(':', '-')}.json`
  if (Platform.OS === 'web') {
    const url = URL.createObjectURL(new Blob([log], { type: 'application/json' }))
    const link = Object.assign(document.createElement('a'), { href: url, download: name })
    link.click()
    URL.revokeObjectURL(url)
    return
  }
  const fs = require('expo-file-system') as typeof import('expo-file-system')
  new fs.Directory(fs.Paths.document, 'backups/').create({ intermediates: true, idempotent: true })
  new fs.File(fs.Paths.document, `backups/${name}`).write(log)
}
