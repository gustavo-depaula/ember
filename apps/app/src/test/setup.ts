/**
 * Global Vitest setup. Mocks native modules so `react-native-web` + jsdom can
 * mount the React tree, swaps `expo-sqlite` for a `better-sqlite3` adapter,
 * and routes Hearth fetches at the local built corpus.
 */

import '@testing-library/jest-dom/vitest'
import { cleanup, configure as configureTestingLibrary } from '@testing-library/react'

// `findBy*` defaults to a 1s timeout, independent of a test's own budget.
// Integration tests that boot the whole app routinely exceed it once the full
// suite competes for CPU (a different test flaked each run). Stuck tests still
// fail on the testTimeout in vitest.config.ts.
configureTestingLibrary({ asyncUtilTimeout: 10_000 })
import 'fake-indexeddb/auto'
import { afterEach, beforeAll, vi } from 'vitest'

import { installHearthFetch } from './hearth-local'

// expo-modules-core's EventEmitter reads from `globalThis.expo.EventEmitter`,
// which is installed by Expo's native bootstrapping — absent in jsdom. Provide
// a no-op shim so any module importing it (audio, notifications, etc.) loads.
class StubEventEmitter {
  addListener(_event: string, _fn: (...args: unknown[]) => void) {
    return { remove() {} }
  }
  removeAllListeners(_event: string) {}
  emit(_event: string, ..._args: unknown[]) {}
}
;(globalThis as { expo?: { EventEmitter: unknown } }).expo ??= {
  EventEmitter: StubEventEmitter,
}

beforeAll(async () => {
  installHearthFetch()
  // react-native-web's AccessibilityInfo lacks the iOS-only
  // `isReduceTransparencyEnabled` that GlassSurface probes — stub it.
  // try/catch so test files that locally `vi.mock('react-native')` without
  // AccessibilityInfo (whose mock throws on the missing export) just skip it.
  try {
    const RN = (await import('react-native')) as unknown as Record<string, unknown>
    const ai = RN.AccessibilityInfo as Record<string, unknown> | undefined
    if (ai && typeof ai.isReduceTransparencyEnabled !== 'function') {
      ai.isReduceTransparencyEnabled = async () => false
    }
  } catch {}
})

// jsdom doesn't ship matchMedia, ResizeObserver, or scrollTo — Tamagui's
// Select/Sheet/Dialog touch all three at import time.
if (typeof window !== 'undefined') {
  if (!window.matchMedia) {
    window.matchMedia = (query) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList
  }
  if (!window.ResizeObserver) {
    window.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as never
  }
  if (!window.scrollTo) window.scrollTo = (() => {}) as never
}

afterEach(() => {
  // Testing Library unmounts after each test only under vitest `globals`, which
  // we don't enable. A screen left mounted keeps its RouterOutlet on the shared
  // fake router, so the next test's route renders twice.
  cleanup()
  vi.clearAllMocks()
})

vi.mock('expo-sqlite', async () => import('./sqlite-better'))

vi.mock('expo-router', async () => import('./router-fake'))

