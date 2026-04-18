# QA Findings — 2026-04-18

Deep QA pass across the app in-browser. Features tested: see overnight journal (~40 iterations shipped 2026-04-17/18). This file is the single source of truth for issues found and the fix plan.

Severity: **P0** = blocking/broken, **P1** = serious UX damage, **P2** = polish, **P3** = nit.

---

## Findings

### F1 · CandleFlame layout broken on web (Oratio, home row icon) — **P0**

**Symptom.** On `/oratio`, the candle flame halo renders at the very top of the page (absolute-positioned up to y=0), separated from the candle body by ~400px. The flame looks like a disembodied dim oval near the title instead of a candle lit at the center of the screen.

**Root cause.** `apps/app/src/components/CandleFlame.tsx:65` — outer `<View width height>` has no `position="relative"`. React Native Web compiles to `position: static`, and the inner `position: absolute` flame group walks up until it finds the `YStack` with `position: relative` far above, anchoring there.

**Fix.** Add `position="relative"` to the outer `<View>` in CandleFlame. Also verify on the home Oratio row (small flame — same component, same bug, probably also visible on web).

---

### F2 · useKeepAwake() crashes on web — **P0 (blocker for web)**

**Symptom.** Any navigation triggers the Expo dev-server red-box:
```
NotAllowedError: Failed to execute 'request' on 'WakeLock': The requesting page is not visible
    at activate (expo-keep-awake)
    at activateKeepAwakeAsync
```
In production this would surface as an uncaught promise rejection on every route change.

**Root cause.** `apps/app/src/app/_layout.tsx:57` — `useKeepAwake()` added in commit `e99c3e3`. On web, expo-keep-awake calls `navigator.wakeLock.request('screen')`. Browsers reject the request unless the document is `visible` at call time — during mount / fast route transitions the page is not yet visible, so the promise rejects.

**Fix.** Either (a) guard with `Platform.OS !== 'web'`, or (b) catch + re-try on visibilitychange. (a) is simpler — Wake Lock on web is unreliable anyway (browsers may throttle). Keep screen-awake behavior on native only.

---
