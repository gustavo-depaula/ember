"""Store a blind reader's reply that was produced outside codex.py (a fresh-context Claude agent),
in the same record format codex.py writes, so the site and the audit read it the same way.

Run from the repo root:
  python3.13 research/psalterium/reader_record.py <workdir> <prompt.md> <target file> <reply file> <out.json> <model>
e.g.
  python3.13 research/psalterium/reader_record.py research/psalterium/ps037 ../prompts/stylist.md prayed.vos.json reply.stylist.txt critic/v1.stylist.json 'claude-opus-5-5 (fresh context)'

The reply file is the reader's answer verbatim; it is moved into the record and deleted.
"""

import hashlib
import json
import sys
from datetime import datetime, timezone
from pathlib import Path


def main():
    workdir, promptName, target, replyName, outName, model = sys.argv[1:7]
    workdir = Path(workdir).resolve()
    prompt = (workdir / promptName).read_text(encoding='utf-8').replace('{{TARGET}}', target)
    replyPath = workdir / replyName
    reply = replyPath.read_text(encoding='utf-8')
    if not reply.strip():
        sys.exit('empty reply')
    record = {
        'role': Path(promptName).stem,
        'prompt': promptName,
        'promptSha256': hashlib.sha256(prompt.encode()).hexdigest(),
        'target': target,
        'targetSha256': hashlib.sha256((workdir / target).read_bytes()).hexdigest(),
        'runner': 'claude-code agent (fresh context)',
        'model': model,
        'at': datetime.now(timezone.utc).isoformat(timespec='seconds'),
        'reply': reply,
    }
    out = workdir / outName
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(record, ensure_ascii=False, indent=2), encoding='utf-8')
    replyPath.unlink()
    print(f'wrote {out}')


main()
