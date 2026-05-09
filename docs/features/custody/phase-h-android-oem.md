# Phase H — Android OEM polish

> Scope: harden the Phase F + G services against manufacturer-specific battery killers; ship the Play Console submission with a clean justification; pass the OEM matrix.
> Complexity: **Low per task; the OEM matrix is irreducible.** Real devices required for verification — emulators do not reproduce the kill behaviors that matter.
> Depends on: Phases F and G shipped and stable in dev. Phase H is the closing pass for v2.

## Goal

Custody on Android needs to *stay running*. Phases F and G build the right architecture; Phase H makes it survive Samsung's "Deep sleep," Xiaomi's "Battery saver," OnePlus's "Advanced optimization," and Huawei's "PowerGenie." After Phase H, a user who set up bound mode and rebooted their phone three times still has an active shield two weeks later.

A secondary goal: pass Play Console review with a clean disclosure of what we use (`BIND_VPN_SERVICE`, `PACKAGE_USAGE_STATS`, `FOREGROUND_SERVICE_SPECIAL_USE`) and a clean disclosure of what we don't (no `AccessibilityService`, no `SYSTEM_ALERT_WINDOW`, no `USE_FULL_SCREEN_INTENT`).

---

## Major decisions

### H1. Officially-supported OEM matrix: stock + Samsung + Xiaomi

Android's OEM landscape is wide. Officially testing every brand is impractical for a solo project. Three priority tiers:

- **Tier 1 (officially supported)**: stock Android (Pixel, OnePlus on OxygenOS 13+, Nothing) — predictable behavior, the OS as Google ships it. Samsung One UI — the dominant non-Pixel OEM and the one with the most aggressive battery rules. Xiaomi MIUI / HyperOS — the dominant Brazilian-market OEM, important for pt-BR.
- **Tier 2 (best-effort)**: Huawei EMUI, Honor MagicOS, OPPO ColorOS. We don't certify these but the architecture should work; document deviations in `docs/journal.md`.
- **Tier 3 (unsupported)**: anything older than Android 12.

Tier 1 gets explicit OEM-aware code paths and tested QA. Tier 2 inherits Tier 1's mitigations and is left alone unless a specific issue is reported.

### H2. The standard mitigation pyramid

OEM kill behaviors share a common surface:

1. **Battery optimization** (universal Android API) → opt-out via `Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`. Already in Phase G.
2. **Auto-start permission** (Xiaomi, OPPO, Vivo) → app starts on boot. Specific Settings deep-links per OEM.
3. **Deep-sleep / "auto-sleeping apps" allowlist** (Samsung) → app exempted from sleep when idle. Settings deep-link.
4. **Lock-app-in-recents** (some OEMs) → user pins our app in the recents UI to prevent OEM-killing. We can only instruct, not enforce.
5. **Foreground service "stickiness"** → `START_STICKY`, low-importance notification, and the `FOREGROUND_SERVICE_SPECIAL_USE` type. Already in F+G.

Phase H stitches these together into a single onboarding sub-flow: "Help Custody stay running." The user runs through the relevant prompts in order; we check each grant before moving on.

### H3. Per-OEM deep-links: best-effort fallback chain

Most OEM-specific Settings screens are accessible via known activity components:

```kotlin
val samsungAutoSleep = ComponentName(
  "com.samsung.android.lool",
  "com.samsung.android.sm.battery.ui.BatteryActivity"
)

val xiaomiAutostart = ComponentName(
  "com.miui.securitycenter",
  "com.miui.permcenter.autostart.AutoStartManagementActivity"
)

val oppoAutostart = ComponentName(
  "com.coloros.safecenter",
  "com.coloros.safecenter.permission.startup.StartupAppListActivity"
)
```

These component names drift between OS versions. Fallback chain per OEM:

1. Try the canonical component.
2. Try the package's launcher activity.
3. Fall back to `Settings.ACTION_APPLICATION_DETAILS_SETTINGS` (the app's settings page).
4. Final fallback: general Settings.

Each step is wrapped in `try`/`catch`; the user always lands somewhere.

### H4. Detection of OEM and version

`Build.MANUFACTURER` is the entry point but it's not enough — Samsung's One UI has different behavior across versions. We use a lookup table:

```kotlin
data class OemProfile(
  val oem: String,
  val needsAutoStart: Boolean,
  val needsDeepSleepExemption: Boolean,
  val deepLinks: Map<String, ComponentName>,
)

val profiles = mapOf(
  "samsung" to OemProfile(...),
  "xiaomi" to OemProfile(...),
  "oppo" to OemProfile(...),
  "vivo" to OemProfile(...),
  "huawei" to OemProfile(...),
)
```

`Build.MANUFACTURER.lowercase()` indexes; default is the stock profile (no extra mitigations needed).

### H5. "Help Custody stay running" onboarding flow

A new sub-flow runs once after the user completes the regular bound-mode onboarding. It's gated to OEMs that need it (skipped on stock Android).

Steps for Samsung:

1. Explainer screen ("Samsung phones may sleep Custody after a few days. Two settings keep it running.")
2. Battery optimization → already done in Phase G
3. Deep sleep exemption → deep-link to "Apps that won't be put to sleep" Settings, "Add Ember"
4. Done

Steps for Xiaomi:

1. Explainer
2. Battery optimization
3. Auto-start permission → deep-link to "Manage app's auto-startup" Settings
4. "Lock in recents" tip with screenshot
5. Done

Each step verifies before continuing where possible (e.g., re-check battery-opt status). Some OEM grants can't be programmatically verified; for those, we ask the user "Did you do that?" with a screenshot reminder.

### H6. Play Console submission

The Play Console submission for v2 is the moment Custody publicly declares the Android architecture. The data-safety form needs:

- **Personal info**: none collected
- **App info**: none collected
- **Device or other IDs**: none collected
- **App activity**: none transmitted (in-app records of falls / events stay local)
- **Sensitive permissions**:
  - `BIND_VPN_SERVICE` — declared with justification: "Custody runs a local VPN to filter DNS for user-selected blocked domains. No traffic leaves the device beyond standard DNS resolution."
  - `PACKAGE_USAGE_STATS` — declared with justification: "Custody detects when a user-blocked app comes foreground in order to display the user's chosen prayer."
  - `FOREGROUND_SERVICE_SPECIAL_USE` reasons: VPN ("dnsFiltering"), Monitor ("appBlocking"). Both new in Android 14; both require explicit reason documentation.
- **Explicit non-use disclosures**:
  - "We do not use `AccessibilityService`."
  - "We do not use `SYSTEM_ALERT_WINDOW`."
  - "We do not use `USE_FULL_SCREEN_INTENT`."

The October 2025 policy update is recent enough that Play Console reviewers will check the Accessibility-non-use claim; making it explicit in the submission notes saves a back-and-forth.

### H7. Demo video for Play review

Like Apple, Google sometimes asks for a demo. Pre-record a 90-second screen capture showing:

- Empty Custody surface
- Creating a bound commitment with both web and app targets
- Permission grants (VPN dialog, Usage access, battery opt-out, OEM-specific)
- Opening a blocked website in Chrome → shield
- Opening a blocked app → prayer-shield
- Each friction mode (skim)
- Pause and resume

Captured on a Pixel + a Samsung side-by-side if budget allows.

### H8. Doze + App Standby coexistence

Beyond OEM customizations, the stock Android battery model has Doze (deep sleep when device idle) and App Standby (apps not used recently get throttled). Both interact with foreground services:

- **Foreground services are exempt from Doze restrictions** for as long as they're in the foreground state.
- `START_STICKY` ensures the OS restarts a killed service.
- `FOREGROUND_SERVICE_SPECIAL_USE` (Android 14+) with a documented reason is the modern path; without it, `dataSync` or `connectedDevice` were the closest fallbacks. We use special-use.

Verification plan: leave a test phone idle for 12+ hours with bound commitments active. After waking, verify both services are alive and the trie/snapshots are correctly arranged.

### H9. Anti-tampering: do nothing

A user can defeat Custody on Android by:

- Force-stopping the service (Settings → Apps → Ember → Force stop)
- Revoking Usage access
- Disabling the VPN
- Uninstalling Ember

We do **none** of:

- Re-asking for permissions automatically
- Re-launching the service after force-stop (the OS prevents it for ~10 minutes anyway)
- Detecting tampering and notifying via push
- Anything that smells like surveillance

Custody is an ascetical aid, not a jail. The user who tampers has already chosen to break their commitment; logging that as a fall is enough. The next examen surfaces it.

### H10. Failure-mode telemetry: zero

We collect no telemetry. We do not phone home about service kills, permission revocations, or OEM-kill events. The only way we learn about OEM problems is bug reports from users.

This is a deliberate choice: privacy posture for Custody is conservative, especially because the feature implies the user has admitted a need (porn-blocking, focus issues). Telemetry, even anonymous, would compromise that posture.

---

## Architecture

### File layout added in Phase H

```
apps/app/modules/ember-custody-android/android/src/main/java/me/dpgu/ember/custody/
  oem/
    OemProfile.kt                          Lookup table
    OemDetector.kt                         Build.MANUFACTURER + version → profile
    OemDeepLinks.kt                        Per-OEM Settings component names with fallback chain
    OemMitigations.kt                      Programmatic checks (where possible)

apps/app/src/features/custody/
  android/
    oemControl.ts                          JS facade for the OEM module
  components/
    OemMitigationsFlow.tsx                 The "Help Custody stay running" sub-flow
    OemStepCard.tsx                        Reusable step UI
    OemBanner.tsx                          Surfaces "service was killed by your phone" if detected on next foreground

apps/app/store-listings/play-store/
  custody-justification.txt                Reviewer-facing text
  custody-permissions.md                   Per-permission justification
  custody-demo.mp4                         The 90-second demo video
```

### JS bridge surface added in Phase H

```typescript
export const EmberCustodyAndroid: {
  // ...existing F + G surface...
  getOemProfile(): Promise<{
    oem: string
    needsAutoStart: boolean
    needsDeepSleepExemption: boolean
    needsLockInRecents: boolean
  }>
  openOemSetting(key: 'auto-start' | 'deep-sleep' | 'app-info'): Promise<void>
  hasMitigation(key: 'battery-opt-out' | 'auto-start' | 'deep-sleep'): Promise<boolean | 'unknown'>
}
```

`'unknown'` is the honest return for mitigations we can't programmatically verify (e.g., Samsung's deep-sleep allowlist isn't queryable).

---

## Tasks

### T-H1. OEM detection + profiles

`oem/OemProfile.kt`, `OemDetector.kt`. Define profiles for `samsung`, `xiaomi`, `oppo`, `vivo`, `huawei`, with the relevant booleans and component names. Stock Android profile has all booleans false. JS facade exposes via `getOemProfile()`.

### T-H2. Per-OEM deep-link helper

`oem/OemDeepLinks.kt`. Implements `openOemSetting(key)` with the fallback chain from H3. Returns success / fallback-level so the UI can show appropriate "manual instructions" copy when we land on a less-helpful Settings screen.

### T-H3. `OemMitigationsFlow` UI

`OemMitigationsFlow.tsx`. The "Help Custody stay running" sub-flow from H5. Reads `getOemProfile()`, conditionally renders each step. Each step uses `OemStepCard` with: explainer, screenshot for the target OEM, [Open setting] CTA, [I did it] confirmation.

### T-H4. Mitigation status banner

`OemBanner.tsx`. On every app foreground, calls `getMonitorStatus()` and `getVpnStatus()`. If either returns `'killed'` (the service was running and now isn't, despite snapshots saying it should be), surfaces a banner: "Your phone stopped Custody. Tap to fix." Tapping reopens the OemMitigationsFlow.

To detect kills: each service writes a heartbeat to SharedPreferences every 30s while running. On app foreground, JS reads the heartbeats; if older than 2 minutes while snapshots say service should be running, treat as killed.

### T-H5. Heartbeat plumbing

In `EmberMonitorService` and `EmberVpnService`: a coroutine writes `lastHeartbeatAt = now` to SharedPreferences every 30s. Cheap; doesn't change service architecture.

### T-H6. Stock Android verification

On a Pixel running the latest two Android majors:

- 12+ hour idle test: services alive, snapshots intact
- Reboot test: services restart via boot receiver
- Foreground service notification grouped correctly
- Battery cost tracked over 24h (compare to a baseline week without Custody)

### T-H7. Samsung One UI verification

On a Galaxy S running One UI:

- Run T-H6 tests
- Plus: open "Apps that won't be put to sleep" → verify Ember appears after the OemMitigationsFlow ran
- Plus: leave the phone in a drawer for 48h with no charger → verify services come back
- Plus: Battery → Power saving mode (eco) → verify services still work or degrade gracefully

### T-H8. Xiaomi MIUI / HyperOS verification

On a Redmi or Mi running HyperOS:

- Run T-H6 tests
- Plus: verify auto-start permission flow lands on the right Settings page
- Plus: lock-app-in-recents tip works (user pins; verify via subsequent battery test)
- Plus: 48h idle test
- Note: Xiaomi often disables Digital Wellbeing by default; verify Phase D's handoff still finds *something* usable

### T-H9. Play Console submission package

Compose `apps/app/store-listings/play-store/custody-justification.txt` per H6. Record `custody-demo.mp4` per H7. Update the listing copy with the Custody section. Submit. Plan for at least one revision cycle — Google reviewers ask sharper questions about the VPN justification than Apple typically does.

### T-H10. Journal entries

Document in `docs/journal.md`:

- OEM-by-OEM kill behavior observations (what we saw, what fixed it)
- Heartbeat-based kill detection — what false positives we hit
- Play Console review back-and-forth (questions asked, answers given)
- Battery cost numbers for each tier-1 OEM

### T-H11. v2 release-notes copy

Both en-US and pt-BR release notes for v2:

> Custody is now active on Android. Block apps and websites with the same prayer-shield as on iOS. Tested on Pixel, Samsung, Xiaomi.

Plus an in-app update card highlighting the new capability for users who already had Custody at v1.

### T-H12. End-to-end final pass

A full v2 verification pass on each tier-1 OEM:

- Set up bound commitments with mixed targets (web + app + curated list)
- Run for 48h with normal usage
- Verify shields trigger for both web and app targets
- Verify falls log records correctly
- Verify pause + resume + override + suspension all work
- Verify Examen and Confessio integration unchanged
- Verify the OemBanner doesn't false-positive

---

## Verification

- Tier-1 OEM matrix passes: Pixel, Samsung, Xiaomi.
- Tier-2 OEMs work uncertified (smoke test on borrowed devices if available).
- 48h idle survival on each tier-1 device with no charger.
- Play Console approves on first or second revision.
- Battery cost stays under +3% baseline over a typical day's usage.
- Heartbeat-based kill detection has < 1% false-positive rate over a week.

## Risks

| Risk | Mitigation |
|---|---|
| Tier-1 device behavior changes after a Samsung / Xiaomi OS update | Heartbeat detection surfaces the regression on next foreground; OemMitigationsFlow re-runs. |
| Play Console rejection on VPN justification specificity | Justification text already explicit; one revision cycle budgeted. |
| Play Console rejection on `FOREGROUND_SERVICE_SPECIAL_USE` reasons | Reasons are pre-justified per H6; refine if requested. |
| Per-OEM deep-link components break in a future OEM update | Fallback chain ensures the user always lands somewhere; `docs/journal.md` documents the maintenance cadence. |
| Battery overhead too high on lower-end devices | Phase G's screen-on gating already handles the worst case; Phase H tunes the heartbeat cadence if needed. |
| Heartbeat false-positives during Doze | Heartbeat threshold of 2 minutes is generous; if we still see false positives, raise to 5 minutes. |
| Tier-2 OEM (Huawei, Honor) users hit a blocker | Document workaround in `docs/journal.md`; don't list as supported until verified. |
| Review timing: Play Console + Apple App Review for the same v2 collide | Stagger submissions: Apple first (conservative reviewer schedule), Google second; release notes diff between platforms is fine. |