// Reanimated's own mock.js does `require('./src/mock')`, which only resolves
// under Metro/Jest.
vi.mock('react-native-reanimated', async () => {
  const React = await import('react')
  const RN = await import('react-native')
  const passthrough = (props: Record<string, unknown>) =>
    React.createElement(RN.View, props as never)
  const Animated = {
    View: passthrough,
    Text: (props: Record<string, unknown>) => React.createElement(RN.Text, props as never),
    Image: (props: Record<string, unknown>) => React.createElement(RN.Image, props as never),
    ScrollView: (props: Record<string, unknown>) =>
      React.createElement(RN.ScrollView, props as never),
    createAnimatedComponent: <T>(c: T) => c,
  }
  const useSharedValue = <T>(v: T) => ({ value: v })
  const useDerivedValue = <T>(fn: () => T) => ({ value: fn() })
  const useAnimatedStyle = (fn: () => Record<string, unknown>) => fn()
  const useAnimatedRef = () => React.useRef(null)
  const useAnimatedScrollHandler = () => () => {}
  const useAnimatedReaction = () => {}
  const withTiming = <T>(v: T) => v
  const withSpring = <T>(v: T) => v
  const withDelay = <T>(_d: number, v: T) => v
  const withSequence = <T>(...args: T[]) => args[args.length - 1]
  const withRepeat = <T>(v: T) => v
  const interpolate = (v: number) => v
  const Easing = new Proxy({}, { get: () => () => {} })
  const runOnJS =
    <Args extends unknown[]>(fn: (...a: Args) => unknown) =>
    (...args: Args) =>
      fn(...args)
  const runOnUI =
    <Args extends unknown[]>(fn: (...a: Args) => unknown) =>
    (...args: Args) =>
      fn(...args)
  // Layout-animation builders used as JSX props (`entering={FadeIn.duration(200)}`).
  // Each method returns the same builder so chaining (`FadeIn.duration(...).delay(...)`)
  // works without modeling Reanimated's real layout-animation type.
  const layoutAnimationBuilder: Record<string, (..._args: unknown[]) => unknown> = {}
  const layoutMethods = [
    'duration',
    'delay',
    'springify',
    'easing',
    'damping',
    'withInitialValues',
    'withCallback',
    'reduceMotion',
    'randomDelay',
    'stiffness',
    'mass',
    'restDisplacementThreshold',
    'restSpeedThreshold',
    'rotate',
  ]
  for (const m of layoutMethods) layoutAnimationBuilder[m] = () => layoutAnimationBuilder
  return {
    default: Animated,
    ...Animated,
    useSharedValue,
    useDerivedValue,
    useAnimatedStyle,
    useAnimatedRef,
    useAnimatedScrollHandler,
    useAnimatedReaction,
    withTiming,
    withSpring,
    withDelay,
    withSequence,
    withRepeat,
    interpolate,
    Easing,
    runOnJS,
    runOnUI,
    cancelAnimation: () => {},
    Extrapolation: { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' },
    ReduceMotion: { System: 'system', Always: 'always', Never: 'never' },
    FadeIn: layoutAnimationBuilder,
    FadeOut: layoutAnimationBuilder,
    SlideInLeft: layoutAnimationBuilder,
    SlideInRight: layoutAnimationBuilder,
    SlideInUp: layoutAnimationBuilder,
    SlideInDown: layoutAnimationBuilder,
    SlideOutLeft: layoutAnimationBuilder,
    SlideOutRight: layoutAnimationBuilder,
    SlideOutUp: layoutAnimationBuilder,
    SlideOutDown: layoutAnimationBuilder,
    FadeInUp: layoutAnimationBuilder,
    FadeInDown: layoutAnimationBuilder,
    FadeInLeft: layoutAnimationBuilder,
    FadeInRight: layoutAnimationBuilder,
    FadeOutUp: layoutAnimationBuilder,
    FadeOutDown: layoutAnimationBuilder,
    FadeOutLeft: layoutAnimationBuilder,
    FadeOutRight: layoutAnimationBuilder,
    LinearTransition: layoutAnimationBuilder,
  }
})
vi.mock('react-native-worklets', () => ({
  runOnUI: (fn: unknown) => fn,
  runOnJS: (fn: unknown) => fn,
  createWorkletRuntime: () => ({}),
  default: {},
}))

// Gesture handler's own jest setup pokes globals jsdom rejects.
vi.mock('react-native-gesture-handler', async () => {
  const React = await import('react')
  const RN = await import('react-native')
  const Passthrough = (props: Record<string, unknown>) =>
    React.createElement(RN.View, props as never)
  return {
    GestureHandlerRootView: Passthrough,
    PanGestureHandler: Passthrough,
    TapGestureHandler: Passthrough,
    LongPressGestureHandler: Passthrough,
    State: {},
    Directions: {},
    gestureHandlerRootHOC: <T>(c: T) => c,
    Gesture: (() => {
      // Each gesture builder method (`Pan().activeOffsetX(...).onStart(...)`)
      // returns the same chainable object so tests can construct gestures
      // without modeling the real semantics.
      const chainable: Record<string, (..._args: unknown[]) => unknown> = {}
      const chainMethods = [
        'onBegin',
        'onStart',
        'onUpdate',
        'onChange',
        'onEnd',
        'onFinalize',
        'onTouchesDown',
        'onTouchesUp',
        'activeOffsetX',
        'activeOffsetY',
        'failOffsetX',
        'failOffsetY',
        'minDistance',
        'maxPointers',
        'minPointers',
        'shouldCancelWhenOutside',
        'enabled',
        'enableTrackpadTwoFingerGesture',
        'simultaneousWithExternalGesture',
        'requireExternalGestureToFail',
        'runOnJS',
        'withRef',
        'numberOfTaps',
        'maxDuration',
        'maxDelay',
        'maxDistance',
      ]
      for (const m of chainMethods) chainable[m] = () => chainable
      return {
        Pan: () => chainable,
        Tap: () => chainable,
        LongPress: () => chainable,
        Fling: () => chainable,
        Pinch: () => chainable,
        Rotation: () => chainable,
        Race: () => chainable,
        Simultaneous: () => chainable,
        Exclusive: () => chainable,
      }
    })(),
    GestureDetector: Passthrough,
    Pressable: RN.Pressable,
    ScrollView: RN.ScrollView,
    TouchableOpacity: RN.TouchableOpacity,
  }
})

vi.mock('expo-font', () => ({
  useFonts: () => [true, undefined] as const,
  loadAsync: async () => {},
  isLoaded: () => true,
  Font: {},
}))

// Every @expo-google-fonts/* package re-exports the same shape (font name
// constants). Stubbing each as a Proxy that returns its key as the value —
// vi.mock is hoisted, so factories must be inline (can't reference outer vars).
vi.mock('@expo-google-fonts/cinzel', () => new Proxy({}, { get: (_t, k) => k }))
vi.mock('@expo-google-fonts/cormorant-garamond', () => new Proxy({}, { get: (_t, k) => k }))
vi.mock('@expo-google-fonts/crimson-pro', () => new Proxy({}, { get: (_t, k) => k }))
vi.mock('@expo-google-fonts/eb-garamond', () => new Proxy({}, { get: (_t, k) => k }))
vi.mock('@expo-google-fonts/libre-baskerville', () => new Proxy({}, { get: (_t, k) => k }))
vi.mock('@expo-google-fonts/lora', () => new Proxy({}, { get: (_t, k) => k }))
vi.mock('@expo-google-fonts/merriweather', () => new Proxy({}, { get: (_t, k) => k }))
vi.mock('@expo-google-fonts/pinyon-script', () => new Proxy({}, { get: (_t, k) => k }))
vi.mock('@expo-google-fonts/source-serif-4', () => new Proxy({}, { get: (_t, k) => k }))

// `expo-crypto` pulls `expo-modules-core`'s `ExpoGlobal.EventEmitter` at import
// time, which is undefined under jsdom (no Expo native host). Stub the only
// surface our code uses (digestStringAsync) using Node's built-in `crypto`.
vi.mock('expo-crypto', async () => {
  const { createHash } = await import('node:crypto')
  return {
    CryptoDigestAlgorithm: { SHA1: 'SHA-1', SHA256: 'SHA-256', SHA512: 'SHA-512' },
    CryptoEncoding: { HEX: 'hex', BASE64: 'base64' },
    async digestStringAsync(algo: string, value: string, opts?: { encoding?: string }) {
      const algoName = algo.toLowerCase().replace('-', '')
      return createHash(algoName)
        .update(value)
        .digest((opts?.encoding ?? 'hex') as 'hex' | 'base64')
    },
  }
})

vi.mock('expo-haptics', () => ({
  impactAsync: async () => {},
  notificationAsync: async () => {},
  selectionAsync: async () => {},
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}))

vi.mock('expo-notifications', () => ({
  setNotificationHandler: () => {},
  getPermissionsAsync: async () => ({ status: 'granted', granted: true }),
  requestPermissionsAsync: async () => ({ status: 'granted', granted: true }),
  scheduleNotificationAsync: async () => 'mock-id',
  cancelScheduledNotificationAsync: async () => {},
  cancelAllScheduledNotificationsAsync: async () => {},
  getAllScheduledNotificationsAsync: async () => [],
  setNotificationChannelAsync: async () => {},
  AndroidImportance: { HIGH: 4 },
  SchedulableTriggerInputTypes: { CALENDAR: 'calendar', DAILY: 'daily', WEEKLY: 'weekly' },
}))

vi.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: async () => {},
  hideAsync: async () => {},
}))

