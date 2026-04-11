#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LIBRARIES_SRC="$REPO_ROOT/content/libraries"
BOOKS_OUT="${1:-$LIBRARIES_SRC}"
BOOK_CSS="$LIBRARIES_SRC/ember-book.css"

mkdir -p "$BOOKS_OUT"

# Phase 1: Copy shared stylesheet to each book's language directories
python3 -c "
import json, os, glob, shutil

LIBRARIES_SRC = '$LIBRARIES_SRC'
BOOK_CSS = '$BOOK_CSS'

if not os.path.exists(BOOK_CSS):
    print('  Warning: ember-book.css not found, skipping style copy')
else:
    for lib_dir in sorted(glob.glob(os.path.join(LIBRARIES_SRC, '*/'))):
        books_dir = os.path.join(lib_dir, 'books')
        if not os.path.isdir(books_dir):
            continue
        for book_sub in sorted(glob.glob(os.path.join(books_dir, '*/'))):
            book_json = os.path.join(book_sub, 'book.json')
            if not os.path.exists(book_json):
                continue
            meta = json.load(open(book_json))
            for lang in meta.get('languages', []):
                lang_dir = os.path.join(book_sub, lang)
                if os.path.isdir(lang_dir):
                    shutil.copy2(BOOK_CSS, os.path.join(lang_dir, 'style.css'))
"

# Phase 2: Build .pray archives
for lib_dir in "$LIBRARIES_SRC"/*/; do
  [ -f "$lib_dir/library.json" ] || continue
  lib_id=$(basename "$lib_dir")
  version=$(python3 -c "import json; print(json.load(open('$lib_dir/library.json'))['version'])")
  filename="${lib_id}-${version}.pray"

  rm -f "$BOOKS_OUT/$filename"

  # Include everything; exclude dot-files and .epub binaries
  (cd "$lib_dir" && zip -r "$BOOKS_OUT/$filename" . \
    -x '.*' \
    > /dev/null)
  echo "  $filename ($(wc -c < "$BOOKS_OUT/$filename" | tr -d ' ') bytes)"
done

# Phase 3: Generate registry.json
python3 -c "
import json, os, glob, hashlib

books = []
for lib_dir in sorted(glob.glob('$LIBRARIES_SRC/*/')):
    mp = os.path.join(lib_dir, 'library.json')
    if not os.path.exists(mp):
        continue
    m = json.load(open(mp))
    bid, ver = m['id'], m['version']
    fn = f'{bid}-{ver}.pray'
    pp = os.path.join('$BOOKS_OUT', fn)

    # Read practice names for preview
    practices_preview = []
    for pid in m.get('practices', []):
        pm_path = os.path.join(lib_dir, 'practices', pid, 'manifest.json')
        if os.path.exists(pm_path):
            pm = json.load(open(pm_path))
            practices_preview.append({'id': pid, 'name': pm.get('name', {}), 'icon': pm.get('icon', 'prayer')})
        else:
            practices_preview.append({'id': pid, 'name': {'en-US': pid}, 'icon': 'prayer'})

    # Read prayer asset titles for preview
    prayers_preview = []
    for prid in m.get('prayers', []):
        pr_path = os.path.join(lib_dir, 'prayers', f'{prid}.json')
        if os.path.exists(pr_path):
            pr = json.load(open(pr_path))
            prayers_preview.append({'id': prid, 'title': pr.get('title', {})})
        else:
            prayers_preview.append({'id': prid, 'title': {'en-US': prid}})

    # Read chapter titles for preview
    chapters_preview = []
    for cid in m.get('chapters', []):
        cm_path = os.path.join(lib_dir, 'chapters', cid, 'chapter.json')
        if os.path.exists(cm_path):
            cm = json.load(open(cm_path))
            chapters_preview.append({'id': cid, 'title': cm.get('title', {})})
        else:
            chapters_preview.append({'id': cid, 'title': {'en-US': cid}})

    # Read book metadata for preview
    books_preview = []
    for eid in m.get('books', []):
        ep_path = os.path.join(lib_dir, 'books', eid, 'book.json')
        if os.path.exists(ep_path):
            ep = json.load(open(ep_path))
            entry = {'id': eid, 'name': ep.get('name', {})}
            if 'author' in ep:
                entry['author'] = ep['author']
            if 'image' in ep:
                entry['image'] = ep['image']
            books_preview.append(entry)
        else:
            books_preview.append({'id': eid, 'name': {'en-US': eid}})

    content_hash = ''
    if os.path.exists(pp):
        with open(pp, 'rb') as hf:
            content_hash = hashlib.sha256(hf.read()).hexdigest()[:12]

    entry = {
        'id': bid,
        'version': ver,
        'name': m.get('name', {}),
        'description': m.get('description', {}),
        'languages': m.get('languages', []),
        'tags': m.get('tags', []),
        'practiceCount': len(m.get('practices', [])),
        'practices': practices_preview,
        'prayers': prayers_preview,
        'chapters': chapters_preview,
        'contents': m.get('contents', None),
        'size': os.path.getsize(pp) if os.path.exists(pp) else 0,
        'file': fn,
        'contentHash': content_hash,
    }
    if books_preview:
        entry['books'] = books_preview
    books.append(entry)

with open(os.path.join('$BOOKS_OUT', 'registry.json'), 'w') as f:
    json.dump({'version': 1, 'books': books}, f, indent=2, ensure_ascii=False)
print(f'  registry.json ({len(books)} libraries)')
"
