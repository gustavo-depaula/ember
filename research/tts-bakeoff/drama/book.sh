#!/bin/sh
# Voice a whole book and leave it stitched: BOOK=luke EDITION=en drama/book.sh
# Lines the transcription check finds garbled are redrawn twice with new seeds
# before the chapters are assembled.
set -e
cd "$(dirname "$0")/.."
cuda=$(echo "$PWD"/envs/verify/.venv/lib/python3.12/site-packages/nvidia/*/lib | tr ' ' ':')
qwen() { SEED=$1 flock /tmp/ember-tts-gpu.lock envs/qwen3-tts/.venv/bin/python drama/synth.py 2>&1 | grep -E "^$BOOK|implausible|Error" || true; }
check() { LD_LIBRARY_PATH=$cuda flock /tmp/ember-tts-gpu.lock envs/verify/.venv/bin/python drama/check_audio.py "$@" 2>&1 | grep -v Warning | tail -12; }
python3 drama/check_attribution.py | tail -1
python3 drama/build_utterances.py
qwen 0
check --redo
qwen 1
check --redo
qwen 2
check
python3 drama/stitch.py | tail -1 | sed 's|.*/out/||'
