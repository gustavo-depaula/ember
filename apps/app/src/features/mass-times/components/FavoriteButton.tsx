import { Heart } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { useTheme } from 'tamagui'
import type { FavoriteChurch } from '../favorites'
import { useFavoritesStore, useIsFavorite } from '../favorites'

// Heart toggle to save / unsave a church. Takes the light snapshot the Saved list needs.
export function FavoriteButton({ church, size = 22 }: { church: FavoriteChurch; size?: number }) {
  const { t } = useTranslation()
  const theme = useTheme()
  const saved = useIsFavorite(church.id)
  const toggle = useFavoritesStore((s) => s.toggle)

  return (
    <Pressable
      onPress={() => toggle(church)}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityState={{ selected: saved }}
      accessibilityLabel={t(saved ? 'massTimes.saved' : 'massTimes.save')}
    >
      <Heart
        size={size}
        color={theme.colorBurgundy?.val}
        fill={saved ? theme.colorBurgundy?.val : 'transparent'}
      />
    </Pressable>
  )
}
