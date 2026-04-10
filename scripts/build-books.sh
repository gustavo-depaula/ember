#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BOOKS_SRC="$REPO_ROOT/content/books"
BOOKS_OUT="${1:-$BOOKS_SRC}"
EPUB_CSS="$BOOKS_SRC/ember-epub.css"

mkdir -p "$BOOKS_OUT"

# Build EPUBs from XHTML sources (before zipping .pray archives)
python3 -c "
import json, os, glob, zipfile, datetime, subprocess, shutil

PANDOC = shutil.which('pandoc')

def convert_md_to_xhtml(md_path, chapter_id, lang, title):
    \"\"\"Convert a markdown file to EPUB-valid XHTML via pandoc.\"\"\"
    if not PANDOC:
        raise RuntimeError('pandoc not found — install it to build markdown chapters')
    with open(md_path, 'r', encoding='utf-8') as f:
        md_text = f.read()
    result = subprocess.run(
        [PANDOC, '--from=markdown', '--to=html5'],
        input=md_text, capture_output=True, text=True, check=True,
    )
    lang_code = lang.split('-')[0]
    return '''<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<html xmlns=\"http://www.w3.org/1999/xhtml\"
      xmlns:epub=\"http://www.idpf.org/2007/ops\"
      xml:lang=\"{lang_code}\">
<head>
  <title>{title}</title>
  <link rel=\"stylesheet\" type=\"text/css\" href=\"style.css\"/>
</head>
<body>
  <section id=\"{chapter_id}\" epub:type=\"chapter\">
{body}
  </section>
</body>
</html>'''.format(lang_code=lang_code, title=title, chapter_id=chapter_id, body=result.stdout)

def get_toc_title(toc, leaf_id, lang):
    \"\"\"Walk TOC tree to find title for a leaf ID.\"\"\"
    for node in toc:
        if node['id'] == leaf_id:
            return node.get('title', {}).get(lang, node.get('title', {}).get('en-US', leaf_id))
        children = node.get('children')
        if children:
            found = get_toc_title(children, leaf_id, lang)
            if found:
                return found
    return None

def chapter_exists(lang_dir, lid):
    \"\"\"Check if a chapter source file (.xhtml or .md) exists.\"\"\"
    return (os.path.exists(os.path.join(lang_dir, f'{lid}.xhtml'))
            or os.path.exists(os.path.join(lang_dir, f'{lid}.md')))

BOOKS_SRC = '$BOOKS_SRC'
EPUB_CSS = '$EPUB_CSS'

def build_nav_xhtml(toc, lang):
    \"\"\"Generate nav.xhtml from TOC nodes.\"\"\"
    def render_nodes(nodes, indent=3):
        lines = []
        pad = '  ' * indent
        for node in nodes:
            title = node.get('title', {}).get(lang, node.get('title', {}).get('en-US', node['id']))
            children = node.get('children')
            if children:
                lines.append(f'{pad}<li><span>{title}</span>')
                lines.append(f'{pad}  <ol>')
                lines.extend(render_nodes(children, indent + 2))
                lines.append(f'{pad}  </ol>')
                lines.append(f'{pad}</li>')
            else:
                lines.append(f'{pad}<li><a href=\"{node[\"id\"]}.xhtml\">{title}</a></li>')
        return lines

    ol_lines = render_nodes(toc)
    return '''<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<html xmlns=\"http://www.w3.org/1999/xhtml\"
      xmlns:epub=\"http://www.idpf.org/2007/ops\">
<head><title>Table of Contents</title></head>
<body>
  <nav epub:type=\"toc\">
    <h1>Contents</h1>
    <ol>
''' + '\\n'.join(ol_lines) + '''
    </ol>
  </nav>
</body>
</html>'''

def collect_leaf_ids(toc):
    \"\"\"Depth-first leaf node IDs from TOC tree.\"\"\"
    ids = []
    for node in toc:
        children = node.get('children')
        if children:
            ids.extend(collect_leaf_ids(children))
        else:
            ids.append(node['id'])
    return ids

