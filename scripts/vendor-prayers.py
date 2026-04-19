#!/usr/bin/env python3
"""
Build-time vendoring: resolves qualified prayer refs (libraryId:prayerId)
into local prayers so .pray packages are fully self-contained.

Usage:
    vendor-prayers.py <libraries_src> <staging_dir>

For each library, this script:
  1. Scans flow.json files for qualified refs like "base:sign-of-cross"
  2. Copies the library to <staging_dir>/<lib_id>/
  3. Copies the referenced prayer from the named source library
  4. Rewrites refs to bare IDs (strips the library prefix)
  5. Patches library.json (adds vendored prayer IDs, adds _vendored metadata)

Libraries with no qualified refs are left untouched (no staging copy).
"""

import json
import shutil
import sys
from pathlib import Path


def collect_and_strip_qualified_refs(obj):
    """Recursively collect qualified prayer refs and strip prefixes in-place.

    Returns the set of qualified refs found (before stripping).
    """
    refs = set()
    if isinstance(obj, dict):
        if obj.get('type') == 'prayer' and 'ref' in obj:
            ref = obj['ref']
            if ':' in ref:
                refs.add(ref)
                obj['ref'] = ref.split(':', 1)[1]
        for v in obj.values():
            refs |= collect_and_strip_qualified_refs(v)
    elif isinstance(obj, list):
        for item in obj:
            refs |= collect_and_strip_qualified_refs(item)
    return refs


def vendor_library(lib_dir, libraries_src, staging_dir):
    """Vendor a single library: resolve qualified refs, copy prayers, strip prefixes."""
    lib_meta = json.loads((lib_dir / 'library.json').read_text())
    lib_id = lib_meta['id']

    # Scan source for qualified refs (to decide if staging is needed)
    has_qualified = False
    practices_dir = lib_dir / 'practices'
    if practices_dir.is_dir():
        for flow_path in practices_dir.rglob('*.json'):
            if flow_path.name == 'manifest.json':
                continue
            try:
                text = flow_path.read_text()
            except UnicodeDecodeError:
                continue
            if '":' not in text:
                continue
            try:
                data = json.loads(text)
            except json.JSONDecodeError:
                continue
            if any(
                isinstance(n, dict) and n.get('type') == 'prayer' and ':' in n.get('ref', '')
                for n in _walk(data)
            ):
                has_qualified = True
                break

    if not has_qualified:
        return None

    # Copy library to staging
    staged = staging_dir / lib_id
    if staged.exists():
        shutil.rmtree(staged)
    shutil.copytree(lib_dir, staged)

    # Single pass: collect refs and strip qualifiers on staged copies
    qualified_refs = set()
    staged_practices = staged / 'practices'
    if staged_practices.is_dir():
        for flow_path in staged_practices.rglob('*.json'):
            if flow_path.name == 'manifest.json':
                continue
            try:
                data = json.loads(flow_path.read_text())
            except (json.JSONDecodeError, UnicodeDecodeError):
                continue
            found = collect_and_strip_qualified_refs(data)
            if found:
                qualified_refs |= found
                flow_path.write_text(
                    json.dumps(data, indent=2, ensure_ascii=False) + '\n'
                )

    # Copy prayers and track provenance
    vendored = {}  # source_lib_id -> [prayer_ids]
    prayers_dir = staged / 'prayers'
    prayers_dir.mkdir(exist_ok=True)

    for qref in sorted(qualified_refs):
        source_lib_id, prayer_id = qref.split(':', 1)
        source_path = libraries_src / source_lib_id / 'prayers' / f'{prayer_id}.json'
        if source_path.exists():
            shutil.copy2(source_path, prayers_dir / f'{prayer_id}.json')
            vendored.setdefault(source_lib_id, []).append(prayer_id)
        else:
            print(f'  Warning: {qref} not found ({lib_id})')

    # Patch library.json
    patched = json.loads((staged / 'library.json').read_text())
    existing_prayers = patched.get('prayers', [])
    for pids in vendored.values():
        for pid in pids:
            if pid not in existing_prayers:
                existing_prayers.append(pid)
    patched['prayers'] = existing_prayers
    patched['_vendored'] = {k: sorted(v) for k, v in sorted(vendored.items())}
    (staged / 'library.json').write_text(
        json.dumps(patched, indent=2, ensure_ascii=False) + '\n'
    )

    total = sum(len(v) for v in vendored.values())
    print(f'  {lib_id}: vendored {total} prayers from {list(vendored.keys())}')
    return staged


def _walk(obj):
    """Yield all dicts/lists in a nested structure."""
    if isinstance(obj, dict):
        yield obj
        for v in obj.values():
            yield from _walk(v)
    elif isinstance(obj, list):
        for item in obj:
            yield from _walk(item)


def main():
    if len(sys.argv) != 3:
        print(f'Usage: {sys.argv[0]} <libraries_src> <staging_dir>')
        sys.exit(1)

    libraries_src = Path(sys.argv[1])
    staging_dir = Path(sys.argv[2])
    staging_dir.mkdir(parents=True, exist_ok=True)

    for lib_dir in sorted(libraries_src.iterdir()):
        lib_json = lib_dir / 'library.json'
        if not lib_json.exists():
            continue
        vendor_library(lib_dir, libraries_src, staging_dir)


if __name__ == '__main__':
    main()
