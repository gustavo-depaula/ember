// Two things the Android app theme gets wrong for this app.
//
// Accent: dialogs — the time and date pickers, their OK / Cancel — take their
// accent from `colorAccent`, which AppCompat leaves at teal. It becomes the
// app's gold (`accentHover` in src/config/themes.ts, the shade that holds its
// contrast as button text on a white dialog).
//
// Focus highlight: when a window opens Android hands focus to its first
// focusable view and paints a grey block over it. Selectable text is focusable,
// so the first paragraph in every bottom sheet (each is its own window) came up
// greyed out. Nothing in the app is navigated by focus.

const { AndroidConfig, withAndroidColors, withAndroidStyles } = require('expo/config-plugins')

const colorName = 'colorAccent'

function withAndroidTheme(config, { accent = '#A8872E' } = {}) {
  config = withAndroidColors(config, (c) => {
    c.modResults = AndroidConfig.Colors.assignColorValue(c.modResults, {
      name: colorName,
      value: accent,
    })
    return c
  })
  return withAndroidStyles(config, (c) => {
    const parent = AndroidConfig.Styles.getAppThemeGroup()
    for (const [name, value] of [
      [colorName, `@color/${colorName}`],
      ['android:defaultFocusHighlightEnabled', 'false'],
    ]) {
      c.modResults = AndroidConfig.Styles.assignStylesValue(c.modResults, {
        add: true,
        parent,
        name,
        value,
      })
    }
    return c
  })
}

module.exports = withAndroidTheme
