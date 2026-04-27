#!/usr/bin/env python3
"""Convert a CCEL ThML XML file to an Ember book directory.

Usage:
  python scripts/ccel-import.py \
      --input path/to/work.xml \
      --library ccel-classics \
      --book-id kempis-imitation-of-christ \
      [--language en-US] [--chapter-level auto] [--composed 1418]

See docs/content/ccel-import.md for the full workflow.
"""

from __future__ import annotations

import sys
from pathlib import Path

# Allow `python scripts/ccel-import.py` from any cwd
sys.path.insert(0, str(Path(__file__).resolve().parent))

from ccel.cli import main


if __name__ == "__main__":
    raise SystemExit(main())
