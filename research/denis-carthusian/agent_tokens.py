"""Total the token usage recorded in subagent transcripts (Claude Code task .output JSONL).

    .venv/bin/python agent_tokens.py <label>=<transcript.output> ...

Each assistant message carries the usage of the request that produced it. A streamed
message is logged once per content block under the same id, and only the last entry has
the final output count, so the last entry per id is the one counted.
"""

import json
import sys

kinds = ("input_tokens", "cache_creation_input_tokens", "cache_read_input_tokens", "output_tokens")

print(f"{'run':<16}{'requests':>9}{'input':>10}{'cache write':>13}{'cache read':>12}{'output':>9}")
for arg in sys.argv[1:]:
    label, path = arg.split("=", 1)
    by_id = {}
    for line in open(path):
        try:
            entry = json.loads(line)
        except json.JSONDecodeError:
            continue
        message = entry.get("message") or {}
        usage = message.get("usage")
        if entry.get("type") == "assistant" and usage:
            by_id[message.get("id")] = usage
    totals = {k: sum(u.get(k) or 0 for u in by_id.values()) for k in kinds}
    print(f"{label:<16}{len(by_id):>9}" + "".join(f"{totals[k]:>{w}}" for k, w in zip(kinds, (10, 13, 12, 9))))
