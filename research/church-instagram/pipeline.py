#!/usr/bin/env python3
"""Compile the Instagram account of each Brazilian church in the Mass Times database.

Read-only against the API; writes CSVs here. Steps, in the order they are run:

  pipeline.py fetch                 index + detail of every Brazilian church  -> $IG_CACHE
  pipeline.py scrape                Instagram handles on the churches' own sites -> scrape.json
  pipeline.py next <stage> [count]  write the next batch files for search-workflow.js
  pipeline.py ingest <stage> <journal.jsonl>   store one workflow run's rows -> results/<stage>.jsonl
  pipeline.py merge <stage>         scrape + results -> <stage>-instagram.csv
  pipeline.py stats                 how many churches each stage holds

Stages: capitals (state capitals except São Paulo), sp-state (São Paulo state outside
the capital), brazil (everything else).
"""

import csv
import json
import os
import re
import sys
import unicodedata
import urllib.parse
import urllib.request
from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor

api = 'https://ember-mass-times.dpgu.workers.dev'
here = os.path.dirname(os.path.abspath(__file__))
cache = os.environ.get('IG_CACHE', '/tmp/igwork')
batchDir = os.path.join(cache, 'batches')
batchSize = 10
userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'

states = {
    'AC': 'Acre', 'AL': 'Alagoas', 'AP': 'Amapá', 'AM': 'Amazonas', 'BA': 'Bahia', 'CE': 'Ceará',
    'DF': 'Distrito Federal', 'ES': 'Espírito Santo', 'GO': 'Goiás', 'MA': 'Maranhão', 'MT': 'Mato Grosso',
    'MS': 'Mato Grosso do Sul', 'MG': 'Minas Gerais', 'PA': 'Pará', 'PB': 'Paraíba', 'PR': 'Paraná',
    'PE': 'Pernambuco', 'PI': 'Piauí', 'RJ': 'Rio de Janeiro', 'RN': 'Rio Grande do Norte',
    'RS': 'Rio Grande do Sul', 'RO': 'Rondônia', 'RR': 'Roraima', 'SC': 'Santa Catarina', 'SP': 'São Paulo',
    'SE': 'Sergipe', 'TO': 'Tocantins',
}
capitals = {
    'AC': 'Rio Branco', 'AL': 'Maceió', 'AP': 'Macapá', 'AM': 'Manaus', 'BA': 'Salvador', 'CE': 'Fortaleza',
    'DF': 'Brasília', 'ES': 'Vitória', 'GO': 'Goiânia', 'MA': 'São Luís', 'MT': 'Cuiabá', 'MS': 'Campo Grande',
    'MG': 'Belo Horizonte', 'PA': 'Belém', 'PB': 'João Pessoa', 'PR': 'Curitiba', 'PE': 'Recife',
    'PI': 'Teresina', 'RJ': 'Rio de Janeiro', 'RN': 'Natal', 'RS': 'Porto Alegre', 'RO': 'Porto Velho',
    'RR': 'Boa Vista', 'SC': 'Florianópolis', 'SP': 'São Paulo', 'SE': 'Aracaju', 'TO': 'Palmas',
}
# Area code -> state, for the churches whose region is empty.
dddState = {}
for uf, ddds in {
    'SP': range(11, 20), 'RJ': (21, 22, 24), 'ES': (27, 28), 'MG': (31, 32, 33, 34, 35, 37, 38),
    'PR': range(41, 47), 'SC': (47, 48, 49), 'RS': (51, 53, 54, 55), 'DF': (61,), 'GO': (62, 64),
    'TO': (63,), 'MT': (65, 66), 'MS': (67,), 'AC': (68,), 'RO': (69,), 'BA': (71, 73, 74, 75, 77),
    'SE': (79,), 'PE': (81, 87), 'AL': (82,), 'PB': (83,), 'RN': (84,), 'CE': (85, 88), 'PI': (86, 89),
    'PA': (91, 93, 94), 'AM': (92, 97), 'RR': (95,), 'AP': (96,), 'MA': (98, 99),
}.items():
    for d in ddds:
        dddState[str(d)] = uf


