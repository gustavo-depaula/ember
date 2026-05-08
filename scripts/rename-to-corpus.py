#!/usr/bin/env python3
"""Hearth v2 rename pass.

Flattens content/libraries/{lib}/{kind}/{id} into content/{kind}/{id}, resolves
the two known collisions, generates content/collections/{lib}.json from each
old library.json, archives auxiliary directories (sources/, extra/, scripts/)
under content/_archive/{lib}/, and moves the spiritual-checkup data to
content/checkup/.

Run with --dry-run first to inspect; without flags it actually moves files.
"""
from __future__ import annotations

import argparse
import json
import shutil
import sys
from pathlib import Path
from typing import Iterable

ROOT = Path(__file__).resolve().parent.parent
LIBRARIES_DIR = ROOT / "content" / "libraries"
CONTENT = ROOT / "content"

# Auxiliary subdirs that are NOT corpus content — preserve under _archive.
AUX_SUBDIRS = {"sources", "extra", "scripts", "html-cache"}

# Subdirs handled with kind-specific mapping.
KIND_SUBDIRS = {"prayers", "practices", "chapters", "books"}


def info(msg: str) -> None:
    print(f"[rename] {msg}")


def ensure_parent(p: Path) -> None:
    p.parent.mkdir(parents=True, exist_ok=True)


def move(src: Path, dst: Path, dry: bool) -> None:
    info(f"  {src.relative_to(ROOT)} → {dst.relative_to(ROOT)}")
    if dry:
        return
    if dst.exists():
        raise SystemExit(f"refusing to overwrite existing {dst}")
    ensure_parent(dst)
    shutil.move(str(src), str(dst))


def remove(src: Path, dry: bool) -> None:
    info(f"  rm {src.relative_to(ROOT)}")
    if dry:
        return
    if src.is_dir():
        shutil.rmtree(src)
    else:
        src.unlink()


def resolve_collisions(dry: bool) -> dict[str, str]:
    """Apply the two collision resolutions. Returns id-remap for the affected libs."""
    info("Phase 1: resolving collisions")

    # te-deum: keep base, delete breviary copy.
    breviary_te_deum = LIBRARIES_DIR / "breviary" / "prayers" / "te-deum.json"
    if breviary_te_deum.exists():
        remove(breviary_te_deum, dry)

    # ladainha-nossa-senhora: keep novenas as canonical; rename claretiano edition.
    cl_src = LIBRARIES_DIR / "ave-maria-claretiano" / "prayers" / "ladainha-nossa-senhora.json"
    cl_dst = LIBRARIES_DIR / "ave-maria-claretiano" / "prayers" / "ladainha-nossa-senhora-claretiano.json"
    if cl_src.exists():
        move(cl_src, cl_dst, dry)

    # Returns: per-library map from old prayer id → new prayer id, so we can
    # rewrite the old library.json's prayer list when generating collections.
    return {
        "breviary": {"removed_prayers": ["te-deum"]},
        "ave-maria-claretiano": {"renamed_prayers": {"ladainha-nossa-senhora": "ladainha-nossa-senhora-claretiano"}},
    }


def kind_target(library: str, kind_dir: str, item_name: str) -> Path:
    """Where does an item move to in the corpus tree?"""
    if kind_dir == "prayers":
        return CONTENT / "prayers" / item_name
    if kind_dir == "practices":
        return CONTENT / "practices" / item_name
    if kind_dir == "chapters":
        return CONTENT / "chapters" / item_name
    if kind_dir == "books":
        return CONTENT / "books" / item_name
    raise ValueError(f"unknown kind {kind_dir}")


def move_kind_dirs(dry: bool) -> None:
    info("Phase 2: moving prayers/practices/chapters/books")
    for lib_dir in sorted(LIBRARIES_DIR.iterdir()):
        if not lib_dir.is_dir():
            continue
        for kind in ("prayers", "practices", "chapters", "books"):
            kd = lib_dir / kind
            if not kd.is_dir():
                continue
            entries = sorted(kd.iterdir())
            for entry in entries:
                if kind == "prayers":
                    if entry.suffix != ".json":
                        continue
                    dst = CONTENT / "prayers" / entry.name
                else:
                    if not entry.is_dir():
                        continue
                    dst = CONTENT / kind / entry.name
                move(entry, dst, dry)
            # If the kind dir is now empty, remove it
            if not dry and kd.is_dir() and not any(kd.iterdir()):
                kd.rmdir()


