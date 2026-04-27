"""CCEL ThML → Ember book CLI."""

from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

from . import markdown as md
from . import metadata as meta
from . import thml


REPO_ROOT = Path(__file__).resolve().parent.parent.parent
LIBRARIES_DIR = REPO_ROOT / "content" / "libraries"


@dataclass
class CliArgs:
    input_path: Path
    library: str
    book_id: str
    language: str
    chapter_level: str
    composed_override: Optional[str]
    author_override: Optional[str]
    title_override: Optional[str]
    library_root: Path
    dry_run: bool


def main(argv: Optional[list[str]] = None) -> int:
    args = _parse_args(argv)
    return _run(args)


def _parse_args(argv: Optional[list[str]]) -> CliArgs:
    p = argparse.ArgumentParser(
        prog="ccel-import",
        description="Convert a CCEL ThML XML file to an Ember book directory.",
    )
    p.add_argument("--input", required=True, help="Path to a local ThML .xml file")
    p.add_argument("--library", default="ccel-classics", help="Target library id under content/libraries/")
    p.add_argument("--book-id", required=True, help="Ember book id (kebab-case, ASCII)")
    p.add_argument("--language", default=None, help="BCP-47 language for this edition (overrides DC.Language)")
    p.add_argument(
        "--chapter-level",
        default="auto",
        choices=["auto", "div1", "div2", "div3", "div4"],
        help="Which div level becomes one chapter file (default: auto by median word count)",
    )
    p.add_argument("--composed", default=None, help="Override composed date (e.g. 1418, 'c. 1418')")
    p.add_argument("--author", default=None, help="Override author for this language")
    p.add_argument("--title", default=None, help="Override title for this language")
    p.add_argument("--library-root", default=str(LIBRARIES_DIR), help="Path to content/libraries/")
    p.add_argument("--dry-run", action="store_true", help="Print plan without writing files")

    ns = p.parse_args(argv)
    return CliArgs(
        input_path=Path(ns.input).expanduser().resolve(),
        library=ns.library,
        book_id=ns.book_id,
        language=ns.language or "",
        chapter_level=ns.chapter_level,
        composed_override=ns.composed,
        author_override=ns.author,
        title_override=ns.title,
        library_root=Path(ns.library_root).expanduser().resolve(),
        dry_run=ns.dry_run,
    )


