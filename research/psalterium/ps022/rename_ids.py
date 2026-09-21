"""Re-key Ps 22 and Ps 24 to the shared latin.readVerses ids (the coordinator's fix: the second line of a repeated DO id
gets 'b'; the first keeps the bare id). My drafts had lettered both lines (22:4a/22:4b); this turns every 22:4a, 22:5a,
22:6a, 24:4a, 24:7a into the bare id, in the working files of both folders. Critic replies are left as they were read.
python3.13 research/psalterium/ps022/rename_ids.py"""
import re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
pattern = re.compile(r'\b(22:[456]|24:[47])a\b')
for folder in ('ps022', 'ps024'):
    for path in sorted((root / folder).glob('*.json')):
        text = path.read_text(encoding='utf-8')
        new = pattern.sub(r'\1', text)
        if new != text:
            path.write_text(new, encoding='utf-8')
            print('re-keyed', path.relative_to(root))
