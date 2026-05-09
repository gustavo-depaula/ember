# Phase C — iOS bound mode

> Scope: real OS-level shielding on iOS via Apple's Screen Time API stack, with the prayer-shield as the centerpiece.
> Complexity: **High and gated.** First custom Expo native module in the repo, first config plugin, first time leaving the managed workflow, three iOS extension targets, and an external dependency on Apple's Family Controls entitlement.
> Depends on: Phase A (data layer), Phase B (UI surface). Phase B's `bound` severity placeholder is what this phase fills in.
> Independently shippable: no. Phase C only delivers value once it lands; pre-Phase-C, `bound` reads as `firm` per the platform note.

## Goal

When a user activates a `bound` commitment and opens a shielded app, iOS overlays Ember's prayer-shield: a sacred-art card with a short verse or aspiration and one button — *Pray and continue blocking*. A second button offers a friction-aware path to disable temporarily (`wait`, `prayer`, `confession-only`). All of this works against opaque tokens — Ember literally cannot enumerate which apps the user picked. The implementation lives in an Expo Module + Config Plugin + three iOS extension targets, sharing state with the main app via an App Group.

This phase is the platform-locked native step. Phases A and B are reversible JS work; Phase C commits the project to native code, a custom dev client, an Apple entitlement, and a TestFlight pipeline.

---

## Background: what Apple gives us, and what they don't

Three frameworks, each with a corresponding extension target:

| Framework | Extension target | Role |
|---|---|---|
| `FamilyControls` | (none — runs in main app) | Authorization, the picker that returns opaque selections |
| `ManagedSettings` | (none) | Apply/remove restrictions on the active selection |
| `DeviceActivity` | **`DeviceActivityMonitor`** | OS-scheduled wake-ups; switches restrictions on/off; observes thresholds |
| (`ManagedSettings.shield`) | **`ShieldConfiguration`** | Renders the shield UI when a shielded app is opened |
| (`ManagedSettings.shield`) | **`ShieldAction`** | Handles button taps on the shield |

The shield UI is **not** a full SwiftUI view we own. Apple gives us a fixed shape: an icon (UIImage), a title (attributed string), a subtitle (attributed string), a primary button label, a secondary button label, and a few colors. Long-form prayer rendering inside the shield is not possible — we work within the shape.

Authorization mode: `.individual` (self-restraint). Selection is opaque: `applicationTokens`, `categoryTokens`, `webDomainTokens` — the developer never sees bundle IDs.

---

## Major decisions

### C1. Library: `kingstinct/react-native-device-activity` covers ~80% of the plumbing

Reviewed in the README. Decision: use it as the FamilyControls + Picker + ManagedSettings + extension-target boilerplate layer. The library ships:

- A Swift bridge for `requestAuthorization(.individual)`, `displayFamilyActivityPicker(...)`, `blockSelection(...)`, `unblockSelection(...)`
- Templates for the three extension targets, configurable via the Expo config plugin
- App Group + entitlement wiring through the plugin
- Status polling (`getAuthorizationStatus`)

We customize the extensions where needed — particularly `ShieldConfiguration` and `ShieldAction`, which are where the prayer-shield and friction logic live. `DeviceActivityMonitor` we customize for our schedule-mapping logic.

**Fallback:** if the library proves insufficient (some Apple API not yet bridged, or the extension hooks are too coarse), fork it. Time-box the discovery to the first 3 days of Phase C — if a fork is needed, do it early and stop pretending otherwise.

### C2. App Group: `group.me.dpgu.ember` (single group, namespaced keys)

The App Group is the only practical channel between the main app and the extensions. Two options:

- **(a) Per-feature group** (`group.me.dpgu.ember.custody`). Cleaner isolation. Locks Custody's storage from any other future extension.
- **(b) Single group** (`group.me.dpgu.ember`). Forward-compatible with future extensions (a Liturgical Hours Live Activity, a Saints widget). Requires keys to be namespaced.

**Decision: (b).** Custody namespaces its keys with `custody.*`. The bundle ID `me.dpgu.ember` already establishes the convention.