def build_package_opf(epub_meta, lang, leaf_ids, timestamp, has_stylesheet=False, image_items=None):
    if image_items is None:
        image_items = []
    \"\"\"Generate package.opf for a single language rendition.\"\"\"
    name = epub_meta.get('name', {}).get(lang, epub_meta.get('name', {}).get('en-US', epub_meta['id']))
    author = epub_meta.get('author', {}).get(lang, epub_meta.get('author', {}).get('en-US', ''))
    desc = epub_meta.get('description', {}).get(lang, epub_meta.get('description', {}).get('en-US', ''))

    manifest_items = [
        '<item id=\"nav\" href=\"nav.xhtml\" media-type=\"application/xhtml+xml\" properties=\"nav\"/>',
    ]
    if has_stylesheet:
        manifest_items.append('<item id=\"style\" href=\"style.css\" media-type=\"text/css\"/>')
    for img_name, img_media in image_items:
        safe_id = img_name.replace('.', '_').replace('-', '_')
        manifest_items.append(f'<item id=\"{safe_id}\" href=\"images/{img_name}\" media-type=\"{img_media}\"/>')
    spine_refs = []
    for lid in leaf_ids:
        manifest_items.append(f'<item id=\"{lid}\" href=\"{lid}.xhtml\" media-type=\"application/xhtml+xml\"/>')
        spine_refs.append(f'<itemref idref=\"{lid}\"/>')

    meta_lines = [
        f'<dc:identifier id=\"uid\">urn:salty:{epub_meta[\"id\"]}:{lang}</dc:identifier>',
        f'<dc:title>{name}</dc:title>',
        f'<dc:language>{lang}</dc:language>',
        f'<meta property=\"dcterms:modified\">{timestamp}</meta>',
    ]
    if author:
        meta_lines.append(f'<dc:creator>{author}</dc:creator>')
    if desc:
        meta_lines.append(f'<dc:description>{desc}</dc:description>')
    composed = epub_meta.get('composed')
    if isinstance(composed, int):
        meta_lines.append(f'<dc:date>{composed}</dc:date>')

    return '''<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<package xmlns=\"http://www.idpf.org/2007/opf\"
         version=\"3.0\"
         unique-identifier=\"uid\">

  <metadata xmlns:dc=\"http://purl.org/dc/elements/1.1/\">
    {metadata}
  </metadata>

  <manifest>
    {manifest}
  </manifest>

  <spine>
    {spine}
  </spine>

</package>'''.format(
        metadata='\\n    '.join(meta_lines),
        manifest='\\n    '.join(manifest_items),
        spine='\\n    '.join(spine_refs),
    )

def build_container_xml(lang):
    return '''<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<container version=\"1.0\" xmlns=\"urn:oasis:names:tc:opendocument:xmlns:container\">
  <rootfiles>
    <rootfile full-path=\"{lang}/package.opf\"
              media-type=\"application/oebps-package+xml\"/>
  </rootfiles>
</container>'''.format(lang=lang)