vi.mock('expo-keep-awake', () => ({
  useKeepAwake: () => {},
  activateKeepAwakeAsync: async () => {},
  deactivateKeepAwake: async () => {},
}))

vi.mock('expo-localization', () => ({
  getLocales: () => [
    { languageTag: 'en-US', languageCode: 'en', regionCode: 'US', textDirection: 'ltr' },
  ],
  getCalendars: () => [{ calendar: 'gregorian', timeZone: 'UTC' }],
  locale: 'en-US',
}))

vi.mock('expo-constants', () => ({
  default: { expoConfig: { extra: {} } },
  expoConfig: { extra: {} },
}))

vi.mock('expo-status-bar', async () => {
  const React = await import('react')
  return { StatusBar: () => React.createElement(React.Fragment) }
})

vi.mock('expo-updates', () => ({
  reloadAsync: async () => {},
  checkForUpdateAsync: async () => ({ isAvailable: false }),
  fetchUpdateAsync: async () => ({ isNew: false }),
  isEnabled: false,
  channel: 'test',
  runtimeVersion: 'test',
  updateId: 'test',
}))

vi.mock('expo-linking', () => ({
  createURL: (path: string) => `ember://${path.replace(/^\/+/, '')}`,
  openURL: async () => true,
  parse: () => ({ path: '', queryParams: {} }),
  useURL: () => undefined,
  addEventListener: () => ({ remove: () => {} }),
}))

