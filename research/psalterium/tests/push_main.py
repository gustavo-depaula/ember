"""Push HEAD's research/psalterium/ onto origin/main, leaving every other path as origin/main has it.

Run from the repo root:  python3.13 research/psalterium/tests/push_main.py "commit message"

The worktree branch carries unrelated history, so the commit is built on a temporary index: origin/main's tree with
research/psalterium/ replaced by HEAD's. Refuses to push if anything outside research/psalterium/ would change.
"""

import os
import subprocess
import sys
import tempfile


def git(*args, env=None):
    return subprocess.run(['git', *args], check=True, capture_output=True, text=True, env=env).stdout.strip()


message = sys.argv[1]
git('fetch', '-q', 'origin', 'main')
with tempfile.TemporaryDirectory() as tmp:
    env = {**os.environ, 'GIT_INDEX_FILE': os.path.join(tmp, 'index')}
    git('read-tree', 'origin/main', env=env)
    git('rm', '-r', '-q', '-f', '--cached', 'research/psalterium', env=env)
    git('read-tree', '--prefix=research/psalterium/', 'HEAD:research/psalterium', env=env)
    tree = git('write-tree', env=env)
outside = [p for p in git('diff', '--name-only', 'origin/main', tree).splitlines() if not p.startswith('research/psalterium/')]
if outside:
    sys.exit('refusing: would change ' + ', '.join(outside[:10]))
commit = git('commit-tree', tree, '-p', 'origin/main', '-m', message)
git('push', '-q', 'origin', f'{commit}:refs/heads/main')
print('pushed', commit[:9])
