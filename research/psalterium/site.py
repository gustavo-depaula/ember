"""The review site: every psalm, word study and piece of the audit trail, as static pages that open from file://.

Run from the repo root:  python3.13 research/psalterium/site.py
Writes research/psalterium/site/ from what is on disk. Safe to re-run while psalms arrive: a psalm folder that is
missing pieces or half-written is skipped and listed on the index as incomplete; no page's failure stops the others.

  --root DIR   read psalm folders and documents from DIR instead of this folder (used by the test fixture)
  --out DIR    write the site to DIR instead of <root>/site

The look and the behaviour are review.html's (the approved design), lifted into assets/site.css and assets/psalm.js.
Comparison psalters are in copyright and never embedded: a psalm page loads ../consult/compare/ps<NNN>.js if it is there.
"""

import html
import json
import re
import shutil
import sys
import traceback
import unicodedata
from pathlib import Path

here = Path(__file__).resolve().parent
sys.path.insert(0, str(here))
from latin import doLatin, fold, readVerses, resolve  # noqa: E402

pilotHours = [('Sunday Compline', [4, 90, 133, 233]), ('Sunday Prime', [53, 117, 118])]
# The working notes page (notes.html): the project's own files, as they stand. The method page is method.md alone,
# written for a reader who does not know the project.
noteDocs = [
    ('readme', 'README.md', 'The project'),
    ('decisions-log', 'DECISIONS.md', 'The decisions log'),
    ('handoff', 'HANDOFF.md', 'Handoff'),
    ('progress', 'PROGRESS.md', 'Progress'),
    ('brief', 'AGENT-BRIEF.md', 'The translator’s brief'),
    ('retrospective', 'ps004/retrospective.md', 'Ps 4 retrospective'),
    ('collation', 'collation/report.md', 'Collation'),
    ('vos-tu', 'vos-tu.md', 'Vós ou tu'),
]
esc = html.escape


# ───────── markdown ─────────

def slug(text):
    plain = ''.join(c for c in unicodedata.normalize('NFD', text) if not unicodedata.combining(c))
    return re.sub(r'[^a-z0-9]+', '-', re.sub(r'[`*_\\]|<[^>]+>', '', plain).lower()).strip('-')


def inline(text, linkFor=None):
    """One line of markdown → HTML. \\x01…\\x02 passes raw HTML through (site.py's own links inside a generated table)."""
    stash = []

    def keep(fragment):
        stash.append(fragment)
        return f'\x00{len(stash) - 1}\x00'

    def code(match):
        body = match.group(1)
        target = linkFor(body, known=True) if linkFor and re.fullmatch(r'[\w./-]+\.(md|json|html)', body) else None
        shown = f'<code>{esc(body)}</code>'
        return keep(f'<a href="{esc(target)}">{shown}</a>' if target else shown)

    def link(match):
        label, href = match.groups()
        href = linkFor(href) if linkFor else href
        return keep(f'<a href="{esc(href)}">') + label + keep('</a>')

    text = re.sub(r'\x01(.*?)\x02', lambda m: keep(m.group(1)), text, flags=re.S)
    text = re.sub(r'`([^`]+)`', code, text)
    text = re.sub(r'\\([\\`*_{}\[\]()#+.!|-])', lambda m: keep(esc(m.group(1))), text)
    text = esc(text, quote=False)
    text = re.sub(r'\[([^\]]+)\]\(([^)\s]+)\)', link, text)
    text = re.sub(r'\*\*(?!\s)(.+?)(?<!\s)\*\*', r'<strong>\1</strong>', text)
    text = re.sub(r'\*(?![\s*])(.+?)(?<![\s*])\*', r'<em>\1</em>', text)
    text = re.sub(r'(?<!\w)_(?!\s)(.+?)(?<!\s)_(?!\w)', r'<em>\1</em>', text)
    for _ in range(3):  # a stashed link may hold a stashed code span
        text = re.sub(r'\x00(\d+)\x00', lambda m: stash[int(m.group(1))], text)
    return text


listItem = re.compile(r'^(\s*)([-*+]|\d+[.)])\s+(.*)$')
tableRule = re.compile(r'^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$')


def cells(line):
    line = line.strip()
    line = line[1:] if line.startswith('|') else line
    line = line[:-1] if line.endswith('|') and not line.endswith('\\|') else line
    return [c.strip() for c in re.split(r'(?<!\\)\|', line)]


def renderMarkdown(text, linkFor=None, cellFor=None, shift=0, idPrefix=''):
    """Headings, paragraphs, emphasis, code, links, tables, lists, blockquotes, rules — what the project's notes use.

    cellFor(text, column, header) may rewrite a table cell's markdown before it is rendered (links into psalm pages).
    """
    tables = [0]

    def blocks(lines):
        out, i = [], 0
        while i < len(lines):
            line = lines[i]
            if not line.strip():
                i += 1
            elif line.strip().startswith('```'):
                end = next((j for j in range(i + 1, len(lines)) if lines[j].strip().startswith('```')), len(lines))
                code = chr(10).join(lines[i + 1:end])
                # a drawing (box characters) keeps its columns: monospace, no wrapping, scrolls sideways
                kind = ' class="diagram"' if re.search('[─│┌┐└┘▼═]', code) else ''
                out.append(f'<pre{kind}>{esc(code)}</pre>')
                i = end + 1
            elif (match := re.match(r'^!\[([^\]]*)\]\((assets/[\w-]+\.svg)\)\s*$', line)) and (here / match.group(2)).exists():
                # inlined rather than linked, so that the drawing takes the page's colours (and dark theme) and type
                svg = (here / match.group(2)).read_text(encoding='utf-8')
                out.append(f'<figure class="drawing">{svg[svg.index("<svg"):]}</figure>')
                i += 1
            elif match := re.match(r'^(#{1,6})\s+(.*?)\s*#*\s*$', line):
                level = min(6, len(match.group(1)) + shift)
                out.append(f'<h{level} id="{idPrefix}{slug(match.group(2))}">{inline(match.group(2), linkFor)}</h{level}>')
                i += 1
            elif re.match(r'^\s*([-*_])(\s*\1){2,}\s*$', line):
                out.append('<hr>')
                i += 1
            elif line.lstrip().startswith('>'):
                end = next((j for j in range(i, len(lines)) if not lines[j].lstrip().startswith('>')), len(lines))
                out.append(f"<blockquote>{blocks([re.sub(r'^\s*>\s?', '', quoted) for quoted in lines[i:end]])}</blockquote>")
                i = end
            elif '|' in line and i + 1 < len(lines) and tableRule.match(lines[i + 1]):
                end = next((j for j in range(i + 2, len(lines)) if not lines[j].strip() or '|' not in lines[j]), len(lines))
                out.append(table(cells(line), [cells(row) for row in lines[i + 2:end]]))
                i = end
            elif listItem.match(line):
                end = i
                while end < len(lines) and (lines[end].strip() or (end + 1 < len(lines) and (lines[end + 1].startswith(' ') or listItem.match(lines[end + 1])))):
                    if lines[end].strip() and not lines[end].startswith(' ') and not listItem.match(lines[end]) and not lines[end - 1].strip():
                        break
                    end += 1
                out.append(listHtml(lines[i:end]))
                i = end
            else:
                end = i
                while end < len(lines) and lines[end].strip() and not (end > i and startsBlock(lines, end)):
                    end += 1
                body = '<br>'.join(inline(' '.join(part.split()), linkFor) for part in re.split(r' {2,}\n', '\n'.join(lines[i:end])))
                out.append(f'<p>{body}</p>')
                i = end
        return '\n'.join(out)

    def startsBlock(lines, at):
        line = lines[at]
        return bool(
            re.match(r'^#{1,6}\s', line) or line.strip().startswith('```') or line.lstrip().startswith('>') or listItem.match(line)
            or ('|' in line and at + 1 < len(lines) and tableRule.match(lines[at + 1]))
        )

    def table(header, rows):
        tables[0] += 1
        cell = lambda text, column: inline(cellFor(text, column, header) if cellFor else text, linkFor)  # noqa: E731
        head = ''.join(f'<th>{inline(h, linkFor)}</th>' for h in header)
        body = '\n'.join('<tr>' + ''.join(f'<td>{cell(c, n)}</td>' for n, c in enumerate(row)) + '</tr>' for row in rows)
        # a long table gets a filter box (assets/words.js) — the concordances run to seventy rows
        tableId = f'{idPrefix}t{tables[0]}'
        box = f'<input class="filter" type="search" placeholder="Filter these {len(rows)} rows" aria-label="Filter the table" data-table="{tableId}">' if len(rows) > 12 else ''
        return f'{box}<div class="scroll"><table id="{tableId}"><thead><tr>{head}</tr></thead><tbody>\n{body}\n</tbody></table></div>'

    def listHtml(lines):
        base = len(listItem.match(lines[0]).group(1))
        ordered = listItem.match(lines[0]).group(2)[0].isdigit()
        items = []
        for line in lines:
            match = listItem.match(line)
            if match and len(match.group(1)) <= base:
                items.append([match.group(3)])
            elif items:
                items[-1].append(line)
        rendered = []
        for first, *rest in items:
            indent = min((len(r) - len(r.lstrip()) for r in rest if r.strip()), default=0)
            # continuation lines of the same paragraph join it; anything after a blank line or a nested list is its own block
            cut = next((n for n, r in enumerate(rest) if not r.strip() or listItem.match(r)), len(rest))
            lead = ' '.join([first, *[r.strip() for r in rest[:cut]]])
            rendered.append(f'<li>{inline(lead, linkFor)}{blocks([r[indent:] for r in rest[cut:]])}</li>')
        tag = 'ol' if ordered else 'ul'
        return f'<{tag}>' + '\n'.join(rendered) + f'</{tag}>'

    return blocks(text.splitlines())