def key(s):
    s = unicodedata.normalize('NFKD', s or '').encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', ' ', s).strip()


stateByKey = {key(n): uf for uf, n in states.items()}
stateByKey.update({uf.lower(): uf for uf in states})
# Spanish and English spellings the source data carries.
stateByKey.update({'rio grande del sur': 'RS', 'state of rio grande do sul': 'RS', 'state of sao paulo': 'SP',
                   'state of rio de janeiro': 'RJ', 'state of minas gerais': 'MG', 'state of parana': 'PR',
                   'state of santa catarina': 'SC', 'state of bahia': 'BA', 'state of ceara': 'CE',
                   'state of pernambuco': 'PE', 'state of goias': 'GO', 'federal district': 'DF'})
capitalByKey = {key(n): uf for uf, n in capitals.items()}
# Capital names that are also other towns' names: need the state to agree.
sharedCapitalNames = {'palmas', 'belem', 'vitoria', 'natal', 'boa vista', 'campo grande', 'rio branco', 'salvador'}


def place(c):
    """(city, state, neighbourhood) of a church; the state falls back to the nearest church that has one."""
    city, state, hood = parsePlace(c)
    return city, state or nearestState.get(c['id']), hood


nearestState = {}


def parsePlace(c):
    """(city, state, neighbourhood) out of the dirty city/region fields."""
    city, region, hood = (c.get('city') or '').strip(), (c.get('region') or '').strip(), None
    state = None
    if key(city) in stateByKey and key(city) not in capitalByKey:
        city, region = '', f'{region}, {city}'
    region = re.sub(r'\d{5}-?\d{3}', ',', region)
    tokens = [t.strip() for t in re.split(r'[,|/]', region) if t.strip()]
    for t in tokens:
        if key(t) in stateByKey:
            state = stateByKey[key(t)]
    # "Recife, PE" as the region means the city field holds the neighbourhood.
    regionCity = next((t for t in tokens if key(t) not in stateByKey and not re.search(r'\d', t)), None)
    # The state can also trail the city: "Guarulhos SP", "Caxias do Sul | Rio Grande do Sul", "Itu - SP".
    m = re.match(r'^(.*?)\s*(?:[|/,–-]\s*|\s)([A-Za-z]{2}|[A-Za-zÀ-ú ]{4,})$', city)
    if m and key(m.group(2)) in stateByKey and (len(m.group(2)) > 2 or not m.group(2).islower()) and m.group(1):
        if key(city) not in capitalByKey and key(city) not in stateByKey:
            state = state or stateByKey[key(m.group(2))]
            city = m.group(1).strip(' -–|/,.')
    if regionCity and key(regionCity) != key(city):
        if state is None and key(regionCity) in capitalByKey and key(regionCity) not in sharedCapitalNames:
            state = capitalByKey[key(regionCity)]
        if city:
            hood = city
        city = regionCity
    if state is None:
        m = re.match(r'^\+55(\d\d)', c.get('phoneE164') or '')
        if m:
            state = dddState.get(m.group(1))
    if state is None and key(city) in capitalByKey and key(city) not in sharedCapitalNames:
        state = capitalByKey[key(city)]
    return city, state, hood


def stage(c):
    if c['id'] in spCityDone:
        return 'done-sp-city'
    city, state, _ = place(c)
    if state and state != 'SP' and key(city) == key(capitals[state]):
        return 'capitals'
    return 'sp-state' if state == 'SP' else 'brazil'


def churchType(name):
    other = r'\b(capela|comunidade|ceb|abadia|mosteiro|convento|hospital|colegio|oratorio|seminario|carmelo|cemiterio|asilo|casa|centro|instituto|universidade|escola|ermida|gruta|cripta|fraternidade|lar|santa casa)\b'
    return 'chapel/community/other' if re.search(other, key(name)) else 'parish'


def get(url, timeout=20):
    req = urllib.request.Request(url, headers={'User-Agent': userAgent, 'Accept-Language': 'pt-BR,pt;q=0.9'})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read(3_000_000).decode('utf-8', 'replace')


