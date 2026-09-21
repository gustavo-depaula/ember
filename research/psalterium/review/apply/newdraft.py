"""Helpers for the drafts made from the review of the finished work (DECISIONS.md, 2026-09-21: D23, D33, D37, D38 …).

Imported by each psalm's own draft script (psNNN/draft<k>.py). Same shape as ps009/draft7.py and ps006/draft3.py:
the current prayed.json is kept as prayed.v<k>.json (and prayed.vos.json as prayed.v<k>.vos.json) before anything
changes; the ruled wording becomes option 0 (moved up, or added when absent); the version is bumped and a `revision`
audit step says what changed and that no critic has read it. A wording typed into a verse becomes a slot with its own
decision, so that the draft's word stays selectable.
"""

import json
import shutil
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(root))
from latin import resolve  # noqa: E402

who = 'the main session, applying the review of the finished work (DECISIONS.md, 2026-09-21)'


def begin(folder, version):
    """Load prayed.json at `version`; keep it as prayed.v<version>.json. Refuses to run twice."""
    path = folder / 'prayed.json'
    prayed = json.loads(path.read_text(encoding='utf-8'))
    kept = folder / f'prayed.v{version}.json'
    if prayed['version'] != version:
        raise SystemExit(f'{folder.name}: at version {prayed["version"]}, not {version} — this draft was already made')
    if kept.exists() and kept.read_bytes() != path.read_bytes():
        raise SystemExit(f'{folder.name}: {kept.name} exists and differs from prayed.json; not overwriting a kept draft')
    shutil.copy(path, kept)
    vos = folder / 'prayed.vos.json'
    keptVos = folder / f'prayed.v{version}.vos.json'
    if vos.exists() and not keptVos.exists():
        shutil.copy(vos, keptVos)
    return prayed, resolve(prayed)


def decision(prayed, did):
    return next(d for d in prayed['decisions'] if d['id'] == did)


def rule(prayed, did, forms, note, label=None, draftNote=None, source='review'):
    """Make the option with these forms option 0 of decision `did` (adding it when absent). The old option 0 gets
    `draftNote` prefixed to its note, so a reader sees it was the draft's ruling."""
    d = decision(prayed, did)
    options = d['options']
    old = options[0]
    if old.get('forms') == forms:
        raise SystemExit(f'{did}: already ruled {forms}')
    ruled = next((o for o in options if o.get('forms') == forms), None)
    if ruled is None:
        ruled = {'label': label or ' / '.join(forms.values()), 'forms': forms, 'note': '', 'from': source}
    else:
        options.remove(ruled)
    options.insert(0, ruled)
    ruled['note'] = (note + (' — Earlier note: ' + ruled['note'] if ruled.get('note') else '')).strip()
    if draftNote:
        old['note'] = draftNote + ' ' + old.get('note', '').replace('Ruling: ', '').replace('Ruling. ', '').replace('Ruling (', '(').replace('Ruled: ', '')
    return d


def slotOut(prayed, vid, typed, slot, did, latin, why, ruled, ruledNote, draftNote, kind='word'):
    """A wording typed into verse `vid` becomes {slot}, owned by a new decision whose option 0 is `ruled` and whose
    option 1 is the typed wording, from the draft."""
    text = prayed['verses'][vid]
    if text.count(typed) != 1:
        raise SystemExit(f'{vid}: {typed!r} occurs {text.count(typed)} times in {text!r}')
    if any(d['id'] == did for d in prayed['decisions']):
        raise SystemExit(f'decision {did} exists')
    prayed['verses'][vid] = text.replace(typed, '{' + slot + '}')
    prayed['decisions'].append({
        'id': did, 'refs': [vid], 'latin': latin, 'kind': kind, 'why': why,
        'options': [
            {'label': ruled, 'forms': {slot: ruled}, 'note': ruledNote, 'from': 'review'},
            {'label': typed, 'forms': {slot: typed}, 'note': draftNote, 'from': 'draft'},
        ],
    })


def finish(folder, prayed, before, version, changes, expected):
    """Bump to `version`, append the revision step, check that exactly the `expected` verses changed, and write."""
    prayed['version'] = version
    prayed['audit'].append({
        'step': 'revision', 'version': version,
        'note': f'v{version}, by {who}: ' + '; '.join(changes) + '. No critic has read draft ' + str(version)
                + ' — these verses are unread. Every earlier wording stays selectable.',
    })
    after = resolve(prayed)
    changed = sorted(v for v in after if after[v] != before.get(v))
    if changed != sorted(expected):
        raise SystemExit(f'{folder.name}: changed {changed}, expected {sorted(expected)}')
    for vid in changed:
        print(f'  {vid}\n    was: {before[vid]}\n    now: {after[vid]}')
    (folder / 'prayed.json').write_text(json.dumps(prayed, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'{folder.name}: draft {version} written; draft {version - 1} kept as prayed.v{version - 1}.json')
