import { ActivityIndicator, Image, StyleSheet, useColorScheme, View } from 'react-native'
import { Text } from 'tamagui'

// Mirrors the native splash in app.json (expo-splash-screen): same images,
// grounds and 200pt width, so the handoff is invisible.
const logoSize = 200
const splash = {
  light: {
    image: require('../../assets/splash-icon.png'),
    background: '#F4E8CF',
    accent: '#9A7424',
    muted: '#7A6A58',
  },
  dark: {
    image: require('../../assets/splash-icon-dark.png'),
    background: '#0E0D0C',
    accent: '#D4A63A',
    muted: '#A89A8C',
  },
}

/**
 * Shown after fonts/theme are ready but before the corpus is fully warmed: the
 * native splash, held, with a spinner and the boot status under the logo. The
 * logo stays exactly where the splash put it; the status hangs below it.
 */
export function BootLoadingScreen({ status }: { status?: string }) {
  // The native splash follows the system appearance, not the app's theme.
  const look = useColorScheme() === 'light' ? splash.light : splash.dark
  return (
    <View style={[styles.screen, { backgroundColor: look.background }]}>
      <Image source={look.image} style={styles.logo} />
      <View style={styles.status}>
        <ActivityIndicator color={look.accent} />
        {status && (
          <Text fontFamily="$body" fontSize="$2" color={look.muted} fontStyle="italic">
            {status}
          </Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { width: logoSize, height: logoSize },
  status: {
    position: 'absolute',
    top: '50%',
    marginTop: logoSize / 2 + 16,
    alignItems: 'center',
    gap: 8,
  },
})
