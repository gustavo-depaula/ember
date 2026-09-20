---
paths:
  - "scripts/**"
  - ".github/workflows/**"
---

# Scripts and CI

- Before deleting or renaming a script or directory, grep `.github/workflows/`. `deploy.yml`'s `paths:` filter skips script-only PRs, so a break surfaces later on an unrelated push, hides among the hourly-cron failures, and the live corpus silently goes stale.