vi.mock('expo-file-system', () => ({
  Directory: class {
    exists = false
    create() {}
    delete() {}
    list() {
      return []
    }
  },
  File: class {
    exists = false
    uri = ''
    write() {}
    delete() {}
    async bytes() {
      return new Uint8Array()
    }
    async text() {
      return ''
    }
  },
  Paths: { document: '/tmp/test-documents' },
}))

vi.mock('expo-image', async () => {
  const React = await import('react')
  return {
    Image: (props: Record<string, unknown>) =>
      React.createElement('img', {
        src: typeof props.source === 'object' ? (props.source as { uri?: string }).uri : '',
        alt: '',
      }),
  }
})

vi.mock('react-native-keyboard-controller', async () => {
  const React = await import('react')
  const RN = await import('react-native')
  const Passthrough = (props: Record<string, unknown>) =>
    React.createElement(RN.View, props as never)
  return {
    KeyboardProvider: Passthrough,
    KeyboardAvoidingView: Passthrough,
    KeyboardAwareScrollView: (props: Record<string, unknown>) =>
      React.createElement(RN.ScrollView, props as never),
  }
})

vi.mock('expo-glass-effect', async () => {
  const React = await import('react')
  return {
    GlassView: (props: Record<string, unknown>) =>
      React.createElement('div', { 'data-testid': 'mock-glass-view' }, props.children as never),
    isLiquidGlassAvailable: () => false,
  }
})

vi.mock('expo-blur', async () => {
  const React = await import('react')
  return {
    BlurView: (props: Record<string, unknown>) =>
      React.createElement('div', { 'data-testid': 'mock-blur-view' }, props.children as never),
  }
})