def loadJson(path, default):
    return json.load(open(path)) if os.path.exists(path) else default


def saveJson(path, data):
    with open(path, 'w') as f:
        json.dump(data, f, ensure_ascii=False, indent=1, sort_keys=True)


spCityDone = {r['id'] for r in csv.DictReader(open(os.path.join(here, 'sp-city-instagram.csv')))}


def churches():
    path = os.path.join(cache, 'details.json')
    if not os.path.exists(path):
        sys.exit('run "pipeline.py fetch" first')
    all_ = json.load(open(path))
    known = [(c['lat'], c['lng'], parsePlace(c)[1]) for c in all_ if parsePlace(c)[1] and c.get('lat') is not None]
    for c in all_:
        if not parsePlace(c)[1] and c.get('lat') is not None:
            nearestState[c['id']] = min(known, key=lambda k: (k[0] - c['lat']) ** 2 + (k[1] - c['lng']) ** 2)[2]
    return all_


# ---- fetch -----------------------------------------------------------------

def fetch():
    os.makedirs(cache, exist_ok=True)
    index, after = [], ''
    while True:
        page = json.loads(get(f'{api}/churches/index?limit=1000&after={urllib.parse.quote(after)}'))
        rows = page.get('churches') or page.get('items') or page.get('data') or []
        index += [r for r in rows if r.get('countryCode') == 'BR']
        after = page.get('next')
        if not after or not rows:
            break
    print(len(index), 'Brazilian churches in the index', flush=True)
    path = os.path.join(cache, 'details.json')
    have = {c['id']: c for c in loadJson(path, [])}

    def one(row):
        for attempt in range(4):
            try:
                d = json.loads(get(f'{api}/churches/{urllib.parse.quote(row["id"])}'))
                return d.get('church') or d
            except Exception as e:
                err = e
        print('failed', row['id'], err, flush=True)

    todo = [r for r in index if r['id'] not in have]
    with ThreadPoolExecutor(16) as pool:
        for i, d in enumerate(pool.map(one, todo)):
            if d:
                d.pop('services', None)
                have[d['id']] = d
            if i % 2000 == 0:
                print(i, '/', len(todo), flush=True)
    json.dump(list(have.values()), open(path, 'w'), ensure_ascii=False)
    print(len(have), 'details saved')


# ---- scrape ----------------------------------------------------------------

notProfiles = {'p', 'reel', 'reels', 'explore', 'accounts', 'tv', 'stories', 'share', 'sharer', 'embed', 'about',
               'developer', 'directory', 'legal', 'web', 'static', 'invites', 'tags', 'locations', 'direct',
               'instagram', 'wix', 'wordpress', 'elementor', 'your-user-name', 'username', 'seuinstagram'}
socialHosts = ('facebook.com', 'instagram.com', 'youtube.com', 'linktr.ee', 'wa.me', 'whatsapp.com', 'twitter.com',
               'x.com', 'google.com', 'goo.gl', 'bit.ly', 'tiktok.com')
handleRe = re.compile(r'instagram\.com/(?:#!/)?@?([A-Za-z0-9_.]{2,30})', re.I)


def handlesIn(text):
    found = []
    for h in handleRe.findall(text.replace('\\/', '/').replace('%2F', '/')):
        h = h.strip('.').lower()
        if h and h not in notProfiles and h not in found and not re.search(r'\.(js|php|html?|css|png|jpg)$', h):
            found.append(h)
    return found


def website(c):
    return next((l['url'] for l in c.get('links') or [] if l.get('kind') == 'website' and l.get('url')), None)


def host(url):
    return re.sub(r'^www\.', '', urllib.parse.urlparse(url if '//' in url else '//' + url).netloc.lower())


