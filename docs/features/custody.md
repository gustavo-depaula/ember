# Custody

> Status: spec (v1, draft). No code yet. The first `Custody` GitHub milestone gates implementation.

A discipline / focus surface for Ember that limits or blocks selected apps and websites at the OS level — and turns each blocked moment into a moment of prayer. Catholic framing: custody of the senses, mortification, *firm purpose of amendment* after confession. Fits the **Fidelity** pillar as the negative half of the rule of life — what the user *refuses*, alongside what they *do*.

The differentiator: Opal's blocked screen shows a score. **Ember's blocked screen shows a prayer.** A verse, an aspiration, a Sacred Heart image — and one button: *Pray and continue blocking*.

---

## Concepts

### Commitment

A user-authored ascetical resolution. The rule itself.

```typescript
type Commitment = {
  id: string
  name: string
  description?: string
  confessorNote?: string
  kind: 'abstain' | 'time-limit' | 'time-fence'
  targets: Target[]                  // opaque tokens, DNS keys, or domains
  schedule: ScheduleRule             // reuses plan-of-life schedule rules
  severity: 'light' | 'firm' | 'bound'
  friction: 'none' | 'wait' | 'prayer' | 'confession-only'
  shieldAnchorRef: string            // e.g., 'prayer/anima-christi'
  fallPolicy: 'log' | 'examen' | 'confession-prep'
  archived: boolean
  createdAt: number
}
```

Examples:

- "Abstain from pornographic websites — always." (`abstain`, `bound`, `confession-only`)
- "No Instagram between 21:00 and 07:00." (`time-fence`, `bound`, `wait` 5m)
- "No news sites during Lent." (`abstain`, season-gated, `firm`)
- "No more than 30 min/day of YouTube on weekdays." (`time-limit`, `bound`, `prayer`)

**Severity** decides enforcement: spiritual (logs and prompts) vs. technical (OS shields the app/site). **Friction** decides how easy escape is — implemented as policy in our shield action, not Apple/Google APIs.

### Custody session

A timed focus block *inside Ember*. Not a blocker of other apps. The user picks a duration (5/10/20/40/60 min) and an **anchor**:

- a `prayer/...` ref (e.g., `prayer/anima-christi`)
- a lectio passage
- an examen prompt
- silence + sacred art

For the window: Ember's notifications silence, screen stays awake (`expo-keep-awake`), anchor renders full-screen, gentle bell at 1/3, 2/3, end. Counts as an *Ideal* practice on the fidelity wall (configurable per user). Optionally deep-links to iOS Focus / Android DND on entry.

A commitment is a long-running rule. A custody session is a single sit-down prayer block. They compose: a Lenten user might have an active "no social media" commitment all season, and start a 20-minute Custody session for lectio each morning.

### Prayer shield (iOS, v1)

When a `bound` commitment fires and the user opens a shielded app, iOS overlays Ember's branded screen via `ShieldConfigurationDataSource`. The shield shows the commitment's anchor, a "Pray and continue blocking" button, and (if friction allows) a "Disable temporarily" path with the configured wait/prayer/confession friction. **This is the product.**

---

## Self-restraint, not parental control

Apple's framework name (*Family Controls*) implies parental control. It is not. Family Controls is the umbrella for the entire iOS Screen Time API stack (`FamilyControls` + `ManagedSettings` + `DeviceActivity`), which is the only iOS API capable of shielding apps or websites.

| Mode | Meaning | Ember? |
|---|---|---|
| `.individual` | The user authorizes restrictions on their own device, for themselves. Picker selections are opaque tokens; nothing leaves the device. | **Yes** |
| `.child` | Controlling another device via Apple Family Sharing. | No |

