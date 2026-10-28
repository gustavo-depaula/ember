---
paths:
  - "packages/divinum-officium/**"
  - "content/do/**"
  - "scripts/*do*"
---

# Divinum Officium

DO's Perl is the spec. The corpus ships DO's `web/www` `.txt` files verbatim and `parseDoFile` structures them at load time; everything DO encodes as Perl is ported to TypeScript in `packages/divinum-officium/`, upstream bugs included, and the differential suites (`src/**/differential.test.ts`, harnesses in `test/perl-harness/`) hold it char-for-char against the Perl.

- Port a routine by reading its Perl and mirroring it statement for statement. When the output diverges, the Perl wins, even where the rubrics book disagrees.
  The one exception is the column language: where the Perl renders a text in the fallback language although the requested language has it (the martyrology on All Souls and the Monastic 14 November, a Matins psalm after a lesson that fell back to English), ours keeps the requested language, by the user's choice.
- After a re-sync or engine port, confirm the differential suites actually ran. They `describe.skipIf` silently when the `content/do` submodule is uninitialized or `.do-golden-lib/` is absent, so a green run may have compared nothing.
- Re-sync = `pnpm sync:upstream do`, which checks out upstream master inside `content/do`, lists the `cgi-bin` files that changed, and runs `pnpm validate:do` and the engine's tests. Then review `git diff <old>..<new> -- web/www web/cgi-bin` there, port any `cgi-bin` changes, and commit the new gitlink. The PR itself shows only the SHA bump, so summarise the upstream diff in its description.
- The hours harness is `Pofficium.pl` (one version, two languages). `Cofficium.pl` compares two *versions* and silently forces column 2 to Divino Afflatu when both match.
- `.do-golden-lib/` needs CGI.pm and URI. metacpan is blocked in the agent sandbox: clone `github.com/leejo/CGI.pm` and `github.com/libwww-perl/URI` and copy each `lib/` in.
- Keep the package's module graph free of static import cycles (e.g. `psalmi.ts` must never import `matins.ts`). Node and vitest tolerate a cycle; Metro/Hermes can bind the import to `undefined` and crash only on device.