def move_of_tree(dry: bool) -> None:
    """Reshape base/of/ into content/{masses,of-library,of-data}/."""
    info("Phase 3: reshaping base/of/ tree")
    of_dir = LIBRARIES_DIR / "base" / "of"
    if not of_dir.is_dir():
        return

    # masses → content/masses/of/
    masses_src = of_dir / "masses"
    if masses_src.is_dir():
        masses_dst = CONTENT / "masses" / "of"
        info(f"  {masses_src.relative_to(ROOT)} → {masses_dst.relative_to(ROOT)}")
        if not dry:
            masses_dst.parent.mkdir(parents=True, exist_ok=True)
            if masses_dst.exists():
                raise SystemExit(f"refusing to overwrite {masses_dst}")
            shutil.move(str(masses_src), str(masses_dst))

    # library/{ordinary,preface,eucharistic-prayer} → content/of-library/{kind}/
    of_lib_src = of_dir / "library"
    if of_lib_src.is_dir():
        for kind_dir in sorted(of_lib_src.iterdir()):
            if not kind_dir.is_dir():
                continue
            dst = CONTENT / "of-library" / kind_dir.name
            move(kind_dir, dst, dry)
        # Move stray library-level files (e.g. library.json) too
        for stray in sorted(of_lib_src.iterdir()) if of_lib_src.exists() else []:
            dst = CONTENT / "of-library" / "_meta" / stray.name
            move(stray, dst, dry)
        if not dry and of_lib_src.is_dir() and not any(of_lib_src.iterdir()):
            of_lib_src.rmdir()

    # calendar/, saints/, igmr/, sacerdotale/ → content/of-data/{...}/
    for sub in ("calendar", "saints", "igmr", "sacerdotale"):
        src = of_dir / sub
        if src.is_dir():
            dst = CONTENT / "of-data" / sub
            move(src, dst, dry)

    # Anything else left in of/ — move under _archive
    if of_dir.is_dir():
        for stray in sorted(of_dir.iterdir()):
            dst = CONTENT / "_archive" / "base" / "of" / stray.name
            move(stray, dst, dry)
        if not dry and of_dir.is_dir() and not any(of_dir.iterdir()):
            of_dir.rmdir()


def move_checkup(dry: bool) -> None:
    """base/checkup/ → content/checkup/"""
    info("Phase 4: moving base/checkup/")
    src = LIBRARIES_DIR / "base" / "checkup"
    if src.is_dir():
        dst = CONTENT / "checkup"
        move(src, dst, dry)


def archive_aux(dry: bool) -> None:
    """Move sources/, extra/, scripts/ from each library under content/_archive/{lib}/."""
    info("Phase 5: archiving auxiliary dirs (sources, extra, scripts)")
    for lib_dir in sorted(LIBRARIES_DIR.iterdir()):
        if not lib_dir.is_dir():
            continue
        for sub in AUX_SUBDIRS:
            src = lib_dir / sub
            if src.is_dir():
                dst = CONTENT / "_archive" / lib_dir.name / sub
                move(src, dst, dry)