# ───────── reading what is on disk ─────────

def readJson(path):
    return json.loads(path.read_text(encoding='utf-8'))


def require(condition, message):
    if not condition:
        raise ValueError(message)


def latinFile(number):
    return doLatin / f'Psalmorum/Psalm{number}.txt'


def latinVerses(number, folder=None):
    """The DO Latin; a folder may carry its own latin.json (render.py writes one) when the number is not DO's."""
    if latinFile(number).exists():
        return [{'id': v['id'], 'text': v['text']} for v in readVerses(latinFile(number))]
    if folder and (folder / 'latin.json').exists():
        return [{'id': vid, 'text': text} for vid, text in readJson(folder / 'latin.json').items()]
    return []


def incipitOf(verses):
    if not verses:
        return ''
    words = re.sub(r'\([^)]*\)', '', verses[0]['text']).split()
    take = 4 if words and words[0].endswith(',') else 2
    chosen = []
    for word in words[:take]:
        if word in '†‡*+':
            break
        chosen.append(word)
        if len(chosen) > 1 and re.search(r'[.:;?!]$', word):
            break
    return ' '.join(chosen).rstrip(',.:;?!')


def canticleTitle(number):
    path = latinFile(number)
    first = path.read_text(encoding='utf-8').splitlines()[0] if path.exists() else ''
    match = re.match(r'^\((.*?)(?:\s*\*\s*(.*))?\)$', first.strip())
    return (match.group(1), match.group(2) or '') if match else (f'Canticle {number}', '')


def titleOf(number):
    return f'Salmo {number}' if number <= 150 else canticleTitle(number)[0]


def progressTable(root):
    path = root / 'PROGRESS.md'
    rows = {}
    if not path.exists():
        return rows
    for line in path.read_text(encoding='utf-8').splitlines():
        parts = cells(line) if line.startswith('|') else []
        if len(parts) >= 4 and parts[0].isdigit():
            rows[int(parts[0])] = parts[3]
    return rows


def loadPsalm(folder, progress):
    """Everything a psalm page needs, or ValueError saying what is missing."""
    number = int(folder.name[2:])
    key = folder.name
    require((folder / 'prayed.json').exists(), 'no prayed.json yet')
    try:
        prayed = readJson(folder / 'prayed.json')
    except ValueError as error:
        raise ValueError(f'prayed.json does not parse ({error})') from error
    require(isinstance(prayed, dict) and isinstance(prayed.get('verses'), dict) and prayed['verses'], 'prayed.json has no verses')
    warnings = []

    # Ps 4 keeps the flat text of the older schema; its slots and decisions live beside it in decisions.json
    extra = {}
    if (folder / 'decisions.json').exists():
        try:
            extra = readJson(folder / 'decisions.json')
        except ValueError as error:
            warnings.append(f'decisions.json does not parse ({error}); the psalm is shown without its decisions')
    merged = {**prayed, **{k: extra[k] for k in ('verses', 'decisions', 'intro', 'hour', 'legacyStoreKey') if k in extra}}
    decisions = merged.get('decisions') or []
    require(isinstance(decisions, list), 'decisions is not a list')
    seen = set()
    for d in decisions:
        require(isinstance(d, dict) and d.get('id') and d.get('options'), f'a decision lacks id or options: {str(d)[:60]}')
        require(d['id'] not in seen, f"two decisions share the id {d['id']}")
        require(all(isinstance(o, dict) and 'label' in o for o in d['options']), f"decision {d['id']}: an option lacks its label")
        seen.add(d['id'])
    try:
        flat = resolve(merged)
    except KeyError as error:
        raise ValueError(f'slot {{{error.args[0]}}} has no form in any decision’s first option') from error
    if 'verses' in extra and flat != resolve(prayed):
        differing = [vid for vid in flat if flat[vid] != resolve(prayed).get(vid)]
        warnings.append(f"decisions.json no longer reproduces prayed.json at {', '.join(differing) or 'its verse list'} — one of them is stale")

    latin = latinVerses(number, folder)
    require(latin, f'no Latin for psalm {number}')
    latinIds = [v['id'] for v in latin]
    missing = [vid for vid in latinIds if vid not in flat]
    stray = [vid for vid in flat if vid not in latinIds]
    # a long psalm translated in stages says so with "range": show the run that exists, beside that much Latin
    have = [vid for vid in latinIds if vid in flat]
    if missing and have and merged.get('range'):
        first, last = latinIds.index(have[0]), latinIds.index(have[-1])
        require(latinIds[first:last + 1] == have, f"the translated verses of a staged psalm must be one unbroken run (gap after {have[0]})")
        warnings.append(f"translated in stages: {have[0]}–{have[-1]} so far, {len(have)} of {len(latinIds)} prayed verses")
        latin, latinIds, missing = latin[first:last + 1], have, []
    require(not missing, f"{len(flat) - len(stray)} of {len(latinIds)} verses translated (first missing: {(missing or [''])[0]})")
    require(not stray, f"verse id {(stray or [''])[0]} is not in the Latin")

    literal = {}
    if (folder / 'literal.json').exists():
        try:
            literal = readJson(folder / 'literal.json').get('verses', {})
        except ValueError:
            warnings.append('literal.json does not parse')
    optionZero = {slot for d in decisions for slot in (d['options'][0].get('forms') or {})}
    for d in decisions:
        for option in d['options'][1:]:
            unknown = [slot for slot in (option.get('forms') or {}) if slot not in optionZero]
            if unknown:
                warnings.append(f"decision {d['id']}: option “{option['label']}” fills {unknown[0]}, a slot no first option has")

    version = merged.get('version', 1)
    incipit = incipitOf(latin)
    return {
        'key': key, 'number': number, 'folder': folder, 'title': titleOf(number), 'incipit': incipit,
        'short': f'Ps {number}' if number <= 150 else incipit,
        'version': version, 'status': merged.get('status') or progress.get(number) or 'draft',
        'hour': merged.get('hour') or next((hour for hour, numbers in pilotHours if number in numbers), ''),
        'latin': latin, 'templates': merged['verses'], 'flat': flat, 'literal': literal,
        'decisions': [normalDecision(d) for d in decisions], 'choices': merged.get('choices') or {},
        'audit': merged.get('audit') or [], 'intro': merged.get('intro') or [],
        'notes': [merged[k] for k in ('note', 'producedBy') if isinstance(merged.get(k), str)],
        'legacyStoreKey': merged.get('legacyStoreKey'), 'warnings': warnings,
        'interlinear': interlinearOf(folder.parent, key),
    }


