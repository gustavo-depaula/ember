#!/usr/bin/env bash
# Serve dots.mocr and draft every volume; run by denis-ocr.service (see README).
# Exits non-zero if either half dies, so systemd restarts the pair; run_volumes.py
# skips every page already done.
set -euo pipefail
cd "$(dirname "$0")"
data="${DENIS_DATA:-$HOME/ember-data/denis-carthusian}"
mkdir -p "$data"

./serve.sh dots >"$data/vllm.log" 2>&1 &
server=$!
trap 'kill $server 2>/dev/null; wait $server 2>/dev/null' EXIT

until curl -sf localhost:8000/v1/models >/dev/null; do
  kill -0 $server 2>/dev/null || { echo "vLLM exited during startup; see $data/vllm.log" >&2; exit 1; }
  sleep 3
done

.venv/bin/python run_volumes.py "$@"
