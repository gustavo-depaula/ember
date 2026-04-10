#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BOOKS_SRC="$REPO_ROOT/content/books"
BOOKS_OUT="${1:-$BOOKS_SRC}"

mkdir -p "$BOOKS_OUT"

# Build .pray archives
for book_dir in "$BOOKS_SRC"/*/; do
  [ -f "$book_dir/book.json" ] || continue
  book_id=$(basename "$book_dir")
  version=$(python3 -c "import json; print(json.load(open('$book_dir/book.json'))['version'])")
  filename="${book_id}-${version}.pray"

  # Remove stale archive
  rm -f "$BOOKS_OUT/$filename"

  (cd "$book_dir" && zip -r "$BOOKS_OUT/$filename" . -x '.*' > /dev/null)
  echo "  $filename ($(wc -c < "$BOOKS_OUT/$filename" | tr -d ' ') bytes)"
done

# Generate registry.json
python3 -c "
import json, os, glob, hashlib

books = []
for book_dir in sorted(glob.glob('$BOOKS_SRC/*/')):
    mp = os.path.join(book_dir, 'book.json')
    if not os.path.exists(mp):
        continue
    m = json.load(open(mp))
    bid, ver = m['id'], m['version']
    fn = f'{bid}-{ver}.pray'
    pp = os.path.join('$BOOKS_OUT', fn)
    # Read practice names for preview
    practices_preview = []
    for pid in m.get('practices', []):
        pm_path = os.path.join(book_dir, 'practices', pid, 'manifest.json')
        if os.path.exists(pm_path):
            pm = json.load(open(pm_path))
            practices_preview.append({'id': pid, 'name': pm.get('name', {}), 'icon': pm.get('icon', 'prayer')})
        else:
            practices_preview.append({'id': pid, 'name': {'en-US': pid}, 'icon': 'prayer'})

    # Read prayer asset titles for preview
    prayers_preview = []
    for prid in m.get('prayers', []):
        pr_path = os.path.join(book_dir, 'prayers', f'{prid}.json')
        if os.path.exists(pr_path):
            pr = json.load(open(pr_path))
            prayers_preview.append({'id': prid, 'title': pr.get('title', {})})
        else:
            prayers_preview.append({'id': prid, 'title': {'en-US': prid}})

    # Read chapter titles for preview
    chapters_preview = []
    for cid in m.get('chapters', []):
        cm_path = os.path.join(book_dir, 'chapters', cid, 'chapter.json')
        if os.path.exists(cm_path):
            cm = json.load(open(cm_path))
            chapters_preview.append({'id': cid, 'title': cm.get('title', {})})
        else:
            chapters_preview.append({'id': cid, 'title': {'en-US': cid}})

    content_hash = ''
    if os.path.exists(pp):
        with open(pp, 'rb') as hf:
            content_hash = hashlib.sha256(hf.read()).hexdigest()[:12]

    books.append({
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
    })

with open(os.path.join('$BOOKS_OUT', 'registry.json'), 'w') as f:
    json.dump({'version': 1, 'books': books}, f, indent=2, ensure_ascii=False)
print(f'  registry.json ({len(books)} books)')
"