vi.mock('react-native-webview', async () => {
  const React = await import('react')
  return {
    WebView: () => React.createElement('div', { 'data-testid': 'mock-webview' }),
    default: () => React.createElement('div', { 'data-testid': 'mock-webview' }),
  }
})

vi.mock('@expo/dom-webview', async () => {
  const React = await import('react')
  return {
    default: () => React.createElement('div', { 'data-testid': 'mock-dom-webview' }),
  }
})

vi.mock('@react-native-community/datetimepicker', async () => {
  const React = await import('react')
  return { default: () => React.createElement(React.Fragment) }
})

vi.mock('react-native-zoom-toolkit', async () => {
  const React = await import('react')
  return {
    ResumableZoom: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    SnapbackZoom: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    GalleryItem: () => React.createElement(React.Fragment),
    Gallery: () => React.createElement(React.Fragment),
  }
})

// react-native-svg ships CJS with TS syntax, which jsdom can't load.
vi.mock('react-native-svg', async () => {
  const React = await import('react')
  const tag = (name: string) => (props: Record<string, unknown>) =>
    React.createElement('span', { 'data-svg': name, ...props })
  return {
    default: tag('Svg'),
    Svg: tag('Svg'),
    Circle: tag('Circle'),
    Ellipse: tag('Ellipse'),
    G: tag('G'),
    Text: tag('Text'),
    TSpan: tag('TSpan'),
    TextPath: tag('TextPath'),
    Path: tag('Path'),
    Polygon: tag('Polygon'),
    Polyline: tag('Polyline'),
    Line: tag('Line'),
    Rect: tag('Rect'),
    Use: tag('Use'),
    Image: tag('Image'),
    Symbol: tag('Symbol'),
    Defs: tag('Defs'),
    LinearGradient: tag('LinearGradient'),
    RadialGradient: tag('RadialGradient'),
    Stop: tag('Stop'),
    ClipPath: tag('ClipPath'),
    Pattern: tag('Pattern'),
    Mask: tag('Mask'),
    Marker: tag('Marker'),
    ForeignObject: tag('ForeignObject'),
    SvgUri: tag('SvgUri'),
    SvgXml: tag('SvgXml'),
    SvgCss: tag('SvgCss'),
    SvgFromXml: tag('SvgFromXml'),
    SvgWithCss: tag('SvgWithCss'),
  }
})

vi.mock('react-native-safe-area-context', async () => {
  const React = await import('react')
  const Passthrough = ({ children }: { children?: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children)
  return {
    SafeAreaView: Passthrough,
    SafeAreaProvider: Passthrough,
    SafeAreaInsetsContext: React.createContext({ top: 0, right: 0, bottom: 0, left: 0 }),
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 1024, height: 768 }),
    initialWindowMetrics: {
      insets: { top: 0, right: 0, bottom: 0, left: 0 },
      frame: { x: 0, y: 0, width: 1024, height: 768 },
    },
  }
})

// lucide-react-native's thousands of per-icon files make a 30s import here.
// Every icon name resolves to a no-op component, so new icons never break tests.
vi.mock('lucide-react-native', () => {
  const Icon = () => null
  return new Proxy(
    {},
    {
      // `then` must stay undefined so vitest doesn't treat the module as a thenable.
      get: (_t, key) => (key === 'then' ? undefined : Icon),
      has: () => true,
    },
  )
})

// expo-web-browser requires the ExpoWebBrowser native module at import time,
// so merely importing a component that links out (LinkBlock, the Explore
// feeds) would throw and take the whole screen render down with it.
vi.mock('expo-web-browser', () => ({
  openBrowserAsync: vi.fn(async () => ({ type: 'opened' })),
  dismissBrowser: vi.fn(),
  WebBrowserPresentationStyle: {
    PAGE_SHEET: 'pageSheet',
    FULL_SCREEN: 'fullScreen',
    FORM_SHEET: 'formSheet',
    AUTOMATIC: 'automatic',
  },
}))
