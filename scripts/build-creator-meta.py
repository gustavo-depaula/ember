#!/usr/bin/env python3
"""Pre-compute per-creator metadata that the client would otherwise have to
discover on every device, every refresh.

For each creator manifest at `content/creators/<id>/manifest.json` we resolve:

1. A stable channel image URL. Podcast feeds expose `<itunes:image>` at the
   channel level; RSS 2.0 uses `<image><url>`; Atom uses `<icon>`/`<logo>`.
   YouTube Atom feeds have no channel image at all, so we scrape the channel
   page's `og:image` meta tag.
2. The set of YouTube video IDs known to be Shorts. The UUSH playlist
   (community-documented per-channel shorts playlist) surfaces the most
   recent ~15 shorts; for older shorts that still show up in the channel
   feed, we HEAD-probe `/shorts/<id>` — a 200 means it's a Short, a 303
   redirect to `/watch` means it isn't.

Output (one file per creator):

    {output}/creator-meta/<creatorSlug>.json
      {
        "creatorId": "creator/<slug>",
        "generatedAt": "2026-05-14T03:00:00Z",
        "channelImage": "https://…" | null,
        "shortVideoIds": ["abc123", …]
      }

The client (apps/app/src/features/creators/feeds/fetcher.ts) reads this file
during refresh; when present, it uses these values directly and skips the
per-device YouTube probing entirely. When absent or 404, the client falls
back to its live UUSH + probe path so a brand-new creator (added between
CI runs) still works.

Stdlib only — runs in any Python 3 environment, no extra deps in CI.
"""

from __future__ import annotations

import concurrent.futures
import json
import re
import sys
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
CREATORS = ROOT / "content" / "creators"

USER_AGENT = "EmberCatholicApp/1.0 (+https://ember.dpgu.me)"
HTTP_TIMEOUT = 15
PROBE_CONCURRENCY = 4
CREATOR_CONCURRENCY = 4

ATOM_NS = {
    "atom": "http://www.w3.org/2005/Atom",
    "yt": "http://www.youtube.com/xml/schemas/2015",
}
ITUNES_NS = {"itunes": "http://www.itunes.com/dtds/podcast-1.0.dtd"}
OG_IMAGE_RE = re.compile(
    r'<meta\s+property=["\']og:image["\']\s+content=["\']([^"\']+)["\']',
    re.IGNORECASE,
)


# --- HTTP helpers (stdlib only) ---------------------------------------------


def _http_get(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=HTTP_TIMEOUT) as r:
        return r.read().decode("utf-8", errors="replace")


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    """HEAD probes need the immediate status; auto-redirect would mask 303s."""

    def redirect_request(self, *_args: Any, **_kwargs: Any) -> None:
        return None


_NO_REDIRECT_OPENER = urllib.request.build_opener(_NoRedirect)


def _http_head_status(url: str) -> int:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT}, method="HEAD")
    try:
        with _NO_REDIRECT_OPENER.open(req, timeout=HTTP_TIMEOUT) as r:
            return r.status
    except urllib.error.HTTPError as e:
        return e.code
    except Exception:
        return 0


# --- Channel-image extractors ----------------------------------------------


def _extract_podcast_channel_image(xml_text: str) -> str | None:
    """RSS podcast: prefer `<itunes:image href>`, fall back to `<image><url>`."""
    try:
        root = ET.fromstring(xml_text)
    except ET.ParseError:
        return None
    channel = root.find(".//channel")
    if channel is None:
        return None
    img = channel.find("itunes:image", ITUNES_NS)
    if img is not None and (href := img.get("href")):
        return href.strip()
    url_node = channel.find("image/url")
    if url_node is not None and url_node.text:
        return url_node.text.strip()
    return None


def _extract_rss_channel_image(xml_text: str) -> str | None:
    """Generic RSS/Atom: <channel><image><url> for RSS 2.0, <icon>/<logo> for Atom."""
    try:
        root = ET.fromstring(xml_text)
    except ET.ParseError:
        return None
    # RSS 2.0
    channel = root.find(".//channel")
    if channel is not None:
        url_node = channel.find("image/url")
        if url_node is not None and url_node.text:
            return url_node.text.strip()
        img = channel.find("itunes:image", ITUNES_NS)
        if img is not None and (href := img.get("href")):
            return href.strip()
    # Atom
    icon = root.find("atom:icon", ATOM_NS)
    if icon is not None and icon.text:
        return icon.text.strip()
    logo = root.find("atom:logo", ATOM_NS)
    if logo is not None and logo.text:
        return logo.text.strip()
    return None


