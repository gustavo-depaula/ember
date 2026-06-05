'use dom'

// Minimal smoke test for the Expo DOM Components native module. Temporarily
// wire it into BookReader.tsx in place of BookReaderSurface to verify the
// `@expo/dom-webview` bridge is alive:
//
//   import TestDom from './_TestDom.dom'
//   ...
//   <TestDom dom={{ style: { flex: 1 }, containerStyle: { flex: 1 } }} />
//
// If you see "HELLO DOM" on red, the native module is fine and bugs are in
// the real surface. If you still see a blank area, the @expo/dom-webview
// native pod is not in the dev client (run `npx pod-install` in apps/app/ios
// then `pnpm ios`).
export default function TestDom() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'red',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
        fontSize: 48,
        fontWeight: 'bold',
      }}
    >
      HELLO DOM
    </div>
  )
}