def normalDecision(d):
    refs = d.get('refs') or ([] if 'ref' not in d else [d['ref']])
    out = {'id': d['id'], 'refs': refs if isinstance(refs, list) else [refs], 'latin': d.get('latin', ''), 'kind': d.get('kind', ''), 'why': d.get('why', '')}
    for field in ('title', 'decided'):
        if d.get(field):
            out[field] = d[field]
    out['options'] = [{k: o[k] for k in ('label', 'forms', 'note', 'from', 'warn', 'mark') if o.get(k)} for o in d['options']]
    return out


def isOpen(d):
    return not d.get('decided')


def keptDrafts(p):
    """Every draft still on disk, oldest first, flattened: prayed.v1.json, prayed.v2.json, … then prayed.json itself."""
    kept = []
    for path in p['folder'].glob('prayed.v*.json'):
        match = re.fullmatch(r'prayed\.v(\d+)\.json', path.name)
        if not match or int(match.group(1)) >= int(p['version']):
            continue
        try:
            kept.append((int(match.group(1)), resolve(readJson(path))))
        except (ValueError, KeyError, TypeError):
            p['warnings'].append(f'{path.name} could not be read, so the layers view leaves it out')
    return [*sorted(kept, key=lambda pair: pair[0]), (int(p['version']), p['flat'])]


def interlinearOf(root, key):
    """The generated interlinear (interlinear/build.py), where it is on disk: {vid: [[form, gloss, morph, lemma(, 1)] | mark, …]}."""
    path = root / 'interlinear' / f'{key}.json'
    if not path.exists():
        return {}
    try:
        return readJson(path).get('verses') or {}
    except ValueError:
        return {}


def interlinearLegend(root):
    path = next((r / 'interlinear' / 'legend.json' for r in (root, here) if (r / 'interlinear' / 'legend.json').exists()), root / 'legend.json')
    try:
        legend = readJson(path) if path.exists() else {}
    except ValueError:
        legend = {}
    pairs = ' · '.join(f'<i>{esc(k)}</i> {esc(v)}' for k, v in (legend.get('abbreviations') or {}).items())
    return f"{esc(legend.get('order', ''))}. {pairs}" if pairs else ''


def remarksByVerse(reply):
    """A critic's findings keyed by verse id, whatever shape its prompt asked for."""
    found = {}
    if not isinstance(reply, dict):
        return found
    verses = reply.get('verses')
    for verse in verses if isinstance(verses, list) else []:
        if isinstance(verse, dict):
            items = [item for value in verse.values() if isinstance(value, list) for item in value if isinstance(item, dict)]
            found.setdefault(str(verse.get('id', '')), []).extend(items)
    for field, value in reply.items():
        if field != 'verses' and isinstance(value, list):
            for item in value:
                if isinstance(item, dict) and item.get('id'):
                    found.setdefault(str(item['id']), []).append(item)
    return found


def causesOf(p, drafts):
    """For each verse that changed between two kept drafts: who objected to the older one, and what the audit says.

    {vid: {newer version: [{'who', 'quoted', 'problem', 'proposed'} | {'who', 'note'}]}}. A critic file belongs to the
    draft its name carries (critic/v1.stylist.json, or the pilot's critic/prayed-v1.stylist.astra.json).
    """
    folder = p['folder']
    byVersion = {}
    for path in sorted((folder / 'critic').glob('*.json')) if (folder / 'critic').is_dir() else []:
        match = re.match(r'^(?:prayed-)?v(\d+)\.', path.name)
        if not match:
            continue
        try:
            critic = readJson(path)
        except ValueError:
            continue
        who = ' · '.join(filter(None, [str(critic.get('role', '')).replace('-critic', ''), str(critic.get('model', ''))]))
        for vid, items in remarksByVerse(parseReply(critic.get('reply'))).items():
            for item in items:
                remark = {
                    'who': who,
                    'quoted': item.get('words') or item.get('portuguese') or item.get('span') or item.get('word') or '',
                    'problem': item.get('problem') or item.get('explanation') or ' / '.join(str(r) for r in item.get('readings') or []),
                    'proposed': item.get('fix') or item.get('alternative') or '',
                }
                byVersion.setdefault(int(match.group(1)), {}).setdefault(vid, []).append(remark)
    causes = {}
    for (older, before), (newer, after) in zip(drafts, drafts[1:]):
        for vid in after:
            if before.get(vid) == after[vid]:
                continue
            # of the remarks on the older draft, those about what moved: the words they quote are gone, or a word they
            # proposed has come in; when none can be told apart that way, all of them are shown
            remarks = byVersion.get(older, {}).get(vid, [])
            nowPlain = plainWords(after[vid])
            added = set(nowPlain.split()) - set(plainWords(before.get(vid, '')).split())
            about = [r for r in remarks if (r['quoted'] and plainWords(r['quoted']) not in nowPlain) or added & set(plainWords(r['proposed']).split())]
            found = list(about or remarks)
            for step in p['audit']:
                note = str(step.get('note', '')) if isinstance(step, dict) else ''
                named = re.search(r'v(\d+)\.', str(step.get('file', ''))) if isinstance(step, dict) else None
                revision = re.match(r'\s*v(\d+)\b', note)
                version = int(named.group(1)) if named else int(revision.group(1)) - 1 if revision else older
                # only the clauses of the note that name this verse — a step's note runs through the whole psalm
                clauses = [c.strip() for c in re.split(r'(?<=[.;])\s+', note) if re.search(rf'(?<![\d:]){re.escape(vid)}(?![\da-z])', c)]
                if version == older and clauses:
                    found.append({'who': f"audit · {step.get('step', 'step')}", 'note': ' '.join(clauses)})
            if not found and p['choices'].get(vid):
                found.append({'who': 'the translator’s note on this verse', 'note': str(p['choices'][vid])})
            causes.setdefault(vid, {})[str(newer)] = found
    return causes


def stylistPreset(p):
    """The stylist's wording, if any of it still sits in an option. When every remark was taken into the text the view
    would be the draft itself: it is shown all the same, unselectable, saying so — an absent button reads as a missing
    reading."""
    if any(o.get('from') == 'stylist' for d in p['decisions'] for o in d['options'][1:]):
        return {'from': 'stylist', 'label': 'the stylist’s'}
    steps = [step for step in p['audit'] if 'stylist' in str(step.get('step', ''))]
    if not steps:
        return None
    taken = sum(1 for step in steps for o in step.get('outcomes') or [] if o.get('outcome') == 'taken')
    why = {0: 'none of his wordings is left to choose', 1: 'his one change was taken'}.get(taken, f'his {taken} changes were taken')
    return {'from': 'stylist', 'label': f"the stylist’s: same as draft {p['version']}, {why}", 'same': True}


