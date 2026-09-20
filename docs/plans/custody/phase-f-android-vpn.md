# Phase F — Android VPN + DNS

> Scope: Android-side enforcement of *web* targets via a local `VpnService` that intercepts DNS. App-target enforcement is Phase G; this phase only handles domains and domain-lists.
> Complexity: **Moderate–High.** First Kotlin native module in the project. The VPN-service shape is well-understood (DNSNet, AdGuard, NextDNS all do it) but doing it cleanly inside an Expo Module — with the Custody-specific snapshot sync, friction states, and the Phase G coexistence story — is the hard part.
> Depends on: Phases A–E shipped (v1). Custody v2 milestone opens with this phase.

## Goal

After Phase F, an Android user with a `bound` commitment that targets domains or a curated domain-list (porn/gambling/social/news) actually has those domains blocked at the OS level. Browsers — Chrome, Firefox, Samsung Internet, anything — fail to resolve the blocked hosts and show a network error. Web targets are now first-class on Android.

App-target enforcement (Instagram by package name) waits for Phase G; this phase explicitly does not shield apps. The two halves combine in v2.0; v1.x ships F+G together.

---

## Background: how Android local-VPN filters work

Android's `VpnService` lets a single app become the system's VPN. Once active:

- The OS routes all device IP traffic through a `tun` interface owned by our service.
- We read raw IP packets from the `tun` file descriptor.
- We choose what to do with each: forward to the real network (transparent), drop, or rewrite.
- Outbound DNS is UDP/53 (and TCP/53). We inspect those packets, parse the DNS question, and either drop / NXDOMAIN-respond (block) or forward to an upstream resolver (allow).
- Non-DNS traffic is forwarded transparently — we are not a content firewall, only a DNS filter.

