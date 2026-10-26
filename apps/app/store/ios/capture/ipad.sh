#!/usr/bin/env bash
# The 13" iPad screenshots, in the store order of marketing/captions.*.txt.
# Usage: capture/ipad.sh <udid> <locale>   (en-US | pt-BR)
# Needs: an iPad Pro 13" simulator in portrait with the dev build installed,
# Metro on :8099, `pnpm hearth` serving, dark appearance, and the dev menu's
# floating button off (simctl spawn <udid> defaults write me.dpgu.ember
# EXDevMenuShowFloatingActionButton -bool NO).
# The iPad lays the screens out differently from the phone, so this drives
# each screen from a fresh launch instead of sharing the phone's tap points.
set -euo pipefail
udid=$1
locale=$2
here=$(cd "$(dirname "$0")" && pwd)
out="$here/../$locale/screenshots-ipad"
mkdir -p "$out"
flow=$(mktemp -t ember-ipad).yaml

wait() { printf -- '- extendedWaitUntil:\n    visible: "__never__"\n    timeout: %s\n    optional: true\n' "$1"; }

# run <yaml commands>: a fresh launch on the Metro this run uses, then the commands.
run() {
  printf 'appId: me.dpgu.ember\n---\n- runFlow:\n    file: %s/launch.yaml\n%s\n' "$here" "$1" > "$flow"
  maestro --device "$udid" test "$flow" >/dev/null
}

# shot <name> <deep link or empty> <wait ms> [commands before the capture]
shot() {
  local link=""
  [ -n "$2" ] && link="- openLink: me.dpgu.ember://$2"
  run "$link
$(wait "$3")
${4:-}
- takeScreenshot: $out/$1"
}

slots=practice/morning-offering::1,practice/mental-prayer::1,practice/mass::1,practice/rosary::1,practice/angelus::1,practice/spiritual-reading::1,practice/examination-of-conscience::1,practice/night-prayer::1
run "- openLink: me.dpgu.ember://dev/reset?date=2026-10-07&lang=$locale&history=45&enableSlots=$slots
- runFlow:
    when:
      visible: \"Open\"
    commands:
      - tapOn: \"Open\"
$(wait 25000)"

shot 01-today "" 4000
# The day's envelope: open it, say Amen, and the card comes with its page.
shot 02-holy-card "" 4000 "- tapOn:
    point: 13%, 25%
$(wait 5000)
- tapOn:
    point: 50%, 50%
$(wait 6000)
- tapOn:
    point: 94%, 95%
$(wait 15000)"
run "- openLink: me.dpgu.ember://saints/bruno
$(wait 15000)
- swipe:
    start: 50%, 80%
    end: 50%, 30%
    duration: 800
- waitForAnimationToEnd
- takeScreenshot: $out/05-saint-page"
# Lift the sheet over the map. Set the location first
# (simctl location <udid> set -23.5505,-46.6340).
shot 03-mass-times mass-times 12000 "- swipe:
    start: 50%, 70%
    end: 50%, 35%
    duration: 500
$(wait 4000)"
shot 04-rosary pray/rosary 8000
# The plan of life stands beside the day on the iPad; tick three of it.
shot 06-plan "" 4000 "- tapOn:
    id: \"slot-toggle-practice/examination-of-conscience\"
- waitForAnimationToEnd
- tapOn:
    id: \"slot-toggle-practice/rosary\"
- waitForAnimationToEnd
- tapOn:
    id: \"slot-toggle-practice/angelus\"
$(wait 2500)"
shot 07-office pray/breviary 45000
shot 08-reader "browse/book/kempis-imitation-of-christ/read?chapter=book-one-chapter-22" 12000 "- tapOn:
    point: 50%, 60%
- waitForAnimationToEnd"
shot 09-chronicle memoria 8000
# The You tab, second in the bar across the top.
shot 10-you "" 4000 "- tapOn:
    point: 41%, 2%
$(wait 5000)"

for png in "$out"/*.png; do
  sips -s format jpeg -s formatOptions 92 "$png" --out "${png%.png}.jpg" >/dev/null
  rm "$png"
done
rm -f "$flow"