def _fetch_youtube_og_image(channel_id: str) -> str | None:
    """Scrape `<meta property="og:image">` from the channel's public page.

    Best-effort: a failed scrape (network error, regex miss, blocked IP)
    returns None and the client falls back to its own scrape at runtime.
    """
    try:
        html = _http_get(f"https://www.youtube.com/channel/{channel_id}")
    except Exception:
        return None
    m = OG_IMAGE_RE.search(html)
    return m.group(1) if m else None


# --- YouTube shorts discovery -----------------------------------------------


def _extract_video_ids(xml_text: str) -> list[str]:
    try:
        root = ET.fromstring(xml_text)
    except ET.ParseError:
        return []
    return [
        elem.text
        for elem in root.findall("atom:entry/yt:videoId", ATOM_NS)
        if elem.text
    ]


def _is_youtube_short(video_id: str) -> bool:
    """200 = `/shorts/<id>` rendered the Shorts viewer. 303 = redirect to /watch."""
    return _http_head_status(f"https://www.youtube.com/shorts/{video_id}") == 200


def _fetch_youtube_short_ids(channel_id: str) -> set[str]:
    """Returns {videoId} for every Short on the channel we can find.

    Sources, in order:
      1. UUSH playlist (~15 recent shorts; community-documented prefix swap).
      2. HEAD-probe every other videoId in the channel feed that isn't
         already in UUSH — catches shorts that fell out of UUSH's window
         but are still in the channel feed.
    """
    rest = channel_id[2:] if channel_id.startswith("UC") else channel_id
    short_ids: set[str] = set()

    try:
        uush_xml = _http_get(
            f"https://www.youtube.com/feeds/videos.xml?playlist_id=UUSH{rest}"
        )
        short_ids.update(_extract_video_ids(uush_xml))
    except Exception:
        pass

    channel_ids: list[str] = []
    try:
        channel_xml = _http_get(
            f"https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}"
        )
        channel_ids = _extract_video_ids(channel_xml)
    except Exception:
        pass

    ambiguous = [v for v in channel_ids if v not in short_ids]
    if ambiguous:
        with concurrent.futures.ThreadPoolExecutor(max_workers=PROBE_CONCURRENCY) as pool:
            for vid, is_short in zip(ambiguous, pool.map(_is_youtube_short, ambiguous)):
                if is_short:
                    short_ids.add(vid)

    return short_ids


# --- Per-creator orchestrator -----------------------------------------------


def _build_one(creator_dir: Path) -> tuple[str, dict[str, Any]]:
    slug = creator_dir.name
    manifest = json.loads((creator_dir / "manifest.json").read_text())
    creator_id = f"creator/{slug}"

    channel_image: str | None = None
    short_ids: set[str] = set()

    for channel in manifest.get("channels", []):
        kind = channel.get("kind")
        if kind == "podcast" and (url := channel.get("feedUrl")):
            try:
                img = _extract_podcast_channel_image(_http_get(url))
                if img and not channel_image:
                    channel_image = img
            except Exception as e:
                print(f"  warn[{slug}] podcast {url}: {e}", file=sys.stderr)
        elif kind == "rss" and (url := channel.get("feedUrl")):
            try:
                img = _extract_rss_channel_image(_http_get(url))
                if img and not channel_image:
                    channel_image = img
            except Exception as e:
                print(f"  warn[{slug}] rss {url}: {e}", file=sys.stderr)
        elif kind == "youtube" and (cid := channel.get("channelId")):
            if not channel_image:
                if img := _fetch_youtube_og_image(cid):
                    channel_image = img
            short_ids.update(_fetch_youtube_short_ids(cid))

    return slug, {
        "creatorId": creator_id,
        "generatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "channelImage": channel_image,
        "shortVideoIds": sorted(short_ids),
    }


# --- Entry point ------------------------------------------------------------


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        print("usage: build-creator-meta.py <output_dir>", file=sys.stderr)
        return 2

    output = Path(argv[1])
    out_dir = output / "creator-meta"
    out_dir.mkdir(parents=True, exist_ok=True)

    creator_dirs = [
        d for d in sorted(CREATORS.iterdir()) if (d / "manifest.json").exists()
    ]
    print(f"[creator-meta] building metadata for {len(creator_dirs)} creators → {out_dir}")
    t0 = datetime.now(timezone.utc)

    with concurrent.futures.ThreadPoolExecutor(max_workers=CREATOR_CONCURRENCY) as pool:
        for slug, meta in pool.map(_build_one, creator_dirs):
            (out_dir / f"{slug}.json").write_text(
                json.dumps(meta, indent=2, sort_keys=True) + "\n"
            )
            img_status = "yes" if meta["channelImage"] else "no"
            print(
                f"  {slug:35s} image={img_status:3s}  shorts={len(meta['shortVideoIds']):>3d}"
            )

    elapsed = (datetime.now(timezone.utc) - t0).total_seconds()
    print(f"[creator-meta] done in {elapsed:.1f}s")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