def pageData(p, full=True):
    presets = [preset for preset in [stylistPreset(p)] if preset]
    data = {
        'key': p['key'], 'psalm': p['number'], 'title': p['title'], 'short': p['short'], 'version': p['version'],
        'storeKey': f"psalterium-{p['key']}-v{p['version']}",
        'verses': [{'id': v['id'], 'la': v['text'], 'pt': p['templates'][v['id']], 'literal': p['literal'].get(v['id'], '')} for v in p['latin']],
        'decisions': p['decisions'], 'presets': presets,
    }
    if p['legacyStoreKey']:
        data['legacyStoreKey'] = p['legacyStoreKey']
    if full:
        # the strata of the layers view and the interlinear; decisions.html carries every psalm at once and leaves them out
        drafts = keptDrafts(p)
        data['layers'] = {
            'drafts': [{'version': version, 'verses': flat} for version, flat in drafts],
            'causes': causesOf(p, drafts),
        }
        data['interlinear'] = {v['id']: p['interlinear'][v['id']] for v in p['latin'] if v['id'] in p['interlinear']}
    return data


def jsonScript(elementId, data):
    # "</" inside the JSON would end the script element early
    return f'<script type="application/json" id="{elementId}">{json.dumps(data, ensure_ascii=False).replace("</", "<\\/")}</script>'


# ───────── the audit trail ─────────

def plainWords(text):
    return ' '.join(re.sub(r'[^\w\s-]|[†‡*+_]', ' ', str(text).lower()).split())


def words(label):
    return re.sub(r'(?<=[a-z])(?=[A-Z])', ' ', label).lower()


def parseReply(reply):
    """A critic's reply is stored verbatim: a JSON string, sometimes fenced, sometimes with a sentence around it."""
    if isinstance(reply, (dict, list)):
        return reply
    text = re.sub(r'^```\w*\s*|\s*```$', '', str(reply).strip())
    for candidate in [text, (re.search(r'\{.*\}', text, flags=re.S) or [''])[0]]:
        try:
            return json.loads(candidate)
        except ValueError:
            continue
    return None


def recordedOutcome(item, vid, role, p):
    """The translator's own record of a remark's fate (audit step `outcomes`, AGENT-BRIEF.md), when there is one.

    Several remarks may fall on one verse: the record whose `remark` shares most words with this one wins.
    """
    records = [o for step in p['audit'] if step.get('step') == role for o in step.get('outcomes') or [] if o.get('verse') == vid]
    if not records:
        return None
    its = set(plainWords(' '.join(str(item.get(k) or '') for k in ('words', 'portuguese', 'span', 'word', 'problem', 'fix', 'alternative'))).split())
    best = max(records, key=lambda o: len(its & set(plainWords(o.get('remark') or '').split())))
    if len(records) > 1 and not its & set(plainWords(best.get('remark') or '').split()):
        return None
    reason = f' — {esc(best["reason"])}' if best.get('reason') else ''
    decision = next((d for d in p['decisions'] if d['id'] == best.get('decision')), None)
    if best.get('outcome') == 'pending':
        # left open on purpose for Gustavo: guessing from the text would pass it off as settled
        recommended = f' (recommended: {esc(best["recommendation"])})' if best.get('recommendation') else ''
        return 'pending', 'pending — for Gustavo' + recommended + reason
    if best.get('outcome') == 'taken':
        return 'taken', 'taken' + reason
    if best.get('outcome') == 'option' and decision:
        return 'option', f'kept as an option under <a href="#d-{esc(decision["id"])}">{esc(decision["latin"] or decision["id"])}</a>' + reason
    if best.get('outcome') in ('refused', 'option'):
        return 'refused' if best['outcome'] == 'refused' else 'option', ('not taken' if best['outcome'] == 'refused' else 'kept as an option') + reason
    return None


def outcomeOf(item, vid, role, p):
    """What became of one remark, read off the text as it now stands — the critics are never asked twice.

    taken: the proposed wording is in the verse today. kept as an option: a later option of a decision on this verse
    says what the critic proposed. Otherwise it was not taken as proposed; the step's note holds the translator's reason.
    """
    recorded = recordedOutcome(item, vid, role, p)
    if recorded:
        return recorded
    current = plainWords(p['flat'].get(vid, ''))
    proposed = plainWords(item.get('fix') or item.get('alternative') or '')
    quoted = plainWords(item.get('words') or item.get('portuguese') or item.get('span') or item.get('word') or '')
    if not current:
        return '', ''
    if not proposed:
        if quoted and quoted not in current:
            return 'taken', 'the wording has since changed'
        return '', 'a remark without a proposal; the wording stands' if quoted else ''
    if proposed in current or current in proposed:
        return 'taken', 'taken'
    firstForms = {slot: form for d in p['decisions'] for slot, form in (d['options'][0].get('forms') or {}).items()}
    fill = lambda text, depth=0: re.sub(r'\{(\w+)\}', lambda m: fill(firstForms.get(m.group(1), ''), depth + 1) if depth < 4 else '', text)  # noqa: E731
    for d in p['decisions']:
        if vid not in d['refs']:
            continue
        for option in d['options'][1:]:
            forms = [plainWords(fill(form)) for form in (option.get('forms') or {}).values()]
            if any(form and form in proposed for form in forms) or (option.get('from') == role and not forms):
                link = f'<a href="#d-{esc(d["id"])}">{esc(d["latin"] or d["id"])}</a>'
                return 'option', f'kept as an option — “{esc(option["label"])}”, under {link}' + ('' if isOpen(d) else ' (since decided)')
    return 'refused', 'not taken as proposed'


def remarkHtml(item, vid, role, p):
    if not isinstance(item, dict):
        return f'<p>{esc(str(item))}</p>'
    known = {'id', 'words', 'portuguese', 'span', 'word', 'latin', 'problem', 'explanation', 'fix', 'alternative', 'severity', 'category', 'readings', 'likelyHeard'}
    quoted = item.get('words') or item.get('portuguese') or item.get('span') or item.get('word')
    tags = ' · '.join(str(item[k]) for k in ('severity', 'category') if item.get(k))
    lines = []
    head = (f'<span lang="pt-BR">“{esc(quoted)}”</span>' if quoted else '') + (f' <i translate="no">{esc(item["latin"])}</i>' if item.get('latin') else '')
    if head or tags:
        lines.append(f'<p>{head}{f" <span class=tag>— {esc(tags)}</span>" if tags else ""}</p>')
    problem = item.get('problem') or item.get('explanation')
    if problem:
        lines.append(f'<p class="problem">{esc(problem)}</p>')
    if item.get('readings'):
        lines.append('<p class="problem">' + ' · '.join(f'<span class="vname">{n}</span>{esc(str(r))}' for n, r in enumerate(item['readings'], 1)) + '</p>')
    if item.get('likelyHeard'):
        lines.append(f'<p class="problem"><span class="vname">likely heard</span>{esc(str(item["likelyHeard"]))}</p>')
    proposed = item.get('fix') or item.get('alternative')
    if proposed:
        lines.append(f'<p lang="pt-BR"><span class="vname" lang="en">proposed</span>{esc(proposed)}</p>')
    for field, value in item.items():
        if field not in known and isinstance(value, (str, int, float)) and not isinstance(value, bool):
            lines.append(f'<p class="problem"><span class="vname">{esc(words(field))}</span>{esc(str(value))}</p>')
    kind, sentence = outcomeOf(item, vid, role, p)
    if sentence:
        lines.append(f'<p class="outcome {kind}">{"❧ " if kind == "taken" else ""}{sentence}</p>')
    return ''.join(lines)


def refCell(vid, p):
    known = vid in p['flat']
    shown = esc(vid.split(':', 1)[1] if ':' in vid and vid.split(':')[0] == str(p['number']) else vid)
    return f'<span class="ref"><a href="#v-{esc(vid.replace(":", "-"))}">{shown}</a></span>' if known else f'<span class="ref">{shown}</span>'


