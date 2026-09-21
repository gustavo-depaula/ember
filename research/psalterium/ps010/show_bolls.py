"""Show a Bolls chapter of the Psalms: python3.13 show_bolls.py <TRANSLATION> <chapter> [<chapter> ...]
Fetches to consult/bolls-<T>-19-<ch>.json when missing (same cache as parallels.py). Read-only otherwise."""
import json
import re
import sys
import urllib.request
from pathlib import Path

consult = Path(__file__).resolve().parents[1] / 'consult'
translation = sys.argv[1]
for chapter in sys.argv[2:]:
    cache = consult / f'bolls-{translation}-19-{chapter}.json'
    if not cache.exists():
        request = urllib.request.Request(f'https://bolls.life/get-text/{translation}/19/{chapter}/', headers={'User-Agent': 'Mozilla/5.0'})
        cache.write_bytes(urllib.request.urlopen(request, timeout=40).read())
    data = json.loads(cache.read_text(encoding='utf-8'))
    print(f'## {translation} chapter {chapter} ({len(data)} verses)')
    for v in data:
        text = re.sub(r'\s+', ' ', re.sub(r'<S>.*?</S>|<sup>.*?</sup>|<[^>]+>', ' ', v['text'])).strip()
        print(v['verse'], text)
    print()
