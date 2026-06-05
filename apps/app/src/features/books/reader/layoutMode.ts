import { Platform } from 'react-native'
import type { ReaderLayout } from './protocol'

/**
 * Resolve the user's `bookLayout` preference to a concrete layout to render.
 * `undefined` means "device default" — paginated on mobile, scroll on web.
 */
export function resolveLayout(pref: ReaderLayout | undefined): ReaderLayout {
  if (pref) return pref
  return Platform.OS === 'web' ? 'scroll' : 'paginated'
}
