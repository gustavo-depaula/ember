---
name: testflight
description: Build the iOS app locally for production and upload it to TestFlight. Use to ship a TestFlight build, or when a local iOS build or its upload fails.
---

# TestFlight

The iOS binary is built on this Mac with EAS and uploaded with Transporter. JS-only changes ship by `eas update` on push to main, so a new binary is needed only for native changes or a new store version.

## 1. Prepare

From the main checkout:

```sh
git pull --ff-only origin main && pnpm install
```

Skipping `pnpm install` after a pull fails the build with `Failed to resolve plugin for module …`.

**Version.** `apps/app/app.json` `version` names the TestFlight train. Once a version is live on the App Store, Apple closes its train. An upload to it then fails with `Invalid Pre-Release Train. The train version 'X' is closed`. Before building, compare `version` against the newest build in Transporter's Delivered list ("The app is ready for sale"), and bump the patch if they match. Leave `runtimeVersion` alone: it is a literal decoupled from the version, and changes only with a native-incompatible change.

**Disk.** A build needs about 20 GB free (`df -h /`). Its working copy goes in `$TMPDIR/eas-build-local-nodejs/<uuid>` (about 10 GB). A killed build leaves that folder behind, so delete it after any kill. Each build also leaves about 2 GB in `~/Library/Developer/Xcode/DerivedData/Ember-*`. A folder whose `info.plist` `WorkspacePath` points into `eas-build-local-nodejs` belongs to a past build and is safe to delete. Ask the user before deleting anything else.

## 2. Build

Run the build in a herdr pane so its prompts can be answered:

```sh
herdr pane split --current --direction down --cwd <repo>    # prints the new pane_id
herdr pane run <pane> "cd apps/app && pnpm eas build --platform ios --profile production --local"
```

- **Apple login prompt** (`Do you want to log in to your Apple account? (Y/n)`): answer `n` with `herdr pane send-text <pane> n` then `herdr pane send-keys <pane> Enter`. The signing credentials are stored on EAS.
- **Build number:** every build that starts takes the next build number, even one that is later killed.
- **Watching:** wait for the `eas build` process to exit (`pgrep -f 'eas build --platform ios'`), and kill it if free disk drops under 1.5 GB. Matching the shell prompt `➜` in the pane gives false positives, because Xcode's copy lines print `➜` too.
- **Output:** `apps/app/build-<timestamp>.ipa`. `Build successful` is the last line printed.

## 3. Upload

Use Transporter, which is installed and signed in as apple@dpgu.me. `eas submit` can sit at `waiting for an available submitter` for a long time.

```sh
open -a Transporter apps/app/build-<timestamp>.ipa
```

The build appears under **Active** with a **Deliver** button. Click it with `osascript -e 'tell application "System Events" to tell process "Transporter"' -e 'set frontmost to true' -e 'click at {x, y}' -e 'end tell'`:

- **Finding the button:** its buttons expose no accessibility labels, so click by screen position. Read the window frame with `get {position, size} of window 1`. Deliver sits at the right end of the first Active row, about 85% across the window and 30% down. Confirm with a `screencapture -x` cropped to the window (`sips --cropOffset` takes y before x; the screen is 2x).
- **Screen recording:** the first `screencapture` triggers a screen-recording permission prompt for the terminal. Click its Allow button only if the user agrees. It is a button named `Allow` in the process `UserNotificationCenter`.

The row then shows `UPLOADING APP`, then `DELIVERED` or `DELIVERY FAILED`. On failure, click the `1 ISSUE…` button in the same spot and read the reason. A closed train means a version bump and a new build (step 1).
