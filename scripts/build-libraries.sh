#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LIBRARIES_SRC="$REPO_ROOT/content/libraries"
LIBRARIES_OUT="${1:-$LIBRARIES_SRC}"
# Resolve to absolute path (the script cd's into library dirs for zip)
case "$LIBRARIES_OUT" in
  /*) ;;
  *)  LIBRARIES_OUT="$REPO_ROOT/$LIBRARIES_OUT" ;;
esac
BOOK_CSS="$LIBRARIES_SRC/ember-book.css"

mkdir -p "$LIBRARIES_OUT"

STAGING_DIR=$(mktemp -d)
trap 'rm -rf "$STAGING_DIR"' EXIT

# Phase 0: Vendor cross-library prayer dependencies into staging
python3 "$REPO_ROOT/scripts/vendor-prayers.py" "$LIBRARIES_SRC" "$STAGING_DIR"

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

  # Use staged (vendored) copy if it exists, otherwise use source
  build_dir="$lib_dir"
  if [ -d "$STAGING_DIR/$lib_id" ]; then
    build_dir="$STAGING_DIR/$lib_id"
  fi

  version=$(python3 -c "import json; print(json.load(open('$build_dir/library.json'))['version'])")
  filename="${lib_id}-${version}.pray"

  rm -f "$LIBRARIES_OUT/$filename"

  # Include everything; exclude dot-files
  (cd "$build_dir" && zip -r "$LIBRARIES_OUT/$filename" . \
    -x '.*' \
    > /dev/null)
  echo "  $filename ($(wc -c < "$LIBRARIES_OUT/$filename" | tr -d ' ') bytes)"
done

# Phase 3: Generate registry.json
python3 -c "
import json, os, glob, hashlib

staging_dir = '$STAGING_DIR'
libraries = []
for lib_dir in sorted(glob.glob('$LIBRARIES_SRC/*/')):
    mp = os.path.join(lib_dir, 'library.json')
    if not os.path.exists(mp):
        continue
    # Use staged (vendored) copy if it exists
    lid_check = os.path.basename(lib_dir.rstrip('/'))
    staged = os.path.join(staging_dir, lid_check)
    if os.path.isdir(staged):
        lib_dir = staged + '/'
        mp = os.path.join(staged, 'library.json')
    m = json.load(open(mp))
    lid, ver = m['id'], m['version']
    fn = f'{lid}-{ver}.pray'
    pp = os.path.join('$LIBRARIES_OUT', fn)

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
        'id': lid,
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
    libraries.append(entry)

with open(os.path.join('$LIBRARIES_OUT', 'registry.json'), 'w') as f:
    json.dump({'version': 1, 'libraries': libraries}, f, indent=2, ensure_ascii=False)
print(f'  registry.json ({len(libraries)} libraries)')
"
