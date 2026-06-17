import { List, MapIcon } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { useTheme, XStack } from 'tamagui'

export type ViewMode = 'list' | 'map'

const items: Array<{ mode: ViewMode; Icon: typeof List }> = [
  { mode: 'list', Icon: List },
  { mode: 'map', Icon: MapIcon },
]

// Compact segmented control for the Mass Times header: switch the nearby churches between the list
// and the map in place (no navigation), the native maps-app pattern.
export function ViewToggle({
  value,
  onChange,
}: {
  value: ViewMode
  onChange: (mode: ViewMode) => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <XStack borderRadius="$lg" borderWidth={1} borderColor="$borderColor" overflow="hidden">
      {items.map(({ mode, Icon }) => {
        const active = value === mode
        return (
          <Pressable
            key={mode}
            onPress={() => onChange(mode)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={t(`massTimes.${mode}`)}
          >
            <XStack
              paddingVertical="$xs"
              paddingHorizontal="$md"
              backgroundColor={active ? '$accent' : 'transparent'}
              alignItems="center"
            >
              <Icon size={16} color={active ? theme.background?.val : theme.colorSecondary?.val} />
            </XStack>
          </Pressable>
        )
      })}
    </XStack>
  )
}