def verdictHtml(reply, role, p):
    """A critic's verdict, whatever its prompt asked for: per-verse findings, lists of remarks, closing sentences."""
    if reply is None:
        return ''
    if not isinstance(reply, dict):
        return f'<details><summary>The reply, as stored</summary><pre>{esc(json.dumps(reply, ensure_ascii=False, indent=1))}</pre></details>'
    out, rows, quiet = [], [], 0
    verses = reply.get('verses')
    if isinstance(verses, dict):
        body = ''.join(f'<div class="fix">{refCell(vid, p)}<div><p translate="no">{esc(str(text))}</p></div></div>' for vid, text in verses.items())
        out.append(f'<details><summary>The text as this reader gave it back ({len(verses)} verses)</summary><div class="fixes">{body}</div></details>')
    for verse in verses if isinstance(verses, list) else []:
        if not isinstance(verse, dict):
            continue
        vid = str(verse.get('id', ''))
        items = [item for value in verse.values() if isinstance(value, list) for item in value if isinstance(item, dict)]
        fails = list(verse.get('fails') or []) + [k for k, v in verse.items() if v is False]
        severity = verse.get('severity') if verse.get('severity') not in (None, '', 'none') else ''
        if not items and not fails and not severity:
            quiet += 1
            continue
        heading = ' · '.join(filter(None, [str(severity), f"fails: {', '.join(words(f) for f in fails)}" if fails else '', f"penalty {verse['penalty']}" if verse.get('penalty') else '']))
        body = (f'<p class="tag">{esc(heading)}</p>' if heading else '') + ''.join(remarkHtml(item, vid, role, p) for item in items)
        rows.append(f'<div class="fix">{refCell(vid, p)}<div>{body}</div></div>')
    for field, value in reply.items():
        if field != 'verses' and isinstance(value, list) and value and all(isinstance(item, dict) for item in value):
            body = ''.join(f'<div class="fix">{refCell(str(item.get("id", "")), p)}<div>{remarkHtml(item, str(item.get("id", "")), role, p)}</div></div>' for item in value)
            out.append(f'<p class="meta">{esc(words(field))} ({len(value)})</p><div class="fixes">{body}</div>')
    if rows:
        out.insert(0, f'<div class="fixes">{"".join(rows)}</div>')
    elif isinstance(verses, list):
        out.insert(0, '<p class="overall">Nothing to correct in any verse.</p>')
    for field, value in reply.items():
        if isinstance(value, str) and value.strip():
            label = '' if field == 'overall' else f'<span class="vname">{esc(words(field))}</span>'
            out.append(f'<p class="overall">{label}{esc(value)}</p>')
        elif isinstance(value, (int, float)) and not isinstance(value, bool):
            out.append(f'<p class="overall"><span class="vname">{esc(words(field))}</span>{value}</p>')
        elif isinstance(value, list) and value and all(isinstance(item, str) for item in value):
            out.append(f'<details><summary>{esc(words(field))} ({len(value)})</summary><ul>' + ''.join(f'<li>{esc(item)}</li>' for item in value) + '</ul></details>')
    return ''.join(out)


def criticHtml(path, p):
    relative = path.relative_to(p['folder']).as_posix()
    try:
        critic = readJson(path)
    except ValueError as error:
        return '', f'<p class="meta">{esc(relative)} does not parse yet ({esc(str(error))}).</p>'
    role = str(critic.get('role', '')).replace('-critic', '') or path.stem
    reply = parseReply(critic.get('reply'))
    meta = ' · '.join(filter(None, [str(critic.get('model', '')), str(critic.get('at', ''))[:10], relative, f"read {critic['target']}" if critic.get('target') else '']))
    body = verdictHtml(reply, role, p) if reply is not None else f'<details open><summary>The reply did not parse as JSON; as stored</summary><pre>{esc(str(critic.get("reply", "")))}</pre></details>'
    return role, f'<p class="meta">{esc(meta)}</p>{body}'


def auditHtml(p):
    folder = p['folder']
    critics = sorted((folder / 'critic').glob('*.json')) if (folder / 'critic').is_dir() else []
    used, steps = set(), []
    for note in p['notes']:
        steps.append(f'<div class="step"><p class="note">{esc(note)}</p></div>')
    for n, step in enumerate(p['audit'], 1):
        if not isinstance(step, dict):
            continue
        body = f'<p class="note">{esc(str(step["note"]))}</p>' if step.get('note') else ''
        if step.get('file'):
            path = folder / str(step['file'])
            used.add(path.resolve())
            body += criticHtml(path, p)[1] if path.exists() else f'<p class="meta">{esc(str(step["file"]))} is not on disk.</p>'
        steps.append(f'<div class="step"><h3><span class="ref">{n}</span>{esc(str(step.get("step", "step")))}</h3>{body}</div>')
    rest = []
    for path in critics:
        if path.resolve() in used:
            continue
        try:
            at = str(readJson(path).get('at', ''))
        except ValueError:
            at = ''
        rest.append((at or '9', path))
    for _, path in sorted(rest, key=lambda pair: (pair[0], pair[1].name)):
        role, body = criticHtml(path, p)
        steps.append(f'<div class="step"><h3>{esc(role or path.stem)}</h3>{body}</div>')
    for name, label in [('hard-readings.md', 'The hard readings, noted before translating'), ('decisions.md', 'decisions.md, as written for this psalm'), ('retrospective.md', 'The retrospective')]:
        if (folder / name).exists():
            rendered = renderMarkdown((folder / name).read_text(encoding='utf-8'), shift=2, idPrefix=f'{name[:-3]}-')
            steps.append(f'<div class="step prose wide" style="padding-left:0;padding-right:0"><details><summary>{esc(label)}</summary>{rendered}</details></div>')
    return ''.join(steps) or '<p class="empty">Nothing is recorded for this psalm yet.</p>'


def checksHtml(p):
    path = p['folder'] / 'checks.md'
    if not path.exists():
        return '<p class="empty">checks.py has not been run on this psalm.</p>'
    hard, failures, flagged, vid = '', [], [], ''
    for line in path.read_text(encoding='utf-8').splitlines():
        if line.startswith('**Hard'):
            hard = line
        elif line.startswith('- ') and 'failures' in hard and not vid:
            failures.append(line[2:])
        elif line.startswith('## '):
            vid = line[3:].strip()
        elif line.startswith('⚑'):
            flagged.append(('', line[1:].strip(), ''))
        elif line.startswith('|') and vid:
            row = cells(line)
            if len(row) >= 8 and row[7] and row[0] != 'colon' and not row[7].startswith('-'):
                flagged.append((vid, row[4], f'{row[7]} — Latin {row[2]} syllables, Portuguese {row[5]}'))
    out = [f'<div class="prose"><p>{inline(hard or "No hard result found in checks.md.")}</p>']
    if failures:
        out.append('<ul>' + ''.join(f'<li>{inline(f)}</li>' for f in failures) + '</ul>')
    out.append('</div>')
    if flagged:
        rows = ''.join(f'<div class="fix">{refCell(v, p) if v else "<span class=ref>⚑</span>"}<div><p lang="pt-BR">{esc(text)}</p>{f"<p class=problem>{esc(flag)}</p>" if flag else ""}</div></div>' for v, text, flag in flagged)
        out.append(f'<div class="fixes">{rows}</div>')
    else:
        out.append('<p class="empty">No colon was flagged.</p>')
    return ''.join(out)


# ───────── pages ─────────

