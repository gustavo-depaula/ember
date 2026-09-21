"""Run one Codex role (a different model family from the drafter) and keep its reply verbatim with provenance.

Run from the repo root:
  python3.13 research/psalterium/codex.py <workdir> <prompt.md> <target file> <out.json>
e.g.
  python3.13 research/psalterium/codex.py research/psalterium/ps004 prompts/latinist-critic.md literal.json critic/literal.latinist.codex.json

Codex runs read-only inside <workdir>; `{{TARGET}}` in the prompt becomes the target file name.
"""

import hashlib
import json
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path


def main():
    workdir, promptName, target, outName = sys.argv[1:5]
    # optional 5th argument overrides the model configured in ~/.codex/config.toml
    override = ['-m', sys.argv[5]] if len(sys.argv) > 5 else []
    workdir = Path(workdir).resolve()
    prompt = (workdir / promptName).read_text(encoding='utf-8').replace('{{TARGET}}', target)
    with tempfile.NamedTemporaryFile('r', suffix='.txt', encoding='utf-8') as last:
        run = subprocess.run(
            ['codex', 'exec', *override, '-s', 'read-only', '-C', str(workdir), '--skip-git-repo-check', '-o', last.name, '-'],
            input=prompt,
            text=True,
            capture_output=True,
        )
        reply = Path(last.name).read_text(encoding='utf-8')
    if run.returncode != 0 or not reply.strip():
        sys.exit(f'codex failed ({run.returncode}):\n{run.stderr[-2000:]}')
    version = subprocess.run(['codex', '--version'], text=True, capture_output=True).stdout.strip()
    # codex prints a `model: …` header line; that is the model that actually answered
    model = next((line.split(':', 1)[1].strip() for line in (run.stderr + run.stdout).splitlines() if line.lower().startswith('model:')), None)
    record = {
        'role': Path(promptName).stem,
        'prompt': promptName,
        'promptSha256': hashlib.sha256(prompt.encode()).hexdigest(),
        'target': target,
        'targetSha256': hashlib.sha256((workdir / target).read_bytes()).hexdigest(),
        'runner': version,
        'model': model,
        'at': datetime.now(timezone.utc).isoformat(timespec='seconds'),
        'reply': reply,
    }
    out = workdir / outName
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(record, ensure_ascii=False, indent=2), encoding='utf-8')
    print(reply)


main()
