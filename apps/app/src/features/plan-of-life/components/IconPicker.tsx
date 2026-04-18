import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { XStack } from 'tamagui'

import { PracticeIcon } from '@/components'
import { practiceIconNames } from '@/components/ornaments/WatercolorIcon'

export function IconPicker({
  selected,
  onSelect,
}: {
  selected: string
  onSelect: (icon: string) => void
}) {
  const { t } = useTranslation()
  return (
    <XStack gap="$xs" flexWrap="wrap">
      {practiceIconNames.map((icon) => (
        <Pressable
          key={icon}
          onPress={() => onSelect(icon)}
          accessibilityRole="button"
          accessibilityLabel={t('a11y.selectIcon', { name: icon })}
          accessibilityState={{ selected: selected === icon }}
        >
          <XStack
            width={44}
            height={44}
            borderRadius="$md"
            borderWidth={2}
            borderColor={selected === icon ? '$accent' : 'transparent'}
            backgroundColor={selected === icon ? '$backgroundSurface' : 'transparent'}
            alignItems="center"
            justifyContent="center"
          >
            <PracticeIcon name={icon} size={22} />
          </XStack>
        </Pressable>
      ))}
    </XStack>
  )
}