def shell(title, body, base='', current='', scripts=''):
    nav = [('index.html', 'Psalterium'), ('glossary.html', 'glossary'), ('words/index.html', 'word studies'), ('decisions.html', 'decisions'), ('method.html', 'method')]
    links = ''.join(f'<a href="{base}{href}"{" aria-current=page" if href == current else ""}>{label}</a>' for href, label in nav)
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{base}assets/site.css">
</head>
<body>
<nav class="sitenav" aria-label="The site">{links}</nav>
{body}
{scripts}
</body>
</html>
'''


def marker(title, fleuron='❦', anchor=''):
    return f'<div class="marker"{f' id="{anchor}"' if anchor else ""}><div class="fleuron" aria-hidden="true">{fleuron}</div><h2>{esc(title)}</h2></div>'


def head(title, incipit='', standing='', warn=''):
    return (
        f'<header class="leaf-head"><div class="cross" aria-hidden="true">✠</div><h1>{esc(title)}</h1>'
        + (f'<p class="incipit">{incipit}</p>' if incipit else '')
        + (f'<p class="standing">{standing}</p>' if standing else '')
        + (f'<p class="standing warn">{esc(warn)}</p>' if warn else '')
        + '</header>'
    )


def switch(legend, name, options, elementId='', disabled=()):
    radios = ''.join(
        f'<span id="{oid}-wrap"><input type="radio" name="{name}" id="{oid}" value="{value}"{" disabled" if oid in disabled else ""}><label for="{oid}">{esc(label)}</label></span>' for oid, value, label in options
    )
    return f'<fieldset class="switch"{f" id={elementId}" if elementId else ""}><legend>{legend}</legend>{radios}</fieldset>'


def psalmPage(p, previous, following):
    data = pageData(p)
    presets = [(f"w-{preset['from']}", preset['from'], preset['label']) for preset in data['presets']]
    # Berean's three: the interlinear (generated), the literal tier (the scaffold), the standard (what is prayed)
    hasInterlinear = bool(data['interlinear'])
    hasLiteral = any(v['literal'] for v in data['verses'])
    versions = [
        ('ver-interlinear', 'interlinear', 'interlinear' if hasInterlinear else 'interlinear — not generated yet'),
        ('ver-literal', 'literal', 'literal' if hasLiteral else 'literal — no literal tier'),
        ('ver-standard', 'standard', 'standard'),
    ]
    bar = (
        '<nav class="bar" aria-label="How the psalm is shown">'
        + switch('version', 'version', versions, 'version-switch', disabled={oid for oid, value, _ in versions if (value == 'interlinear' and not hasInterlinear) or (value == 'literal' and not hasLiteral)})
        + switch('view', 'view', [('view-facing', 'facing', 'facing columns'), ('view-layers', 'layers', 'the layers')], 'view-switch')
        + switch('pointing', 'pointing', [('p-app', 'app', 'as Ember shows it'), ('p-full', 'full', 'with flexes')])
        + switch('wording', 'preset', [('w-draft', 'draft', f"draft {p['version']}"), *presets, ('w-mine', 'mine', 'my choices')], 'wording-switch', disabled={f"w-{preset['from']}" for preset in data['presets'] if preset.get('same')})
        + switch('beside it', 'beside', [('b-none', 'none', 'nothing'), ('b-literal', 'literal', 'the literal tier'), ('b-pt', 'pt', 'português'), ('b-en', 'en', 'english'), ('b-all', 'all', 'both')], 'beside-switch')
        + '</nav><div id="pop" role="dialog" aria-label="Decide this wording" hidden></div>'
    )
    openCount = sum(1 for d in p['decisions'] if isOpen(d) and d['refs'])
    standing = f"Draft {p['version']}{', ' + esc(p['hour']) if p['hour'] else ''} — {esc(p['status'])}. Pray it aloud first; then decide below. Every choice you make rewrites the psalm here, so what you pray is what you chose. Nothing is final until you say so."
    legend = (
        f"Dotted gold marks words still waiting for your decision — touch one to choose its wording where it stands. A gold wash marks where your choice departs from draft {p['version']}."
        if openCount else 'No wording is open in this psalm.'
    )
    draftCount = len(data['layers']['drafts'])
    layersLegend = (
        'Each verse from the Latin down to what is prayed. Between one draft and the next, words that left are struck through and words that came carry the gold wash; beside them, who objected and what the audit says. A verse no draft touched folds to one line — open it to see its strata.'
        if draftCount > 1 else
        f"Each verse from the Latin down to what is prayed. Only draft {p['version']} is on disk for this psalm (no prayed.v&lt;k&gt;.json was kept), so there is no earlier wording to compare it with; your own choices show as a further layer."
    )
    choices = ''.join(f'<div class="fix">{refCell(vid, p)}<div><p>{esc(str(note))}</p></div></div>' for vid, note in p['choices'].items())
    turn = (
        '<nav class="turn" aria-label="Neighbouring psalms">'
        + (f'<a href="{previous["key"]}.html">← {esc(previous["title"])}</a>' if previous else '<span></span>')
        + (f'<a href="{following["key"]}.html">{esc(following["title"])} →</a>' if following else '<span></span>')
        + '</nav>'
    )
    body = f'''{bar}
{head(p['title'], f'<span translate="no">{esc(p["incipit"])}</span>', standing, ' '.join(p['warnings']))}
<main>
  <section class="psalm" id="blocks" aria-label="Other psalters, whole"></section><section class="psalm" id="psalm" aria-label="{esc(p['title'])}, Latin and Portuguese"></section>
  <p class="legend" id="legend">{legend}</p>
  <p class="legend" id="legend-layers" hidden>{layersLegend}</p>
  <p class="legend" id="legend-literal" hidden>The literal tier: the Latin’s words and order kept as far as Portuguese grammar allows — the scaffold the prayed text was made from, not a text to pray.</p>
  <p class="legend" id="legend-interlinear" hidden>Word by word: under each Latin word, its lemma’s dictionary sense and its form. Generated, not translated — LatinCy’s parse, unreviewed, and one gloss per lemma (<code>interlinear/</code>); … marks a gloss not yet written, and a dotted word a lemma rare in the psalter. Under each verse, the prayed text as you have chosen it. {interlinearLegend(p['folder'].parent)}</p>

  {marker('What is yours to decide', anchor='decide')}
  {'<div class="prose">' + ''.join(f'<p>{esc(para)}</p>' for para in p['intro']) + '</div>' if p['intro'] else ''}
  <div id="decisions"></div>

  {marker('The audit trail', anchor='audit')}
  <div class="audit">{auditHtml(p)}</div>

  {marker('Verse by verse', anchor='choices')}
  {f'<div class="fixes">{choices}</div>' if choices else '<p class="empty">No notes on the verses.</p>'}

  {marker('What the checks found', anchor='checks')}
  {checksHtml(p)}

  {marker('Where the mouth stumbled', anchor='stumbled')}
  <div class="decision stumbles">
    <p class="why">Verse, the words, what happened. Date it. This is the evidence no model can produce.</p>
    <textarea id="stumbles" placeholder="{esc(p['latin'][0]['id'])} — the words: what happened at recitation pace…" aria-label="Stumbles while praying"></textarea>
  </div>

  <div class="handback">
    <button id="copy" type="button">Copy my decisions</button>
    <button id="reset" type="button" class="quiet">Start over</button>
    <span id="copied" role="status"></span>
    <textarea id="fallback" hidden aria-label="Your decisions as text"></textarea>
  </div>
  {turn}
  <div class="handback"></div>
