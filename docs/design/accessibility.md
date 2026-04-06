# Accessibility

## Target

WCAG 2.1 Level AA compliance across iOS, Android, and Web.

## Screen Reader Support

All interactive elements must be identifiable to VoiceOver (iOS), TalkBack (Android), and keyboard navigation (web).

### Required props on interactive elements

Every `Pressable`, `AnimatedPressable`, and custom interactive component must have:

- **`accessibilityRole`** — `"button"`, `"link"`, `"checkbox"`, `"radio"`, `"tab"`, etc.
- **`accessibilityLabel`** — human-readable label describing the action (use i18n keys from the `a11y` namespace)
- **`accessibilityState`** — for stateful elements: `{ checked }`, `{ selected }`, `{ expanded }`, `{ disabled }`
- **`accessibilityHint`** (optional) — additional context when the label alone isn't clear

### Component patterns

| Component | Role | State | Notes |
|-----------|------|-------|-------|
| `AnimatedCheckbox` | `checkbox` | `{ checked }` | Requires `accessibilityLabel` prop |
| `AnimatedPressable` | varies | varies | Passes all a11y props via `...props` spread |
| `ToolbarButton` | `button` | `{ selected, disabled }` | Requires `accessibilityLabel` prop |
| `CollapsiblePrayer` | `button` | `{ expanded }` | Label is the prayer title |
| `OptionsBlock` tabs | `tab` | `{ selected }` | One per option |
| `PillSelector` options | `radio` | `{ selected }` | One per pill |
| `DayCarousel` pills | `button` | — | Label is full date string |

### i18n

Accessibility labels live in the `a11y` namespace in both `en.ts` and `pt-BR.ts`. Keep labels concise and action-oriented.

## Screen Titles

Even with `headerShown: false`, every `Stack.Screen` in `_layout.tsx` must have a `title` option. React Navigation uses this for screen reader announcements during navigation.

## Decorative Elements

Ornamental SVGs, flourishes, dividers, and manuscript borders should be hidden from screen readers:

```tsx
<View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
  <OrnamentalRule />
</View>
```

## Color Contrast

- Primary text on background: minimum 4.5:1 ratio (WCAG AA)
- Large text (18pt+ or 14pt+ bold): minimum 3:1 ratio
- Current theme colors generally meet AA. Gold accent (`#C9A84C`) on light parchment is borderline — use `goldDeep` (`#A8872E`) for small text

## Font Scaling

The app respects OS-level Dynamic Type (iOS) and font scale (Android) by default. No in-app font size control for UI text — the reading config handles prayer/reading text independently.

### maxFontSizeMultiplier

Compact UI elements that could break at extreme font scales use `maxFontSizeMultiplier`:
- `DayCarousel` pill text: capped at 1.2x
- Body text, prayer text, and headings: uncapped (scale freely)

## Touch Targets

Minimum 44x44pt touch target (iOS HIG) / 48x48dp (Material). The app achieves this via:
- `minHeight={44}` or `minHeight={52}` on interactive rows
- `hitSlop` on compact pressables (8-20px padding)

## Verification Checklist

1. VoiceOver on iOS: swipe through every screen, verify all elements are announced
2. Keyboard on web: tab through all interactive elements
3. Large Dynamic Type on iOS: verify no clipping or layout overflow
4. Contrast: spot-check gold accent usage in both themes
