# Phase D — Android handoff + DNS walkthrough

> Scope: Android v1 closes the dignity gap with two tools — a Digital Wellbeing deep-link and a DNS-filtering setup walkthrough. No native code; no Android module.
> Complexity: **Low.** Mostly copy, screenshots, and a couple of system-deep-link helpers.
> Depends on: Phase A (data layer — for the bound-Android UI copy that reads commitment severity), Phase B (the surfaces we're augmenting).

## Goal

Until Phase F+G ship native Android shielding, Android users still need a path to actually block apps and websites today. Phase D delivers two of them, both based on the OS or a third-party service rather than Ember code:

1. **Digital Wellbeing handoff** — Android's built-in app-limit and Focus Mode UI. Ember points the user at it.
2. **DNS-based filtering setup walkthrough** — guide the user through configuring Private DNS to a Catholic-friendly resolver (Cloudflare for Families, NextDNS, OpenDNS FamilyShield).

Combined, these cover ~80% of what a porn-blocking commitment needs (web targets are the bulk) and a softer fraction of app-blocking. Phase G is what closes the last gap.

The Android `bound` severity stays disabled in v1 with explicit "coming v2" copy that points at these handoffs as today's tool.

---

## Major decisions

### D1. Lead with Cloudflare for Families (1.1.1.3); offer NextDNS as the advanced option

Four DNS resolvers in scope, each with trade-offs:

| Resolver | Pros | Cons | When to recommend |
|---|---|---|---|
| **Cloudflare for Families (1.1.1.3 / family.cloudflare-dns.com)** | Free, fast, no account, strong privacy, blocks malware + adult content by default | Fixed blocklist — no user customization | **Default.** Set-it-and-forget-it for most users. |
| **NextDNS** | Free tier 300k queries/month, custom Catholic-friendly blocklists, native filter rules, query log | Requires account, monthly cap on free tier | "Advanced" option for users who want category control beyond adult/malware. |
| **AdGuard DNS Family** | Free, no account, blocks ads + adult | Privacy posture less battle-tested than Cloudflare | Alternative if Cloudflare is blocked in the user's network. |
| **OpenDNS FamilyShield (208.67.222.123)** | Free, no account, well-known | IPv4 only on the public free tier; no DoT/DoH on the free tier easily | Legacy / fallback only. |

**Decision: Cloudflare default, NextDNS as "advanced," AdGuard as fallback, OpenDNS not surfaced.** Three options is enough; four becomes choice paralysis. Order them in the UI by recommendation strength.

### D2. Setup walkthrough format: in-app screen sequence with screenshots

Three options for the walkthrough delivery:

- **(a) External web link** to a guide on `dpgu.me`. Easiest to maintain; worst UX (user leaves the app, may not return).
- **(b) Inline in-app prose** with text-only steps. Easy; relies on the user understanding Android settings paths.
- **(c) In-app screen sequence with annotated screenshots.** More effort up front; much higher completion rate.

**Decision: (c).** Each provider gets a dedicated multi-step screen. Each step has an annotated screenshot of the relevant Android screen. pt-BR localization is text-overlay only — screenshots can be shared across locales (Android setting names are already localized by the OS in the screenshot context, but our annotations are in our copy).

### D3. Deep-link directly to Private DNS settings on Android 9+

Android added `Settings.ACTION_PRIVATE_DNS_SETTINGS` in API 28 (Android 9). On API 28+, we can deep-link directly. On older versions, we fall back to `Settings.ACTION_WIFI_SETTINGS` and tell the user to navigate manually.

**Decision: deep-link where supported; provide manual instructions otherwise.** The deep-link is best-effort — if the intent fails (unusual OEMs may not support it), fall back automatically.

### D4. Detect existing VPN; warn before setup

If the user already has a VPN active (NextDNS native app, Mullvad, corporate VPN), DNS-level blocking *is* in their hands — but it's also in conflict with Phase F's future bound mode. Detect on entry to the DNS walkthrough; show a one-line note:

> You currently have a VPN active ({name}). DNS settings on this phone may be controlled by that app. If you're using NextDNS or AdGuard, your blocking is already set up — you can skip this walkthrough.

VPN detection on Android: `ConnectivityManager.NetworkCapabilities.NET_CAPABILITY_NOT_VPN` is the canonical check. We don't get the VPN's name without `BIND_VPN_SERVICE`, which we don't request in v1. The note can say "a VPN" without naming it.

### D5. Digital Wellbeing handoff: a sequence of best-effort intents

Android's Digital Wellbeing app has different package names and entry points by manufacturer:

| OEM | Package | Notes |
|---|---|---|
| Pixel / stock Android | `com.google.android.apps.wellbeing` | Standard intents work |
| Samsung | `com.samsung.android.forest` | "Modes and Routines" / "Digital Wellbeing" |
| Xiaomi | varies; often disabled by default | May require user to enable Digital Wellbeing first |
| Other OEMs | varies | Fall back to Settings root |

Strategy: try a sequence of intents in priority order; fall back to general Settings if all fail.

```kotlin
val intents = listOf(
  Intent("com.google.android.apps.wellbeing.action.DASHBOARD"),
  Intent().setComponent(ComponentName("com.google.android.apps.wellbeing", "com.google.android.apps.wellbeing.home.HomeActivity")),
  Intent(Settings.ACTION_SETTINGS)
)
```

The opening intent is wrapped with `try`/`catch` for `ActivityNotFoundException`. The final fallback always works.

This is a small Kotlin function exposed via `expo-linking` / a tiny wrapper. We'll add a thin module-level helper rather than a full Expo Module — `expo-linking` already exposes `openURL` for `intent://` URIs, which is enough.

### D6. Android-bound copy in CommitmentEditor

When the user picks `bound` severity on Android in v1, the SeverityPicker shows:

> **Coming on Android in v2**
> For now this commitment will act as Firm — logged at examen and confession prep, with reminders. To enforce blocking on Android today:
> [Set up DNS filtering →]   [Open Digital Wellbeing →]

The two CTAs deep-link into the Phase D surfaces. Phase B's SeverityPicker placeholder is upgraded here with these CTAs.

### D7. Per-target recommendation shape

Different commitment target kinds are well or poorly served by Phase D's tools:

| Target | Phase D coverage | UI message |
|---|---|---|
| `domain` (specific site) | Excellent via DNS | "DNS will block this exactly." |
| `domain-list: porn` | Excellent via DNS | "Cloudflare 1.1.1.3 already blocks adult sites; NextDNS adds custom lists." |
| `domain-list: gambling` / `social` / `news` | Good via NextDNS only | "Use NextDNS for category lists beyond adult." |
| `android-app` (specific Android app) | Partial via Digital Wellbeing | "Digital Wellbeing can set a daily timer or pause." |

CommitmentEditor's "Bound on Android" copy is target-aware — surface the relevant tool per target.

---

## Architecture

### File layout added in Phase D

```
apps/app/src/features/custody/
  android/
    digitalWellbeing.ts                Best-effort intent helper
    privateDns.ts                      Deep-link to Private DNS settings
    vpnDetection.ts                    NetworkCapabilities check
  components/
    AndroidBoundCallouts.tsx           CTAs in CommitmentEditor for bound + Android
    DnsWalkthrough.tsx                 Provider-agnostic shell
    DnsProviderCard.tsx                Per-provider tile
    DnsCloudflareSteps.tsx             Annotated screenshots
    DnsNextDnsSteps.tsx
    DnsAdGuardSteps.tsx
    DigitalWellbeingHandoff.tsx        Explainer + handoff CTA
  copy/
    dns-providers.ts                   Provider metadata + copy keys

apps/app/src/app/custody/
  setup-dns.tsx                        New route: provider chooser → walkthrough
  setup-app-limit.tsx                  New route: Digital Wellbeing handoff

apps/app/assets/custody/
  android-private-dns/                 Annotated screenshots: stock, Samsung, Xiaomi
  digital-wellbeing/                   Screenshots for the handoff explainer

apps/app/src/lib/i18n/locales/{en-US,pt-BR}.ts   [edited: custody.dns.* + custody.android.*]
```

### Walkthrough screen shape (per provider)

Each provider walkthrough is 3–5 screens, each with one screenshot + ≤2 sentences of copy. Example for Cloudflare:

1. **Why** — "Cloudflare for Families is free, fast, and blocks malware and adult sites by default."
2. **Open settings** — "Open Settings → Network & Internet → Private DNS." [Open Settings →]
3. **Choose Private DNS provider** — Annotated screenshot: tap "Private DNS provider hostname".
4. **Enter hostname** — Annotated screenshot: type `family.cloudflare-dns.com`.
5. **Verify** — "When you tap Save, your phone will route DNS through Cloudflare. Test it: try opening a known adult site — it should fail to load."

The "Open Settings" CTA on screen 2 deep-links to `Settings.ACTION_PRIVATE_DNS_SETTINGS` per D3.

---

## Tasks

### T-D1. DNS provider metadata + copy

`apps/app/src/features/custody/copy/dns-providers.ts` — typed list of three providers with: id, name, hostname, requires-account flag, blocklist description, recommendation tier, screenshot keys.

### T-D2. Deep-link helpers

`apps/app/src/features/custody/android/privateDns.ts` — exports `openPrivateDnsSettings()`. Tries `Settings.ACTION_PRIVATE_DNS_SETTINGS` (`android.settings.PRIVATE_DNS_SETTINGS`), falls back to `android.settings.WIFI_SETTINGS`, then `android.settings.SETTINGS`. Returns `'opened-private-dns' | 'opened-wifi' | 'opened-root' | 'failed'` so the UI can adjust copy.

`apps/app/src/features/custody/android/digitalWellbeing.ts` — exports `openDigitalWellbeing()`. Tries the intent sequence from D5; returns whether the dashboard opened or only Settings.

### T-D3. VPN detection

`apps/app/src/features/custody/android/vpnDetection.ts` — exports `isVpnActive(): Promise<boolean>` using `expo-network` if its NetworkType API exposes the VPN capability, otherwise a tiny native bridge that calls `ConnectivityManager.getActiveNetwork()` + `getNetworkCapabilities(...)`. Read-only; no permissions needed beyond `ACCESS_NETWORK_STATE`.

### T-D4. DnsWalkthrough shell

`apps/app/src/features/custody/components/DnsWalkthrough.tsx` — multi-step component with prev/next, dot indicator, and a "Open Settings" CTA on the relevant step. Provider-specific step lists are passed as a prop so the shell stays generic.

### T-D5. Provider-specific step components

Three components (`DnsCloudflareSteps.tsx`, `DnsNextDnsSteps.tsx`, `DnsAdGuardSteps.tsx`), each rendering 3–5 step entries. Each entry is `{ heading, body, screenshotKey, cta? }`. Screenshots are bundled in `apps/app/assets/custody/android-private-dns/`.

### T-D6. DnsProviderCard + chooser screen

`apps/app/src/app/custody/setup-dns.tsx` — landing screen with three `DnsProviderCard`s. Selecting one opens `DnsWalkthrough` with that provider's steps.

### T-D7. Digital Wellbeing handoff screen

`apps/app/src/app/custody/setup-app-limit.tsx` + `DigitalWellbeingHandoff.tsx` — explainer ("Android's Digital Wellbeing can set per-app daily limits or pause apps. Ember will sync your commitments here once Custody v2 ships on Android. Until then, set limits manually."), then a "Open Digital Wellbeing" CTA via `openDigitalWellbeing()`. If the OEM-specific deep-link fails, fall back copy explains the path manually.

### T-D8. AndroidBoundCallouts in CommitmentEditor

`apps/app/src/features/custody/components/AndroidBoundCallouts.tsx` — rendered inside SeverityPicker when severity = `bound` and `Platform.OS === 'android'`. Contains the two CTAs from D6 and the v2 timeline note. Target-aware (D7) — picks which CTA is primary based on the commitment's targets.

### T-D9. Screenshot capture pass

Capture annotated screenshots for the three priority OEMs (stock Android, Samsung One UI, Xiaomi MIUI) of the Private DNS settings flow. Save under `apps/app/assets/custody/android-private-dns/{stock,samsung,xiaomi}/{step1.png, step2.png, ...}`. Detect OEM at runtime to pick the matching screenshot set.

OEM detection: `Build.MANUFACTURER` via `expo-device` is enough; not all OEMs need their own pack — Pixel/OnePlus/Nothing all share the stock screens. We ship two packs in v1 (stock, Samsung) and add Xiaomi as a v1.5 polish item if data shows the audience needs it.

### T-D10. Bound-Android v2-timeline copy

A single copy block reused across surfaces ("Coming to Android with Custody v2"). Single source of truth in i18n; reused by SeverityPicker, CommitmentEditor's bound section, and the home-today block when an Android user has a bound commitment that's currently inactive.

### T-D11. Smoke test on three Android variants

On a physical Pixel, a Samsung One UI device, and a Xiaomi MIUI device:

- Setup-DNS walkthrough completes for each provider.
- Private DNS deep-link opens the right Settings screen.
- Digital Wellbeing handoff lands somewhere usable.
- VPN detection correctly identifies an active NextDNS app vs no VPN.
- Bound-Android copy renders in en-US and pt-BR.

---

## Verification

- All three providers have working walkthroughs with annotated screenshots in en-US and pt-BR.
- Private DNS deep-link succeeds on Pixel and Samsung; falls back gracefully on Xiaomi if Settings.ACTION_PRIVATE_DNS_SETTINGS is unavailable.
- Digital Wellbeing handoff opens to a usable surface on each tested OEM (or the cleanest fallback).
- VPN detection correctly reflects test states (no VPN / NextDNS active / Mullvad active).
- A user can complete the Cloudflare setup in under 90 seconds following the walkthrough.

## Risks

| Risk | Mitigation |
|---|---|
| Provider hostnames change | Single source of truth in `dns-providers.ts`; document the update process in `docs/journal.md`. |
| Annotated screenshots become outdated as Android evolves | Capture-pass is a deliberate v1.x maintenance task; flag obvious staleness with a "screenshots last verified Android 14" note in the doc copy. |
| OEMs (especially Xiaomi) don't expose Digital Wellbeing | Final fallback to general Settings is always available; copy explains. |
| Cloudflare for Families blocks something legitimate | Document that the user can switch providers from the walkthrough; provide an "Undo: switch back to default DNS" companion screen. |
| User mistakes the walkthrough for actual blocking by Ember | Onboarding copy must be explicit: "Once you set this, your phone will block — not Ember. Removing it requires going back into Settings." |
| Walkthrough completion drops at the manual-typing step | Offer a copy-to-clipboard tap on the hostname; consider a long-press shortcut. |
