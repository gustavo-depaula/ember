#!/usr/bin/env python3
"""One-shot migration: convert content/prayers/<id>.json into
content/practices/<id>/manifest.json with inline `flow`.

Five prayer ids collide with existing practice dirs (act-of-reparation,
anima-christi, memorare, regina-caeli, suscipe). In those cases the existing
practice is the canonical schedulable form; this script merges the prayer's
body into the practice's flow:

  * If the practice flow contains a self-ref `{ type: 'prayer', ref: '<id>' }`,
    that ref is replaced with the prayer JSON's body sections spread inline.
  * If the practice flow contains an inline-prayer section with the prayer
    text (no self-ref), that section's `inline` is overwritten with the
    prayer JSON's body's first inline (the prayer-side formatting tends to
    be more carefully line-broken).
  * The practice manifest's legacy `"flow": "flow.json"` string field is
    replaced with inline `flow: { sections: [...] }`, and flow.json is
    deleted.

Subtitle/source are preserved only for the 3 canticles; on the 5 other
prayers that declare them (nicene-creed and four others) they are dead data
(no renderer reads them) and get dropped.
"""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PRAYERS = ROOT / "content" / "prayers"
PRACTICES = ROOT / "content" / "practices"

CANTICLE_IDS = {"magnificat", "benedictus", "nunc-dimittis"}

KNOWN_REF_IDS = {
    "sign-of-cross",
    "our-father",
    "hail-mary",
    "glory-be",
    "apostles-creed",
}


def write_json(path: Path, data: dict) -> None:
    text = json.dumps(data, ensure_ascii=False, indent="\t") + "\n"
    path.write_text(text, encoding="utf-8")


def migrate_fresh(pid: str, payload: dict) -> None:
    title = payload.get("title")
    body = payload.get("body")
    if title is None or body is None:
        raise SystemExit(f"  prayer {pid}: missing title or body")
    dest_dir = PRACTICES / pid
    dest_dir.mkdir(parents=True)
    manifest: dict = {
        "id": pid,
        "name": title,
        "flow": {"sections": body},
    }
    if pid in CANTICLE_IDS:
        if "subtitle" in payload:
            manifest["subtitle"] = payload["subtitle"]
        if "source" in payload:
            manifest["source"] = payload["source"]
    write_json(dest_dir / "manifest.json", manifest)


def merge_collision(pid: str, payload: dict) -> None:
    """Merge the prayer's body into an existing practice/<pid>."""
    body = payload.get("body")
    if not isinstance(body, list) or not body:
        raise SystemExit(f"  prayer {pid}: empty or non-list body")

    dest_dir = PRACTICES / pid
    manifest_path = dest_dir / "manifest.json"
    flow_path = dest_dir / "flow.json"
    if not manifest_path.is_file() or not flow_path.is_file():
        raise SystemExit(f"  practice {pid}: expected manifest.json and flow.json")

    with manifest_path.open(encoding="utf-8") as fh:
        manifest = json.load(fh)
    with flow_path.open(encoding="utf-8") as fh:
        flow = json.load(fh)

    sections = flow.get("sections")
    if not isinstance(sections, list):
        raise SystemExit(f"  practice {pid}: flow.json missing sections array")

    # Case 1: self-ref present → replace with body (spread inline).
    new_sections: list = []
    self_ref_replaced = False
    for s in sections:
        if (
            isinstance(s, dict)
            and s.get("type") == "prayer"
            and s.get("ref") == pid
        ):
            new_sections.extend(body)
            self_ref_replaced = True
        else:
            new_sections.append(s)

    # Case 2: no self-ref → find a single inline prayer that's the "content"
    # (not sign-of-cross / etc.) and overwrite its `inline` with the prayer's.
    if not self_ref_replaced:
        candidates = [
            i
            for i, s in enumerate(sections)
            if isinstance(s, dict)
            and s.get("type") == "prayer"
            and "inline" in s
            and s.get("ref") not in KNOWN_REF_IDS
        ]
        if len(candidates) != 1:
            raise SystemExit(
                f"  practice {pid}: expected exactly one inline-content prayer section, got {len(candidates)}"
            )
        idx = candidates[0]
        # Replace the section entirely with the prayer's body section(s).
        replaced: list = []
        for i, s in enumerate(new_sections):
            if i == idx:
                replaced.extend(body)
            else:
                replaced.append(s)
        new_sections = replaced

    # Inline the (possibly substituted) flow into the manifest. Drop the legacy
    # `"flow": "flow.json"` string pointer.
    manifest.pop("flow", None)
    manifest["flow"] = {"sections": new_sections}
    write_json(manifest_path, manifest)
    flow_path.unlink()


def main() -> None:
    if not PRAYERS.is_dir():
        print(f"no {PRAYERS} directory; nothing to migrate")
        return

    files = sorted(PRAYERS.glob("*.json"))
    if not files:
        print(f"no prayer JSONs found in {PRAYERS}")
        return

    print(f"migrating {len(files)} prayers from {PRAYERS}")
    fresh = 0
    merged = 0
    for f in files:
        pid = f.stem
        with f.open(encoding="utf-8") as fh:
            payload = json.load(fh)
        dest_dir = PRACTICES / pid
        if dest_dir.exists():
            merge_collision(pid, payload)
            f.unlink()
            merged += 1
            print(f"  ↻ {pid}  [merged into existing practice]")
        else:
            migrate_fresh(pid, payload)
            f.unlink()
            fresh += 1
            tag = "  [canticle]" if pid in CANTICLE_IDS else ""
            print(f"  ✓ {pid}{tag}")

    # Drop the now-empty content/prayers directory.
    leftovers = list(PRAYERS.iterdir())
    if leftovers:
        print(f"warn: {PRAYERS} not empty: {[p.name for p in leftovers]}")
    else:
        PRAYERS.rmdir()
        print(f"removed empty directory {PRAYERS}")

    print(f"done: {fresh} fresh + {merged} merged = {fresh + merged} total")


if __name__ == "__main__":
    main()
