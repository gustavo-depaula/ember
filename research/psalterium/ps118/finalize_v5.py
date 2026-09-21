"""Close draft 5: the audit steps for its checks and its Latinist gate. No wording changes.
python3.13 research/psalterium/ps118/finalize_v5.py"""

import json
import sys
from pathlib import Path

path = Path(__file__).resolve().parent / 'prayed.json'
data = json.loads(path.read_text(encoding='utf-8'))
if data['version'] != 5 or any(s.get('file') == 'critic/v5.latinist.part2.json' for s in data['audit']):
    sys.exit('not version 5, or already finalized')

v51a = next(d for d in data['decisions'] if d['id'] == 'v51a')
v51a['options'][0]['note'] = v51a['options'][0]['note'].replace("The Latin's length exactly.", 'No shorter by the checker (3 over, like draft 4); the gain is in the mouth.')

data['audit'] += [
    {
        'step': 'checks',
        'note': 'Draft 5, PARTIAL hard check by ps118/partial.py: 80 of 176 verses, DO\'s ids in DO\'s order, no gaps; ids and marks match. Soft flags in 118:33–80, all accepted. Short, where a three-syllable term stands for a long Latin one: 118:33 −3, 39 −3, 48b −3, 52 −4, 56 −4, 67b −3, 68b −3, 70b −3, 80a −3. Long: 118:36 +3 (testemunhos), 42 +4 (the open "com uma palavra"; the resolved option is 1 shorter), 46b +3 and 80b +5 (envergonhado, as 118:6), 48a +3 and 73b +4 (mandamentos), 49 +3, 51 +3, 60 +4 (new: the Latinist\'s full second verb), 66b +3 (acreditei; "cri" is the option), 72 +4 (Boa é para mim, a copula supplied), 74b +4 (new: "pus toda a esperança", the price of not being misheard), 78 +4 (was +5). No rhyme inside a verse; the only neighbouring-finals flag is the first portion\'s 118:16/17 (palavras / palavras, the Latin\'s own sermónes tuos twice). No cadence flag: 118:44 ends on a proparoxytone as its Latin does.'
    },
    {
        'step': 'latinist', 'file': 'critic/v5.latinist.part2.json',
        'note': 'Draft 5, 118:33–80 only, run because eleven verses changed. One remark, minor, and it is the one refused on draft 4: marks confirmed in all 48 verses. The gate is clean for 118:33–80 but for that refused minor.',
        'outcomes': [
            {'verse': '118:44', 'remark': 'minor (repeated): in sǽculum sǽculi is singular twice → "pelo século do século"', 'outcome': 'option', 'decision': 'saeculum44', 'reason': 'The glossary\'s formula for the phrase in every psalm; the number carries no sense.'},
        ],
    },
]
data['status'] = 'reviewed'
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok')
