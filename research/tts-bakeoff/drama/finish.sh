#!/bin/sh
# Second half of book.sh, for a book whose first voicing is done: redraw what
# the transcription check flags (twice), then stitch. BOOK=luke drama/finish.sh
# Split from book.sh because a long book outlasts one two-hour background job.
set -e
cd "$(dirname "$0")/.."
cuda=$(echo "$PWD"/envs/verify/.venv/lib/python3.12/site-packages/nvidia/*/lib | tr ' ' ':')
qwen() { SEED=$1 flock /tmp/ember-tts-gpu.lock envs/qwen3-tts/.venv/bin/python drama/synth.py 2>&1 | grep -E "^$BOOK|implausible|Error" || true; }
check() { LD_LIBRARY_PATH=$cuda flock /tmp/ember-tts-gpu.lock envs/verify/.venv/bin/python drama/check_audio.py "$@" 2>&1 | grep -E "word error|deleted" || true; }
qwen 1
check --redo
qwen 2
check --redo
qwen 3
check
python3 drama/stitch.py | tail -1 | sed 's|.*/out/||'
