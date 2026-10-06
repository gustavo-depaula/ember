import { aveMaria } from './aveMaria'
import type { WebBible } from './types'

export type { Verse, WebBible } from './types'

// In-copyright translations, keyed by translation code: read from their
// publisher a chapter at a time and kept on the device only.
export const webBibles: Record<string, WebBible> = {
  AM: aveMaria,
}