def build_epub(epub_dir, epub_meta):
    \"\"\"Build one EPUB per language from XHTML sources.\"\"\"
    toc = epub_meta.get('toc', [])
    if not toc:
        return []

    all_leaf_ids = collect_leaf_ids(toc)
    timestamp = datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
    built = []

    for lang in epub_meta.get('languages', []):
        lang_dir = os.path.join(epub_dir, lang)
        if not os.path.isdir(lang_dir):
            continue

        # Filter leaf IDs to only chapters that exist for this language
        leaf_ids = [lid for lid in all_leaf_ids if chapter_exists(lang_dir, lid)]
        if not leaf_ids:
            continue

        # Filter TOC to only include nodes with existing chapters
        def filter_toc(nodes):
            filtered = []
            for node in nodes:
                children = node.get('children')
                if children:
                    fc = filter_toc(children)
                    if fc:
                        filtered.append({**node, 'children': fc})
                elif node['id'] in leaf_ids:
                    filtered.append(node)
            return filtered
        lang_toc = filter_toc(toc)

        # Shared stylesheet (injected from content/books/ember-epub.css)
        has_stylesheet = os.path.exists(EPUB_CSS)
        image_items = []
        images_dir = os.path.join(lang_dir, 'images')
        if os.path.isdir(images_dir):
            ext_to_media = {'.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml'}
            for img_name in sorted(os.listdir(images_dir)):
                ext = os.path.splitext(img_name)[1].lower()
                if ext in ext_to_media:
                    image_items.append((img_name, ext_to_media[ext]))

        out_path = os.path.join(epub_dir, f'{epub_meta[\"id\"]}.{lang}.epub')

        with zipfile.ZipFile(out_path, 'w') as zf:
            # mimetype must be first, uncompressed
            zf.writestr('mimetype', 'application/epub+zip', compress_type=zipfile.ZIP_STORED)

            # META-INF/container.xml
            zf.writestr('META-INF/container.xml', build_container_xml(lang))

            # Language rendition (uses filtered TOC and leaf_ids)
            zf.writestr(f'{lang}/package.opf', build_package_opf(epub_meta, lang, leaf_ids, timestamp, has_stylesheet, image_items))
            zf.writestr(f'{lang}/nav.xhtml', build_nav_xhtml(lang_toc, lang))

            # Stylesheet (shared Ember EPUB stylesheet)
            if has_stylesheet:
                zf.write(EPUB_CSS, f'{lang}/style.css')

            # Images
            for img_name, _ in image_items:
                zf.write(os.path.join(images_dir, img_name), f'{lang}/images/{img_name}')

            # Chapter files (.xhtml or .md)
            for lid in leaf_ids:
                xhtml_path = os.path.join(lang_dir, f'{lid}.xhtml')
                md_path = os.path.join(lang_dir, f'{lid}.md')
                if os.path.exists(xhtml_path):
                    zf.write(xhtml_path, f'{lang}/{lid}.xhtml')
                elif os.path.exists(md_path):
                    title = get_toc_title(toc, lid, lang) or lid
                    xhtml_content = convert_md_to_xhtml(md_path, lid, lang, title)
                    zf.writestr(f'{lang}/{lid}.xhtml', xhtml_content)

        built.append(out_path)
        print(f'    {epub_meta[\"id\"]}.{lang}.epub')

    return built

# Process all books
for book_dir in sorted(glob.glob(os.path.join(BOOKS_SRC, '*/'))):
    epubs_dir = os.path.join(book_dir, 'epubs')
    if not os.path.isdir(epubs_dir):
        continue

    book_json_path = os.path.join(book_dir, 'book.json')
    if not os.path.exists(book_json_path):
        continue

    book_name = os.path.basename(book_dir.rstrip('/'))
    for epub_sub in sorted(glob.glob(os.path.join(epubs_dir, '*/'))):
        epub_json = os.path.join(epub_sub, 'epub.json')
        if not os.path.exists(epub_json):
            continue
        meta = json.load(open(epub_json))
        print(f'  Building EPUBs for {meta[\"id\"]} in {book_name}:')
        build_epub(epub_sub, meta)
"

# Build .pray archives
for book_dir in "$BOOKS_SRC"/*/; do
  [ -f "$book_dir/book.json" ] || continue
  book_id=$(basename "$book_dir")
  version=$(python3 -c "import json; print(json.load(open('$book_dir/book.json'))['version'])")
  filename="${book_id}-${version}.pray"

  # Remove stale archive
  rm -f "$BOOKS_OUT/$filename"

  # Exclude EPUB sources — only epub.json and built .epub files ship in .pray
  (cd "$book_dir" && zip -r "$BOOKS_OUT/$filename" . \
    -x '.*' \
    'epubs/*/*.xhtml' 'epubs/*/*/*.xhtml' \
    'epubs/*/*.md' 'epubs/*/*/*.md' \
    'epubs/*/*.css' 'epubs/*/*/*.css' \
    'epubs/*/images/*' 'epubs/*/*/images/*' \
    > /dev/null)
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

    # Read epub metadata for preview
    epubs_preview = []
    for eid in m.get('epubs', []):
        ep_path = os.path.join(book_dir, 'epubs', eid, 'epub.json')
        if os.path.exists(ep_path):
            ep = json.load(open(ep_path))
            entry = {'id': eid, 'name': ep.get('name', {})}
            if 'author' in ep:
                entry['author'] = ep['author']
            if 'image' in ep:
                entry['image'] = ep['image']
            epubs_preview.append(entry)
        else:
            epubs_preview.append({'id': eid, 'name': {'en-US': eid}})

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
    if epubs_preview:
        entry['epubs'] = epubs_preview
    books.append(entry)

with open(os.path.join('$BOOKS_OUT', 'registry.json'), 'w') as f:
    json.dump({'version': 1, 'books': books}, f, indent=2, ensure_ascii=False)
print(f'  registry.json ({len(books)} books)')
"
