"""After the shared re-keying of repeated DO ids: correct the ids in my own Ps 22 text in glossary.md and PROGRESS.md
(22:5a -> 22:5, 22:6a -> 22:6; the PROGRESS row's note on the private wrapper). Reads and writes each file in one go.
python3.13 research/psalterium/ps022/fix_shared_ids.py"""
from pathlib import Path

root = Path(__file__).resolve().parents[1]
edits = {
    'glossary.md': [
        ('Ps 22:5a *in conspéctu meo*', 'Ps 22:5 *in conspéctu meo*'),
        ('Ps 22:5a *os que me atribulam*', 'Ps 22:5 *os que me atribulam*'),
        ('| open | Ps 22:6a, only place; καταδι', '| open | Ps 22:6, only place; καταδι'),
    ],
    'PROGRESS.md': [
        ('a comma added; 22:5a *afligem*', 'a comma added; 22:5 *afligem*'),
        ('**DO repeats the ids 22:4, 22:5, 22:6: lettered 22:4a/4b … and run through `ps022/dupids.py`** (render/checks wrapped; site.py lists the psalm incomplete until the shared `latin.readVerses` letters repeated ids — reported, not patched).',
         '**DO repeats the ids 22:4, 22:5, 22:6: keyed 22:4, 22:4b … by the shared `latin.readVerses`** (the coordinator\'s fix; drafts were re-keyed from a private wrapper by `ps022/rename_ids.py`).'),
        ('Scripts: `ps022/dupids.py`, `revise_v2.py` |', 'Scripts: `ps022/revise_v2.py`, `rename_ids.py` |'),
    ],
}
for name, pairs in edits.items():
    path = root / name
    text = path.read_text(encoding='utf-8')
    for old, new in pairs:
        if old in text:
            text = text.replace(old, new, 1)
            print(name, 'fixed:', old[:50])
        elif new not in text:
            print(name, 'NOT FOUND:', old[:50])
    path.write_text(text, encoding='utf-8')