### C3. UserDefaults schema in the App Group

Extensions read this on every shield trigger. Schema:

| Key | Type | Written by | Read by |
|---|---|---|---|
| `custody.commitments` | JSON `CommitmentSnapshot[]` | main app | all extensions |
| `custody.tokens.<commitmentId>` | `Data` (encoded `FamilyActivitySelection`) | main app | DeviceActivityMonitor |
| `custody.lockedUntil.<commitmentId>` | Number (epoch ms) | ShieldAction | ShieldConfiguration |
| `custody.dailyLimits.<commitmentId>` | JSON `{ limitSeconds, accumulatedSeconds, resetAt }` | DeviceActivityMonitor | ShieldConfiguration |
| `custody.shieldEvents.queue` | JSON `ShieldEvent[]` | extensions | main app (drains on launch) |

`CommitmentSnapshot` is the extension-friendly subset of `Commitment`:

```swift
struct CommitmentSnapshot: Codable {
  let id: String
  let name: String
  let friction: String              // "none" | "wait" | "prayer" | "confession-only"
  let frictionConfig: [String: Any]?
  let anchor: AnchorSnapshot
}

struct AnchorSnapshot: Codable {
  let kind: String                  // "text" | "image" | "prayer" | "lectio" | "silence"
  let title: String                 // short — fits the shield title
  let subtitle: String              // short — fits the shield subtitle
  let imageData: Data?              // pre-rendered card image
}
```

The main app keeps this in sync on every commitment create / update / archive via the Swift module's `syncSnapshots` JS-callable. The extensions read on demand.

### C4. The shield's UI shape forces anchor pre-rendering

Apple's `ShieldConfiguration` API:

```swift
ShieldConfiguration(
  backgroundBlurStyle: UIBlurEffect.Style,
  backgroundColor: UIColor?,
  icon: UIImage?,
  title: ShieldConfiguration.Label,           // attributed string + color
  subtitle: ShieldConfiguration.Label,
  primaryButtonLabel: ShieldConfiguration.Label,
  primaryButtonBackgroundColor: UIColor,
  secondaryButtonLabel: ShieldConfiguration.Label?
)
```

We can't render a 200-word Anima Christi inside the shield. We can render:

- An icon (sacred art card, ~120×120 displayed area on the shield)
- A title (~30–40 chars before truncation)
- A subtitle (~80–120 chars before truncation; varies by device)

**Decision:** at commitment-edit time in the main app, the anchor picker produces three artifacts per anchor:
1. A short `title` (≤30 chars; e.g., "Custódia")
2. A short `subtitle` (≤120 chars; the verse / aspiration)
3. A pre-rendered card `imageData` (PNG; the sacred-art card if `kind=image`, or a typeset card if `kind=text|prayer|lectio` — in v1, only `image` and bundled cards; typeset card rendering is deferred to v1.5)

For longer prayers (`kind=prayer`), the shield shows the prayer's *title* and a one-line *opening* as the subtitle. The full prayer text is shown when the user taps "Pray and continue blocking" — we deep-link into the main app's prayer renderer.

### C5. `Pray and continue blocking` deep-links into the main app

When the user taps the primary shield button:

- ShieldAction logs a `kept` event into the App Group's `custody.shieldEvents.queue`.
- ShieldAction returns `.defer` and opens `ember://custody/shield-pray/<commitmentId>` via `extensionContext.open(url:)`.
- The main app launches (or wakes), routes to a full-screen prayer view that renders the anchor's full prayer/text, and ticks a checkpoint after the user dismisses.
- The shield's restriction stays applied; the user has prayed; iOS's normal app-switching is preserved.

This is the heart of the product loop: every time the temptation hits, the user is brought through one decision moment and one prayer moment before they can return to Ember or continue blocking.

### C6. Friction modes implemented in ShieldAction

Secondary button: "Disable temporarily." Per friction:

| Friction | Behavior |
|---|---|
| `none` | Log `overrode`. Remove shield for this app for the rest of the day. Return `.defer`. |
| `wait` | Write `custody.lockedUntil.<commitmentId> = now + frictionConfig.waitSeconds`. Return `.none`. ShieldConfiguration on next trigger reads the lock and renders a countdown subtitle ("disable in 4:32") with the secondary button disabled. After expiry, secondary becomes "Confirm disable" → log `overrode` and remove shield. |
| `prayer` | Open `ember://custody/pray-to-disable/<commitmentId>` via `extensionContext.open(url:)`. Main app shows the prayer; on user mark-as-prayed, calls back into the Swift module to remove the shield. Log `overrode` with `metadata.via='prayer'`. |
| `confession-only` | Open `ember://confessio` via deep link. Secondary button on the shield reads "After confession". The user can only override by recording a confession in the Confessio surface. The Confessio screen, on save, calls into the Swift module to lift the override. Log `overrode` with `metadata.via='confession'`. |

The lock timestamps (`custody.lockedUntil.*`) and the friction policy are in UserDefaults — the extensions read them; they don't call into JS.

### C7. Schedule mapping: `ScheduleRule` → `DeviceActivitySchedule[]`

`DeviceActivitySchedule` is rigid: an `intervalStart: DateComponents`, `intervalEnd: DateComponents`, `repeats: Bool`, optional `warningTime`. It does not understand days-of-week, seasons, holy days, or fixed programs.

**Decision:** the Swift module flattens `ScheduleRule` into a list of concrete schedules; the main app re-flattens on commitment edit and on liturgical-season transitions.

Mapping table:

| `ScheduleRule` | Flattened to |
|---|---|
| `daily` (always-on `abstain`) | One schedule, `00:00–23:59`, `repeats: true` |
| `time-fence` (e.g., 21:00–07:00 daily) | One schedule, the fence times, `repeats: true` |
| `days-of-week: [Mon, Wed]` | Two schedules, one per active day, `repeats: true` (Apple's `DateComponents.weekday`) |
| `season-gated: lent` | Same as above, but registered/unregistered at season boundaries by the main app |
| `holy-days-of-obligation` | Per-occurrence; main app schedules each one as `fixed-program` of one day |
| `fixed-program: 9 days` | Nine concrete schedules, one per day |
| `times-per: 3 / week` | **Not bound-supported.** Falls back to `firm` with a UI note. (No way to express "first three times you open Instagram this week" in DeviceActivitySchedule.) |

The flattening produces a `DeviceActivity`-named registration per schedule. Activity names are `commitmentId + "_" + scheduleIndex`. When a commitment is edited, all activities matching the prefix are stopped and re-registered.

For `time-limit` (e.g., "no more than 30 min/day of YouTube"), we use `DeviceActivityEvent` with a usage threshold instead of a schedule. The DeviceActivityMonitor extension's `eventDidReachThreshold` callback fires; we then apply the shield. Reset happens via a daily `intervalEnd` callback.

### C8. Web domain shielding: explicit + Apple's curated categories

Two dimensions of web blocking:

- `ManagedSettings.shield.webDomains` — explicit list of domains
- `ManagedSettings.shield.webDomainCategories` — Apple's curated categories (`adult`, etc.)

For Ember:

- A commitment with `Target.kind = 'domain'` writes to `webDomains`.
- A commitment with `Target.kind = 'domain-list'` writes:
  - `webDomains` for our explicit list (defense in depth, captures known sites Apple may not have categorized)
  - `webDomainCategories` for the matching Apple category where one exists (`porn` → `.adult`)

The shield UI for web vs app: same `ShieldConfiguration`, our extension overrides `configuration(shielding webDomain: WebDomain)` in addition to `configuration(shielding application: Application)`.

### C9. Authorization flow with explicit recovery

Three states from `AuthorizationCenter.shared.authorizationStatus`: `notDetermined`, `denied`, `approved`.

Flow when the user toggles severity to `bound` for the first time:

1. App reads status.
2. If `approved`: proceed to picker.
3. If `notDetermined`:
   - Show explainer screen ("To enforce this commitment, Ember needs Screen Time access. We never see which apps you pick.")
   - On "Continue", call `requestAuthorization(.individual)`.
   - On approval, proceed to picker. On denial, jump to recovery.
4. If `denied`:
   - Show recovery screen ("Custody enforcement is currently disabled. To re-enable, open Settings → Screen Time and allow Ember.")
   - "Open Settings" deep-link to `App-Prefs:SCREEN_TIME` (or the closest available URL — Apple's Settings deep-link surface is unstable; fall back to `UIApplication.openSettingsURLString`).
   - Until the user re-grants, the commitment is saved at `bound` but acts as `firm`. UI on the commitment row shows "Awaiting Screen Time access."

### C10. Onboarding flow

A multi-step screen sequence the first time the user activates a bound commitment:

```
1. "Custody is your phone helping you keep your word."     [Continue]
2. "Custody is single-user. No one else controls your apps." [Continue]
3. "We never see which apps you pick — Apple keeps that private." [Continue]
4. (System sheet) "Allow Ember to manage Screen Time?"     [system]
5. (System sheet) "Pick the apps and websites this commitment covers." [system]
6. "Pick a prayer or image to show when this app opens."   [Anchor picker]
7. "Custody is active. You can pause or remove it any time." [Done]
```

Steps 4 and 5 are Apple's system sheets — we don't style them. The pre/post copy is ours.

### C11. EAS / dev-client transition

Adding `react-native-device-activity` and the Family Controls entitlement leaves the managed workflow. Concrete changes:

- `apps/app/eas.json`: add a new `development` profile `withCustody: true`. Existing profiles unchanged for now (so non-Custody dev work keeps the lighter loop). The `production` profile flips to the Custody-enabled config when Phase C ships.
- `apps/app/app.config.ts` (we may need to migrate from `app.json` to `app.config.ts` here for conditional plugin loading): includes the plugin chain only when the Custody flag is on.
- A custom dev client built once via `eas build --profile development-custody`. Engineers run against this client.
- `pnpm` scripts: `start:custody` runs against the custom client.

This is the moment the project crosses from "managed Expo" to "managed Expo + custom dev client." Document the transition in `docs/journal.md` so future devs understand the asymmetry.

### C12. Apple entitlement: file before any code

Family Controls entitlement (`com.apple.developer.family-controls`) approval is the long pole and cannot be parallelized into the build. File the request *first*, before any Phase C engineering:

- Submit via Apple Developer Portal → Capabilities → Family Controls → Request entitlement.
- Justification draft: "Ember is a Catholic prayer companion that helps users keep ascetical commitments through prayer and self-imposed restrictions on their own device. Custody uses Family Controls in Individual mode (`.individual`); the user picks which apps to shield, configures friction modes, and may revoke at any time. No second party is involved. Selections are opaque tokens; Ember never enumerates which apps the user picked."
- Provide a 60–90 second demo video of the Phase B flow + a mockup of the prayer-shield (record on a dev build with locally-enabled Family Controls).
- Review timeline: historically days–weeks; sometimes months. The request can sit in parallel with Phases A and B.

If denied, the typical revisions are sharper "self-restraint" copy and removal of any framing that implies surveillance. Build in time for one revision cycle.

### C13. Failure modes

| Failure | Behavior |
|---|---|
| Picker dismissed without selection | Commitment saves with empty `targets`; UI shows "No targets — pick apps to enforce" badge; bound is inactive until targets are set. |
| Authorization revoked from Settings while a bound commitment is active | App detects revocation on next foreground; shows a banner; commitment auto-degrades to `firm` until re-authorized. |
| User uninstalls Ember | iOS removes the entitlement; restrictions lift automatically. (This is a feature, not a bug — Custody is ascetical aid, not jail.) |
| Apple's `webDomainCategories.adult` mis-categorizes a site we want allowed | Our explicit `webDomains` list takes precedence for the *blocked* side; Apple's allow-list does not override our blocks. The reverse — Apple blocks something we'd rather allow — requires the user to remove the corresponding domain-list target. |
| User opens shielded app with no network | Shield still appears (it's local). "Pray and continue blocking" still deep-links to Ember (also local). All-offline path works. |
| App Group fails to write (iCloud sync conflict, disk full) | Detect on next sync attempt; surface a "Custody data is out of sync" banner; offer manual re-sync. |

---

## Architecture

### File layout added in Phase C

```
apps/app/modules/ember-custody-ios/
  expo-module.config.json
  index.ts                                  JS bridge type declarations
  ios/
    EmberCustodyModule.swift                Main module: authorize, picker, sync, status
    Snapshots/
      CommitmentSnapshot.swift              Codable shapes shared with extensions
      AnchorSnapshot.swift
      AppGroupKeys.swift                    Centralised key constants
    Shield/
      EmberShieldConfiguration.swift        ShieldConfigurationDataSource subclass
      EmberShieldAction.swift               ShieldActionExtension subclass
      FrictionState.swift                   Read/write lockedUntil
    Monitor/
      EmberDeviceActivityMonitor.swift      DeviceActivityMonitor subclass
      ScheduleFlattener.swift               ScheduleRule → DeviceActivitySchedule[]
    Targets/
      ActivityMonitor/Info.plist
      ShieldConfiguration/Info.plist
      ShieldAction/Info.plist

apps/app/plugins/
  withCustodyIOS.ts                         Expo config plugin

apps/app/src/features/custody/
  native/
    ios.ts                                  TS facade over the module (typed)
    fallback.ts                             No-op for non-iOS / sim
  components/
    AppTargetPickerIOS.tsx                  Wraps FamilyActivityPicker
    BoundOnboarding.tsx                     Multi-step explainer
    AuthorizationGuard.tsx                  notDetermined / denied / approved branching
    SyncStatusBanner.tsx                    Authorization revoked / out-of-sync
  shieldEvents.ts                           Drains the extension event queue on launch

apps/app/src/app/custody/
  shield-pray/[commitmentId].tsx            Deep-link target for "Pray and continue"
  pray-to-disable/[commitmentId].tsx        Deep-link target for prayer friction

apps/app/app.config.ts                       [new — replaces app.json for conditional plugins]
apps/app/eas.json                            [edited]
```

### JS-callable surface of the Swift module

```typescript
// apps/app/modules/ember-custody-ios/index.ts
export type AuthStatus = 'notDetermined' | 'denied' | 'approved' | 'unsupported'

export const EmberCustodyIOS: {
  isSupported(): boolean                       // false on iOS < 15 or simulator
  getAuthorizationStatus(): Promise<AuthStatus>
  requestAuthorization(): Promise<AuthStatus>
  presentPicker(commitmentId: string, includeWebDomains: boolean): Promise<{ tokenRef: string } | null>
  syncSnapshots(snapshots: CommitmentSnapshot[]): Promise<void>
  applyShield(commitmentId: string): Promise<void>
  removeShield(commitmentId: string): Promise<void>
  removeAllShields(): Promise<void>
  getStatus(): Promise<{ activeCommitmentIds: string[]; lockedUntil: Record<string, number> }>
  drainShieldEvents(): Promise<ShieldEvent[]>
  liftFrictionLock(commitmentId: string, reason: 'prayer' | 'confession'): Promise<void>
  openSettings(): Promise<void>                // best-effort Screen Time deep-link
}

type ShieldEvent = {
  type: 'kept' | 'overrode'
  commitmentId: string
  occurredAt: number
  via?: 'prayer' | 'confession' | 'wait'
}
```

The TS facade in `apps/app/src/features/custody/native/ios.ts` falls back to no-ops on Android / simulator / unsupported iOS. Every Custody hook calls through the facade so the rest of the codebase doesn't branch on platform.

### Config plugin sketch

```typescript
// apps/app/plugins/withCustodyIOS.ts
const withCustodyIOS: ConfigPlugin<{ teamId: string; appGroup: string }> = (config, props) => {
  config = withEntitlementsPlist(config, (c) => {
    c.modResults['com.apple.developer.family-controls'] = true
    c.modResults['com.apple.security.application-groups'] = [props.appGroup]
    return c
  })
  config = withInfoPlist(config, (c) => {
    c.modResults.NSFamilyControlsUsageDescription = 'Custody helps you keep your ascetical commitments by shielding selected apps and websites.'
    return c
  })
  // Three extension targets via withXcodeProject; uses templates from the
  // bundled native module folder.
  config = withCustodyExtensionTargets(config, props)
  return config
}
```

### Anchor card image generation

For Phase C v1, anchor card images are bundled assets (`apps/app/src/features/custody/anchors/cards/*.png`), one per starter (Sacred Heart, Christ Crucified, Our Lady, etc.). The user picks a card; the picker writes the corresponding bundled asset path into the snapshot's `imageData` (read at sync-time, encoded into UserDefaults).

Typeset cards (text rendered onto a designed background) are deferred to v1.5. They require a Skia or `react-native-skia` renderer in the main app — significant addition, not in scope here.

---

## Tasks

### T-C1. File the Family Controls entitlement request

**Procedural — first task of Phase C, before any code.** Submit the request via Apple Developer Portal with the justification draft from C12, the demo video, and screenshots. Track the ticket ID in `docs/journal.md`. While waiting, proceed with T-C2 through T-C5; the entitlement isn't needed for local dev builds, only for App Store distribution.

### T-C2. Create the custom dev client

- Migrate `apps/app/app.json` → `apps/app/app.config.ts` to enable conditional plugin loading on a `CUSTODY=1` env flag.
- Add a `development-custody` profile to `apps/app/eas.json`.
- `pnpm add react-native-device-activity` in `apps/app/package.json`.
- Build the dev client: `eas build --profile development-custody --platform ios`.
- Document the new dev workflow in `docs/journal.md`: when to use the standard dev client vs the custody one.

### T-C3. Write the Expo config plugin

`apps/app/plugins/withCustodyIOS.ts`. Uses `withEntitlementsPlist`, `withInfoPlist`, and (via the library or a custom `withXcodeProject` mod) creates the three extension targets, sets their bundle IDs (`me.dpgu.ember.activity-monitor` / `.shield-config` / `.shield-action`), entitles each with `com.apple.developer.family-controls` + the App Group, and points each at the corresponding source folder.

### T-C4. Initialize the Swift module skeleton

`apps/app/modules/ember-custody-ios/`. Create `expo-module.config.json` and `EmberCustodyModule.swift` per Expo Modules API. Wire `isSupported`, `getAuthorizationStatus`, `requestAuthorization` first — these don't need extensions and let us validate the JS bridge end-to-end before tackling the heavier surface.

### T-C5. App Group keys + snapshot codables

`apps/app/modules/ember-custody-ios/ios/Snapshots/`. Define `CommitmentSnapshot`, `AnchorSnapshot`, `AppGroupKeys` (centralized key constants — avoids string drift across the four targets). Implement `syncSnapshots(snapshots:)` that writes to UserDefaults atomically (encode to JSON, single write under `custody.commitments`).

### T-C6. ShieldConfiguration extension

`apps/app/modules/ember-custody-ios/ios/Shield/EmberShieldConfiguration.swift`. Subclass `ShieldConfigurationDataSource`. Override:

- `configuration(shielding application: Application) -> ShieldConfiguration`
- `configuration(shielding application: Application, in category: ActivityCategory)`
- `configuration(shielding webDomain: WebDomain)`
- `configuration(shielding webDomain: WebDomain, in category: WebDomainCategory)`

Each reads `custody.commitments` + `custody.lockedUntil.*` from UserDefaults, finds the active commitment(s) for this token, and returns a `ShieldConfiguration` with:

- `icon` = decoded `imageData` from the anchor snapshot
- `title` = anchor `title` as `ShieldConfiguration.Label`
- `subtitle` = anchor `subtitle`, OR a countdown if `lockedUntil > now`
- `primaryButtonLabel` = "Pray and continue blocking"
- `secondaryButtonLabel` = friction-aware ("Disable" / "Disable in 4:32" / "After confession" / "Pray to disable")

Test on a physical device (extension cannot be exercised in the simulator).

### T-C7. ShieldAction extension

`apps/app/modules/ember-custody-ios/ios/Shield/EmberShieldAction.swift`. Subclass `ShieldActionExtension`. Override `handle(action:for:completionHandler:)` and `handle(action:forWebDomain:completionHandler:)`. Implement the four friction modes per C6. For `prayer` and `confession-only`, use `extensionContext.open(url:completionHandler:)` to launch the deep-link. Append events to `custody.shieldEvents.queue`.

### T-C8. DeviceActivityMonitor extension + schedule flattener

`apps/app/modules/ember-custody-ios/ios/Monitor/EmberDeviceActivityMonitor.swift`. Subclass `DeviceActivityMonitor`. Override `intervalDidStart`, `intervalDidEnd`, `eventDidReachThreshold`. On `intervalDidStart`, apply `ManagedSettings.shield` against the relevant commitment's tokens. On `intervalDidEnd`, remove. On `eventDidReachThreshold` (used by `time-limit`), apply.

`ScheduleFlattener.swift` translates a `ScheduleRule` payload (passed from JS) into one or more `DeviceActivitySchedule` registrations. Names use the convention `<commitmentId>_<index>`.

### T-C9. AppPicker iOS component

`apps/app/src/features/custody/components/AppTargetPickerIOS.tsx`. On press, calls `EmberCustodyIOS.presentPicker(commitmentId, includeWebDomains)`. The library renders Apple's system sheet. On selection, the Swift side encodes the `FamilyActivitySelection`, writes it to `custody.tokens.<commitmentId>`, returns a `tokenRef`. The TS side stores `Target { kind: 'ios-app', tokenRef }` in the commitment.

### T-C10. Authorization guard + onboarding

`apps/app/src/features/custody/components/AuthorizationGuard.tsx` — branches on `getAuthorizationStatus()` (notDetermined / denied / approved) and renders the explainer / recovery / continue UI per C9.

`apps/app/src/features/custody/components/BoundOnboarding.tsx` — the multi-step sequence from C10. Triggered the first time the user picks `bound` severity in CommitmentEditor.

### T-C11. Sync orchestration

A `useSyncCommitmentSnapshots()` hook listens to commitment mutations and calls `EmberCustodyIOS.syncSnapshots(...)` after each write. Also runs on app foreground (recovers from any drift). Drains `custody.shieldEvents.queue` on the same trigger, logging events into `commitment_events` via the repo.

### T-C12. Web-domain shielding path

In the schedule flattener and the Swift apply logic, branch on `Target.kind`:

- `domain` / `domain-list` → write to `webDomains` and (where mapped) `webDomainCategories`
- `ios-app` / `ios-category` → write to `applicationTokens` / `categoryTokens`

The `ShieldConfiguration` overrides for web domains return the same anchor-driven UI.

### T-C13. Time-limit support via `DeviceActivityEvent`

For commitments with `kind: 'time-limit'`, register a `DeviceActivityEvent` with `threshold = limitSeconds` instead of a daily schedule. The monitor's `eventDidReachThreshold` applies the shield. A daily reset schedule (`intervalEnd` at midnight) clears `accumulatedSeconds` in UserDefaults.

### T-C14. Disable-shield deep-link handlers

`apps/app/src/app/custody/shield-pray/[commitmentId].tsx` — full-screen renderer of the anchor's full text/prayer. On dismiss, no shield change (the user prayed; the shield stays).

`apps/app/src/app/custody/pray-to-disable/[commitmentId].tsx` — same renderer, but the dismiss CTA is "I have prayed — lift the shield." On dismiss, calls `EmberCustodyIOS.liftFrictionLock(commitmentId, 'prayer')`. The Swift side removes the shield for the commitment for the rest of the day, logs `overrode` with `via: 'prayer'`.

### T-C15. Confessio override path

Edit `apps/app/src/app/confessio/index.tsx` — on a new confession record, call `EmberCustodyIOS.liftFrictionLock(commitmentId, 'confession')` for any commitment with `friction: 'confession-only'` whose user is currently in lock. Single confession lifts all such locks (no per-commitment confession state — that would be exhausting in confession prep).

### T-C16. Manual QA matrix

Test on a physical device (iOS 17+, then iOS 16):

| Scenario | Expected |
|---|---|
| First-time `bound` activation | Onboarding → auth → picker → anchor → done |
| Auth denied → recovery → re-grant | Banner clears; commitment activates |
| Open shielded app while bound active | Prayer shield appears; both buttons render |
| `Pray and continue blocking` | Deep-links to Ember prayer view; shield stays |
| `wait` friction tap → countdown → confirm | Shield re-renders with countdown; after expiry, override works |
| `prayer` friction tap | Deep-link to pray-to-disable; on prayed, shield lifts |
| `confession-only` friction | Tap deep-links to Confessio; recording confession lifts shield |
| App-cold-killed during bound period | DeviceActivityMonitor still wakes; shield still applies |
| Auth revoked from Settings | App detects on foreground; banner; degrade to firm |
| Web domain shielding (Safari) | Same shield UI |
| Web domain shielding (Chrome iOS) | Same shield UI (Chrome iOS uses WebKit) |
| Lent-only commitment outside Lent | No shield applied |
| Lent-only commitment first day of Lent | Shield applies starting at season transition |

### T-C17. TestFlight + App Review prep

- Build production-flavor with Custody plugin enabled.
- Upload to TestFlight; internal-test for a week.
- App Review submission package:
  - Privacy disclosures: Family Controls used, no data leaves device, opaque tokens
  - Demo build credentials (none — Custody is local-only)
  - Demo video: full Phase C flow on a real device
  - Justification text from C12
  - Screenshots of the prayer-shield in three states (active, countdown, confession-required)
- Plan for at least one revision cycle.

### T-C18. Journal entries

Document in `docs/journal.md` everything Apple-quirky we learn during Phase C: shield title/subtitle character limits, `extensionContext.open(url:)` quirks, App Group write-coalescing behavior, simulator vs device divergences. This phase will produce more journal-worthy material than any other.

---

## Verification

- All scenarios in T-C16 pass on a physical iPhone running the most recent two iOS major versions.
- `drainShieldEvents` reliably round-trips events from the extension to `commitment_events`.
- Authorization revocation and re-grant cycles cleanly without orphaned shields.
- TestFlight build accepted; App Review approves on first or second submission.
- DeviceActivityMonitor wakes correctly with the app cold-killed (verify via Console.app device logs).
- `webDomainCategories.adult` actually blocks known sites in Safari and Chrome (smoke test against a known-safe sample).

## Risks

| Risk | Mitigation |
|---|---|
| Apple entitlement denied or delayed | File first (T-C1); build the rest of Phase C in parallel against a locally-entitled dev build. |
| `react-native-device-activity` insufficient for our shield UX | Time-box discovery to the first 3 days; fork or fall back to direct Swift if needed. |
| Shield title/subtitle character limits more restrictive than expected | The anchor pre-rendering pipeline already accommodates short forms; truncate at known-safe lengths (30 / 120 chars). |
| App Review pushback on framing | Sharper "self-restraint" copy ready in advance; one revision cycle budgeted. |
| Extension binary bloat (App Group + image cards) | Cards are bundled in main app and copied at build time; extensions reference paths, not duplicate assets. Verify per-target binary size stays under Apple's extension limits. |
| Swift module signature drift between dev clients | Use the typed TS facade (`native/ios.ts`) as the single source of truth; runtime checks at module boot. |
| User confusion about why an app is blocked when commitment is paused | The shield UI stays applied until DeviceActivityMonitor processes the change; document the lag (minutes) in onboarding copy. |
| Deep-link to Settings → Screen Time fragile across iOS versions | Fall back to `UIApplication.openSettingsURLString` (always works); show in-app instructions as backup. |
| Anchor cards visually mediocre at v1 | Phase E ships ~6 designed cards; v1.5 adds typeset card rendering for prayer/lectio anchors. |
| Time-limit reset timing off by hours due to time-zone edge cases | Daily reset uses `Calendar.current.startOfDay` — covers DST and travel; document and test. |
