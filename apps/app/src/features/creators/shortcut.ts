import { Mic2 } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import type { ShortcutTileData } from '@/features/search'

import { creatorsHref } from './routes'

/** The Creators directory as a Search shortcut tile. */
export function useCreatorsShortcut(): ShortcutTileData {
  const { t } = useTranslation()
  return { key: 'creators', title: t('creators.title'), icon: Mic2, href: creatorsHref }
}
