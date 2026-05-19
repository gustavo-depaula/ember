import { Input, type InputProps } from 'tamagui'

/**
 * Search-bar input with the autocorrect/autocapitalize/spellcheck defaults
 * turned off — prevents the keyboard from mangling a half-typed query when
 * the user taps a result row and the input blurs.
 */
export function SearchInput(props: InputProps) {
  return (
    <Input
      autoCorrect={false}
      autoCapitalize="none"
      spellCheck={false}
      autoComplete="off"
      returnKeyType="search"
      {...props}
    />
  )
}
