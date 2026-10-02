import { Cinzel_400Regular } from '@expo-google-fonts/cinzel/400Regular'
import { Cinzel_600SemiBold } from '@expo-google-fonts/cinzel/600SemiBold'
import { Cinzel_700Bold } from '@expo-google-fonts/cinzel/700Bold'
import { CormorantGaramond_400Regular } from '@expo-google-fonts/cormorant-garamond/400Regular'
import { CrimsonPro_400Regular } from '@expo-google-fonts/crimson-pro/400Regular'
import { EBGaramond_400Regular } from '@expo-google-fonts/eb-garamond/400Regular'
import { EBGaramond_400Regular_Italic } from '@expo-google-fonts/eb-garamond/400Regular_Italic'
import { EBGaramond_500Medium } from '@expo-google-fonts/eb-garamond/500Medium'
import { EBGaramond_600SemiBold } from '@expo-google-fonts/eb-garamond/600SemiBold'
import { EBGaramond_700Bold } from '@expo-google-fonts/eb-garamond/700Bold'
import { EBGaramond_700Bold_Italic } from '@expo-google-fonts/eb-garamond/700Bold_Italic'
import { LibreBaskerville_400Regular } from '@expo-google-fonts/libre-baskerville/400Regular'
import { Lora_400Regular } from '@expo-google-fonts/lora/400Regular'
import { Merriweather_400Regular } from '@expo-google-fonts/merriweather/400Regular'
import { PinyonScript_400Regular } from '@expo-google-fonts/pinyon-script/400Regular'
import { SourceSerif4_400Regular } from '@expo-google-fonts/source-serif-4/400Regular'

// Each face is imported from its own subpath: a package's root requires every
// weight it publishes, and Metro then ships all of them — some 35 MB of fonts
// nothing uses.
//
// Android loads none of these at runtime: `plugins/androidFonts.js` registers
// the same names as native font families (see `appFonts.android.ts`).

/** The fonts `useFonts` loads at launch, keyed by the name the app uses as `fontFamily`. */
export const appFonts = {
  Cinzel_400Regular,
  Cinzel_600SemiBold,
  Cinzel_700Bold,
  EBGaramond_400Regular,
  EBGaramond_400Regular_Italic,
  EBGaramond_500Medium,
  EBGaramond_600SemiBold,
  EBGaramond_700Bold,
  EBGaramond_700Bold_Italic,
  PinyonScript_400Regular,
  CrimsonPro_400Regular,
  Lora_400Regular,
  CormorantGaramond_400Regular,
  LibreBaskerville_400Regular,
  SourceSerif4_400Regular,
  Merriweather_400Regular,
  UnifrakturMaguntia: require('../../assets/fonts/UnifrakturMaguntia-Book.ttf'),
  Junicode: require('../../assets/fonts/Junicode.ttf'),
  Junicode_Italic: require('../../assets/fonts/Junicode-Italic.ttf'),
  Junicode_Light: require('../../assets/fonts/Junicode-Light.ttf'),
  Junicode_LightItalic: require('../../assets/fonts/Junicode-LightItalic.ttf'),
  Junicode_Medium: require('../../assets/fonts/Junicode-Medium.ttf'),
  Junicode_MediumItalic: require('../../assets/fonts/Junicode-MediumItalic.ttf'),
  Junicode_SemiBold: require('../../assets/fonts/Junicode-SemiBold.ttf'),
  Junicode_SemiBoldItalic: require('../../assets/fonts/Junicode-SemiBoldItalic.ttf'),
  Junicode_Bold: require('../../assets/fonts/Junicode-Bold.ttf'),
  Junicode_BoldItalic: require('../../assets/fonts/Junicode-BoldItalic.ttf'),
}