def _run(args: CliArgs) -> int:
    if not args.input_path.is_file():
        print(f"error: input file not found: {args.input_path}", file=sys.stderr)
        return 2

    raw = args.input_path.read_bytes()
    tree = thml.parse(raw)
    book_meta = meta.extract(tree)

    language = args.language or book_meta.language or "en-US"
    title = args.title_override or book_meta.title or args.book_id
    author = args.author_override or book_meta.author
    composed = (
        meta._parse_composed(args.composed_override)
        if args.composed_override is not None
        else book_meta.composed
    )

    body = thml.find_body(tree)
    roots = thml.walk(body)
    if not roots:
        print("error: no <divN> elements found under <ThML.body>", file=sys.stderr)
        return 3

    chapter_level = thml.pick_chapter_level(roots, args.chapter_level)
    chapters = thml.flatten_chapters(roots, chapter_level)

    print(
        f"  parsed: {len(roots)} top-level div(s); chapter level = div{chapter_level}; "
        f"{len(chapters)} chapter(s)"
    )
    if not chapters:
        print("error: chapter level produced zero chapters", file=sys.stderr)
        return 3

    book_dir = args.library_root / args.library / "books" / args.book_id
    lang_dir = book_dir / language

    toc, chapter_files, stats = _build_chapters(chapters, language)

    book_json = _build_book_manifest(
        book_id=args.book_id,
        language=language,
        title=title,
        author=author,
        composed=composed,
        source_url=book_meta.source_url,
        source_description=book_meta.source_description or "Christian Classics Ethereal Library (ccel.org)",
        toc=toc,
    )

    print(f"  TOC nodes: {len(toc)} top-level; chapter files: {len(chapter_files)}")
    if stats.dropped_links:
        print(f"  dropped cross-document links: {stats.dropped_links}")
    if stats.unknown_elements:
        items = ", ".join(f"{k}:{v}" for k, v in sorted(stats.unknown_elements.items()))
        print(f"  unknown elements (passed through as text): {items}")

    if args.dry_run:
        print("  --dry-run: not writing files")
        print(json.dumps(book_json, indent=2, ensure_ascii=False))
        return 0

    lang_dir.mkdir(parents=True, exist_ok=True)
    book_json_path = book_dir / "book.json"
    book_json_path.write_text(
        json.dumps(book_json, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"  wrote {book_json_path.relative_to(args.library_root)}")

    for filename, body_md in chapter_files:
        out = lang_dir / f"{filename}.md"
        out.write_text(body_md, encoding="utf-8")
    print(f"  wrote {len(chapter_files)} chapter(s) to {lang_dir.relative_to(args.library_root)}/")

    _update_library_manifest(
        library_root=args.library_root,
        library_id=args.library,
        book_id=args.book_id,
        language=language,
    )
    return 0


def _build_chapters(
    chapters: list[tuple[list[thml.Section], thml.Section]],
    language: str,
) -> tuple[list[dict], list[tuple[str, str]], md.ConversionStats]:
    """Produce TOC nodes (with ancestor grouping) and one Markdown body per chapter.

    IDs are ancestor-path qualified so a leaf inside multiple groups still has
    a globally unique id/filename (e.g. "book-1-chapter-1.md")."""
    toc: list[dict] = []
    files: list[tuple[str, str]] = []
    stats = md.ConversionStats()
    used_ids: set[str] = set()

    group_index: dict[tuple[int, ...], dict] = {}
    group_id_index: dict[tuple[int, ...], str] = {}

    for ancestors, chapter in chapters:
        # Resolve ancestor group ids first, threaded through the TOC
        cursor_list = toc
        path_key: tuple[int, ...] = tuple()
        ancestor_id_parts: list[str] = []
        for depth, anc in enumerate(ancestors):
            path_key = path_key + (id(anc.element),)
            group = group_index.get(path_key)
            if group is None:
                group_local = _section_slug(anc, fallback=f"part-{depth + 1}")
                # Group ids include the parent path so two "Chapter 1"s under
                # different "Book"s don't collide.
                full_local = "-".join([*ancestor_id_parts, group_local]) if ancestor_id_parts else group_local
                group_id = _ensure_unique(full_local, used_ids)
                used_ids.add(group_id)
                group = {
                    "id": group_id,
                    "title": {language: _title_text(anc)},
                    "children": [],
                }
                group_index[path_key] = group
                group_id_index[path_key] = group_id
                cursor_list.append(group)
            ancestor_id_parts.append(group_id_index[path_key])
            cursor_list = group["children"]

        # Leaf id = full ancestor path + the leaf's own slug
        leaf_local = _section_slug(chapter, fallback=f"ch-{len(files) + 1:02d}")
        leaf_full = "-".join([*ancestor_id_parts, leaf_local]) if ancestor_id_parts else leaf_local
        leaf_id = _ensure_unique(leaf_full, used_ids)
        used_ids.add(leaf_id)

        body_md, _ = md.convert(chapter.element, stats=stats)
        title = _title_text(chapter)
        body_with_heading = f"# {title}\n\n{body_md.lstrip()}"
        files.append((leaf_id, body_with_heading))

        leaf_node = {"id": leaf_id, "title": {language: title}}
        cursor_list.append(leaf_node)

    return toc, files, stats


def _section_slug(s: thml.Section, fallback: str) -> str:
    """Build a stable slug from (type, n), falling back to title."""
    if s.type and s.n:
        return _slugify(f"{s.type} {s.n}", fallback=fallback)
    if s.type:
        return _slugify(s.type, fallback=fallback)
    if s.raw_id:
        return _slugify(s.raw_id, fallback=fallback)
    return _slugify(s.title, fallback=fallback)


def _title_text(s: thml.Section) -> str:
    return s.title or "Untitled"


def _slugify(raw: str, fallback: str) -> str:
    s = unicodedata.normalize("NFKD", raw)
    s = s.encode("ascii", "ignore").decode("ascii")
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s or fallback


def _ensure_unique(base: str, taken: set[str]) -> str:
    if base not in taken:
        return base
    i = 2
    while f"{base}-{i}" in taken:
        i += 1
    return f"{base}-{i}"


def _build_book_manifest(
    book_id: str,
    language: str,
    title: str,
    author: Optional[str],
    composed: Optional[object],
    source_url: Optional[str],
    source_description: str,
    toc: list[dict],
) -> dict:
    manifest: dict = {
        "id": book_id,
        "name": {language: title},
        "languages": [language],
    }
    if author:
        manifest["author"] = {language: author}
    if composed is not None:
        manifest["composed"] = composed
    if source_url:
        manifest["sources"] = [
            {"language": language, "url": source_url, "description": source_description}
        ]
    manifest["toc"] = toc
    return manifest


def _update_library_manifest(
    library_root: Path,
    library_id: str,
    book_id: str,
    language: str,
) -> None:
    """Idempotently append the new book to the target library.json."""
    lib_path = library_root / library_id / "library.json"
    if not lib_path.is_file():
        print(
            f"  note: {lib_path.relative_to(library_root)} does not exist; "
            f"skipping library manifest update (run scaffolding first)",
            file=sys.stderr,
        )
        return

    data = json.loads(lib_path.read_text(encoding="utf-8"))

    books = data.setdefault("books", [])
    if book_id not in books:
        books.append(book_id)

    contents = data.setdefault("contents", [])
    if not any(c.get("type") == "book" and c.get("id") == book_id for c in contents):
        contents.append({"type": "book", "id": book_id})

    languages = data.setdefault("languages", [])
    if language not in languages:
        languages.append(language)

    lib_path.write_text(
        json.dumps(data, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"  updated {lib_path.relative_to(library_root)}")


if __name__ == "__main__":
    raise SystemExit(main())
