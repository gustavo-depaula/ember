import { Search, X } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { useTheme, XStack } from 'tamagui'

import { AnimatedPressable } from './AnimatedPressable'
import { SearchInput } from './SearchInput'

/** An in-page search field: the glass, the input, and a clear button once something is typed. */
export function SearchField({
  query,
  onQuery,
  placeholder,
  label,
  onFocus,
  onBlur,
}: {
  query: string
  onQuery: (query: string) => void
  placeholder: string
  label: string
  onFocus?: () => void
  onBlur?: () => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  return (
    <XStack
      flex={1}
      paddingHorizontal="$md"
      alignItems="center"
      gap="$sm"
      borderRadius="$lg"
      backgroundColor="$backgroundSurface"
    >
      <Search size={18} color={theme.colorSecondary?.val} />
      <SearchInput
        flex={1}
        value={query}
        onChangeText={onQuery}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor="$colorSecondary"
        backgroundColor="transparent"
        borderWidth={0}
        paddingHorizontal={0}
        height={48}
        color="$color"
        fontFamily="$body"
        fontSize="$3"
        accessibilityLabel={label}
      />
      {query.length > 0 && (
        <AnimatedPressable
          onPress={() => onQuery('')}
          hitSlop={14}
          accessibilityRole="button"
          accessibilityLabel={t('a11y.clearSearch')}
        >
          <X size={16} color={theme.colorSecondary?.val} />
        </AnimatedPressable>
      )}
    </XStack>
  )
}
