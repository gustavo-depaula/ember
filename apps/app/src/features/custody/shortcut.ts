import { ShieldCheck } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import type { ShortcutTileData } from '@/features/search'

import { custodyHref } from './routes'

/** Custody as a Search shortcut tile. */
export function useCustodyShortcut(): ShortcutTileData {
  const { t } = useTranslation()
  return { key: 'custody', title: t('you.custody'), icon: ShieldCheck, href: custodyHref }
}