</main>'''
    # other psalters: built by compare.py into the gitignored consult/ folder; the page works without the file
    scripts = f'{jsonScript("psalm-data", data)}\n<script src="../consult/compare/{p["key"]}.js"></script>\n<script src="assets/psalm.js"></script>'
    return shell(f"{p['title']} — Psalterium", body, scripts=scripts)


def indexPage(psalms, incomplete):
    built = {p['number']: p for p in psalms}
    broken = {number: reason for number, reason in incomplete}

    def row(number):
        latin = latinVerses(number)
        name = f'<span class="name">{esc(titleOf(number))} <i translate="no">{esc(incipitOf(latin))}</i></span>'
        count = f'<span class="count">{len(latin)} verses</span>' if latin else '<span class="count"></span>'
        if number in built:
            p = built[number]
            openCount = sum(1 for d in p['decisions'] if isOpen(d))
            return (
                f'<a class="row" href="{p["key"]}.html"><span class="n">{number}</span>{name}<span class="status">{esc(p["status"])}</span>'
                f'<span class="count">{len(p["latin"])} verses · {openCount} open</span><span class="version">v{esc(str(p["version"]))}</span></a>'
            )
        if number in broken:
            return f'<div class="row"><span class="n">{number}</span>{name}<span class="status incomplete" title="{esc(broken[number])}">incomplete</span>{count}<span class="version"></span></div>'
        return f'<div class="row idle"><span class="n">{number}</span>{name}<span class="status">not started</span>{count}<span class="version"></span></div>'

    canticles = sorted(n for n in {*built, *broken, *[n for _, numbers in pilotHours for n in numbers]} if n > 150)
    sections = [marker(hour) + f'<div class="ledger">{"".join(row(n) for n in numbers)}</div>' for hour, numbers in pilotHours]
    sections.append(marker('The Psalter', '✠') + f'<div class="ledger">{"".join(row(n) for n in range(1, 151))}</div>')
    if canticles:
        sections.append(marker('Canticles') + f'<div class="ledger">{"".join(row(n) for n in canticles)}</div>')
    if broken:
        notes = ''.join(f'<li>{esc(titleOf(n))}: {esc(reason)}</li>' for n, reason in sorted(broken.items()))
        sections.append(marker('Incomplete', '❧') + f'<div class="prose"><p>These folders exist but could not be built; they are skipped until the next run finds them whole.</p><ul>{notes}</ul></div>')
    done = len(built)
    openTotal = sum(1 for p in psalms for d in p['decisions'] if isOpen(d))
    standing = f'The Gallican Psalter in Brazilian Portuguese, to be prayed beside the Latin. {done} of 150 psalms and canticles drafted; {openTotal} decisions open.'
    contents = '<p class="contents"><a href="glossary.html">the glossary</a> <a href="words/index.html">word studies</a> <a href="decisions.html">every open decision</a> <a href="decisions.html#decided">what is decided</a> <a href="method.html">the method</a> <a href="notes.html">working notes</a></p>'
    return shell('Psalterium', head('Psalterium', 'Psalmi Davidis, lingua Brasiliensi', standing) + f'<main>{contents}{"".join(sections)}<div class="handback"></div></main>', current='index.html')


def makeLinker(sourceDir, root, base, builtKeys, wordNames):
    """Rewrites a link written for the repo into one that works from a site page."""
    docAnchors = {path: key for key, path, _ in noteDocs}

    def linkFor(href, known=False):
        if re.match(r'^(\w+:|#|//)', href):
            return None if known else href
        target, _, fragment = href.partition('#')
        try:
            relative = (sourceDir / target).resolve().relative_to(root.resolve()).as_posix()
        except ValueError:
            relative = target
        if known and not (root / relative).exists():
            # a bare `words/exaudire.md` in running text is written from the project root, wherever the note lives
            relative = target
        name = Path(relative).name
        if relative.startswith('words/') and name.split('.')[0] in wordNames:
            return f"{base}words/{name.split('.')[0]}.html" + ('#concordance' if '.concordance' in name else '')
        if relative == 'glossary.md':
            return f'{base}glossary.html' + (f'#{fragment}' if fragment else '')
        if relative == 'method.md':
            return f'{base}method.html' + (f'#method-{fragment}' if fragment else '')
        if relative in docAnchors:
            return f'{base}notes.html#doc-{docAnchors[relative]}'
        if re.match(r'^ps\d{3}(/|$)', relative) and relative[:5] in builtKeys:
            return f'{base}{relative[:5]}.html'
        if known:
            return None
        return f'{base}../{relative}' + (f'#{fragment}' if fragment else '')

    return linkFor


def wordPages(root, out, builtKeys, written):
    folder = root / 'words'
    names = sorted({path.name.split('.')[0] for path in folder.glob('*.md')}) if folder.is_dir() else []
    linkFor = makeLinker(folder, root, '../', builtKeys, set(names))

    def cellFor(text, column, header):
        match = re.fullmatch(r'(\d+):(\d+[a-z]?)', text)
        key = f'ps{int(match.group(1)):03d}' if match else ''
        return f'\x01<a href="../{key}.html#v-{match.group(1)}-{match.group(2)}">{text}</a>\x02' if column == 0 and key in builtKeys else text

    listing = []
    for name in names:
        study, concordance = folder / f'{name}.md', folder / f'{name}.concordance.md'
        parts = []
        if study.exists():
            parts.append(f'<div class="prose wide">{renderMarkdown(dropTitle(study.read_text(encoding="utf-8")), linkFor, shift=1, idPrefix="s-")}</div>')
        if concordance.exists():
            parts.append(marker('Concordance', anchor='concordance') + f'<div class="prose wide">{renderMarkdown(dropTitle(concordance.read_text(encoding="utf-8")), linkFor, cellFor, shift=1, idPrefix="c-")}</div>')
        standing = 'A word study, with every occurrence in the psalter.' if study.exists() else 'The concordance only — no study has been written for this word yet.'
        body = head(name, '', standing) + f'<main>{"".join(parts)}<div class="handback"></div></main>'
        write(out / 'words' / f'{name}.html', shell(f'{name} — Psalterium', body, base='../', current='words/index.html', scripts='<script src="../assets/words.js"></script>'), written)
        firstLine = next((line for line in (concordance.read_text(encoding='utf-8').splitlines() if concordance.exists() else []) if 'occurrences' in line), '')
        tally = re.search(r'(\d+ occurrences in \d+ psalms)', firstLine)
        listing.append(f'<a class="row" href="{name}.html" style="grid-template-columns:1fr 12rem 9rem"><span class="name"><i translate="no">{esc(name)}</i></span><span class="count">{esc(tally.group(1)) if tally else ""}</span><span class="status">{"study and concordance" if study.exists() else "concordance"}</span></a>')
    body = head('Word studies', '', 'The heavy-duty words: what each is in the psalter, its neighbours, and what is proposed for it.') + f'<main><div class="ledger">{"".join(listing) or "<p class=empty>None yet.</p>"}</div><div class="handback"></div></main>'
    write(out / 'words' / 'index.html', shell('Word studies — Psalterium', body, base='../', current='words/index.html'), written)
    return names


def dropTitle(text):
    return re.sub(r'\A\s*#\s+.*\n', '', text, count=1)


def stemOf(term):
    word = max(re.findall(r'[a-z]+', fold(term).lower()) or [''], key=len)
    # enough of the word to catch its inflected forms (exaudi- for exaudívit, exáudi, exáudiet), no less
    return word[: max(4, len(word) - 2)] if len(word) > 5 else word


def glossaryPage(root, psalms, wordNames):
    source = (root / 'glossary.md').read_text(encoding='utf-8')
    builtKeys = {p['key'] for p in psalms}
    linkFor = makeLinker(root, root, '', builtKeys, set(wordNames))

    def mentions(term):
        stems = [stemOf(part) for part in re.split(r'\s+/\s+', term)]
        found = []
        for p in psalms:
            for d in p['decisions']:
                # the Latin the decision is about, not its English reasoning ("verb" is not verbum)
                haystack = fold(' '.join([d['id'], d['latin']])).lower()
                if any(stem and re.search(rf'\b{re.escape(stem)}', haystack) for stem in stems):
                    found.append(f'<a href="{p["key"]}.html#d-{esc(d["id"])}">{esc(p["short"])}</a>')
                    break
        return found

    def cellFor(text, column, header):
        if column != 0 or header[0].strip().lower() != 'latin' or not text:
            return text
        names = [name for part in re.split(r'\s+/\s+', text) for name in wordNames if fold(re.sub(r'[*_`]', '', part)).lower().strip() == name]
        studied = lambda name: (root / 'words' / f'{name}.md').exists()  # noqa: E731
        links = [f'<a href="words/{name}.html">{"the study" if studied(name) else "the concordance"}</a>' for name in names] + mentions(re.sub(r'[*_`]', '', text))
        return text + (f'\x01<span class="links">{" ".join(links)}</span>\x02' if links else '')

    body = head('Glossary', '', 'One rendering per controlled Latin term, so that what repeats in the Latin repeats in the Portuguese. Under a term: its word study, and the psalms where a decision turns on it.')
    return shell('Glossary — Psalterium', body + f'<main><div class="prose wide">{renderMarkdown(dropTitle(source), linkFor, cellFor, shift=1)}</div><div class="handback"></div></main>', current='glossary.html')


def methodPage(root, psalms, wordNames):
    path = root / 'method.md'
    require(path.exists(), 'method.md is not on disk')
    linkFor = makeLinker(root, root, '', {p['key'] for p in psalms}, set(wordNames))
    rendered = renderMarkdown(dropTitle(path.read_text(encoding='utf-8')), linkFor, idPrefix='method-')
    body = head('Method', '', 'How this psalter is made — for someone meeting it for the first time.')
    return shell('Method — Psalterium', body + f'<main><div class="prose">{rendered}</div><div class="handback"></div></main>', current='method.html')


def notesPage(root, psalms, wordNames):
    builtKeys = {p['key'] for p in psalms}
    present = [(key, root / path, label) for key, path, label in noteDocs if (root / path).exists()]
    require(present, 'none of the working notes is on disk')
    contents = '<p class="contents">' + ' '.join(f'<a href="#doc-{key}">{esc(label)}</a>' for key, _, label in present) + '</p>'
    sections = []
    for key, path, label in present:
        linkFor = makeLinker(path.parent, root, '', builtKeys, set(wordNames))
        rendered = renderMarkdown(dropTitle(path.read_text(encoding='utf-8')), linkFor, shift=1, idPrefix=f'{key}-')
        sections.append(marker(label, anchor=f'doc-{key}') + f'<div class="prose wide">{rendered}</div>')
    body = head('Working notes', '', 'The project’s own files, as they stand: how the run is organised, where it has got to, the brief each translator reads, the pilot’s lessons, and the log of every ruling. For how the psalter is made, read the method first.')
    return shell('Working notes — Psalterium', body + f'<main>{contents}{"".join(sections)}<div class="handback"></div></main>', current='notes.html')


def decisionsPage(root, psalms):
    kinds = sorted({d['kind'] for p in psalms for d in p['decisions'] if isOpen(d) and d['kind']})
    data = {'psalms': [pageData(p, full=False) for p in psalms], 'kindIds': {kind: f'k-{slug(kind)}' for kind in kinds}}
    bar = (
        '<nav class="bar" aria-label="Which decisions are shown">'
        + switch('kind', 'kind', [('k-all', 'all', 'all'), *[(f'k-{slug(kind)}', kind, kind) for kind in kinds]])
        + '<label class="switch"><span style="color:var(--ink-2);font-style:italic;margin-right:.9rem">psalm</span><select id="psalm-filter" aria-label="Psalm"><option value="all">all</option>'
        + ''.join(f'<option value="{p["key"]}">{esc(p["short"])}</option>' for p in psalms)
        + '</select></label></nav>'
    )
    decided = [f'<div class="fix"><span class="ref"><a href="{p["key"]}.html#d-{esc(d["id"])}">{esc(p["short"])}</a></span><div><p><i translate="no">{esc(d["latin"] or d.get("title", ""))}</i> — <span lang="pt-BR">{esc(d["options"][0]["label"])}</span></p><p class="problem">{esc(str(d["decided"]))}</p></div></div>' for p in psalms for d in p['decisions'] if not isOpen(d)]
    glossary = root / 'glossary.md'
    for line in glossary.read_text(encoding='utf-8').splitlines() if glossary.exists() else []:
        row = cells(line) if line.startswith('|') else []
        if len(row) >= 3 and 'decided' in [c.strip().lower() for c in row[2:4]]:
            decided.append(f'<div class="fix"><span class="ref"><a href="glossary.html">glossary</a></span><div><p>{inline(row[0])} — {inline(row[1])}</p></div></div>')
    body = f'''{bar}
{head('Decisions', '', 'Every open decision in every psalm, so that a glossary-grade choice can be made once. A choice made here is the same choice on the psalm’s own page: both keep it in this browser.')}
<main>
  <div id="decisions"></div>
  <div class="handback">
    <button id="copy" type="button">Copy every decision, all psalms</button>
    <span id="copied" role="status"></span>
    <textarea id="fallback" hidden aria-label="Your decisions as text"></textarea>
  </div>
  {marker('Decided', '✠', 'decided')}
  {f'<div class="fixes">{"".join(decided)}</div>' if decided else '<p class="empty">Nothing is marked decided yet.</p>'}
  <div class="handback"></div>
