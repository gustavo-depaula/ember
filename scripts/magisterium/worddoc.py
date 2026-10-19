"""Plain-text extraction from Word 97–2003 `.doc` files (Documenta Catholica Omnia).

No antiword or LibreOffice on this machine, so this reads the format directly:
the FIB in the WordDocument stream gives the character counts of the main text
and the footnotes, and the piece table (CLX) in the 0Table/1Table stream maps
character positions to byte ranges, either cp1252 ("compressed") or UTF-16LE.

Returns paragraphs, with footnote references numbered in order and the
footnote texts alongside.
"""
from __future__ import annotations

import re
import struct

import olefile


def _pieces(doc: bytes, table: bytes, fc_clx: int, lcb_clx: int) -> list[tuple[int, int, int, bool]]:
    """(cp_start, cp_end, byte_offset, compressed) for each piece."""
    pos, end = fc_clx, fc_clx + lcb_clx
    while pos < end and table[pos] == 0x01:  # Prc: property modifiers, skip
        cb = struct.unpack_from("<H", table, pos + 1)[0]
        pos += 3 + cb
    if table[pos] != 0x02:
        raise ValueError("no piece table in CLX")
    lcb = struct.unpack_from("<I", table, pos + 1)[0]
    plc = table[pos + 5 : pos + 5 + lcb]
    n = (lcb - 4) // 12
    cps = struct.unpack_from(f"<{n + 1}I", plc, 0)
    out = []
    for i in range(n):
        fc = struct.unpack_from("<I", plc, 4 * (n + 1) + 8 * i + 2)[0]
        compressed = bool(fc & 0x40000000)
        offset = (fc & ~0x40000000) // 2 if compressed else fc
        out.append((cps[i], cps[i + 1], offset, compressed))
    return out


def _text(doc: bytes, pieces: list[tuple[int, int, int, bool]], start: int, stop: int) -> str:
    parts = []
    for a, b, off, compressed in pieces:
        lo, hi = max(a, start), min(b, stop)
        if lo >= hi:
            continue
        if compressed:
            parts.append(doc[off + (lo - a) : off + (hi - a)].decode("cp1252", errors="replace"))
        else:
            parts.append(doc[off + 2 * (lo - a) : off + 2 * (hi - a)].decode("utf-16-le", errors="replace"))
    return "".join(parts)


def _clean(s: str, note_counter: list[int] | None) -> str:
    # Fields: \x13 instruction \x14 result \x15 — keep the result, drop the code.
    s = re.sub(r"\x13[^\x13\x14\x15]*\x14([^\x13\x15]*)\x15", r"\1", s)
    s = re.sub(r"\x13[^\x13\x15]*\x15", "", s)
    if note_counter is not None:
        def ref(_: re.Match) -> str:
            note_counter[0] += 1
            return f"\x00{note_counter[0]}\x00"
        s = re.sub(r"\x02", ref, s)
    else:
        s = s.replace("\x02", "")
    s = s.replace("\x0b", "\n").replace("\x07", "\t").replace("\x0c", "\r")
    s = re.sub(r"[\x01\x03-\x06\x08\x0e-\x1f]", "", s)
    return s


def read_doc(path: str) -> tuple[list[str], list[str]]:
    """(paragraphs, footnotes). A footnote reference shows up in the text as
    \\x00N\\x00, N counting from 1 in document order."""
    ole = olefile.OleFileIO(path)
    doc = ole.openstream("WordDocument").read()
    flags = struct.unpack_from("<H", doc, 0x0A)[0]
    if flags & 0x0100:
        raise ValueError("encrypted .doc")
    table = ole.openstream("1Table" if flags & 0x0200 else "0Table").read()
    csw = struct.unpack_from("<H", doc, 0x20)[0]
    rglw = 0x22 + 2 * csw
    cslw = struct.unpack_from("<H", doc, rglw)[0]
    lw = struct.unpack_from(f"<{cslw}I", doc, rglw + 2)
    ccp_text, ccp_ftn = lw[3], lw[4]
    fclcb = rglw + 2 + 4 * cslw + 2
    fc_clx, lcb_clx = struct.unpack_from("<II", doc, fclcb + 8 * 33)
    pieces = _pieces(doc, table, fc_clx, lcb_clx)

    counter = [0]
    body = _clean(_text(doc, pieces, 0, ccp_text), counter)
    paragraphs = [p.strip() for p in body.split("\r")]

    notes: list[str] = []
    if ccp_ftn:
        ftn = _clean(_text(doc, pieces, ccp_text, ccp_text + ccp_ftn), None)
        # Each footnote ends with a paragraph mark; one may span several.
        notes = [n.strip() for n in ftn.split("\r") if n.strip()]
    return [p for p in paragraphs], notes