Ember Custody is single-user, single-device, self-restraint. No guardian, no remote, no shared account. The `com.apple.developer.family-controls` entitlement is still required (Apple's standard gate; days–weeks lead time before App Store distribution; dev builds work without it). The phrase "Family Controls" appears only in technical docs — never in user-facing UI.

---

## iOS — bound mode

### Library

`kingstinct/react-native-device-activity`. Configured as an Expo config plugin (`appleTeamId`, `appGroup`); covers `DeviceActivityMonitor`, `ShieldConfiguration`, `ShieldAction`, `FamilyControls`. Requires a custom dev client and iOS 15+. The library hosts the plumbing; Ember owns the prayer-shield UI by providing its own `ShieldConfiguration` content.

### Architecture

1. `FamilyActivityPicker` — user selects apps and categories. Selections are opaque tokens.
2. `ManagedSettingsStore` — applies app and web-domain shields.
3. `DeviceActivityMonitor` extension — OS-scheduled activation/deactivation; runs in the background even when the app is cold.
4. `ShieldConfigurationDataSource` extension — renders Ember's prayer-shield.
5. `ShieldActionExtension` — handles the friction modes on early disable.

App Group `group.me.dpgu.ember.custody` shares state between the main app and extensions.

### What can and can't be blocked

- ✓ Native apps (selected via picker), shown as shielded
- ✓ Web domains in Safari and any WebKit-based iOS browser (Chrome, Firefox, Edge — all WebKit on iOS)
- ✗ Content *inside* apps that fetch their own (Reddit, X, TikTok). Either the whole app is shielded or web access to the same content is blocked, or nothing.

### Apple entitlement

`com.apple.developer.family-controls` (Individual). File the request before any iOS code. App Store distribution blocked until approval; local dev builds work without it.

---

## Android — bound mode (v2)

Android has no first-party Family Controls equivalent. Three approaches; one was just killed.

| Path | Viable | Complexity | Shields |
|---|---|---|---|
| VPN service + DNS filter | ✓ | Moderate (Kotlin VPN service, DNS resolver, single-VPN-slot UX) | Web domains |
| UsageStatsManager + foreground service + Activity overlay | ✓ | High (long-running foreground service; OEM-variable battery behavior; full-screen Activity overlay UX) | Apps |
| AccessibilityService | ✗ killed | — | — |

The **October 30, 2025 Google Play policy update** restricted the AccessibilityService API to genuine disability features; non-accessibility automation is prohibited and apps in the focus-blocker category have been removed. Ember's Android approach avoids `AccessibilityService` entirely.

### Architecture

1. **`EmberVpnService extends VpnService`** — DNS interception against the commitment's `targets` domain list. Used by NextDNS, Blokada, AdGuard. Only one VPN slot at a time on Android — detect existing VPNs at setup, warn, let the user choose.
2. **`EmberMonitorService` foreground service** — sticky notification (`FOREGROUND_SERVICE_SPECIAL_USE`); polls `UsageStatsManager` every ~500ms. When a shielded app comes foreground, starts the shield Activity.
3. **`PrayerShieldActivity`** — full-screen Compose UI; same `shieldAnchorRef` resolution as iOS; same friction modes.

### Permissions

- `BIND_VPN_SERVICE`
- `PACKAGE_USAGE_STATS` (special access; deep-link to system Settings)
- `FOREGROUND_SERVICE` + `FOREGROUND_SERVICE_SPECIAL_USE` (Android 14+)
- `POST_NOTIFICATIONS` (Android 13+)
- `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` (deep-link only — never auto-grant)

### Limits vs iOS

| Constraint | Impact |
|---|---|
| One VPN slot only | Conflicts with corporate VPN, NextDNS, AdGuard |
| 1–3s detection delay | Shielded app briefly visible before shield Activity launches |
| Continuous foreground service | Sticky notification, battery cost |
| More bypassable | User can disable Usage Access in system settings; Custody is ascetical aid, not jail |
| Per-browser engines | DNS filter at VPN level catches all browsers — better than iOS in this one regard |

### Privacy posture differs from iOS

iOS opaque tokens hide app identities from the developer. Android's package-name model exposes them. Document this difference in onboarding copy.

---

## Integration with existing features

### Reuse

- **Schedule evaluation.** Commitments use the existing `ScheduleRule` discriminated union from `apps/app/src/features/plan-of-life/schedule.ts:18-26`. `isApplicableOn(rule, date, ctx)` at `schedule.ts:41` is the evaluator. `ScheduleContext` (season + dayCalendar) at `schedule.ts:28-31` is reused unchanged. Season-gating for Lent/Advent commitments works without new schedule types.
- **Notifications.** `apps/app/src/lib/notifications.ts:26-80` — reuse `requestNotificationPermission()` and the channel-setup pattern; add a `'custody'` channel for nudges.
- **Examen.** `apps/app/src/app/examen.tsx:13-47` already exists (six-phase Ignatian). The `peccatum` and `propositum` phases hook in: "Did I keep my resolutions today?"
- **Confessio.** `apps/app/src/app/confessio/index.tsx` already tracks confession dates. Custody adds a "falls since last confession" surface that joins `commitment_events` of type `fell` against the last confession's `recorded_at`.
- **Fidelity wall.** `apps/app/src/features/plan-of-life/utils.ts:102-113` — completed Custody sessions emit standard `Completion` rows so they roll into `buildTieredWallData()` without special-casing.
- **DB / repositories.** Match the event-sourced pattern from `apps/app/src/db/repositories/practices.ts` (`emit` / `emitBatch`).

### New code

```
apps/app/src/features/custody/                  — types, hooks, components, screens
apps/app/src/app/custody/                       — Expo Router routes (mirror /plan/, /examen.tsx)
apps/app/modules/ember-custody-ios/             — Swift module + 3 extension targets
apps/app/modules/ember-custody-android/         — Kotlin module + VPN + foreground services (v2)
apps/app/plugins/withCustodyIOS.ts              — Expo config plugin
apps/app/src/db/repositories/custody.ts         — CRUD with event-sourced mutations
apps/app/src/db/migrations/0002_custody.sql     — new tables (subject to confirmation)
```

### `app.json` additions

```json
{
  "expo": {
    "plugins": [
      ["react-native-device-activity", {
        "appleTeamId": "<TEAM_ID>",
        "appGroup": "group.me.dpgu.ember.custody"
      }],
      "./plugins/withCustodyIOS"
    ],
    "ios": {
      "entitlements": { "com.apple.developer.family-controls": true }
    }
  }
}
```

---

## Data model

```sql
commitments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  confessor_note TEXT,
  kind TEXT NOT NULL,
  targets TEXT NOT NULL,              -- JSON
  schedule TEXT NOT NULL,             -- JSON ScheduleRule
  severity TEXT NOT NULL,
  friction TEXT NOT NULL,
  shield_anchor_ref TEXT,
  fall_policy TEXT NOT NULL,
  archived INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
)

commitment_events (
  id TEXT PRIMARY KEY,
  commitment_id TEXT NOT NULL,
  type TEXT NOT NULL,                 -- 'kept' | 'fell' | 'paused' | 'overrode' | 'confessed'
  occurred_at INTEGER NOT NULL,
  note TEXT
)

custody_sessions (
  id TEXT PRIMARY KEY,
  anchor_ref TEXT NOT NULL,
  planned_seconds INTEGER NOT NULL,
  started_at INTEGER NOT NULL,
  completed_at INTEGER,
  ended_reason TEXT                   -- 'completed' | 'aborted' | 'app-killed'
)
```

The existing schema runs `0001_initial.sql` once at boot via `apps/app/src/db/client.ts:26-51`. The migration runner is naive and needs a tiny extension to support multi-file migrations before `0002_custody.sql` can land.

---

## v1 — what ships

| Layer | iOS | Android |
|---|---|---|
| Commitments (data + schedule + UI) | ✓ | ✓ |
| Custody sessions | ✓ | ✓ |
| Severity: light / firm | ✓ | ✓ |
| Severity: bound | ✓ Family Controls | "coming v2" (disabled) |
| Prayer shield | ✓ | — |
| OS handoff (Screen Time / Digital Wellbeing) | ✓ | ✓ |
| DNS setup walkthrough (NextDNS / AdGuard) | ✓ | ✓ |
| Examen integration | ✓ | ✓ |
| Confessio "falls log" surface | ✓ | ✓ |
| en-US + pt-BR locales | ✓ | ✓ |

Web hidden in v1.

---

## Milestones

Track-as-milestone convention. Two milestones: **Custody** (v1) and **Custody — v2** (Android bound mode).

### Custody — v1

Phases A and B are JS-only and reversible. Phase C is the platform-locked native step and the dominant complexity gate. Phases D and E close the loop.

#### Phase A — Foundation (cross-platform, no native)

Complexity: **Moderate.** Pure JS work; the only non-trivial bit is extending the migration runner to support multi-file migrations.

1. Spec promotion (this document).
2. Migration mechanic: extend `apps/app/src/db/client.ts` for multi-file migrations.
3. `0002_custody.sql` — `commitments`, `commitment_events`, `custody_sessions`.
4. `apps/app/src/db/repositories/custody.ts`.
5. `apps/app/src/features/custody/` — types, hooks, schedule wrappers.
6. i18n keys: en-US + pt-BR.
7. Expo Router scaffold under `apps/app/src/app/custody/`.

#### Phase B — Spiritual surface (cross-platform, JS-only)

Complexity: **Moderate.** UI breadth is the cost (Custody screens, Examen integration, Confessio falls-log, home-today block). All reversible.

8. `CommitmentList` + `CommitmentEditor` + `SeverityPicker` + `FrictionPicker` (light/firm only at this stage).
9. Custody session runner + bells + anchor picker.
10. Home today: active-commitment block.
11. Examen `peccatum` and `propositum` extensions: pull broken commitments since last examen.
12. Confessio: "falls since last confession" surface.
13. Notifications: nudges for upcoming `firm` commitments.

Phase B is independently shippable: Ember v(N+1) without bound mode but with the spiritual frame. Validates the data model before the native dive.

#### Phase C — iOS bound mode

Complexity: **High — and gated.** This is the project's first custom Expo native module, the first config plugin, the first time we leave managed Expo for a custom dev client, and it ships *three* iOS extension targets (`DeviceActivityMonitor`, `ShieldConfiguration`, `ShieldAction`) wired through an App Group. Apple's Family Controls entitlement is an external dependency that gates App Store distribution (lead time: days–weeks; dev builds work without it). Family Controls does not run in the simulator — every meaningful test requires a physical iPhone.

Risks: entitlement denial or delay; `react-native-device-activity` proving insufficient for the prayer-shield UI (fallback: fork or wrap); App Review pushback on the Custody framing (fallback: refine justification, resubmit).

14. **File the Family Controls Individual entitlement request for `me.dpgu.ember`** — before any code. Lead time: days–weeks.
15. Add `react-native-device-activity` to `apps/app/package.json`; switch to a custom dev client.
16. App Group `group.me.dpgu.ember.custody`.
17. `apps/app/plugins/withCustodyIOS.ts` — entitlement, extension targets, App Group, Info.plist.
18. `apps/app/modules/ember-custody-ios/` — Swift module exposing `authorize`, `presentPicker`, `applyShield`, `removeShield`, `getStatus`.
19. `ShieldConfiguration` extension — render the prayer-shield (anchor text/image, "Pray and continue blocking" CTA, friction-aware "Disable" path).
20. `ShieldAction` extension — friction modes (`none`, `wait`, `prayer`, `confession-only`).
21. `DeviceActivityMonitor` extension — schedule activation/deactivation per commitment.
22. `AppPicker` JS wrapper around `FamilyActivityPicker`.
23. Onboarding flow: explain, request authorization, present picker, choose anchor.
24. Manual QA on a physical iPhone (simulator does not support Family Controls).
25. TestFlight build + Apple App Review prep with Family Controls justification.

#### Phase D — Android handoff + DNS walkthrough

Complexity: **Low.** Mostly copy, screenshots, and a deep-link helper.

26. Digital Wellbeing deep-link helper.
27. NextDNS / AdGuard DNS setup walkthrough.
28. Render bound severity as "coming to Android in v2" with the DNS walkthrough as today's recommendation.

#### Phase E — Polish, locales, docs

Complexity: **Low**, but the pt-BR catechetical-vocabulary review needs a careful pass — *propósito*, *firme propósito de emenda*, *custódia dos sentidos* are theological terms that must land precisely.

29. pt-BR catechetical-vocabulary review (*propósito*, *firme propósito de emenda*, *custódia dos sentidos*).
30. Saint-quote pool for shield-empty defaults.
31. `docs/journal.md` entries for Family Controls quirks.
32. Screenshots and store-listing copy.

### Custody — v2 (Android bound mode)

The platform's first Kotlin native module. Two enforcement halves (web via VPN/DNS, apps via UsageStats), then OEM polish. No off-the-shelf Expo Android equivalent of `react-native-device-activity` — this is hand-written.

#### Phase F — Android VPN + DNS (web targets)

Complexity: **Moderate–High.** First Kotlin Expo module; VPN service must be implemented carefully (single-VPN-slot conflict, DNS-over-HTTPS bypass on some browsers, graceful denial path). Reference implementation: [DNSNet](https://github.com/t895/DNSNet).

33. `apps/app/modules/ember-custody-android/` — Kotlin Expo module skeleton.
34. `EmberVpnService extends VpnService` — DNS interception, per-commitment domain blocklist.
35. JS bridge: `startVpn`, `stopVpn`, `getVpnStatus`.
36. First-run consent: explain VPN slot conflict; system VPN dialog; handle denial.
37. Web-target commitments now show "Active on Android".

#### Phase G — Android UsageStats + shield Activity (app targets)

Complexity: **High.** A long-running foreground service that polls and launches Activities is exactly the surface OEMs aggressively kill. The 1–3s detection delay is a UX limit we cannot engineer around. The `PACKAGE_USAGE_STATS` deep-link flow is unfamiliar to most users; onboarding copy carries the load.

38. `EmberMonitorService` foreground service.
39. UsageStats poll loop + foreground-app detection.
40. `PrayerShieldActivity` (Compose) — same `shieldAnchorRef` and friction modes as iOS.
41. App-picker UX: list installed packages with launcher intents.
42. Permission flows: `PACKAGE_USAGE_STATS` deep-link, battery-optimization opt-out.
43. Friction modes implemented in `PrayerShieldActivity`.

#### Phase H — Android polish

Complexity: **Low per task, but the OEM matrix is irreducible.** Samsung One UI, Xiaomi MIUI, OnePlus OxygenOS each kill background services differently. Real devices required for verification — emulators do not reproduce these behaviors.

44. Battery / wake-lock tuning; verify foreground service survives Doze and App Standby.
45. OEM-specific testing (Samsung One UI, Xiaomi MIUI, OnePlus OxygenOS).
46. Play Console submission with VPN justification and explicit "no AccessibilityService" disclosure.
47. Update copy: bound severity is now active on Android.

### Beyond v2 — backlog

- Browser extensions (Chrome / Firefox / Safari).
- Accountability partner sharing.
- Override penances ("give X to charity to lift session").
- `practice/custody-of-eyes` and `practice/digital-fast-friday` catalog content.
- Parental / family management mode.
- Cloud sync of commitments.

---

## What we copy from Opal, and what we change

| Opal mechanic | Copy? | Notes |
|---|---|---|
| `FamilyActivityPicker` | Yes | Apple-mandated; only path |
| Token-only privacy | Yes | Embrace it in onboarding copy |
| `DeviceActivityMonitor` background scheduling | Yes | OS wakes the extension; main app can be cold |
| Custom shield UI | **Yes — and reframe** | Score → prayer |
| Friction on early disable | Yes | Implement as policy in our shield action |
| Streaks / scores / leaderboards | **No** | Fidelity, not achievement; falls go to examen |
| Paid unlock button | **No** | Unconscionable on Custody |
| Saint quotes everywhere | **Add** | Catechesis as UX |

---

## Privacy

- Commitments and `commitment_events` are stored locally only. No sync, no transmission, no analytics, in v1.
- iOS picker selections are opaque tokens — Ember literally cannot enumerate which apps the user picked. Surface this in onboarding copy.
- DNS filtering uses external resolvers; document the choice in plain language during the setup walkthrough.
- Shield content is local — never fetched at shield-trigger time. The network can't be relied on at the moment of temptation, and the moment of temptation must not leak to a server.

---

## Risks

| Risk | Mitigation |
|---|---|
| Apple entitlement delays Phase C | File request as story 14, before code. Phases A+B ship independently. |
| `react-native-device-activity` proves limiting | Fork or write thin wrapper. Time-box discovery to first 3 days of Phase C. |
| Migration runner change breaks existing data | Test on a staging DB with realistic Plan of Life data before merge. |
| Android v1 dignity gap for pt-BR users | Honest "coming v2" copy + working DNS walkthrough today; commit publicly to v2 timeline. |
| Schema additions violate "no migrations unless asked" | Confirm explicitly before story 3. |
| Confessio surface insufficient for falls-log | Scope a minimal addition into Phase B if needed. |
| Shield content authoring underspecified | Default anchor pool + per-commitment override in Phase B. |
| Google Play policy further restricts UsageStats or VPN | Avoid Accessibility entirely; document VPN+UsageStats justification in Play Console. |
| One-VPN-slot conflict on Android v2 | Detect existing VPN at setup; explain trade-off; user choice. |
| Android OEM kills the foreground service | Phase H allocates real budget for OEM testing. |

---

## Verification

- Manual on a physical iPhone (simulator does not support Family Controls):
  - Authorization prompt; deny path works.
  - `FamilyActivityPicker` opens; selections persist as opaque tokens.
  - Activate a `bound` commitment; opening a shielded app shows the Ember prayer-shield, not Apple's default.
  - Each `friction` mode behaves correctly on disable.
  - `DeviceActivityMonitor` fires at scheduled times with the app cold-killed.
  - Web-domain shield works in Safari and Chrome on iOS.
- Manual on Android: commitments + Custody sessions + Digital Wellbeing handoff + DNS walkthrough work end-to-end. Bound severity is correctly disabled with v2 copy.
- Unit tests: `ScheduleRule` evaluation under season-gated commitments; fall/kept event logging; falls-since-last-confession join.
- Component tests: `CommitmentEditor`, `CustodySession` runner, `FallsLog`.
- Stores: TestFlight build well before public release. Document Family Controls justification for App Review.

---

## Not in scope (v1)

- Accountability partner / shared logs.
- Android native shielding (deferred to v2).
- Browser extensions for desktop.
- Parental / family management mode.
- Cloud sync of commitment data.
- Paywall on the unlock button.

---

## References

- [kingstinct/react-native-device-activity](https://github.com/kingstinct/react-native-device-activity)
- [Apple — Configuring Family Controls](https://developer.apple.com/documentation/xcode/configuring-family-controls)
- [Apple — Screen Time API](https://developer.apple.com/documentation/screentimeapidocumentation)
- [Apple — Meet the Screen Time API (WWDC21)](https://developer.apple.com/videos/play/wwdc2021/10123/)
- [Google Play — Use of the AccessibilityService API](https://support.google.com/googleplay/android-developer/answer/10964491?hl=en)
- [Google Play — Policy announcement, October 30, 2025](https://support.google.com/googleplay/android-developer/answer/16550159?hl=en)
- [Android — UsageStatsManager](https://developer.android.com/reference/android/app/usage/UsageStatsManager)
- [Android — VpnService](https://developer.android.com/reference/android/net/VpnService)
- [DNSNet — open-source Android DNS filter](https://github.com/t895/DNSNet)
