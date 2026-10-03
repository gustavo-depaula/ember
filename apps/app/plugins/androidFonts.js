// Android font families for the `expo-font` config plugin.
//
// A font loaded at runtime (`useFonts`) is known to Android under one style
// only. Ask that family for italic or a heavier weight and React Native finds
// no typeface and falls back to Roboto — a sans caption in the middle of a
// prayer. Tamagui hides this where a font's `face` table names a file for the
// weight and style, but not for a `<Text>` with no weight, a weight without an
// italic file, or the reader's chosen prayer font.
//
// Registered as XML font families instead, each name resolves natively: Android
// picks the closest file in the family and synthesizes what is missing. Every
// name the app passes as `fontFamily` is a family here — the bases carry their
// real italics and weights, the single faces just themselves. iOS resolves
// faces by PostScript name and needs none of this.

// Resolved through Node, so the path holds whichever way the package manager
// lays out node_modules.
const google = (pkg, face, file) =>
  require.resolve(`@expo-google-fonts/${pkg}/${face}/${file}.ttf`)

const single = (fontFamily, path) => ({ fontFamily, fontDefinitions: [{ path, weight: 400 }] })

const garamond = (face) => google('eb-garamond', face, `EBGaramond_${face}`)
const garamondFaces = [
  ['400Regular', 400],
  ['500Medium', 500],
  ['600SemiBold', 600],
  ['700Bold', 700],
]

const cinzelFaces = [
  ['400Regular', 400],
  ['600SemiBold', 600],
  ['700Bold', 700],
]

// expo-font key → file in assets/fonts, with the weight it carries.
const junicodeFaces = [
  ['Junicode_Light', 'Junicode-Light', 300],
  ['Junicode', 'Junicode', 400],
  ['Junicode_Medium', 'Junicode-Medium', 500],
  ['Junicode_SemiBold', 'Junicode-SemiBold', 600],
  ['Junicode_Bold', 'Junicode-Bold', 700],
]
const junicode = (file) => `./assets/fonts/${file}.ttf`
const junicodeItalic = (file) => junicode(file === 'Junicode' ? 'Junicode-Italic' : `${file}Italic`)

const readingFonts = [
  ['crimson-pro', 'CrimsonPro'],
  ['lora', 'Lora'],
  ['cormorant-garamond', 'CormorantGaramond'],
  ['libre-baskerville', 'LibreBaskerville'],
  ['source-serif-4', 'SourceSerif4'],
  ['merriweather', 'Merriweather'],
  ['pinyon-script', 'PinyonScript'],
]

const androidFonts = [
  {
    fontFamily: 'EBGaramond_400Regular',
    fontDefinitions: garamondFaces.flatMap(([face, weight]) => [
      { path: garamond(face), weight },
      { path: garamond(`${face}_Italic`), weight, style: 'italic' },
    ]),
  },
  ...garamondFaces.slice(1).map(([face]) => single(`EBGaramond_${face}`, garamond(face))),
  single('EBGaramond_400Regular_Italic', garamond('400Regular_Italic')),
  single('EBGaramond_700Bold_Italic', garamond('700Bold_Italic')),

  {
    fontFamily: 'Junicode',
    fontDefinitions: junicodeFaces.flatMap(([, file, weight]) => [
      { path: junicode(file), weight },
      { path: junicodeItalic(file), weight, style: 'italic' },
    ]),
  },
  ...junicodeFaces.flatMap(([key, file]) => [
    ...(key === 'Junicode' ? [] : [single(key, junicode(file))]),
    single(key === 'Junicode' ? 'Junicode_Italic' : `${key}Italic`, junicodeItalic(file)),
  ]),

  {
    fontFamily: 'Cinzel_400Regular',
    fontDefinitions: cinzelFaces.map(([face, weight]) => ({
      path: google('cinzel', face, `Cinzel_${face}`),
      weight,
    })),
  },
  ...cinzelFaces
    .slice(1)
    .map(([face]) => single(`Cinzel_${face}`, google('cinzel', face, `Cinzel_${face}`))),

  ...readingFonts.map(([pkg, name]) =>
    single(`${name}_400Regular`, google(pkg, '400Regular', `${name}_400Regular`)),
  ),
  single('UnifrakturMaguntia', './assets/fonts/UnifrakturMaguntia-Book.ttf'),
]

module.exports = { androidFonts }
