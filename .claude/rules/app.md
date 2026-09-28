---
paths:
  - "apps/app/**"
---

# Expo app

Design reference: `docs/design/design-system.md`. Justified text: `docs/design/typography-justification.md`.

## Idiom

- Reuse the pattern already on the screen before reaching for a generic default, and generalize every design correction the user makes to the whole app.
- Text is `<Typography variant="…">` from `@/components`, the variant chosen by what the text *is*; the ladder is at the top of `components/typography/Typography.tsx`. `$script` and italics are rare accents, never prayer bodies.
- Hierarchy comes from type, space and printer's ornament (rules, fleurons, a small inline ✠). Selection and tappable options are typographic; a border only delimits a genuine region. Icons sit flat — no glows or halos.
- Selection must read at a glance. A selector moves its indicator (e.g. a sliding underline) from local optimistic state on tap, not after the store round-trip.
- The cross is the Unicode ✠, small and inline. The SVG `Glyph kind="pattee"` belongs to the book-cover designs only — never a standalone decoration or empty-state emblem; an empty state lets type carry the card.
- Sheets use the native `@expo/ui` BottomSheet (`@expo/ui/community/bottom-sheet`).

## Accessibility

- Every `Pressable` / `AnimatedPressable` needs `accessibilityRole` and an `accessibilityLabel` from the `a11y` i18n namespace. Stateful controls also need `accessibilityState` paired with the matching `aria-*` prop — react-native-web drops `accessibilityState` from the DOM.
- Every `Stack.Screen` gets a `title`, even with `headerShown: false`; screen readers announce it.
- Hide ornaments, flourishes and dividers from screen readers (`accessibilityElementsHidden` + `importantForAccessibility="no-hide-descendants"`).
- Touch targets are at least 44pt (`minHeight` or `hitSlop`). Use `goldDeep`, not the gold accent, for small text on parchment.

## React Native traps

- Read `e.nativeEvent` values synchronously inside the handler and close over them — never inside a `setState(prev => …)` updater or a deferred callback. RN nullifies the event when the handler returns: a fatal crash in release that jsdom's `fireEvent` cannot reproduce.
- Render appearance that reflects state (fill, position, glyph visibility) as plain React style or children; give reanimated decoration only. `useAnimatedStyle` freezes its initial style at mount, and a NativeTabs reattach rebuilds the view from that snapshot.
- One keyboard owner per ScrollView: never combine `automaticallyAdjustKeyboardInsets` with a `KeyboardAvoidingView`.
- Large display glyphs (versals, drop caps, cover initials) need a `lineHeight` of about 1.4× `fontSize`; iOS crops the glyph when `lineHeight` ≤ `fontSize`.
- In expo-file-system's `File`/`Directory` API only `bytes()`, `text()` and `base64()` are async. `write()`, `delete()`, `create()`, `list()` and the `exists`/`size` getters are synchronous JSI calls — never loop over them unyielded, and download with `File.downloadFileAsync` so bytes never enter JS.
- Match user-typed text with `normalizeForSearch` / `matchWords` from `@/lib/search`, never `.toLowerCase().includes()`, which is accent-blind ("Rosario" never finds "Rosário").

## Testing and debugging

- A green Vitest run proves nothing about bundling: Vite honours `import`-only package exports and `src/test/setup.ts` stubs native modules; Metro does neither. After adding a dependency or calling a native-only API, run the app in the iOS simulator.
- A Vitest render dying with `Unexpected token 'typeof'` means a native package pulled in real `react-native` (Flow source). `vi.mock` that package in `apps/app/src/test/setup.ts`; the alias and `deps.inline` cannot reach that require.
- A TestFlight crash with SIGABRT on `expo.controller.errorRecoveryQueue` is an uncaught JS error rethrown by expo-updates. Apple's `.crash`/`.ips` strip the JS message, so reproduce with `npx expo run:ios` and read Metro's output.