</main>'''
    scripts = f'{jsonScript("decisions-data", data)}\n<script src="assets/psalm.js"></script>\n<script src="assets/decisions.js"></script>'
    return shell('Decisions — Psalterium', body, current='decisions.html', scripts=scripts)


# ───────── the build ─────────

def write(path, text, written):
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists() or path.read_text(encoding='utf-8') != text:
        path.write_text(text, encoding='utf-8')
    written.add(path.resolve())


def main():
    args = sys.argv[1:]
    option = lambda name, default: Path(args[args.index(name) + 1]).resolve() if name in args else default  # noqa: E731
    root = option('--root', here)
    out = option('--out', root / 'site')
    written, failures = set(), []

    def attempt(label, build):
        try:
            return build()
        except Exception as error:  # noqa: BLE001 — one broken page must never stop the night's build
            if '--trace' in args:
                traceback.print_exc()
            failures.append(f'{label}: {type(error).__name__}: {error}')
            return None

    progress = attempt('PROGRESS.md', lambda: progressTable(root)) or {}
    psalms, incomplete = [], []
    for folder in sorted(root.glob('ps[0-9][0-9][0-9]')):
        if not folder.is_dir():
            continue
        try:
            psalms.append(loadPsalm(folder, progress))
        except Exception as error:  # noqa: BLE001 — a half-written folder is listed, not fatal
            if '--trace' in args:
                traceback.print_exc()
            incomplete.append((int(folder.name[2:]), str(error) if isinstance(error, ValueError) else f'{type(error).__name__}: {error}'))

    for name in ('site.css', 'psalm.js', 'decisions.js', 'words.js', 'method.svg'):
        (out / 'assets').mkdir(parents=True, exist_ok=True)
        if (here / 'assets' / name).exists():
            shutil.copyfile(here / 'assets' / name, out / 'assets' / name)

    shown = []
    for index, p in enumerate(psalms):
        previous = shown[-1] if shown else None
        page = attempt(p['key'], lambda p=p, previous=previous, index=index: psalmPage(p, previous, psalms[index + 1] if index + 1 < len(psalms) else None))
        if page is None:
            incomplete.append((p['number'], 'the page could not be rendered — see the build output'))
            continue
        write(out / f"{p['key']}.html", page, written)
        shown.append(p)
    psalms = shown

    wordNames = attempt('words', lambda: wordPages(root, out, {p['key'] for p in psalms}, written)) or []
    for name, build in [
        ('index.html', lambda: indexPage(psalms, incomplete)),
        ('glossary.html', lambda: glossaryPage(root, psalms, wordNames)),
        ('method.html', lambda: methodPage(root, psalms, wordNames)),
        ('notes.html', lambda: notesPage(root, psalms, wordNames)),
        ('decisions.html', lambda: decisionsPage(root, psalms)),
    ]:
        page = attempt(name, build)
        if page is not None:
            write(out / name, page, written)

    # a psalm that stopped building must not leave last run's page behind as if it were current
    for stale in out.rglob('*.html'):
        if stale.resolve() not in written:
            stale.unlink()

    print(f'{len(psalms)} psalm pages, {len(wordNames)} word pages → {out}')
    for number, reason in incomplete:
        print(f'  incomplete  ps{number:03d}: {reason}')
    for failure in failures:
        print(f'  failed      {failure}')


main()
