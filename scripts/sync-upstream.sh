#!/usr/bin/env bash
# Bring the content Ember takes from others up to what they publish today.
#
#   pnpm sync:upstream              # everything below
#   pnpm sync:upstream gregobase    # chant scores, from the live GregoBase
#   pnpm sync:upstream do           # the Divinum Officium submodule, to upstream master
#
# It changes the working tree and stops there. Nothing is committed: a chant
# correction wants a look at its diff, and a Divinum Officium bump may need its
# Perl changes ported before it is safe to ship (.claude/rules/divinum-officium.md).
set -euo pipefail
cd "$(dirname "$0")/.."

targets=("$@")
[ ${#targets[@]} -eq 0 ] && targets=(gregobase do)

sync_gregobase() {
  echo "── GregoBase"
  python3 scripts/import-gregobase.py --sync
  if git diff --quiet -- content/chants; then
    echo "   content/chants is already current."
  else
    git --no-pager diff --stat -- content/chants | tail -1
    echo "   Review: git diff --word-diff -- content/chants"
    echo "   Then:   pnpm --filter @ember/app exec vitest run src/features/chant"
  fi
}

sync_do() {
  echo "── Divinum Officium"
  # Only when absent: on a submodule already moved, `update` would put the pin back.
  [ -e content/do/.git ] || git submodule update --init --depth 1 content/do
  local pinned new
  # Measured from the commit the repo pins, so a second run reports the whole
  # pending bump and not just what arrived since the first.
  pinned=$(git rev-parse HEAD:content/do)
  # The submodule is shallow; one commit of upstream is all a diff of trees needs.
  git -C content/do fetch --quiet --depth 1 origin master
  new=$(git -C content/do rev-parse FETCH_HEAD)
  if [ "$pinned" = "$new" ]; then
    echo "   content/do is already at upstream master (${pinned:0:7})."
    return
  fi
  git -C content/do checkout --quiet --detach "$new"
  echo "   ${pinned:0:7} → ${new:0:7}"

  echo "   Texts (web/www), shipped as they are:"
  git -C content/do --no-pager diff --stat "$pinned" "$new" -- web/www | tail -1 | sed 's/^/     /'
  # The engine in packages/divinum-officium is a port of this Perl, statement
  # for statement: a change here is a change still to be made there.
  local perl
  perl=$(git -C content/do diff --name-only "$pinned" "$new" -- web/cgi-bin)
  if [ -n "$perl" ]; then
    echo "   Perl (web/cgi-bin) changed — port these to packages/divinum-officium before shipping:"
    echo "$perl" | sed 's/^/     /'
    echo "     git -C content/do diff $pinned $new -- web/cgi-bin"
  else
    echo "   Perl (web/cgi-bin): unchanged, nothing to port."
  fi

  # A failure here is the finding, not a reason to stop: the bump stays in the
  # working tree to be worked on, and the script still says how to back out.
  local failed=0
  echo "   Validating the new files with the engine's own parser…"
  pnpm --silent validate:do || failed=1
  echo "   Running the engine's tests against them…"
  local log
  log=$(mktemp)
  if pnpm --silent --filter @ember/divinum-officium test >"$log" 2>&1; then
    grep -E 'Test Files|Tests ' "$log" | sed 's/^/    /'
  else
    failed=1
    grep -E '^ *(FAIL|×)|Test Files|Tests ' "$log" | sed 's/^/    /'
    echo "     full output: $log"
  fi
  echo "   The differential suites skip silently without .do-golden-lib/; check they ran."
  echo "   To keep the bump: git add content/do   (summarise the upstream diff in the PR)"
  echo "   To drop it:      git submodule update --depth 1 content/do"
  if [ "$failed" = 1 ]; then
    echo "   ✗ The engine does not hold against the new upstream yet." >&2
    status=1
  fi
}

status=0
for target in "${targets[@]}"; do
  case "$target" in
    gregobase) sync_gregobase ;;
    do) sync_do ;;
    *)
      echo "unknown upstream '$target' (gregobase, do)" >&2
      exit 1
      ;;
  esac
done
exit $status