def scrape():
    path = os.path.join(here, 'scrape.json')
    pages = loadJson(path, {})
    urls = sorted({website(c) for c in churches() if website(c)} - set(pages))
    urls = [u for u in urls if not any(host(u).endswith(s) for s in socialHosts)]
    print(len(urls), 'pages to fetch', flush=True)

    def one(url):
        full = url if '//' in url else 'http://' + url
        try:
            return url, handlesIn(get(full, timeout=12))
        except Exception as e:
            return url, {'error': type(e).__name__}

    with ThreadPoolExecutor(32) as pool:
        for i, (url, found) in enumerate(pool.map(one, urls)):
            pages[url] = found
            if i % 500 == 0:
                print(i, '/', len(urls), flush=True)
                saveJson(path, pages)
    saveJson(path, pages)
    print(sum(1 for v in pages.values() if isinstance(v, list) and v), 'pages carry a handle')


# Accounts of dioceses, orders, media and platforms that parish sites link to.
blockRe = re.compile(r'(diocese|arqui|cnbb|vatican|pontifex|franciscus|cancaonova|cancao_nova|redevida|tvaparecida|'
                     r'a12|pascombrasil|salesian|jesuit|franciscan|capuchinh|redentorist|carmelit|dehonian|'
                     r'claretian|marist|pucsp|pucrio|unisal|hospital|colegio|escola|santacasa|regiao|vicariato|'
                     r'padre|^pe[._]|^frei|^dom[._]|wix|hotmart|agencia|digital|criativ|design|marketing|web)')


def ownSiteHandles(all_):
    """church id -> (handle | None, [ambiguous handles]) from the churches' own pages."""
    pages = loadJson(os.path.join(here, 'scrape.json'), {})
    byUrl, hostPages = defaultdict(list), defaultdict(lambda: defaultdict(set))
    for c in all_:
        u = website(c)
        if not u:
            continue
        byUrl[u].append(c['id'])
        direct = handlesIn(u) if 'instagram.com' in u else []
        for h in direct or (pages.get(u) if isinstance(pages.get(u), list) else []):
            hostPages[host(u)][h].add(u)
    out = {}
    for c in all_:
        u = website(c)
        if not u:
            continue
        if 'instagram.com' in u:
            hs = handlesIn(u)
            out[c['id']] = (hs[0] if len(hs) == 1 else None, [], 'database link')
            continue
        found = pages.get(u)
        if not isinstance(found, list) or len(byUrl[u]) > 2:
            continue
        # A handle on three or more pages of one host is the site template's (the diocese's) account.
        kept = [h for h in found if len(hostPages[host(u)][h]) < 3 and not blockRe.search(h) and handlesIn('instagram.com/' + h)]
        if len(kept) == 1:
            out[c['id']] = (kept[0], [], 'own website')
        elif kept:
            out[c['id']] = (None, kept[:6], 'own website')
    # One handle claimed by three or more churches is not any one church's.
    counts = Counter(h for h, _, _ in out.values() if h)
    return {i: v for i, v in out.items() if not v[0] or counts[v[0]] < 3}


# ---- search rounds ---------------------------------------------------------

def stageChurches(name, all_):
    rows = [c for c in all_ if stage(c) == name]
    return sorted(rows, key=lambda c: (place(c)[1] or 'ZZ', key(place(c)[0]), key(c['name']), c['id']))


def results(name):
    """church id -> latest row that was actually searched."""
    path, out = os.path.join(here, 'results', f'{name}.jsonl'), {}
    if os.path.exists(path):
        for line in open(path):
            r = json.loads(line)
            refused = re.search(r'limit|budget|blocked|exhaust|not searched', (r.get('evidence') or '').lower())
            if r['match'] != 'not_searched' or not refused:
                out[r['id']] = {**r, 'match': 'none' if r['match'] == 'not_searched' else r['match']}
    return out


def batchLine(n, c, hint):
    city, state, hood = place(c)
    parts = [f'n={n}', c.get('longName') or c['name'], f'cidade: {city or "?"}/{state or "?"}']
    if hood:
        parts.append(f'bairro: {hood}')
    if c.get('address'):
        parts.append(f'endereço: {c["address"]}' + (f' CEP {c["postalCode"]}' if c.get('postalCode') else ''))
    if c.get('phoneE164'):
        parts.append(f'tel: {c["phoneE164"]}')
    if c.get('email'):
        parts.append(f'email: {c["email"]}')
    if website(c):
        parts.append(f'site: {website(c)}')
    if hint:
        parts.append('handles seen on its site: ' + ', '.join(hint))
    return ' | '.join(re.sub(r'\s+', ' ', p) for p in parts)


