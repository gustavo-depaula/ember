"""Search archive.org for texts by creator. usage: ia_search.py 'creator query' [extra query]"""
import sys, json, urllib.request, urllib.parse
q = f'creator:({sys.argv[1]}) AND mediatype:texts' + (' AND ' + sys.argv[2] if len(sys.argv) > 2 else '')
u = 'https://archive.org/advancedsearch.php?' + urllib.parse.urlencode({'q': q, 'fl[]': ['identifier', 'title', 'date', 'downloads', 'language'], 'rows': 400, 'output': 'json', 'sort[]': 'downloads desc'}, doseq=True)
d = json.load(urllib.request.urlopen(u, timeout=60))
for r in d['response']['docs']:
    print(r.get('identifier'), '|', str(r.get('title'))[:80], '|', str(r.get('date', ''))[:4], '|', r.get('downloads'), '|', r.get('language', ''))
