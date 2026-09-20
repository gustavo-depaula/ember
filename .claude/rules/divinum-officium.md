---
paths:
  - "packages/divinum-officium/**"
  - "content/do/**"
  - "scripts/*do*"
---

# Divinum Officium

Spec: `docs/features/divinum-officium.md`. DO's Perl is the spec — port upstream behaviour verbatim, bugs included, or the differential tests fail.

- After a re-sync or engine port, confirm the differential suites actually ran. They `describe.skipIf` silently when `.divinum-officium/` or `.do-golden-lib/` is absent, so a green run may have compared nothing.
- `.do-golden-lib/` needs CGI.pm and URI. metacpan is blocked in the agent sandbox: clone `github.com/leejo/CGI.pm` and `github.com/libwww-perl/URI` and copy each `lib/` in.
- Keep the package's module graph free of static import cycles (e.g. `psalmi.ts` must never import `matins.ts`). Node and vitest tolerate a cycle; Metro/Hermes can bind the import to `undefined` and crash only on device.
