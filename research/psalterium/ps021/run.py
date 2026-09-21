"""Run a shared script (render.py, checks.py, site.py) with Ps 21's repeated DO ids made unique (see ids.py).

From the repo root:
  python3.13 research/psalterium/ps021/run.py render     # = render.py research/psalterium/ps021 21
  python3.13 research/psalterium/ps021/run.py checks     # = checks.py research/psalterium/ps021 21 (exit code kept)
  python3.13 research/psalterium/ps021/run.py site       # = site.py (so that ps021 is built, not listed as incomplete)
The shared scripts are executed unchanged; only latin.readVerses is swapped before they import it.
"""

import sys
from pathlib import Path

here = Path(__file__).resolve().parent
sys.path.insert(0, str(here))
import ids  # noqa: E402

ids.install()
which = sys.argv[1]
script = here.parent / f'{which}.py'
sys.argv = [f'{which}.py'] + ([str(here), '21'] if which in ('render', 'checks') else sys.argv[2:])
code = script.read_text(encoding='utf-8')
exec(compile(code, str(script), 'exec'), {'__name__': '__main__', '__file__': str(script)})
