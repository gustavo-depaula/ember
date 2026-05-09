# Phase G — Android UsageStats + shield Activity

> Scope: Android-side enforcement of *app* targets. A foreground monitor service polls `UsageStatsManager` and launches a full-screen `PrayerShieldActivity` over shielded apps. App-picker, friction modes, and coexistence with Phase F's VPN service.
> Complexity: **High.** A continuously-running foreground service that polls and launches Activities is the exact surface OEMs aggressively kill. The 1–3s detection delay is an irreducible UX limit. The `PACKAGE_USAGE_STATS` flow is unfamiliar; copy carries the load.
> Depends on: Phase F (VPN service + module skeleton + snapshot sync). Phase G adds a sibling service inside the same Kotlin module.

## Goal

After Phase G, an Android user with a `bound` commitment that targets specific apps (Instagram by package name, TikTok, Reddit) sees Ember's full-screen prayer-shield within ~1s of opening the shielded app. The shield mirrors iOS Phase C — same anchor, same friction modes, same deep-link to "Pray and continue blocking" / "Disable temporarily." The two halves of v2 (Phase F web + Phase G app) ship together; there is no v2.0-without-Phase-G.

This phase explicitly does **not** use `AccessibilityService` (closed by Google's October 2025 policy update). The mechanism is `PACKAGE_USAGE_STATS` + a foreground polling service, the same legitimate combination used by current focus apps that survived the policy change.

---

## Background: how Android app shielding works without Accessibility

The legitimate-2026 stack:

1. **`PACKAGE_USAGE_STATS`** — special permission (granted in Settings → Special access → Usage access). Lets us query foreground events from `UsageStatsManager`.
2. **Foreground service** — runs continuously, polls usage events, decides when a shielded app comes foreground.
3. **Full-screen Activity** — launched over the shielded app, presents the prayer-shield UI.

Observed industry pattern (post-October-2025): poll at ~500ms with screen-on gating, launch a `singleTop` Activity from the service when a target package is detected, accept the ~600–1300ms detection delay as the cost of avoiding `AccessibilityService`.

---

## Major decisions

### G1. Two services, not one combined service

Phase F introduced `EmberVpnService`. Phase G adds `EmberMonitorService`. Two questions:

- **(a) One unified service.** Single notification, simpler lifecycle.
- **(b) Two services with independent lifecycles.** Each starts only when relevant; each can be stopped independently.

**Decision: (b).** Web-only commitments don't need the monitor; app-only commitments don't need the VPN. Combining them couples concerns and doubles battery cost for users whose commitments only need one half. Two services with grouped notifications (G9) is the cleaner shape.

Both services run inside the same `ember-custody-android` Expo Module.

### G2. Polling cadence: 500ms screen-on, paused screen-off

`UsageStatsManager.queryEvents(start, end)` returns events in `(start, end]`. We tail the stream by passing `lastSeen` as `start` and `now` as `end`, polling at intervals.

Cadence trade-offs:

| Interval | Detection latency | Battery |
|---|---|---|
| 200 ms | ~300–400 ms (best UX) | High; 4 reads/s sustained |
| 500 ms | ~600–800 ms (matches industry) | Acceptable |
| 1 s | ~1100–1300 ms | Cheap |
| 2 s | ~2100–2300 ms (user notices) | Negligible |

**Decision: 500 ms when screen on; paused when screen off.** A foreground app can't be opened while the screen is off, so polling adds no value. Use `DisplayManager.DisplayListener` to react to `STATE_ON` / `STATE_OFF`. On screen-off, the service stays alive (foreground) but the polling thread sleeps on a condition variable.

### G3. Honest detection-delay copy

The 600–1300 ms window is unavoidable. During it, the shielded app is visible and may render content. This matters most for a porn-blocking commitment — the blocked content can flash before the shield takes over.

**Decision: be explicit in onboarding copy.** Specifically:

> Custody on Android catches up to ~1 second after you open a blocked app. Apple's iOS lets us shield instantly; Android does not have an equivalent API. For sensitive blocking (adult content), pair Custody with the DNS walkthrough — DNS blocks the website *before* it loads.

This sets expectations and routes users to DNS for adult content (which is web-delivered anyway).

### G4. Activity launch from service: standard `startActivity` with `singleTop`

Three approaches considered:

- **(a) `SYSTEM_ALERT_WINDOW` overlay.** Non-Activity overlay drawn on top. Hostile permission post-Android 12; risk of Play Store flags.
- **(b) `USE_FULL_SCREEN_INTENT` notification.** A notification configured with `setFullScreenIntent` that launches the Activity. Designed for incoming-call-style alerts. Android 14+ requires user-granted permission and only allows it for "high-priority alerts that require immediate attention."
- **(c) Direct `startActivity` from the foreground service.** Standard. Allowed for foreground services with visible notifications. The shield Activity is `singleTop` so duplicate launches collapse.

**Decision: (c).** It's the documented happy path for foreground services; doesn't require `SYSTEM_ALERT_WINDOW` or `USE_FULL_SCREEN_INTENT`; survives Play Store policy. The Activity is declared `singleTop` + `excludeFromRecents` + `noHistory`. Launch flags: `FLAG_ACTIVITY_NEW_TASK | FLAG_ACTIVITY_CLEAR_TOP | FLAG_ACTIVITY_REORDER_TO_FRONT`.

We add `setShowWhenLocked(true)` + `setTurnScreenOn(true)` so the shield works on the lock screen too.

### G5. `PrayerShieldActivity`: Compose UI mirroring iOS

A full-screen Compose Activity. The same `Anchor` JSON shape as iOS Phase C; the UI logic is shared in spirit (typography, spacing, copy) though re-implemented in Compose. Four states:

| State | UI |
|---|---|
| Normal | Anchor card + title + subtitle + "Pray and continue blocking" / "Disable temporarily" |
| Wait friction (locked) | Same + countdown subtitle + secondary disabled |
| Prayer friction | "Disable" launches `PrayToDisableActivity` with the prayer rendered full-screen |
| Confession-only | "After confession" launches Confessio surface in the main app |

Anchor decoding: the snapshot's `imageData` (PNG bytes) is decoded once per shield launch; `title` and `subtitle` are attributed strings. The `kind: 'prayer'` and `kind: 'lectio'` anchors render their full prerendered text in the prayer-to-disable surface, not in the shield itself (which is constrained vertically).

### G6. App-picker: filter to launchable, expose package names with explicit privacy note

`PackageManager.getInstalledApplications` returns thousands including system services. Filter to apps with launcher activities:

```kotlin
val launcherIntent = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER)
val resolved = packageManager.queryIntentActivities(launcherIntent, 0)
val launchablePackages = resolved.map { it.activityInfo.packageName }.distinct()
```

Cache in service memory. Refresh on `Intent.ACTION_PACKAGE_ADDED` / `ACTION_PACKAGE_REMOVED` broadcasts.

UX in CommitmentEditor's TargetPicker:

- Search-as-you-type
- Sort alphabetically by app label
- Visual: app icon + label + package name (small)
- Multi-select via checkboxes

**Privacy asymmetry**: unlike iOS's opaque tokens, Android exposes package names. Custody on Android *can* enumerate which apps the user picked. This is a real privacy-posture difference and we surface it in the picker copy:

> On Android, Custody knows which apps you pick. Apple's iOS does not allow apps to see this; Android does. Your selections never leave your phone, but Ember's database does record them.

This is the truth, plainly. Users who care can use the DNS walkthrough alone (Phase D) and avoid app targets.

### G7. Permission flow: unfamiliar surface, deep-link with explainer

`PACKAGE_USAGE_STATS` is granted in Settings → Apps → Special access → Usage access — three taps deep, unfamiliar to most users.

Flow:

1. User toggles severity to `bound` with at least one app target.
2. Check `AppOpsManager.checkOpNoThrow(OPSTR_GET_USAGE_STATS, ...)`.
3. If `MODE_ALLOWED`: proceed.
4. If not allowed:
   - Show explainer screen: "Custody needs Usage access to know when a blocked app opens. We don't read content; we only see which app is foreground."
   - Animated screenshot of the Settings flow.
   - "Open Usage access" CTA → `Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)`.
   - On return, recheck. Loop until granted or user cancels.

This is the heaviest permission UX in the whole feature on Android. Phase E's polish pass tunes the copy and animation.

### G8. Battery-optimization opt-out: required, deep-linked, never auto-requested

Without battery-optimization opt-out, Samsung / Xiaomi / Huawei kill the monitor service within hours.

Standard request:

```kotlin
val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS)
  .setData(Uri.parse("package:$packageName"))
startActivity(intent)
```

The user sees a system dialog with "Allow" / "Deny." We never auto-request — Play Store rejects apps that surprise-prompt this.

Triggered on bound activation, after `PACKAGE_USAGE_STATS` is granted. If the user denies battery opt-out, the commitment still saves and the service starts; we surface a banner explaining that enforcement may degrade after a few hours.

OEM-specific extras (Samsung's "Deep sleep" auto-list, Xiaomi's "Autostart") cannot be deep-linked reliably — those go in Phase H's polish pass.

### G9. Coexistence with VPN service: grouped notifications, independent lifecycles

When the user has bound commitments with both web and app targets, both services run. Two notifications would be ugly; we group them.

Channels:

- `custody-vpn` (Phase F): "Custody is active for web filtering."
- `custody-monitor` (Phase G): "Custody is active for app monitoring."

Both `IMPORTANCE_LOW` (no sound, no peek). Both set `setGroup("custody")`. Android collapses them into a single visual entry in the shade. A summary notification at group level: "Custody is active."

Lifecycle: each service starts only when its required commitments exist; each stops independently. Adding/removing/archiving commitments triggers a re-evaluation in JS that calls `startVpn`/`stopVpn`/`startMonitor`/`stopMonitor` accordingly.

### G10. Friction modes: identical semantics to iOS

The friction logic is platform-agnostic; only the implementation differs.

| Friction | Android implementation |
|---|---|
| `none` | Tap secondary → log `overrode` event → set commitment `suspendedUntil` to start of next day → finish() the shield Activity. |
| `wait` | Read `lockedUntil` from SharedPreferences. If `now < lockedUntil`: render countdown subtitle, secondary disabled. If `now ≥ lockedUntil`: secondary becomes "Confirm disable"; tap → log `overrode` → suspend. On user-initiated wait start: `lockedUntil = now + waitSeconds`; persist. |
| `prayer` | Tap secondary → start `PrayToDisableActivity` with the commitment's prayer/lectio anchor rendered full-screen + "I have prayed — lift the shield" CTA. On confirm: log `overrode` with `via='prayer'` → suspend. |
| `confession-only` | Tap secondary → launch the main app with deep link `ember://confessio?return=custody`. On confession recorded, the main app's confession-save mutation calls `EmberCustodyAndroid.liftFrictionLock(commitmentId, 'confession')`. |

Suspension semantics: a commitment with `suspendedUntil > now` is treated as inactive — monitor service skips it; the user can re-open the app freely until the suspension expires.

### G11. Resilience: re-arm on app uninstall, package change, network change

The monitor cares about app-list changes:

- `Intent.ACTION_PACKAGE_REMOVED`: if a shielded package is uninstalled, mark the corresponding target as orphaned in the snapshot; surface a UI banner; don't crash.
- `Intent.ACTION_PACKAGE_ADDED`: refresh the launchable-app cache.

The service registers a `BroadcastReceiver` for these. Service lifecycle is independent of the broadcasts; receivers just notify the polling thread to refresh state.

### G12. Suspension after override: per-commitment, until next reset

When the user successfully overrides a commitment, the commitment is suspended until the next "reset" — which is one of:

- Start of next day (default).
- Start of next week (for weekly commitments — config knob).
- Until next confession (for `confession-only` friction).
- Indefinitely (configurable per friction).

Decision: default to start-of-next-day. Configurable per commitment via a new `suspensionReset` field added to the schema. Phase G adds the schema column (small migration, `0003_custody_suspension.sql`) and the UI control. Pre-existing commitments default to `start-of-next-day`.

This is a real schema change; confirm willingness per CLAUDE.md before writing the migration.

---

## Architecture

### File layout added in Phase G

```
apps/app/modules/ember-custody-android/android/src/main/java/me/dpgu/ember/custody/
  monitor/
    EmberMonitorService.kt                Foreground service; polling thread
    UsageEventsTail.kt                    UsageStatsManager.queryEvents tail loop
    ScreenStateGate.kt                    Pause polling on screen off
    AppListCache.kt                       Launchable apps cache + refresh
    PackageChangeReceiver.kt              ACTION_PACKAGE_ADDED/REMOVED
    ShieldDispatcher.kt                   Decides when to launch the shield
  shield/
    PrayerShieldActivity.kt               Full-screen Compose Activity
    PrayToDisableActivity.kt              Prayer friction surface
    AnchorRenderer.kt                     Compose composables for each Anchor.kind
    FrictionState.kt                      lockedUntil read/write
    SuspensionStore.kt                    suspendedUntil per commitment
  permission/
    UsageStatsPermission.kt               Check + deep-link
    BatteryOptimizationOptOut.kt          Opt-out request flow
  notifications/
    NotificationGroup.kt                  Group both Custody services into one shade entry
  AndroidManifest.xml                     [edited: monitor service, shield activity, broadcast receiver, USE_EXACT_ALARM if needed]

apps/app/src/features/custody/
  android/
    monitorControl.ts                     JS facade: startMonitor / stopMonitor / status
    usagePermission.ts                    JS facade for the permission flow
  components/
    AppTargetPickerAndroid.tsx             [filled in: real picker]
    UsagePermissionGuard.tsx               Explainer + deep-link
    BatteryOptOutPrompt.tsx                Post-permission battery opt-out
    AndroidPrivacyNote.tsx                 The "Custody knows your picks on Android" disclosure

apps/app/src/db/migrations/
  0003_custody_suspension.sql             [pending confirmation: suspensionReset column]
```

### JS bridge surface added in Phase G

```typescript
// extension to apps/app/modules/ember-custody-android/index.ts
export const EmberCustodyAndroid: {
  // ...existing Phase F surface...
  hasUsageStatsPermission(): Promise<boolean>
  openUsageStatsSettings(): Promise<void>
  hasBatteryOptOut(): Promise<boolean>
  requestBatteryOptOut(): Promise<'granted' | 'denied' | 'unavailable'>
  startMonitor(): Promise<void>
  stopMonitor(): Promise<void>
  getMonitorStatus(): Promise<'inactive' | 'active' | 'starting' | 'killed'>
  liftFrictionLock(commitmentId: string, reason: 'prayer' | 'confession'): Promise<void>
  listLaunchableApps(): Promise<Array<{ packageName: string; label: string; iconUri: string }>>
}
```

### Polling-loop pseudocode

```kotlin
class UsageEventsTail(
  private val usm: UsageStatsManager,
  private val screenGate: ScreenStateGate,
  private val onForeground: (packageName: String) -> Unit,
) {
  private var lastSeen: Long = System.currentTimeMillis()
  private val pollInterval = 500L

  fun loop() {
    while (running) {
      screenGate.awaitScreenOn()
      val now = System.currentTimeMillis()
      val events = usm.queryEvents(lastSeen, now)
      val ev = UsageEvents.Event()
      while (events.hasNextEvent()) {
        events.getNextEvent(ev)
        if (ev.eventType == UsageEvents.Event.MOVE_TO_FOREGROUND) {
          onForeground(ev.packageName)
        }
      }
      lastSeen = now
      Thread.sleep(pollInterval)
    }
  }
}

class ShieldDispatcher(
  private val snapshots: SnapshotStore,
  private val launcher: ShieldLauncher,
) {
  fun onForeground(pkg: String) {
    val activeSnapshots = snapshots.activeBoundAppCommitments()
    val matching = activeSnapshots.firstOrNull { it.targets.any { t -> t is AppTarget && t.packageName == pkg } }
    if (matching != null && !matching.isSuspended()) {
      launcher.launchShield(matching)
    }
  }
}
```

---

## Tasks

### T-G1. `EmberMonitorService` skeleton

`monitor/EmberMonitorService.kt`. Foreground service with `IMPORTANCE_LOW` notification, type `specialUse` (Android 14+) with reason `appBlocking`. `onStartCommand` returns `START_STICKY`. Spawns a polling thread on first start; stops it on `onDestroy`.

### T-G2. `UsageEventsTail` polling loop

`monitor/UsageEventsTail.kt`. Tails `UsageStatsManager.queryEvents`, dispatches `MOVE_TO_FOREGROUND` events to `ShieldDispatcher`. 500ms interval, gated by `ScreenStateGate`.

### T-G3. `ScreenStateGate`

`monitor/ScreenStateGate.kt`. Listens for `Intent.ACTION_SCREEN_ON` / `ACTION_SCREEN_OFF`. Provides `awaitScreenOn()` that blocks the polling thread when the screen is off and releases on screen-on.

### T-G4. `ShieldDispatcher`

`monitor/ShieldDispatcher.kt`. Reads snapshots, matches incoming foreground packages against active app targets, launches the shield via `ShieldLauncher` (which builds the Intent with the right flags and calls `startActivity`). De-dupes: don't relaunch the shield if it's already on top for the same commitment.

### T-G5. `PrayerShieldActivity` Compose UI

`shield/PrayerShieldActivity.kt`. Full-screen, `singleTop`, `excludeFromRecents`, `noHistory`. Compose UI with:

- Background blur (decode the anchor's `imageData`, scale, apply a 30 px blur)
- Anchor card centered (decoded `imageData`, ~120×120 dp display)
- Title (`Anchor.title`) and subtitle (`Anchor.subtitle`) below the card
- Two buttons: primary ("Pray and continue blocking"), secondary (friction-aware label)
- `setShowWhenLocked(true)`, `setTurnScreenOn(true)`

`AnchorRenderer.kt` factors out the anchor-specific composables so the same logic applies to `PrayToDisableActivity`.

### T-G6. Friction logic

`shield/FrictionState.kt`. Read/write `lockedUntil` per commitment in SharedPreferences. The shield's secondary button reads this on display and updates its label and enabled state.

`shield/SuspensionStore.kt`. Read/write `suspendedUntil` per commitment. `ShieldDispatcher` consults this before launching.

The four friction modes' transition logic lives in `PrayerShieldActivity`'s ViewModel:

```kotlin
fun onSecondaryTapped() {
  when (commitment.friction) {
    None -> { recordOverride(); suspend(); finish() }
    Wait -> if (now < lockedUntil) { /* no-op; UI shows countdown */ }
            else if (lockedUntil == 0L) { setLockedUntil(now + waitSeconds) }
            else { recordOverride(via = "wait"); suspend(); finish() }
    Prayer -> startActivity(PrayToDisableActivity intent)
    ConfessionOnly -> startActivity(/* deep link to ember://confessio */)
  }
}
```

### T-G7. App-picker UX + AppListCache

`monitor/AppListCache.kt`. Builds and caches the launchable-apps list from `PackageManager`. `PackageChangeReceiver` invalidates on package adds/removes.

`AppTargetPickerAndroid.tsx`. Calls `listLaunchableApps()` from the JS facade. Search-as-you-type. Multi-select. Selected packages persist as `Target { kind: 'android-app', packageName }` in the commitment.

### T-G8. Usage-stats permission flow

`UsageStatsPermission.kt` exposes `isGranted()` (via `AppOpsManager.checkOpNoThrow`) and `openSettings()` (deep-link). JS facade exposes both as `hasUsageStatsPermission` and `openUsageStatsSettings`.

`UsagePermissionGuard.tsx` is the explainer + deep-link UI. Mounted before the picker on first bound-app activation.

### T-G9. Battery opt-out flow

`BatteryOptimizationOptOut.kt` exposes `isAlreadyOptedOut()` and `requestOptOut()`. JS facade exposes both. `BatteryOptOutPrompt.tsx` shows the explainer screen and deep-links the user, then re-checks on return.

### T-G10. Notification grouping

`NotificationGroup.kt` provides a shared `IMPORTANCE_LOW` channel and a group-summary builder. Both Phase F's VPN service and Phase G's monitor service post into the group. The summary notification reads "Custody is active" and tapping it opens the Custody overview.

### T-G11. Snapshot sync extension for app targets

Extend Phase F's `SnapshotStore` to include `appTargets: string[]` per commitment in the snapshot JSON. The flattening function in JS adds another branch:

```typescript
function flattenAppTargets(snapshots: CommitmentSnapshot[]): Map<string, string[]> {
  const m = new Map<string, string[]>()
  for (const s of snapshots) {
    const apps = s.targets.filter(t => t.kind === 'android-app').map(t => t.packageName)
    if (apps.length) m.set(s.id, apps)
  }
  return m
}
```

`ShieldDispatcher` reads this map on every snapshot update.

### T-G12. Lift-friction-lock from main app

`PrayToDisableActivity` on confirm calls a new module method `liftFrictionLock(commitmentId, 'prayer')`. The Confessio mutation in the main app, on confession recorded, calls the same with `'confession'`. Internally: clears `lockedUntil`, sets `suspendedUntil` per the suspension reset rule, logs the override event.

### T-G13. Schema migration `0003_custody_suspension.sql`

(Pending CLAUDE.md confirmation.) Adds two columns to `commitments`:

```sql
ALTER TABLE commitments ADD COLUMN suspension_reset TEXT NOT NULL DEFAULT 'start-of-next-day'
  CHECK (suspension_reset IN ('start-of-next-day', 'start-of-next-week', 'until-confession', 'indefinite'));
ALTER TABLE commitments ADD COLUMN suspended_until INTEGER;  -- nullable; epoch ms
```

If the user prefers no migration, fall back to representing this in `friction_config` JSON. Decision pending; document either way.

### T-G14. Manual QA matrix

On Pixel, Samsung One UI, and Xiaomi MIUI:

| Scenario | Expected |
|---|---|
| First-time bound activation with app target | Permission flow → battery opt-out → picker → done |
| Open shielded app | Shield within ~1s |
| Shield on lock screen (open shielded app from lock) | Shield shows; user can interact |
| Pray and continue blocking | Logs event; shield closes; if user re-opens app, shield re-launches |
| Disable temporarily (none friction) | Suspends commitment for the day; re-opening the app is unblocked |
| Wait friction tap → countdown → confirm | Countdown displays; secondary becomes "Confirm disable" after expiry |
| Prayer friction → prayer surface → confirm | Lifts the shield; logs override with via=prayer |
| Confession-only friction → record confession in app → return | Shield lifted on next foreground trigger |
| Phase F VPN + Phase G monitor both active | Single grouped notification; both services stable |
| Restart phone | Both services auto-start; commitments resume |
| Battery opt-out denied | Banner warns; service still starts; degrade after long idle |
| Service force-stopped via Settings | Banner detects on next foreground |
| Uninstall a shielded app | Target marked orphaned; commitment edited |
| Install an app while picker is open | Picker auto-refreshes |
| Polling during a 4h benchmark with screen on | Battery delta < 2% over baseline |

### T-G15. Journal entries

In `docs/journal.md`:

- Foreground service patterns post-Android-14 special-use type
- UsageStats event-tail rate-limit reality
- Activity-launch-from-service constraints in 2026
- OEM kill behaviors observed
- Privacy-asymmetry framing decisions (the iOS/Android disclosure)

---

## Verification

- All scenarios in T-G14 pass on at least Pixel and Samsung; Xiaomi covered by Phase H.
- Battery overhead < 2% over a 4h screen-on benchmark.
- Detection latency p99 < 1.3s on cold-launch of a shielded app.
- Shield Activity correctly handles back button, recents button, and home button.
- Friction modes match iOS Phase C semantics 1:1 (parity test).

## Risks

| Risk | Mitigation |
|---|---|
| OEMs (especially Samsung, Xiaomi) kill the monitor service | Phase H allocates dedicated time; battery opt-out + OEM-specific deep-links + stickier service. |
| `startActivity` from a foreground service blocked by some OEMs | Test matrix covers the major three; fallback to full-screen-intent notification path documented but not preferred. |
| Detection delay frustrates users | Honest copy in onboarding (G3); recommend DNS for adult content. |
| Privacy asymmetry between iOS and Android perceived as inconsistent | Disclosed in app on Android; documented in privacy listing. |
| Polling at 500ms drains battery on lower-end devices | Screen-on gate caps the worst case; benchmark gate before merge. |
| Shield stuck-on-top after pray-and-continue | `singleTop` + `noHistory` + de-dupe in `ShieldDispatcher`. |
| `PACKAGE_USAGE_STATS` permission denied | Re-check loop with explainer; commitment saves but stays inactive until granted. |
| App uninstall mid-shield | `PackageChangeReceiver` invalidates the target; shield Activity gracefully closes. |
| Suspension semantics disagree across timezones / DST | Use `Calendar.getInstance().apply { ... start-of-day }`; unit tests cover DST transitions. |
| Schema migration `0003` violates "no migrations unless asked" | Confirm before authoring; have JSON-in-friction_config fallback ready. |
| Shield Activity drawn over fingerprint / biometric prompt | `setShowWhenLocked` interaction with secure inputs is fragile; defer to system on KeyguardManager events. |
| Confessio deep-link returns to wrong tab | Deep-link includes `?return=custody`; the main app routes back on confession save. |