Reference implementations: [DNSNet](https://github.com/t895/DNSNet), [AdGuard's Android client](https://github.com/AdguardTeam/AdguardForAndroid), Blokada. Our shape is closest to DNSNet's "DNS-only mode."

What this gives us:

- Web domain blocking that works in every browser, including Chrome's DoH-disabled mode.
- Coverage across the entire device (system apps, embedded WebViews, server pings).

What it does **not** give us:

- App shielding (Phase G).
- Robustness against browsers using DNS-over-HTTPS (Chrome, Firefox, Brave by default). We address this in F8.
- Coverage when the user's own NextDNS or Mullvad app is active (single-VPN-slot conflict; F9).

---

## Major decisions

### F1. DNS-only architecture, not packet inspection

Two architectural extremes:

- **(a) DNS-only**: parse only UDP/TCP DNS traffic; transparently forward everything else. What DNSNet does. Lightweight, low battery, easy to reason about.
- **(b) Full packet inspection**: read every packet, do SNI sniffing on TLS, block by hostname even for IPs. What AdGuard's pro tier does. Heavy, complex, high battery cost, brittle against ECH (Encrypted Client Hello).

**Decision: (a).** Custody is an ascetical aid, not enterprise content filtering. DNS-only catches ~95% of the web traffic we care about (a porn site that the user can navigate to by IP is not realistic in practice). The simplicity buys us reliability and battery.

Future-proofing: the interface boundary leaves room for (b) later — `EmberVpnPipeline` is the abstraction; v1 has only `DnsFilter` plugged in.

### F2. Upstream resolver: configurable, default to current Private DNS or 1.1.1.1

When a query is allowed, we forward it. To where?

Three options:

- **(a) System resolver** — read the OS's current DNS via `LinkProperties.dnsServers`. Uses whatever the user already configured (e.g., Cloudflare for Families from Phase D, or their carrier).
- **(b) Hardcoded 1.1.1.1** — predictable; ignores user setup.
- **(c) User-configurable** — Custody settings expose an upstream resolver picker.

**Decision: (a) with (c) as a settings escape hatch.** Default behavior respects the user's existing setup — if they followed Phase D's walkthrough and enabled Cloudflare for Families, queries we *allow* still go through Cloudflare's adult-blocking, providing two layers of defense. If the system resolver is unavailable (e.g., empty `LinkProperties`), fall back to `1.1.1.1`.

Settings exposes "Upstream DNS" (advanced) for users who want to override.

### F3. DoH/DoT bypass: best-effort, document the limit

Modern browsers ship DNS-over-HTTPS (DoH) on by default — Chrome, Firefox, Brave. When DoH is in use, our DNS interception sees nothing (the queries go over HTTPS to a public DoH endpoint, which our VPN forwards as opaque TCP/443 traffic).

Three approaches:

- **(a) Block known DoH endpoints by IP.** Maintain a list of public DoH provider IPs (`1.1.1.1:443`, `8.8.8.8:443`, `8.8.4.4:443`, etc.) and reject TCP/443 SYNs to them. Forces browsers to fall back to system DNS (which we control).
- **(b) Detect via SNI**. Read TLS ClientHello SNI; reject `cloudflare-dns.com`, `dns.google`, `mozilla.cloudflare-dns.com`, etc. Stops working when ECH lands broadly.
- **(c) Document the limit; tell the user how to disable DoH in their browser.**

**Decision: (a) for known providers + (c) for the limit.** Maintain a DoH-IP blocklist as a separate JSON file shipped with the app; reject SYNs to those IP+port combinations during the VPN's packet inspection (one lookup per outbound TCP SYN — manageable). This stops the vast majority of DoH browser users without false-flagging legitimate traffic. Document the residual gap (newer or self-hosted DoH endpoints) in onboarding copy and offer per-browser instructions to disable DoH.

ECH (Encrypted Client Hello) when widely deployed will eventually break (b); (a) survives because it operates on IPs, not hostnames.

The DoH-blocking is a setting the user can toggle; defaults to **on** for `bound` commitments with web targets.

### F4. Blocklist data structure: domain trie

Per-commitment target lists join into a single global "blocked domains" set the VPN service consults on every DNS query. Naive `HashSet<String>` works for ~10k entries; goes south at 100k+ once we add curated lists.

**Decision: a domain trie keyed by reversed labels.** `instagram.com` is stored as `com → instagram → ★`. A query for `cdn.instagram.com` reverses to `com.instagram.cdn`, walks the trie, and matches at `com → instagram → ★`. Wildcards (`*.instagram.com`) are first-class; subdomain matches are the common case for porn-list curation.

Implementation: `DomainTrie.kt` — single class, ~60 lines, no external dependency. Rebuilt on every snapshot sync from JS (Phase A's repository).

### F5. Single-VPN-slot UX: detect, explain, never silently take

Android allows exactly one active VPN at a time. If the user already has NextDNS, Mullvad, or a corporate VPN active, activating Custody's VPN displaces theirs.

**Decision: detect on every activation attempt; require explicit user choice.**

```
User toggles bound on a web-target commitment for the first time:
1. VpnService.prepare(ctx) returns null if we already have permission, else an Intent.
2. We additionally check ConnectivityManager for an active VPN.
3. If active VPN belongs to another app:
   - Block activation
   - Show: "Custody can't run alongside another VPN. {OtherApp} is currently active.
     To use Custody, disable it first. Or keep {OtherApp} and configure your blocking there."
   - Two CTAs: "Open Settings → VPN" and "Cancel"
4. If no other VPN: present the OS VPN-permission dialog.
```

We never silently take the slot. Even if the user allows the system dialog, our service refuses to start until the conflict is explicitly resolved.

### F6. Snapshot sync: mirror Phase C, store under `SharedPreferences`

Phase C established the pattern: main app keeps a snapshot of all commitments in shared storage, native side reads it on demand, drains an event queue back. Phase F reuses the pattern with Android's `SharedPreferences` and a JSON serialization:

| Key | Type | Written by | Read by |
|---|---|---|---|
| `custody.commitments.json` | JSON `CommitmentSnapshot[]` | main app (JS) | VPN service |
| `custody.blockedDomains.json` | JSON `string[]` (flattened from snapshots) | main app | VPN service |
| `custody.upstreamDns` | string | main app (settings) | VPN service |
| `custody.dohBlock` | boolean | main app (settings) | VPN service |
| `custody.eventQueue.json` | JSON `BlockEvent[]` | VPN service | main app (drains on foreground) |

The VPN service reads on every commitment-snapshot change (broadcast intent from the JS side) and rebuilds the trie. The flattened `blockedDomains` is computed in JS so the native side doesn't have to know about Target shapes — it gets a flat list and a trie to build.

### F7. Bound severity per-target: web targets active in Phase F, app targets still pending

Multi-target commitments (e.g., "no Instagram + no instagram.com") are normal. After Phase F, only the *web* targets of those commitments are enforced; the *app* targets remain "coming v2" (Phase G).

The CommitmentEditor surfaces this clearly: per-target status row showing "Active" for web targets and "Coming when Phase G ships" for app targets, both visible. The user always knows what's on and what's off.

### F8. Logging: minimal, never the queries themselves

A web blocker is in a unique privacy position: the queries it sees would be a complete browsing history if logged. The VPN service:

- Logs **counts** per blocked domain per day (for the falls log)
- Logs **timestamps and commitment IDs** for blocked queries
- Never logs **the queries themselves** beyond hashed identifiers
- Never logs **allowed queries**
- Has no analytics, no telemetry, no remote logging

The `BlockEvent` posted to the queue contains: `{ commitmentId, occurredAt, targetKind: 'domain'|'domain-list', targetId: string }`. The actual blocked hostname is *not* in the event — only the matching target. That's enough to mark a fall in commitment_events without recording browsing.

### F9. Performance budget

A device-wide VPN sits in the hot path of every network operation. Acceptable overhead:

- DNS: <2ms per query (trie lookup is O(labels) — negligible). UDP forwarding socket.
- Non-DNS forwarding: <1ms per packet (the OS still does most of the work; we just relay the buffer).
- Battery: <1% additional drain over 24h with normal usage. Measured against a baseline of no VPN.

Budget is enforced via a smoke-test pass before merge: a benchmark script runs network operations and measures both metrics. Any regression > 10% is a blocker.

### F10. Restart resilience

The VPN service must:

- Survive the OS killing it (use `START_STICKY`).
- Restart automatically when the user reboots, if `bound` web commitments exist (boot receiver, conditioned on a snapshot saying so).
- Reconnect when the network changes (Wi-Fi to mobile, etc.).
- Stop cleanly when the last bound web commitment is paused or archived.

A foreground service notification (LOW importance) advertises that Custody is active; tapping it opens the Custody overview. This is required by Android 14+ and useful UX.

---

## Architecture

### File layout added in Phase F

```
apps/app/modules/ember-custody-android/
  expo-module.config.json
  index.ts                                   JS bridge type declarations
  android/
    src/main/
      java/me/dpgu/ember/custody/
        EmberCustodyModule.kt                Main module: snapshot sync, start/stop VPN
        vpn/
          EmberVpnService.kt                 VpnService implementation
          DnsFilter.kt                       DNS packet inspection + decision
          DnsResolver.kt                     UDP forwarding to upstream
          DomainTrie.kt                      Reversed-label trie
          DohBlocker.kt                      Known-DoH-IP rejection
          PipelineRouter.kt                  Routes packets between filters
        snapshots/
          CommitmentSnapshot.kt              Codable matching iOS shape
          AppGroupKeys.kt                    SharedPreferences key constants
          SnapshotStore.kt                   Read/write SharedPreferences
        events/
          BlockEvent.kt
          EventQueue.kt
        boot/
          BootReceiver.kt                    Re-arm on device boot
        settings/
          UpstreamDnsResolver.kt             Read system DNS or configured upstream
      AndroidManifest.xml                    Service declaration, BIND_VPN_SERVICE perm
      res/values/strings.xml                 Foreground notification copy
  android/build.gradle                       Kotlin, Compose, no third-party deps for VPN

apps/app/src/features/custody/
  android/
    vpnControl.ts                            JS facade for the module
    blocklists/
      doh-providers.json                     Known DoH IPs to block
  components/
    AppTargetPickerAndroid.tsx               Phase G placeholder; AppPicker wired in G
    BoundActivationGuardAndroid.tsx          VPN-conflict / permission flow
    BoundCommitmentTargetStatus.tsx          Per-target Active / Coming v2 row

apps/app/app.config.ts                       [edited: ember-custody-android plugin]
apps/app/eas.json                            [edited: Android variant uses custody plugin]
```

### JS bridge surface

```typescript
// apps/app/modules/ember-custody-android/index.ts
export const EmberCustodyAndroid: {
  isSupported(): boolean
  hasVpnPermission(): Promise<boolean>
  hasVpnConflict(): Promise<{ hasConflict: boolean; conflictingApp?: string }>
  requestVpnPermission(): Promise<'granted' | 'denied' | 'cancelled'>
  syncSnapshots(snapshots: CommitmentSnapshot[]): Promise<void>
  startVpn(): Promise<void>
  stopVpn(): Promise<void>
  getVpnStatus(): Promise<'inactive' | 'active' | 'starting' | 'error'>
  drainEvents(): Promise<BlockEvent[]>
  setUpstreamDns(value: 'system' | string): Promise<void>
  setDohBlock(enabled: boolean): Promise<void>
}
```

### Packet flow inside `EmberVpnService`

```
[tun read]
   ↓
[parse IP packet]
   ↓
   ├── UDP/53 or TCP/53 → DnsFilter
   │      ├── parse DNS query; extract hostname
   │      ├── DomainTrie.contains(hostname) → block: synthesize NXDOMAIN, write back to tun
   │      └── allow: forward to UpstreamDnsResolver, write response back to tun
   ↓
   ├── TCP SYN to known DoH IP+port → drop (if dohBlock enabled)
   ↓
   └── any other → forward transparently
```

### Snapshot sync flow

```
JS: useUpdateCommitment mutation
   → repo.updateCommitment(...)
   → buildSnapshots(allActiveBoundCommitmentsWithWebTargets)
   → EmberCustodyAndroid.syncSnapshots(snapshots)
       → SnapshotStore.write(snapshots)
       → broadcast intent ACTION_CUSTODY_SNAPSHOT_UPDATED
           → EmberVpnService catches intent
           → rebuild DomainTrie from snapshots
           → no VPN restart required
```

---

## Tasks

### T-F1. Kotlin Expo module skeleton

`apps/app/modules/ember-custody-android/`. Create `expo-module.config.json` and the Gradle setup. The module exports `EmberCustodyModule.kt` with `isSupported`, `hasVpnPermission`, `requestVpnPermission`, `getVpnStatus` first — these are the simplest entry points that don't require the VPN service running. Validate the JS bridge end-to-end before going deeper.

### T-F2. AndroidManifest declarations

Declare `EmberVpnService`:

```xml
<service
    android:name=".vpn.EmberVpnService"
    android:permission="android.permission.BIND_VPN_SERVICE"
    android:exported="false"
    android:foregroundServiceType="systemExempted">  <!-- Phase G upgrades to special-use -->
  <intent-filter>
    <action android:name="android.net.VpnService" />
  </intent-filter>
</service>
```

Plus permissions: `BIND_VPN_SERVICE`, `FOREGROUND_SERVICE`, `POST_NOTIFICATIONS`, `RECEIVE_BOOT_COMPLETED`, `ACCESS_NETWORK_STATE`. The `foregroundServiceType` will switch to `specialUse` in Phase G when we add the monitor service alongside.

### T-F3. `DomainTrie` implementation

`vpn/DomainTrie.kt`. Reversed-label trie with `★` terminal marker for "any subdomain matches." API: `add(domain: String, wildcard: Boolean)`, `contains(host: String): Boolean`, `clear()`, `rebuildFrom(domains: Iterable<String>)`. Unit tests covering exact match, wildcard subdomains, mixed-case, IDN, and edge cases (empty hostname, trailing dot, root).

### T-F4. `DnsFilter`

`vpn/DnsFilter.kt`. Parses DNS queries from raw UDP packets per RFC 1035 (read header, name decompression, query type). Calls `DomainTrie.contains`. On block: synthesize an NXDOMAIN response, write back to the tun. On allow: hand off to `DnsResolver`. Supports A and AAAA; ignores TXT/MX/SRV blocking (forwards transparently — those don't carry web traffic).

TCP/53 (used by some clients for large responses) is handled too: same parser, different framing.

### T-F5. `DnsResolver` (upstream forwarder)

`vpn/DnsResolver.kt`. Holds a UDP socket pool to the upstream resolver (default: system DNS via `LinkProperties.dnsServers[0]`, fallback `1.1.1.1`). Forwards parsed queries; receives responses; writes back to tun with the appropriate framing. Times out at 2s and synthesizes SERVFAIL.

`UpstreamDnsResolver.kt` provides the upstream IP — reads `LinkProperties` if `setting=='system'`, else parses the configured upstream string.

### T-F6. `EmberVpnService` skeleton

`vpn/EmberVpnService.kt`. `extends VpnService`. On `onStartCommand`:

- Build the tun interface: `Builder().addAddress("10.99.99.1", 30).addRoute("0.0.0.0", 0).addRoute("::", 0).addDnsServer("10.99.99.2").establish()`
- Start a foreground notification ("Custody is active").
- Spawn a thread that reads the tun fd in a loop, classifies packets, dispatches to `DnsFilter` / `DohBlocker` / transparent-forward.
- Return `START_STICKY`.

On `onDestroy`: close tun, stop foreground.

### T-F7. `DohBlocker` (Phase F8)

`vpn/DohBlocker.kt`. On every outbound TCP SYN: parse destination IP+port; check against the bundled `doh-providers.json` list; drop if matched. Reads `custody.dohBlock` setting from SharedPreferences on init and on broadcast.

### T-F8. Snapshot store + broadcast intent

`snapshots/SnapshotStore.kt`. Reads/writes JSON to SharedPreferences. `EmberCustodyModule.kt` exposes `syncSnapshots(...)` to JS, which serializes and writes; on success, sends an `Intent(ACTION_CUSTODY_SNAPSHOT_UPDATED)` ordered broadcast caught by the VPN service (when running) to rebuild its trie.

The flattening from `CommitmentSnapshot[]` to `domains[]` happens in JS:

```typescript
function flattenWebTargets(snapshots: CommitmentSnapshot[]): string[] {
  return snapshots.flatMap(s =>
    s.targets.flatMap(t => {
      if (t.kind === 'domain') return [t.domain]
      if (t.kind === 'domain-list') return BLOCKLISTS[t.listKey] // imported from bundled JSON
      return [] // ios-* and android-app skipped here; android-app handled in Phase G
    })
  )
}
```

### T-F9. Block event recording

`events/EventQueue.kt`. Append-only file in app private storage. `DnsFilter` calls `EventQueue.append(BlockEvent(...))` on each block. `EmberCustodyModule.drainEvents()` reads the file, returns the events to JS, truncates the file. JS writes the events into `commitment_events` via the repo.

Events do **not** include the blocked hostname (F8). They include: `commitmentId`, `targetKind`, `targetId`, `occurredAt`. That's enough to log a `fell` event with metadata sufficient for examen.

### T-F10. VPN-conflict guard UI

`apps/app/src/features/custody/components/BoundActivationGuardAndroid.tsx`. On entry to bound activation flow on Android:

1. Calls `hasVpnConflict()`.
2. If conflict: shows the explainer + two CTAs from F5.
3. If no conflict: calls `requestVpnPermission()` which presents the OS VPN dialog.
4. On permission granted + no conflict: calls `startVpn()`.

### T-F11. Per-target status row in CommitmentEditor

`BoundCommitmentTargetStatus.tsx`. Renders one row per target: target description, status indicator. After Phase F: web targets show "Active on Android" with a green dot; app targets show "Coming with Phase G" with a gray dot. After Phase G ships, this component reads both and renders both.

### T-F12. Boot receiver

`boot/BootReceiver.kt`. On `BOOT_COMPLETED`, reads SnapshotStore. If any active bound commitment with web targets exists, starts the VPN service. Avoids cold-start flicker if the user reboots their phone with active commitments.

### T-F13. Settings UI for upstream DNS and DoH blocking

A new `Settings → Custody → Advanced` surface in the JS app exposes:

- Upstream DNS (default "Use system DNS"; advanced text field for custom)
- Block known DoH endpoints (default on)

Saves call `setUpstreamDns` / `setDohBlock`. The VPN service picks up changes via SharedPreferences without a restart.

### T-F14. Performance benchmarking

`apps/app/modules/ember-custody-android/android/src/androidTest/...`: benchmark suite that:

- Runs 1000 DNS queries with a 10k-entry blocklist; asserts p99 < 5ms.
- Streams 100 MB of HTTP traffic; asserts < 5% throughput overhead.
- Measures battery delta over a 4h benchmark run.

Run on a real device before merge; record results in `docs/journal.md`.

### T-F15. DoH-providers blocklist curation

`apps/app/src/features/custody/android/blocklists/doh-providers.json`: bundled list of known public DoH endpoints with their resolved IPs. Phase F seed: Cloudflare 1.1.1.1, Google 8.8.8.8 / 8.8.4.4, Mozilla, OpenDNS, Quad9. Document refresh cadence (~every 6 months) in `docs/journal.md`.

### T-F16. Manual QA matrix

On a physical Pixel and a Samsung One UI device:

| Scenario | Expected |
|---|---|
| First-time bound activation, no prior VPN | OS dialog → service starts → notification appears |
| Existing VPN active (NextDNS app) | Conflict guard blocks activation; CTAs work |
| Single domain commitment activated | Site fails to load in Chrome (DoH off) |
| Domain-list `porn` activated | Sample known sites fail in Chrome and Firefox |
| DoH on in Chrome | Domain still blocked when DoH-block setting is on |
| DoH on, DoH-block off | Documented limit visible: domain *not* blocked |
| Pause commitment | VPN still runs (other commitments active); affected domain unblocks |
| Pause last bound web commitment | VPN stops; notification clears |
| Reboot phone with active bound commitment | Service auto-starts via boot receiver |
| Network switch (Wi-Fi → cellular) | Filtering continues |
| App force-quit | Service survives (START_STICKY) |
| Force-stop the service via Settings | Custody surfaces a banner; commitment marked inactive until re-arm |

### T-F17. Journal entries

In `docs/journal.md`: VPN-permission UX patterns, OEM-specific quirks (Samsung's "Battery Optimization" interaction with our service), DoH endpoint list maintenance, performance numbers, single-VPN-slot framing.

---

## Verification

- All scenarios in T-F16 pass on Pixel and Samsung devices.
- Performance budget (F9) holds.
- DNS interception works for both UDP and TCP queries.
- IPv6 (AAAA) queries are filtered, not just IPv4.
- The trie correctly handles wildcard subdomains in real-world domain lists.
- The block-event log accumulates without ever recording the blocked hostname.

## Risks

| Risk | Mitigation |
|---|---|
| Single-VPN-slot conflict surprises users | Detect-and-explain flow (F5); never silent. |
| DoH adoption broader than the bundled list | Setting toggle + documented limit in onboarding; refresh DoH list on a 6-month cadence. |
| ECH (Encrypted Client Hello) eventually breaks SNI-based DoH detection | We use IP+port detection (F3), which survives ECH; document the timeline. |
| Performance regression from packet inspection | Benchmark gate before merge; trie complexity O(labels). |
| Boot receiver restarts service on devices where the user expected Custody to be off | Boot receiver checks `custody.startOnBoot` flag (default on); user can disable in Settings → Custody → Advanced. |
| OEM kills the foreground service (Samsung, Xiaomi) | Phase H allocates dedicated time for OEM testing; battery-optimization opt-out flow at activation. |
| User expects app shielding from this phase | UI is explicit (F7): web targets active, app targets "Coming with Phase G". CommitmentEditor shows status per target. |
| TCP DNS forwarding edge cases | Treat TCP/53 as a slow path; tests cover both transports. |
| Trie memory bloat from large blocklists | Cap total domains at 250k; warn in JS when approaching the cap. |
| Block events leak browsing history through `targetId` | `targetId` is a stable list key (e.g., `porn`), not the hostname; verify in unit tests. |
