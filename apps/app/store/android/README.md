# Google Play listing

Everything the Play Console asks for that can be prepared ahead. The folders follow the
`fastlane supply` layout (`<locale>/title.txt`, `images/phoneScreenshots/…`), so they can be
uploaded by hand now and by tool later.

| Console field | File |
| --- | --- |
| App name (30) | `<locale>/title.txt` |
| Short description (80) | `<locale>/short_description.txt` |
| Full description (4000) | `<locale>/full_description.txt` |
| App icon, 512×512 | `<locale>/images/icon.png` |
| Feature graphic, 1024×500 | `<locale>/images/featureGraphic.png` |
| Phone screenshots, 1080×1920 | `<locale>/images/phoneScreenshots/` |

Default language `en-US`; add `pt-BR` as a translation. Privacy policy:
`https://ember.dpgu.me/privacy.html` (source: `apps/hearth/privacy.html`, published by the Pages
deploy on merge to `main`).

## Building and uploading

```bash
pnpm build:production:android   # EAS: signed .aab, versionCode auto-incremented
pnpm build:apk:cloud            # EAS: an installable .apk with a download link
pnpm submit:android             # EAS: upload to the internal track as a draft
```

- The first upload of a new app has to be done by hand in the Console (create the app, upload
  the `.aab` to Internal testing). `submit:android` works from the second release on and needs a
  Google service-account key; `eas submit` asks for it.
- Signing: EAS already holds an Android keystore for `me.dpgu.ember` (the `preview` builds used
  it). It becomes the *upload* key; enrol in Play App Signing when the Console offers it.
- **OTA updates.** A build takes updates from the `production` channel for its runtime version
  (the app version). Updates published before Android support landed are built from code that
  crashes on Android, so make sure `main` has published an update that includes it — the push
  that merges the Android work does this — before a build with the same version goes out.
- A new personal developer account must run a closed test with at least 12 testers for 14 days
  before Play grants production access.

To check a bundle locally without EAS (debug-signed — not uploadable):

```bash
cd apps/app && npx expo prebuild -p android && cd android && ./gradlew :app:bundleRelease
```

## Console answers

**App access** — all functionality is available without an account or login.
**Ads** — none.
**Category** — Lifestyle (or Books & Reference). **Tags** — religion, prayer.
**Target audience** — 13 and over. The app is suitable for everyone, but naming children as a
target audience brings the Families policy requirements with it.
**Content rating** — no violence, sexuality, language, drugs, gambling or user interaction; the
questionnaire should come out at the lowest rating.
**News / health / financial / government app** — no to each.
**Permissions needing a declaration** — none. Location is foreground-only; photos go through the
system photo picker (the storage permission in the manifest applies to Android 12 and older
only); there is no foreground service and no exact-alarm permission.

### Data safety

The app has no ads or analytics and needs no account; the answers below come from what the code
sends. They change when sync ships (synced data is collected, encrypted in transit and at rest),
so answer the form again with that release.

- Does the app collect or share user data? **Yes** (collect), **No** (share).
- Encrypted in transit? **Yes.** Can users request deletion? **Yes** — through the address in
  the privacy policy.

| Data type | Collected | Why | Required? |
| --- | --- | --- | --- |
| Location — approximate and precise | Yes: the Mass Times map sends the area in view, which starts centred on the user | App functionality | Optional |
| Photos | Yes: a photo attached to a correction | App functionality | Optional |
| Other user-generated content | Yes: the note on a correction | App functionality | Optional |
| Device or other IDs | Yes: a random per-install id, hashed with the network address on the server | Fraud prevention, security | Optional (only with a correction or confirmation) |

Everything else — name, email, contacts, messages, health, financial, browsing, app activity,
crash logs, diagnostics — is **not collected**. None of the above is processed "ephemerally" in
Play's sense (corrections are stored; requests appear in short-lived server logs), so do not
tick that box.
