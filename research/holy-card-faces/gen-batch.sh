#!/bin/sh
# Generate every card of a batch file in parallel (or only the listed ids), via new-card.sh.
# Usage (repo root): research/holy-card-faces/gen-batch.sh batches/batch-N.json [card-id...]
dir=research/holy-card-faces
batch=$dir/$1; shift
python3 - "$batch" "$@" <<'PY' | while IFS= read -r line; do eval "$line" & done; wait
import json, shlex, sys
cards = json.load(open(sys.argv[1]))["cards"]
only = set(sys.argv[2:])
for c in cards:
    if only and c["id"] not in only:
        continue
    args = [c["id"], c["letter"], c["subject"], c["face"], *c["refs"]]
    print("research/holy-card-faces/new-card.sh " + " ".join(shlex.quote(a) for a in args) + " > /dev/null")
PY