def nextBatches(name, count):
    all_ = churches()
    rows, own, done = stageChurches(name, all_), ownSiteHandles(all_), results(name)
    pending = [(n, c) for n, c in enumerate(rows) if c['id'] not in done and not own.get(c['id'], (None,))[0]]
    os.makedirs(batchDir, exist_ok=True)
    for f in os.listdir(batchDir):
        os.remove(os.path.join(batchDir, f))
    take = pending[:count * batchSize]
    for b in range(0, len(take), batchSize):
        with open(os.path.join(batchDir, f'batch_{b // batchSize}.txt'), 'w') as f:
            for n, c in take[b:b + batchSize]:
                f.write(batchLine(n, c, own.get(c['id'], (None, []))[1]) + '\n')
    saveJson(os.path.join(cache, 'round.json'), {str(n): c['id'] for n, c in take})
    print(json.dumps({'stage': name, 'churches': len(rows), 'pending': len(pending),
                      'batches': -(-len(take) // batchSize), 'dir': batchDir}))


def ingest(name, journal):
    ids = loadJson(os.path.join(cache, 'round.json'), {})
    order = sorted(ids, key=int)
    os.makedirs(os.path.join(here, 'results'), exist_ok=True)
    counts, searches, labels = Counter(), 0, {}
    with open(os.path.join(here, 'results', f'{name}.jsonl'), 'a') as f:
        for line in open(journal):
            entry = json.loads(line)
            if entry.get('type') == 'started':
                labels[entry['key']] = entry.get('label') or ''
            if entry.get('type') != 'result' or not isinstance(entry.get('result'), dict):
                continue
            rows = entry['result'].get('results') or []
            # Some agents renumber their rows 1..10; the batch's own order gives the numbers back.
            m = re.search(r'\d+', labels.get(entry['key'], ''))
            batch = order[int(m.group()) * batchSize:(int(m.group()) + 1) * batchSize] if m else []
            got = [r.get('n') for r in rows]
            if len(rows) == len(batch) and got in (list(range(1, len(rows) + 1)), list(range(len(rows)))) \
                    and not all(str(n) in batch for n in got):
                for r, n in zip(rows, batch):
                    r['n'] = int(n)
                counts['renumbered'] += len(rows)
            for r in rows:
                if str(r.get('n')) not in ids or (batch and str(r['n']) not in batch):
                    counts['unknown n'] += 1
                    continue
                r['id'] = ids[str(r['n'])]
                # An agent may skip a school or hospital without searching; only a refused search is retried.
                refused = re.search(r'limit|budget|blocked|exhaust|not searched', (r.get('evidence') or '').lower())
                if r['match'] == 'none' and not r.get('searches') and not r.get('instagram') and refused:
                    r['match'] = 'not_searched'
                elif r['match'] == 'not_searched' and not refused:
                    r['match'] = 'none'
                counts[r['match']] += 1
                searches += r.get('searches') or 0
                f.write(json.dumps(r, ensure_ascii=False) + '\n')
    done = sum(v for k, v in counts.items() if k not in ('renumbered', 'unknown n'))
    print(json.dumps({**counts, 'searches': searches, 'missing': len(ids) - done}))


# ---- merge -----------------------------------------------------------------

institutionRe = re.compile(r'(hospital|colegio|escola|universidade|faculdade|puc|santacasa|santa casa|school|'
                           r'franciscan|salesian|jesuit|capuchinh|carmelit|redentorist|diocese|arquidiocese)')


def merge(name):
    all_ = churches()
    rows, own, found = stageChurches(name, all_), ownSiteHandles(all_), results(name)
    out = []
    for c in rows:
        city, state, hood = place(c)
        row = {'id': c['id'], 'name': c.get('longName') or c['name'], 'type': churchType(c.get('longName') or c['name']),
               'city': city, 'state': state or '', 'address': c.get('address') or hood or '',
               'phone': c.get('phoneE164') or '', 'email': c.get('email') or '', 'instagram': '',
               'status': 'not searched', 'account_of': '', 'source': '', 'evidence': '', 'other_candidates': '',
               'flags': []}
        handle, ambiguous, source = own.get(c['id'], (None, [], ''))
        r = found.get(c['id'])
        if handle:
            row.update(instagram=handle, status='confirmed', account_of='own', source=source,
                       evidence=f'linked from {website(c)}')
            # A lone handle on the page can still be the web designer's or a priest's.
            letters = re.sub(r'[^a-z]', '', handle)
            near = re.sub(r'[^a-z]', '', key(host(website(c)).split('.')[0] + row['name'] + city))
            if source == 'own website' and not any(letters[i:i + 5] in near for i in range(max(1, len(letters) - 4))):
                row['status'] = 'probable'
                row['flags'].append('handle unlike the church name and its site')
        elif r:
            h = (r.get('instagram') or '').strip().lstrip('@').lower()
            h = re.sub(r'^https?://(www\.)?instagram\.com/', '', h).strip('/')
            row.update(source='web search (agent)', evidence=r.get('evidence') or '',
                       other_candidates='; '.join(r.get('candidates') or []), status='not found')
            if h and r['match'] in ('confirmed', 'probable') and re.fullmatch(r'[a-z0-9_.]{2,30}', h):
                if row['type'] != 'parish' and r.get('owner') != 'parent' and institutionRe.search(key(h).replace(' ', '')):
                    row['flags'].append(f'rejected institution account @{h}')
                else:
                    row.update(instagram=h, status=r['match'], account_of=r.get('owner') or '')
                    local = key((c.get('email') or '').split('@')[0]).replace(' ', '')
                    if local and local == key(h).replace(' ', ''):
                        row['flags'].append('handle equals email name')
        if ambiguous and not row['instagram']:
            row['other_candidates'] = '; '.join(filter(None, [row['other_candidates'], 'on its site: ' + ', '.join(ambiguous)]))
        out.append(row)
    counts = Counter(r['instagram'] for r in out if r['instagram'])
    for r in out:
        n = counts[r['instagram']]
        if r['instagram'] and n > 1:
            r['flags'].append(f'same handle given to {n} churches')
            if r['status'] == 'confirmed' and r['source'].startswith('web search') and r['account_of'] != 'parent':
                r['status'] = 'probable'
        r['flags'] = '; '.join(r['flags'])
    out.sort(key=lambda r: (r['state'] or 'ZZ', key(r['city']), key(r['name'])))
    with open(os.path.join(here, f'{name}-instagram.csv'), 'w', newline='') as f:
        w = csv.DictWriter(f, fieldnames=list(out[0]))
        w.writeheader()
        w.writerows(out)
    status = Counter(r['status'] for r in out)
    print(json.dumps({'stage': name, 'churches': len(out), **status}))


def stats():
    all_ = churches()
    print(Counter(stage(c) for c in all_))
    print('no state:', sum(1 for c in all_ if not place(c)[1]))
    print(Counter(f'{place(c)[0]}/{place(c)[1]}' for c in all_ if stage(c) == 'capitals').most_common())
    own = ownSiteHandles(all_)
    print('own-site handles:', Counter(stage(c) for c in all_ if own.get(c['id'], (None,))[0]))


if __name__ == '__main__':
    cmd, args = (sys.argv[1] if len(sys.argv) > 1 else ''), sys.argv[2:]
    if cmd == 'fetch':
        fetch()
    elif cmd == 'scrape':
        scrape()
    elif cmd == 'next':
        nextBatches(args[0], int(args[1]) if len(args) > 1 else 13)
    elif cmd == 'ingest':
        ingest(args[0], args[1])
    elif cmd == 'merge':
        merge(args[0])
    elif cmd == 'stats':
        stats()
    else:
        sys.exit(__doc__)
