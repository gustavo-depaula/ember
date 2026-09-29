#!/bin/sh
# Generate every card of a batch file in parallel (or only the listed ids), via new-card.sh.
# Usage (repo root): research/holy-card-faces/gen-batch.sh batches/batch-N.json [card-id...]
dir=research/holy-card-faces
batch=$dir/$1; shift
# The loop runs in the pipe's subshell, so its `wait` must too, or the jobs die with the script.
python3 - "$batch" "$@" <<'PY' | { while IFS= read -r line; do eval "$line" & done; wait; }
import json, shlex, sys
cards = json.load(open(sys.argv[1]))["cards"]
only = set(sys.argv[2:])
for c in cards:
    if only and c["id"] not in only:
        continue
    args = [c["id"], c["letter"], c["subject"], c.get("face", "-"), *c["refs"]]
    env = "".join(f"{k.upper()}={shlex.quote(c[k])} " for k in ("frame", "box") if k in c)
    print(env + "research/holy-card-faces/new-card.sh " + " ".join(shlex.quote(a) for a in args) + " > /dev/null")
PY
