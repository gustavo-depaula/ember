# Custody

> Status: spec (v1, draft). No code yet. The first `Custody` GitHub milestone gates implementation.

A discipline / focus surface for Ember that limits or blocks selected apps and websites at the OS level — and turns each blocked moment into a moment of prayer. Catholic framing: custody of the senses, mortification, *firm purpose of amendment* after confession. Fits the **Fidelity** pillar as the negative half of the rule of life — what the user *refuses*, alongside what they *do*.

The differentiator: Opal's blocked screen shows a score. **Ember's blocked screen shows a prayer.** A verse, an aspiration, a Sacred Heart image — and one button: *Pray and continue blocking*.

## Documents

This README is the overview. Each phase has its own technical design doc with the major decisions, architecture, and tasks for that phase.

**v1 — Custody**
- [Phase A — Foundation](./phase-a-foundation.md) — schema, migration runner, types, repositories, hooks, routing scaffold
- [Phase B — Spiritual surface](./phase-b-spiritual-surface.md) — UI, custody session runner, examen + confessio integration, notifications
- [Phase C — iOS bound mode](./phase-c-ios-bound.md) — config plugin, Swift module, three extension targets, prayer-shield, App Group, Apple submission
- [Phase D — Android handoff + DNS walkthrough](./phase-d-android-handoff.md) — Digital Wellbeing deep-link, NextDNS / AdGuard setup
- [Phase E — Polish, locales, docs](./phase-e-polish.md) — pt-BR catechetical vocabulary, anchor pool, store assets

**v2 — Custody (Android bound mode)**
- [Phase F — Android VPN + DNS](./phase-f-android-vpn.md) — VpnService, DNS interception, single-VPN-slot UX
- [Phase G — Android UsageStats + shield Activity](./phase-g-android-usagestats.md) — foreground service, polling, full-screen overlay
- [Phase H — Android OEM polish](./phase-h-android-oem.md) — Doze, manufacturer-specific kill behaviors, Play Console

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

Each phase has a dedicated technical design doc with major decisions, architecture, and concrete tasks. The list below is a one-line summary; click through for the detail.

### Custody — v1

Phases A and B are JS-only and reversible. Phase C is the platform-locked native step and the dominant complexity gate. Phases D and E close the loop.

| Phase | Complexity | Doc |
|---|---|---|
| A — Foundation | Moderate | [phase-a-foundation.md](./phase-a-foundation.md) |
| B — Spiritual surface | Moderate | [phase-b-spiritual-surface.md](./phase-b-spiritual-surface.md) |
| C — iOS bound mode | High and gated | [phase-c-ios-bound.md](./phase-c-ios-bound.md) |
| D — Android handoff + DNS walkthrough | Low | [phase-d-android-handoff.md](./phase-d-android-handoff.md) |
| E — Polish, locales, docs | Low | [phase-e-polish.md](./phase-e-polish.md) |

Phase B is independently shippable: it delivers the spiritual frame without bound mode, and validates the data model before Phase C's native dive.

### Custody — v2 (Android bound mode)

The project's first Kotlin native module. Two enforcement halves (web via VPN/DNS, apps via UsageStats) then OEM polish. No off-the-shelf Expo Android equivalent of `react-native-device-activity` — this is hand-written.

| Phase | Complexity | Doc |
|---|---|---|
| F — Android VPN + DNS | Moderate–High | [phase-f-android-vpn.md](./phase-f-android-vpn.md) |
| G — Android UsageStats + shield Activity | High | [phase-g-android-usagestats.md](./phase-g-android-usagestats.md) |
| H — Android OEM polish | Low per task; irreducible OEM matrix | [phase-h-android-oem.md](./phase-h-android-oem.md) |

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