def generate_collection(library_id: str, library_json: dict, remap: dict) -> dict:
    """Build a content/collections/{lib}.json from the old library.json."""
    # The old library.json had: id, name, description, languages, tags, icon, image,
    # practices[], prayers[], chapters[], books[], contents[] (TOC), defaults, etc.
    items: list[dict] = []

    # Preserve ordering from `contents` if present; otherwise use the per-kind arrays.
    contents = library_json.get("contents")
    if isinstance(contents, list) and contents:
        for entry in contents:
            kind = entry.get("kind") or entry.get("type")
            iid = entry.get("id")
            if not (kind and iid):
                continue
            if kind == "practice":
                items.append({"ref": f"practice/{iid}"})
            elif kind == "prayer":
                # apply prayer remap
                renamed = remap.get(library_id, {}).get("renamed_prayers", {})
                removed = remap.get(library_id, {}).get("removed_prayers", [])
                if iid in removed:
                    continue
                iid = renamed.get(iid, iid)
                items.append({"ref": f"prayer/{iid}"})
            elif kind == "chapter":
                items.append({"ref": f"chapter/{iid}"})
            elif kind == "book":
                items.append({"ref": f"book/{iid}"})
    else:
        for pid in library_json.get("practices", []) or []:
            items.append({"ref": f"practice/{pid}"})
        for prid in library_json.get("prayers", []) or []:
            renamed = remap.get(library_id, {}).get("renamed_prayers", {})
            removed = remap.get(library_id, {}).get("removed_prayers", [])
            if prid in removed:
                continue
            prid = renamed.get(prid, prid)
            items.append({"ref": f"prayer/{prid}"})
        for cid in library_json.get("chapters", []) or []:
            items.append({"ref": f"chapter/{cid}"})
        for bid in library_json.get("books", []) or []:
            items.append({"ref": f"book/{bid}"})

    out: dict = {
        "id": f"collection/{library_id}",
        "version": library_json.get("version", "1.0.0"),
        "name": library_json.get("name", {}),
        "description": library_json.get("description", {}),
        "languages": library_json.get("languages", []),
        "tags": library_json.get("tags", []),
        "items": items,
    }
    if "icon" in library_json:
        out["icon"] = library_json["icon"]
    if "image" in library_json:
        out["image"] = library_json["image"]
    if "defaults" in library_json:
        out["defaults"] = library_json["defaults"]
    if "_vendored" in library_json:
        # legacy field from build pipeline; drop it
        pass
    return out


def write_collections(remap: dict, dry: bool) -> None:
    info("Phase 6: generating content/collections/{lib}.json")
    coll_dir = CONTENT / "collections"
    if not dry:
        coll_dir.mkdir(parents=True, exist_ok=True)

    for lib_dir in sorted(LIBRARIES_DIR.iterdir()):
        if not lib_dir.is_dir():
            continue
        lib_id = lib_dir.name
        lib_json_path = lib_dir / "library.json"
        if not lib_json_path.is_file():
            info(f"  WARN no library.json for {lib_id}")
            continue
        with lib_json_path.open(encoding="utf-8") as f:
            lib_json = json.load(f)
        collection = generate_collection(lib_id, lib_json, remap)
        out = coll_dir / f"{lib_id}.json"
        info(f"  write {out.relative_to(ROOT)}")
        if not dry:
            with out.open("w", encoding="utf-8") as f:
                json.dump(collection, f, indent=2, ensure_ascii=False)
                f.write("\n")


def remove_library_dirs(dry: bool) -> None:
    info("Phase 7: removing now-empty library directories and library.json files")
    for lib_dir in sorted(LIBRARIES_DIR.iterdir()):
        if not lib_dir.is_dir():
            continue
        # Anything left? If only library.json remains, remove the whole dir.
        leftover = [p for p in lib_dir.iterdir() if p.name not in {"library.json", ".gitkeep"}]
        if leftover:
            info(f"  WARN {lib_dir.name} still has leftover entries:")
            for p in leftover:
                info(f"    {p.relative_to(ROOT)}")
            continue
        remove(lib_dir, dry)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="print what would happen, don't move anything")
    args = parser.parse_args()
    dry = args.dry_run

    if not LIBRARIES_DIR.is_dir():
        print(f"error: {LIBRARIES_DIR} not found", file=sys.stderr)
        return 1

    info(f"{'DRY RUN' if dry else 'EXECUTE'} starting from {ROOT}")
    remap = resolve_collisions(dry)
    write_collections(remap, dry)
    move_kind_dirs(dry)
    move_of_tree(dry)
    move_checkup(dry)
    archive_aux(dry)
    remove_library_dirs(dry)
    info("done")
    return 0


if __name__ == "__main__":
    sys.exit(main())
